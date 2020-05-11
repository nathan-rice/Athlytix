from sqlalchemy.dialects.postgresql import JSONB, BYTEA, TSVECTOR
from flask_sqlalchemy import SQLAlchemy
from flask_user import UserMixin
from sqlalchemy.dialects.postgresql import insert as _insert

db = SQLAlchemy()


def insert(class_, data):
    table = class_.__table__
    return _insert(table, returning=list(table.c)) \
        .values(data) \
        .on_conflict_do_update(index_elements=[table.c.id], set_=data)


class Transformer(object):
    default_accessors = {
        "date": (lambda o, f: getattr(o, f).isoformat())
    }

    def __init__(self, model):
        self.model = model
        self.table = model.__table__
        self.fields = [c.key for c in self.table.c if c.info.get("visible")]
        self.accessors = [self.default_accessors.get(f, getattr) for f in self.fields]

    @property
    def dict(self, obj=None):
        if not obj:
            obj = self.model

        def obj_to_dict(o):
            return {f: a(o, f) for (f, a) in zip(self.fields, self.accessors) if a(o, f) is not None}

        return obj_to_dict(obj)


class Model(db.Model):
    __abstract__ = True

    @property
    def transform(self):
        return Transformer(self)


class User(Model, UserMixin):
    __tablename__ = "user"
    id = db.Column(db.Integer, primary_key=True, info={"visible": True})
    password = db.Column(db.Text, info={"visible": False})
    email = db.Column(db.Text, unique=True, info={"visible": True, "changeable": False})
    is_admin = db.Column(db.Boolean, nullable=False, default=False, info={"visible": True, "changeable": False})
    active = db.Column(db.Boolean, nullable=False, default=False, info={"visible": False})
    is_confirmed = db.Column(db.Boolean, default=True, info={"visible": False})
    confirmation_code = db.Column(db.Text, info={"visible": False})
    is_trainer = db.Column(db.Boolean, info={"visible": True, "changeable": True}, index=True)
    is_premium = db.Column(db.Boolean, info={"visible": True})
    next_bill_date = db.Column(db.Date, info={"visible": True})
    first_name = db.Column(db.Text, info={"visible": True, "changeable": True}, index=True)
    last_name = db.Column(db.Text, info={"visible": True, "changeable": True}, index=True)
    gender = db.Column(db.Text, info={"visible": True, "changeable": True}, index=True)
    birthday = db.Column(db.Date, info={"visible": True, "changeable": True})
    height = db.Column(db.Float, info={"visible": True, "changeable": True})
    trainer_id = db.Column(db.Integer, db.ForeignKey(id), info={"visible": True})
    city = db.Column(db.Text, info={"visible": True, "changeable": True}, index=True)
    state = db.Column(db.Text, info={"visible": True, "changeable": True}, index=True)
    country = db.Column(db.Text, info={"visible": True, "changeable": True}, index=True)
    about = db.Column(db.Text, info={"visible": True, "changeable": True})
    is_public = db.Column(db.Boolean, nullable=False, default=True, info={"visible": True, "changeable": True})
    join_date = db.Column(db.Date, info={"visible": True, "changeable": False})
    youtube = db.Column(db.Text, info={"visible": True, "changeable": True})
    instagram = db.Column(db.Text, info={"visible": True, "changeable": True})
    twitter = db.Column(db.Text, info={"visible": True, "changeable": True})
    referrer_id = db.Column(db.Integer)
    layouts = db.Column(JSONB, info={"visible": True, "changeable": True})
    metric_units = db.Column(db.Boolean, info={"visible": True, "changeable": True})
    onboard = db.Column(db.Boolean, info={"visible": True})

    trainer = db.relationship("User", backref="clients", remote_side=id)


class BodyfatMeasurementType(Model):
    __tablename__ = "bodyfat_measurement_type"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, info={"visible": True})
    std_err = db.Column(db.Float, info={"visible": True})


class BodyfatMeasurement(Model):
    __tablename__ = "bodyfat_measurement"
    id = db.Column(db.Integer, primary_key=True, info={"visible": True})
    user_id = db.Column(db.Integer, db.ForeignKey(User.id), info={"visible": True}, index=True)
    measurement_type_id = db.Column(db.Integer, db.ForeignKey(BodyfatMeasurementType.id),
                                    info={"visible": True, "changeable": True}, index=True)
    date = db.Column(db.Date, info={"visible": True, "changeable": True}, index=True)
    value = db.Column(db.Float, info={"visible": True, "changeable": True})
    media = db.Column(db.Text, info={"visible": True, "changeable": True})

    measurement_type = db.relationship(BodyfatMeasurementType)
    user = db.relationship(User, backref="bodyfat_measurements")


class WeightMeasurement(Model):
    __tablename__ = "weight_measurement"
    id = db.Column(db.Integer, primary_key=True, info={"visible": True})
    user_id = db.Column(db.Integer, db.ForeignKey(User.id), info={"visible": True}, index=True)
    date = db.Column(db.Date, info={"visible": True, "changeable": True}, index=True)
    value = db.Column(db.Float, info={"visible": True, "changeable": True})
    media = db.Column(db.Text, info={"visible": True, "changeable": True})

    user = db.relationship(User, backref="weight_measurements")


class GirthMeasurement(Model):
    __tablename__ = "girth_measurement"
    id = db.Column(db.Integer, primary_key=True, info={"visible": True})
    user_id = db.Column(db.Integer, db.ForeignKey(User.id), info={"visible": True}, index=True)
    date = db.Column(db.Date, info={"visible": True, "changeable": True}, index=True)
    location = db.Column(db.Text, info={"visible": True, "changeable": True})
    value = db.Column(db.Float, info={"visible": True, "changeable": True})

    user = db.relationship(User, backref="girth_measurements")


class CalorieIntake(Model):
    __tablename__ = "calorie_intake"
    id = db.Column(db.Integer, primary_key=True, info={"visible": True})
    user_id = db.Column(db.Integer, db.ForeignKey(User.id), info={"visible": True}, index=True)
    date = db.Column(db.Date, info={"visible": True, "changeable": True}, index=True)
    name = db.Column(db.Text, info={"visible": True, "changeable": True}, index=True)
    value = db.Column(db.Float, info={"visible": True, "changeable": True})
    amount = db.Column(db.Float, info={"visible": True, "changeable": True})
    protein = db.Column(db.Float, info={"visible": True, "changeable": True})
    carbohydrates = db.Column(db.Float, info={"visible": True, "changeable": True})
    fiber = db.Column(db.Float, info={"visible": True, "changeable": True})
    fat = db.Column(db.Float, info={"visible": True, "changeable": True})
    details = db.Column(db.Text, info={"visible": True, "changeable": True})

    user = db.relationship(User, backref="calorie_intakes")


class CalorieExpenditure(Model):
    __tablename__ = "calorie_expenditure"
    id = db.Column(db.Integer, primary_key=True, info={"visible": True})
    user_id = db.Column(db.Integer, db.ForeignKey(User.id), info={"visible": True}, index=True)
    workout_id = db.Column(db.Integer, info={"visible": True, "changeable": True})
    program_id = db.Column(db.Integer, info={"visible": True, "changeable": True})
    date = db.Column(db.Date, info={"visible": True, "changeable": True}, index=True)
    value = db.Column(db.Float, info={"visible": True, "changeable": True})
    name = db.Column(db.Text, info={"visible": True, "changeable": True}, index=True)
    details = db.Column(db.Text, info={"visible": True, "changeable": True})

    user = db.relationship(User, backref="calorie_expenditures")


class Program(Model):
    __tablename__ = "program"
    id = db.Column(db.Integer, primary_key=True, info={"visible": True})
    user_id = db.Column(db.Integer, db.ForeignKey(User.id), info={"visible": True})
    name = db.Column(db.Text, info={"visible": True, "changeable": True}, index=True)
    tags = db.Column(db.Text, info={"visible": True, "changeable": True})
    workouts_per_week = db.Column(db.Integer, info={"visible": True, "changeable": True})
    tags_tsv = db.Column(TSVECTOR, index=True, info={"visible": False})
    shared = db.Column(db.Boolean, info={"visible": True, "changeable": True})
    workouts = db.Column(JSONB, info={"visible": True, "changeable": True})

    user = db.relationship(User, backref="programs")


class DietPeriod(Model):
    __tablename__ = "diet_period"
    id = db.Column(db.Integer, primary_key=True, info={"visible": True})
    user_id = db.Column(db.Integer, db.ForeignKey(User.id), info={"visible": True}, index=True)
    start_date = db.Column(db.Date, info={"visible": True, "changeable": True})
    end_date = db.Column(db.Date, info={"visible": True, "changeable": True})
    name = db.Column(db.Text, info={"visible": True, "changeable": True})
    example_date = db.Column(db.Date, info={"visible": True, "changeable": True})
    min_calories = db.Column(db.Float, info={"visible": True, "changeable": True})
    max_calories = db.Column(db.Float, info={"visible": True, "changeable": True})
    min_protein = db.Column(db.Float, info={"visible": True, "changeable": True})
    max_protein = db.Column(db.Float, info={"visible": True, "changeable": True})
    min_carbohydrates = db.Column(db.Float, info={"visible": True, "changeable": True})
    max_carbohydrates = db.Column(db.Float, info={"visible": True, "changeable": True})
    min_fiber = db.Column(db.Float, info={"visible": True, "changeable": True})
    max_fiber = db.Column(db.Float, info={"visible": True, "changeable": True})
    min_fat = db.Column(db.Float, info={"visible": True, "changeable": True})
    max_fat = db.Column(db.Float, info={"visible": True, "changeable": True})
    details = db.Column(db.Text, info={"visible": True, "changeable": True})

    user = db.relationship(User, backref="diet_periods")


class TrainingPeriod(Model):
    __tablename__ = "training_period"
    id = db.Column(db.Integer, primary_key=True, info={"visible": True})
    user_id = db.Column(db.Integer, db.ForeignKey(User.id), info={"visible": True}, index=True)
    start_date = db.Column(db.Date, info={"visible": True, "changeable": True})
    name = db.Column(db.Text, info={"visible": True, "changeable": True})
    difficulty = db.Column(db.Float, info={"visible": True, "changeable": True})
    program_id = db.Column(db.Integer, db.ForeignKey(Program.id), info={"visible": True, "changeable": True})

    user = db.relationship(User, backref="training_periods")
    program = db.relationship(Program)


class StrengthAchievement(Model):
    __tablename__ = "strength_achievement"
    id = db.Column(db.Integer, primary_key=True, info={"visible": True})
    user_id = db.Column(db.Integer, db.ForeignKey(User.id), info={"visible": True}, index=True)
    date = db.Column(db.Date, info={"visible": True, "changeable": True}, index=True)
    exercise = db.Column(db.Text, info={"visible": True, "changeable": True}, index=True)
    weight = db.Column(db.Float, info={"visible": True, "changeable": True})
    repetitions = db.Column(db.Integer, info={"visible": True, "changeable": True})
    details = db.Column(db.Text, info={"visible": True, "changeable": True})
    media = db.Column(db.Text, info={"visible": True, "changeable": True})
    predicted_1rm = db.Column(db.Float, info={"visible": True})
    adjusted_score = db.Column(db.Float, info={"visible": True})
    rpe = db.Column(db.Float, info={"visible": True, "changeable": True})
    average_velocity = db.Column(db.Float, info={"visible": True, "changeable": True})

    user = db.relationship(User, backref="strength_achievements")


class DistanceType(Model):
    __tablename__ = "distance_type"
    id = db.Column(db.Integer, primary_key=True, info={"visible": True})
    name = db.Column(db.Text, info={"visible": True})
    value = db.Column(db.Float, info={"visible": True})


class EnduranceAchievement(Model):
    __tablename__ = "endurance_achievement"
    id = db.Column(db.Integer, primary_key=True, info={"visible": True})
    user_id = db.Column(db.Integer, db.ForeignKey(User.id), info={"visible": True}, index=True)
    date = db.Column(db.Date, info={"visible": True, "changeable": True}, index=True)
    exercise = db.Column(db.Text, info={"visible": True, "changeable": True}, index=True)
    distance = db.Column(db.Float, info={"visible": True, "changeable": True})
    distance_type_id = db.Column(db.Integer, db.ForeignKey(DistanceType.id), info={"visible": True, "changeable": True})
    fixed = db.Column(db.Text, nullable=False, default="distance", info={"visible": True, "changeable": True})
    time = db.Column(db.Float, info={"visible": True, "changeable": True})
    average_heart_rate = db.Column(db.Float, info={"visible": True, "changeable": True})
    climb = db.Column(db.Float, info={"visible": True, "changeable": True})
    descent = db.Column(db.Float, info={"visible": True, "changeable": True})
    altitude = db.Column(db.Float, info={"visible": True, "changeable": True})
    temperature = db.Column(db.Float, info={"visible": True, "changeable": True})
    details = db.Column(db.Text, info={"visible": True, "changeable": True})

    user = db.relationship(User, backref="endurance_achievements")
    distance_type = db.relationship(DistanceType)

    @property
    def foot_distance(self):
        return self.distance * self.distance_type.value

    @property
    def foot_second_pace(self):
        return self.distance * self.distance_type.value / self.time


class GoalType(Model):
    __tablename__ = "goal_type"
    id = db.Column(db.Integer, primary_key=True, info={"visible": True})
    name = db.Column(db.Text, info={"visible": True})


class Goal(Model):
    __tablename__ = "goal"
    id = db.Column(db.Integer, primary_key=True, info={"visible": True})
    goal_type_id = db.Column(db.Integer, db.ForeignKey(GoalType.id), info={"visible": True, "changeable": True})
    user_id = db.Column(db.Integer, db.ForeignKey(User.id), info={"visible": True}, index=True)
    creation_date = db.Column(db.Date, info={"visible": True})
    date = db.Column(db.Date, info={"visible": True, "changeable": True}, index=True)
    value = db.Column(db.Float, info={"visible": True, "changeable": True})
    parameters = db.Column(JSONB, info={"visible": True, "changeable": True})

    goal_type = db.relationship(GoalType)
    user = db.relationship(User, backref="goals")


class TrainerRequest(Model):
    __tablename__ = "trainer_request"
    id = db.Column(db.Integer, primary_key=True, info={"visible": True})
    user_id = db.Column(db.Integer, db.ForeignKey(User.id), info={"visible": True})
    trainer_id = db.Column(db.Integer, db.ForeignKey(User.id), info={"visible": True, "changeable": True})
    date = db.Column(db.Date, info={"visible": True})
    message = db.Column(db.Text, info={"visible": True, "changeable": True})

    user = db.relationship(User, foreign_keys=[user_id], lazy='joined')
    trainer = db.relationship(User, foreign_keys=[trainer_id], lazy='joined')


class StrengthEstimator(Model):
    __tablename__ = "strength_estimator"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(User.id), index=True)
    date = db.Column(db.Date)
    version = db.Column(db.Float)
    exercise = db.Column(db.Text)
    model = db.Column(BYTEA)


class EnduranceEstimator(Model):
    __tablename__ = "endurance_estimator"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(User.id), index=True)
    date = db.Column(db.Date)
    version = db.Column(db.Float)
    exercise = db.Column(db.Text)
    distance = db.Column(db.Float)
    distance_type_id = db.Column(db.Integer)
    time = db.Column(db.Float)
    fixed = db.Column(db.Text)
    model = db.Column(BYTEA)


class WeightEstimator(Model):
    __tablename__ = "weight_estimator"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(User.id), index=True)
    date = db.Column(db.Date)
    version = db.Column(db.Float)
    model = db.Column(BYTEA)


class BodyfatEstimator(Model):
    __tablename__ = "bodyfat_estimator"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(User.id), index=True)
    date = db.Column(db.Date)
    version = db.Column(db.Float)
    model = db.Column(BYTEA)


class GirthEstimator(Model):
    __tablename__ = "girth_estimator"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(User.id), index=True)
    date = db.Column(db.Date)
    version = db.Column(db.Float)
    location = db.Column(db.Text)
    model = db.Column(BYTEA)


class IntakeEstimator(Model):
    __tablename__ = "intake_estimator"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(User.id), index=True)
    date = db.Column(db.Date)
    version = db.Column(db.Float)
    model = db.Column(BYTEA)


def get_intakes(user_id):
    intake_query = """
        SELECT sum(value) as total_calories, date
        FROM calorie_intake
        GROUP BY date, user_id
        HAVING user_id = %(user_id)s
    """

    return list(db.engine.execute(intake_query, user_id=user_id).fetchall())


