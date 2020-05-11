from datetime import date

from flask import Flask, current_app, render_template, jsonify, request, abort, url_for, session
from flask_mail import Mail, Message
from flask_user import current_user, login_required, UserManager, SQLAlchemyAdapter
from flask_cors import CORS, cross_origin
from wtforms import IntegerField, validators, PasswordField, BooleanField
from passlib.context import CryptContext
from flask_user.forms import RegisterForm, StringField
import flask_profiler

import models
import predictors

from blueprints.search import search
from blueprints.leaderboard import leaderboard
from blueprints.percentile import percentile
from blueprints.estimate import estimate
from common import access_user, NotAuthorizedError, gravatar


def handle_not_authorized(error):
    response = jsonify(message=error.message)
    response.status_code = error.status_code
    return response


def user_or_trainer_condition():
    return (models.User.id == current_user.id) | (models.User.trainer_id == current_user.id)


def user_trainer_or_public_condition():
    return user_or_trainer_condition() | (models.User.is_public == True)


def create(user_id, class_, extra_data=None):
    def fix_value(k, v):
        t = class_.__table__
        if isinstance(t.columns[k].type, (models.db.Integer, models.db.Float)) and v == '':
            return None
        else:
            return v
    access_user(user_id)
    data = request.get_json()
    valid_fields = {c.name.lower() for c in class_.__table__.c if c.info.get("changeable")}
    valid_data = {k.lower(): fix_value(k, v) for k, v in data.items() if k.lower() in valid_fields}
    valid_data["user_id"] = user_id
    if extra_data:
        valid_data.update(**extra_data)
    if "id" in data and data["id"]:
        result = class_.query.filter((class_.id == data["id"]) & user_or_trainer_condition()).first()
        if not result:
            raise NotAuthorizedError
        valid_data["id"] = data["id"]
    result = models.db.engine.execute(models.insert(class_, valid_data)).fetchone()
    return dict(result)


def get(object_ids, class_):
    if type(object_ids) == int:
        clause = object_ids == class_.id
        method = "first"
    else:
        clause = class_.id.in_(object_ids)
        method = "all"
    query = class_.query \
        .join(models.User) \
        .filter(clause) \
        .filter(user_trainer_or_public_condition())
    result = getattr(query, method)()
    if not result:
        return abort(404)
    return result


def delete_(object_id, class_):
    s = models.db.session
    result = class_.query \
        .join(models.User) \
        .filter(user_or_trainer_condition()) \
        .filter(object_id == class_.id).first()
    if not result:
        return abort(404)
    s.delete(result)
    s.commit()
    return True


def render_template_with_form(template):
    form = current_app.user_manager.login_form(request.form)
    return render_template(template, form=form, load_bootstrap=True)


def home(path=None):
    session["referrer_id"] = request.args.get("referrer_id")
    if not current_user.is_anonymous:
        return render_template("main.html", render_nav=False)
    return render_template_with_form("home.html")


def page(path):
    return render_template_with_form(path)


def safe_user_update(u, d):
    changeable = set(c.key for c in models.User.__table__.c if c.info.get("changeable"))
    for k, v in d.items():
        if k in changeable:
            setattr(u, k, v)


def send_account_created_email(user, creator):
    msg = Message("Welcome to Athlytix!", recipients=[user.email])
    token = current_app.user_manager.generate_token(int(user.get_id()))
    reset_password_link = url_for('user.reset_password', token=token, _external=True)
    msg.html = render_template("email/account-created.html", reset_password_link=reset_password_link, creator=creator)
    current_app.mail.send(msg)


@login_required
def create_user():
    data = request.get_json()
    email = data.pop("email")
    password = data.pop("password", "abc")
    if not (email and password):
        return abort(400)
    context = CryptContext(schemes=["bcrypt"])
    s = models.db.session
    u = models.User(email=email, active=True, password=context.hash(password), trainer_id=current_user.id)
    safe_user_update(u, data)
    s.add(u)
    s.commit()
    send_account_created_email(u, current_user)
    # TODO: add email verification for users created in this manner
    return jsonify(user=u.transform.dict)


def set_password(user_id, password):
    context = CryptContext(schemes=["bcrypt"])
    m = models.User
    u = m.query.filter(m.id == user_id).first()
    u.password = context.hash(password)
    models.db.session.commit()
    return True


def get_user_training_periods(user):
    training_periods_ = []
    for tp in user.training_periods:
        tp_dict = tp.transform.dict
        if tp.program:
            p_dict = tp.program.transform.dict
            tp_dict["program"] = p_dict
        training_periods_.append(tp_dict)
    return training_periods_


@login_required
def get_current_user():
    return jsonify(user=current_user.transform.dict)


@login_required
def get_all_user_data(user_id):
    user = access_user(user_id)

    return jsonify(
        strength_achievements=[a.transform.dict for a in user.strength_achievements],
        endurance_achievements=[a.transform.dict for a in user.endurance_achievements],
        calorie_intakes=[c.transform.dict for c in user.calorie_intakes],
        calorie_expenditures=[c.transform.dict for c in user.calorie_expenditures],
        weight_measurements=[m.transform.dict for m in user.weight_measurements],
        bodyfat_measurements=[m.transform.dict for m in user.bodyfat_measurements],
        girth_measurements=[m.transform.dict for m in user.girth_measurements],
        diet_periods=[p.transform.dict for p in user.diet_periods],
        training_periods=get_user_training_periods(user),
        goals=[p.transform.dict for p in user.goals])


@login_required
def get_user(user_id):
    user = access_user(user_id, read_only=True)
    if not user:
        return abort(404)
    user_dict = user.transform.dict
    user_dict["gravatar"] = gravatar(user_dict.get("email"), size=200)
    if not (current_user.id == user.id or current_user.id == user.trainer_id):
        user_dict.pop("email", None)
        birthday = user_dict.pop("birthday", None)
        if birthday:
            user_dict["age"] = int((date.today() - birthday).days / 365)
        if user.trainer_id:
            user_dict["trainer_name"] = "{} {}".format(user.trainer.first_name, user.trainer.last_name)
    return jsonify(user=user_dict)


@login_required
def update_user(user_id):
    data = request.get_json()
    result = models.User.query.filter(models.User.id == user_id).first()
    if not result:
        return abort(404)
    if not (result.id == current_user.id or result.trainer_id == current_user.id):
        return abort(401)
    safe_user_update(result, data)
    models.db.session.commit()
    return jsonify(user=result.transform.dict)


@login_required
def clients():
    return jsonify(users=[u.transform.dict for u in current_user.clients])


@login_required
def delete_client(user_id):
    s = models.db.session
    m = models.User
    client = m.query.filter(m.id == user_id).first()
    if client.trainer_id == current_user.id:
        client.trainer_id = None
        s.commit()
        return jsonify(user=client.transform.dict)
    else:
        return abort(403)


@login_required
def goals(user_id):
    user = access_user(user_id)
    return jsonify(goals=[g.transform.dict for g in user.goals])


@login_required
def goal(goal_id):
    gl = get(goal_id, models.Goal)
    if not gl:
        return abort(404)
    return jsonify(goal=gl.transform.dict)


@login_required
def create_goal(user_id):
    goal_ = create(user_id, models.Goal)
    return jsonify(goal=goal_)


@login_required
def delete_goal(id_):
    deleted = delete_(id_, models.Goal)
    return jsonify(deleted=deleted)


@login_required
def intakes(user_id):
    user = access_user(user_id)
    return jsonify(calorie_intakes=[i.transform.dict for i in user.calorie_intakes])


@login_required
def intake(id_):
    itk = get(id_, models.CalorieIntake)
    if not itk:
        return abort(404)
    return jsonify(calorie_intake=itk.transform.dict)


@login_required
def create_intake(user_id):
    intake_ = create(user_id, models.CalorieIntake)
    return jsonify(calorie_intake=intake_)


@cross_origin()
def bookmarklet_create_intake():
    if current_user.is_anonymous:
        return abort(401)
    intake_ = create(current_user.id, models.CalorieIntake, {"date": date.today()})
    return jsonify(calorie_intake=intake_)


@login_required
def delete_intake(id_):
    deleted = delete_(id_, models.CalorieIntake)
    return jsonify(deleted=deleted)


@login_required
def create_diet_period(user_id):
    period_ = create(user_id, models.DietPeriod)
    return jsonify(diet_period=period_)


@login_required
def diet_period(id_):
    period = get(id_, models.DietPeriod)
    if not period:
        return abort(404)
    return jsonify(diet_period=period.transform.dict)


@login_required
def diet_periods(user_id):
    user = access_user(user_id)
    return jsonify(diet_periods=[dp.transform.dict for dp in user.diet_periods])


@login_required
def delete_diet_period(id_):
    deleted = delete_(id_, models.DietPeriod)
    return jsonify(deleted=deleted)


@login_required
def expenditures(user_id):
    user = access_user(user_id)
    return jsonify(calorie_expenditures=[e.transform.dict for e in user.calorie_expenditures])


@login_required
def expenditure(id_):
    exp = get(id_, models.CalorieExpenditure)
    if not exp:
        return abort(404)
    return jsonify(calorie_expenditure=exp.transform.dict)


@login_required
def create_expenditure(user_id):
    expenditure_ = create(user_id, models.CalorieExpenditure)
    return jsonify(calorie_expenditure=expenditure_)


@login_required
def delete_expenditure(id_):
    deleted = delete_(id_, models.CalorieExpenditure)
    return jsonify(deleted=deleted)


@login_required
def create_training_period(user_id):
    period_ = create(user_id, models.TrainingPeriod)
    program_ = get(period_.get("program_id"), models.Program)
    period_["program"] = program_.transform.dict
    return jsonify(training_period=period_)


@login_required
def training_period(id_):
    period = get(id_, models.TrainingPeriod)
    period_dict = period.transform.dict
    period_dict["program"] = period.program.transform.dict
    if not period:
        return abort(404)
    return jsonify(training_period=period_dict)


@login_required
def training_periods(user_id):
    user = access_user(user_id)
    training_periods_ = []
    for tp in user.training_periods:
        tp_dict = tp.transform.dict
        if tp.program:
            p_dict = tp.program.transform.dict
            tp_dict["program"] = p_dict
        training_periods_.append(tp_dict)
    return jsonify(training_periods=training_periods_)


@login_required
def delete_training_period(id_):
    deleted = delete_(id_, models.TrainingPeriod)
    return jsonify(deleted=deleted)


@login_required
def weight_measurements(user_id):
    user = access_user(user_id, read_only=True)
    return jsonify(weight_measurements=[wm.transform.dict for wm in user.weight_measurements])


@login_required
def weight_measurement(id_):
    measurement = get(id_, models.WeightMeasurement)
    if not measurement:
        return abort(404)
    return jsonify(weight_measurement=measurement.transform.dict)


@login_required
def create_weight_measurement(user_id):
    weight_measurement_ = create(user_id, models.WeightMeasurement)
    return jsonify(weight_measurement=weight_measurement_)


@login_required
def delete_weight_measurement(id_):
    deleted = delete_(id_, models.WeightMeasurement)
    return jsonify(deleted=deleted)


@login_required
def bodyfat_measurements(user_id):
    user = access_user(user_id, read_only=True)
    return jsonify(bodyfat_measurements=[bf.transform.dict for bf in user.bodyfat_measurements])


@login_required
def bodyfat_measurement(id_):
    measurement = get(id_, models.BodyfatMeasurement)
    if not measurement:
        return abort(404)
    return jsonify(bodyfat_measurement=measurement.transform.dict)


@login_required
def create_bodyfat_measurement(user_id):
    bodyfat_measurement_ = create(user_id, models.BodyfatMeasurement)
    return jsonify(bodyfat_measurement=bodyfat_measurement_)


@login_required
def delete_bodyfat_measurement(id_):
    deleted = delete_(id_, models.BodyfatMeasurement)
    return jsonify(deleted=deleted)


@login_required
def girth_measurements(user_id):
    user = access_user(user_id, read_only=True)
    return jsonify(girth_measurements=[gm.transform.dict for gm in user.girth_measurements])


@login_required
def girth_measurement(id_):
    measurement = get(id_, models.GirthMeasurement)
    if not measurement:
        return abort(404)
    return jsonify(girth_measurement=measurement.transform.dict)


@login_required
def create_girth_measurement(user_id):
    girth_measurements_ = create(user_id, models.GirthMeasurement)
    return jsonify(girth_measurement=girth_measurements_)


@login_required
def delete_girth_measurement(id_):
    deleted = delete_(id_, models.GirthMeasurement)
    return jsonify(deleted=deleted)


@login_required
def endurance_achievements(user_id):
    user = access_user(user_id, read_only=True)
    return jsonify(endurance_achievements=[ea.transform.dict for ea in user.endurance_achievements])


@login_required
def endurance_achievement(id_):
    achievement = get(id_, models.EnduranceAchievement)
    if not achievement:
        return abort(404)
    return jsonify(endurance_achievement=achievement.transform.dict)


@login_required
def create_endurance_achievement(user_id):
    endurance_achievements_ = create(user_id, models.EnduranceAchievement)
    return jsonify(endurance_achievement=endurance_achievements_)


@login_required
def delete_endurance_achievement(id_):
    deleted = delete_(id_, models.EnduranceAchievement)
    return jsonify(deleted=deleted)


@login_required
def strength_achievements(user_id):
    user = access_user(user_id, read_only=True)
    return jsonify(strength_achievements=[sa.transform.dict for sa in user.strength_achievements])


@login_required
def strength_achievement(id_):
    achievement = get(id_, models.StrengthAchievement)
    if not achievement:
        return abort(404)
    return jsonify(strength_achievement=achievement.transform.dict)


@login_required
def create_strength_achievement(user_id):
    result = create(user_id, models.StrengthAchievement)
    return jsonify(strength_achievement=dict(result.items()))


@login_required
def delete_strength_achievement(id_):
    deleted = delete_(id_, models.StrengthAchievement)
    return jsonify(deleted=deleted)


@login_required
def create_program(user_id):
    data = request.get_json()
    max_day = max(w["day"] for w in data["workouts"])
    num_workouts = len(data["workouts"])
    num_weeks = max_day / 7
    extra_data = {"workouts_per_week": round(num_workouts / num_weeks)}
    program_ = create(user_id, models.Program, extra_data)
    return jsonify(program=program_)


@login_required
def program(id_):
    program_ = get(id_, models.Program)
    if not program_:
        return abort(404)
    return jsonify(program=program_.transform.dict)


@login_required
def programs(user_id):
    user = access_user(user_id)
    return jsonify(programs=[p.transform.dict for p in user.programs])


@login_required
def delete_program(id_):
    s = models.db.session
    p = models.Program
    result = p.query \
        .join(models.User) \
        .filter(p.user_id == current_user.id) \
        .filter(id_ == p.id).first()
    if not result:
        return abort(404)
    statement = "UPDATE training_period SET program_id = NULL where program_id = %(id)s"
    models.db.engine.execute(statement, id=id_)
    s.delete(result)
    s.commit()
    return jsonify(deleted=True)


@login_required
def trainer_request(id_):
    m = models.TrainerRequest
    result = m.query \
        .filter(id_ == m.id) \
        .filter((current_user.id == m.user_id) | (current_user.id == m.trainer_id)) \
        .first()
    if not result:
        return abort(404)
    return jsonify(trainer_request=result.transform.dict)


@login_required
def trainer_requests():
    m = models.TrainerRequest
    results = m.query.filter((current_user.id == m.user_id) | (current_user.id == m.trainer_id)).all()
    results_dicts = [tr.transform.dict for tr in results]
    for r, d in zip(results, results_dicts):
        d["user_full_name"] = " ".join((r.user.first_name, r.user.last_name))
        d["trainer_full_name"] = " ".join((r.trainer.first_name, r.trainer.last_name))
    return jsonify(trainer_requests=results_dicts)


@login_required
def create_trainer_request(user_id):
    extra_data = {"date": date.today()}
    trainer_request_ = create(user_id, models.TrainerRequest, extra_data)
    trainer = models.User.query.filter(models.User.id == trainer_request_["trainer_id"]).first()
    if trainer:
        trainer_request_["trainer_full_name"] = "{} {}".format(trainer.first_name, trainer.last_name)
    return jsonify(trainer_request=trainer_request_)


@login_required
def delete_trainer_request(id_):
    s = models.db.session
    m = models.TrainerRequest
    result = m.query \
        .filter((current_user.id == m.user_id) | (current_user.id == m.trainer_id)) \
        .filter(id_ == m.id).first()
    if not result:
        return abort(404)
    s.delete(result)
    s.commit()
    return jsonify(deleted=True)


@login_required
def approve_trainer_request(id_):
    s = models.db.session
    m = models.TrainerRequest
    result = m.query \
        .filter(id_ == m.id) \
        .filter(current_user.id == m.trainer_id) \
        .first()
    if not result:
        raise abort(404)
    user = models.User.query.filter(models.User.id == result.id).first()
    user.trainer_id = result.trainer_id
    # The first trainer to accept a user's trainer request gets the user
    m.query.filter(m.user_id == result.user_id).delete()
    s.commit()
    return jsonify(user=user.transform.dict)


@login_required
def goal_probabilities():
    data = request.get_json()
    gl = get(data, models.Goal)
    probabilities = {}
    if not gl:
        return abort(404)
    user_id = gl[0].user_id
    if not all(g.user_id == gl[0].user_id for g in gl):  # Don't support multiple user queries
        return abort(400)
    if all(g.goal_type_id == 1 for g in gl):  # Weight goals
        predict = predictors.create_weight_predictor(user_id)
    elif all(g.goal_type_id == 2 for g in gl):  # Bodyfat goal
        m = models.BodyfatMeasurement
        bodyfats = m.query.filter(m.user_id == gl[0].user_id).all()
        predict = predictors.create_bodyfat_predictor(bodyfats)
    elif all(g.goal_type_id == 3 for g in gl):  # Strength goal
        exercise = gl[0].parameters["exercise"]
        user_id = gl[0].user_id
        predict = predictors.create_1rm_predictor(exercise, user_id)
    elif all(g.goal_type_id == 4 for g in gl):  # Endurance goal
        m = models.EnduranceAchievement
        exercise = gl[0].parameters["exercise"]
        endurances = m.query.filter(m.user_id == gl[0].user_id & (m.exercise == exercise)).all()
        predict = predictors.create_endurance_predictor(endurances)
    elif all(g.goal_type_id == 5 for g in gl):  # Girth goal
        m = models.GirthMeasurement
        location = gl[0].parameters["location"]
        girths = m.query.filter((m.user_id == gl[0].user_id) & (m.location == location)).all()
        predict = predictors.create_girth_predictor(girths)
    else:  # Don't support mix-n-match predictors
        return abort(400)
    for g in gl:
        probabilities[g.id] = predictors.goal_achievement_probability(predict, g)
    return jsonify(probabilities=probabilities)


_email_placeholder = "We won't share this with anyone"
_pass_placeholder = "6+ characters, with lower and upper case letters and a number"
_name_placeholder = "Only visible if your profile is public"


class AthlytixUserForm(RegisterForm):
    email = StringField('Email', [validators.required()], render_kw={"placeholder": _email_placeholder})
    password = PasswordField('Password', [validators.required()], render_kw={"placeholder": _pass_placeholder})
    first_name = StringField('First name', [validators.required()], render_kw={"placeholder": _name_placeholder})
    last_name = StringField('Last name', [validators.required()], render_kw={"placeholder": _name_placeholder})
    is_trainer = BooleanField('I am a coach/personal trainer')
    referrer_id = IntegerField('Referrer ID', default=None)
    country = StringField('Country', default=None)
    state = StringField('State/Province', default=None)
    city = StringField('City', default=None)


def create_app(profile=True):
    app = Flask(__name__)
    app.config.from_pyfile("config.py")
    if __name__ == "__main__":
        app.config.from_pyfile("config_localhost.py")
    app.config["FLASK_PROFILER"]["enabled"] = profile

    # Database
    models.db.init_app(app)
    with app.app_context():
        # models.db.drop_all()
        models.db.create_all()

    # Extras
    app.mail = Mail(app)
    UserManager(SQLAlchemyAdapter(models.db, models.User), app, register_form=AthlytixUserForm)
    CORS(app)

    # CRUD-like
    app.route('/')(home)
    app.route('/api/current_user/')(get_current_user)
    app.route('/api/current_user/client/')(clients)
    app.route('/api/current_user/client/<int:user_id>/', methods=["DELETE"])(delete_client)

    app.route('/api/user/', methods=["PUT"])(create_user)
    app.route('/api/user/<int:user_id>/')(get_user)
    app.route('/api/user/<int:user_id>/', methods=["POST"])(update_user)

    app.route('/api/user/<int:user_id>/goal/')(goals)
    app.route('/api/user/<int:user_id>/goal/', methods=["PUT"])(create_goal)
    app.route('/api/goal/<int:id_>/')(goal)
    app.route('/api/goal/<int:id_>/', methods=["DELETE"])(delete_goal)
    app.route('/api/goal/probability/', methods=["POST"])(goal_probabilities)

    app.route('/api/user/<int:user_id>/calorie_intake/')(intakes)
    app.route('/api/user/<int:user_id>/calorie_intake/', methods=["PUT"])(create_intake)
    app.route('/api/calorie_intake/', methods=["PUT"])(bookmarklet_create_intake)
    app.route('/api/calorie_intake/<int:id_>/')(intake)
    app.route('/api/calorie_intake/<int:id_>/', methods=["DELETE"])(delete_intake)

    app.route('/api/user/<int:user_id>/diet_period/')(diet_periods)
    app.route('/api/user/<int:user_id>/diet_period/', methods=["PUT"])(create_diet_period)
    app.route('/api/diet_period/<int:id_>/')(diet_period)
    app.route('/api/diet_period/<int:id_>/', methods=["DELETE"])(delete_diet_period)

    app.route('/api/user/<int:user_id>/training_period/')(training_periods)
    app.route('/api/user/<int:user_id>/training_period/', methods=["PUT"])(create_training_period)
    app.route('/api/training_period/<int:id_>/')(training_period)
    app.route('/api/training_period/<int:id_>/', methods=["DELETE"])(delete_training_period)

    app.route('/api/user/<int:user_id>/calorie_expenditure/')(expenditures)
    app.route('/api/user/<int:user_id>/calorie_expenditure/', methods=["PUT"])(create_expenditure)
    app.route('/api/calorie_expenditure/<int:id_>/')(expenditure)
    app.route('/api/calorie_expenditure/<int:id_>/', methods=["DELETE"])(delete_expenditure)

    app.route('/api/user/<int:user_id>/weight_measurement/')(weight_measurements)
    app.route('/api/user/<int:user_id>/weight_measurement/', methods=["PUT"])(create_weight_measurement)
    app.route('/api/weight_measurement/<int:id_>/')(weight_measurement)
    app.route('/api/weight_measurement/<int:id_>/', methods=["DELETE"])(delete_weight_measurement)

    app.route('/api/user/<int:user_id>/bodyfat_measurement/')(bodyfat_measurements)
    app.route('/api/user/<int:user_id>/bodyfat_measurement/', methods=["PUT"])(create_bodyfat_measurement)
    app.route('/api/bodyfat_measurement/<int:id_>/')(bodyfat_measurement)
    app.route('/api/bodyfat_measurement/<int:id_>/', methods=["DELETE"])(delete_bodyfat_measurement)

    app.route('/api/user/<int:user_id>/girth_measurement/')(girth_measurements)
    app.route('/api/user/<int:user_id>/girth_measurement/', methods=["PUT"])(create_girth_measurement)
    app.route('/api/girth_measurement/<int:id_>/')(girth_measurement)
    app.route('/api/girth_measurement/<int:id_>/', methods=["DELETE"])(delete_girth_measurement)

    app.route('/api/user/<int:user_id>/endurance_achievement/')(endurance_achievements)
    app.route('/api/user/<int:user_id>/endurance_achievement/', methods=["PUT"])(create_endurance_achievement)
    app.route('/api/endurance_achievement/<int:id_>/')(endurance_achievement)
    app.route('/api/endurance_achievement/<int:id_>/', methods=["DELETE"])(delete_endurance_achievement)

    app.route('/api/user/<int:user_id>/strength_achievement/')(strength_achievements)
    app.route('/api/user/<int:user_id>/strength_achievement/', methods=["PUT"])(create_strength_achievement)
    app.route('/api/strength_achievement/<int:id_>/')(strength_achievement)
    app.route('/api/strength_achievement/<int:id_>/', methods=["DELETE"])(delete_strength_achievement)

    app.route('/api/user/<int:user_id>/trainer_request/', methods=["PUT"])(create_trainer_request)
    app.route('/api/trainer_request/')(trainer_requests)
    app.route('/api/trainer_request/<int:id_>/')(trainer_request)
    app.route('/api/trainer_request/<int:id_>/', methods=["DELETE"])(delete_trainer_request)
    app.route('/api/trainer_request/<int:id_>/approve')(approve_trainer_request)

    app.route('/api/user/<int:user_id>/program/')(programs)
    app.route('/api/user/<int:user_id>/program/', methods=["PUT"])(create_program)
    app.route('/api/program/<int:id_>/')(program)
    app.route('/api/program/<int:id_>/', methods=["DELETE"])(delete_program)

    app.route('/api/user/<int:user_id>/all/')(get_all_user_data)

    # Client routing fixes
    app.route('/page/<path:path>')(page)
    app.route('/<path:path>')(home)

    # Error handlers
    app.errorhandler(NotAuthorizedError)(handle_not_authorized)

    app.register_blueprint(search, url_prefix='/api/search')
    app.register_blueprint(leaderboard, url_prefix='/api/leaderboard')
    app.register_blueprint(percentile, url_prefix='/api/percentile')
    app.register_blueprint(estimate, url_prefix='/api/estimate')

    flask_profiler.init_app(app)

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
