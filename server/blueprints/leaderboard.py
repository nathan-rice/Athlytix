from datetime import timedelta, date

from flask import Blueprint, request, abort, jsonify
from flask_user import login_required

import models

leaderboard = Blueprint('leaderboard', __name__)


@leaderboard.route('/strength/<exercise>/<gender>/<country>/<state>/<city>/')
@leaderboard.route('/strength/<exercise>/<gender>/<country>/<state>/')
@leaderboard.route('/strength/<exercise>/<gender>/<country>/')
@leaderboard.route('/strength/<exercise>/<gender>/')
@leaderboard.route('/strength/<exercise>/')
@login_required
def strength_leaderboard(exercise, gender=None, country=None, state=None, city=None):
    min_age = request.args.get("min_age")
    max_age = request.args.get("max_age")
    with_media = request.args.get("with_media")

    bind_params = {"is_public": True}

    if country:
        bind_params["country"] = country

    if state:
        bind_params["state"] = state

    if city:
        bind_params["city"] = city

    if gender:
        bind_params["gender"] = gender

    user_where = " AND ".join("{} = %({})s".format(k, k) for k in bind_params)

    bind_params["exercise"] = exercise

    if min_age:
        latest_birthday = date.today() - timedelta(days=int(min_age) * 365)
        bind_params["latest_birthday"] = latest_birthday
        user_where += ", birthday < %(latest_birthday)s"

    if max_age:
        earliest_birthday = date.today() - timedelta(days=int(max_age) * 365)
        bind_params["earliest_birthday"] = earliest_birthday
        user_where += ", birthday > %(earliest_birthday)s"

    bind_params["limit"] = request.args.get("limit", 30)

    user_subquery = '''
        SELECT first_name, last_name, id from "user" WHERE {}
    '''.format(user_where)

    sa_sub_subquery = '''
        SELECT predicted_1rm, id, date, exercise, weight, repetitions, user_id, adjusted_score, media
        FROM strength_achievement WHERE exercise = %(exercise)s
    '''

    if with_media:
        sa_sub_subquery += "AND media IS NOT NULL"

    strength_achievement_subquery = '''
        SELECT DENSE_RANK() OVER (PARTITION BY sa.user_id ORDER BY sa.adjusted_score DESC) as r, *
        FROM ({}) as sa
    '''.format(sa_sub_subquery)

    leaderboard_query = '''
    SELECT u.first_name, u.last_name, u.id as user_id, s.adjusted_score, s.weight, s.repetitions,
               s.predicted_1rm, s.id as achievement_id, s.date, s.exercise, media
       FROM ({}) as u INNER JOIN ({}) as s ON u.id = s.user_id AND s.r = 1 ORDER BY s.adjusted_score DESC
       LIMIT %(limit)s;
    '''.format(user_subquery, strength_achievement_subquery).strip()

    results = models.db.engine.execute(leaderboard_query, **bind_params).fetchall()
    return jsonify(results=[dict(r.items()) for r in results])


@leaderboard.route('/endurance/<exercise>/<fixed>/<value>/<gender>/<country>/<state>/<city>/')
@leaderboard.route('/endurance/<exercise>/<fixed>/<value>/<gender>/<country>/<state>/')
@leaderboard.route('/endurance/<exercise>/<fixed>/<value>/<gender>/<country>/')
@leaderboard.route('/endurance/<exercise>/<fixed>/<value>/<gender>/')
@login_required
def endurance_leaderboard(exercise, fixed, value, gender=None, country=None, state=None, city=None):
    min_age = request.args.get("min_age")
    max_age = request.args.get("max_age")
    bind_params = {"is_public": True}

    if country:
        bind_params["country"] = country

    if state:
        bind_params["state"] = state

    if city:
        bind_params["city"] = city

    if gender:
        bind_params["gender"] = gender

    user_where = " AND ".join("{} = %({})s".format(k, k) for k in bind_params)

    bind_params["exercise"] = exercise

    if min_age:
        latest_birthday = date.today() - timedelta(days=int(min_age) * 365)
        bind_params["latest_birthday"] = latest_birthday
        user_where += ", birthday < %(latest_birthday)s"

    if max_age:
        earliest_birthday = date.today() - timedelta(days=int(max_age) * 365)
        bind_params["earliest_birthday"] = earliest_birthday
        user_where += ", birthday > %(earliest_birthday)s"

    bind_params["limit"] = request.args.get("limit", 30)

    user_subquery = '''
        SELECT first_name, last_name, id from "user" WHERE {}
    '''.format(user_where)

    if fixed == "time":
        rank_order = "distance DESC"
        sq_where = "time = %(value)s"
        bind_params["value"] = int(value)
    else:
        rank_order = "time ASC"
        sq_where = "distance = %(value)s AND distance_type_id = %(distance_type_id)s"
        try:
            v, u = value.split("_")
            bind_params["value"] = v
            bind_params["distance_type_id"] = u
        except ValueError:
            return abort(401)

    ea_sub_subquery = '''
        SELECT user_id, exercise, id, date, distance, time, distance_type_id
        FROM endurance_achievement WHERE exercise = %(exercise)s AND {} 
    '''.format(sq_where)

    endurance_achievement_subquery = '''
        SELECT 
            DENSE_RANK() OVER (PARTITION BY ea.user_id ORDER BY {}) as r, ea.id, ea.date, ea.exercise, ea.distance,
            ea.time, ea.distance_type_id, ea.user_id
        FROM ({}) as ea'''.format(rank_order, ea_sub_subquery)

    leaderboard_query = '''
    SELECT u.first_name, u.last_name, u.id as user_id, e.distance, e.time, e.distance_type_id, e.id as achievement_id,
       e.date, e.exercise
    FROM ({}) as u INNER JOIN ({}) as e ON u.id = e.user_id AND e.r = 1 ORDER BY e.{}
    LIMIT %(limit)s;
    '''.format(user_subquery, endurance_achievement_subquery, rank_order).strip()

    results = models.db.engine.execute(leaderboard_query, **bind_params).fetchall()
    return jsonify(results=[dict(r.items()) for r in results])


@leaderboard.route('/bodyfat/<gender>/')
@leaderboard.route('/bodyfat/<gender>/<country>/')
@leaderboard.route('/bodyfat/<gender>/<country>/<state>/')
@leaderboard.route('/bodyfat/<gender>/<country>/<state>/<city>/')
@login_required
def bodyfat_leaderboard(gender=None, country=None, state=None, city=None):
    min_age = request.args.get("min_age")
    max_age = request.args.get("max_age")
    has_media = request.args.get("has_media")
    methods = [int(m) for m in request.args.getlist("method")]

    bind_params = {"is_public": True}

    if country:
        bind_params["country"] = country

    if state:
        bind_params["state"] = state

    if city:
        bind_params["city"] = city

    if gender:
        bind_params["gender"] = gender

    user_where = " AND ".join("{} = %({})s".format(k, k) for k in bind_params)

    if min_age:
        latest_birthday = date.today() - timedelta(days=int(min_age) * 365)
        bind_params["latest_birthday"] = latest_birthday
        user_where += ", birthday < %(latest_birthday)s"

    if max_age:
        earliest_birthday = date.today() - timedelta(days=int(max_age) * 365)
        bind_params["earliest_birthday"] = earliest_birthday
        user_where += ", birthday > %(earliest_birthday)s"

    bind_params["limit"] = request.args.get("limit", 30)

    user_subquery = '''
        SELECT first_name, last_name, id from "user" WHERE {}
    '''.format(user_where)

    bm_sub_subquery = '''
        SELECT id, user_id, date, value, measurement_type_id, media
        FROM bodyfat_measurement
    '''

    if methods or has_media:
        bm_sub_subquery += " WHERE measurement_type_id IN ({})".format(", ".join(str(m) for m in methods))

    if has_media:
        if "WHERE" in bm_sub_subquery:
            bm_sub_subquery += " AND media IS NOT NULL"
        else:
            bm_sub_subquery += " WHERE media IS NOT NULL"

    # For bodyfat measurements, use the latest value rather than the all time best
    bodyfat_measurement_subquery = '''
        SELECT ROW_NUMBER() OVER (PARTITION BY bm.user_id ORDER BY bm.date DESC, bm.value ASC) as r, *
        FROM ({}) as bm
    '''.format(bm_sub_subquery)

    leaderboard_query = '''
        SELECT u.first_name, u.last_name, u.id as user_id, m.id as measurement_id, m.date, m.value,
        m.measurement_type_id, m.media
        FROM ({}) as u INNER JOIN ({}) as m ON u.id = m.user_id AND m.r = 1 ORDER BY m.value ASC
       LIMIT %(limit)s;
    '''.format(user_subquery, bodyfat_measurement_subquery).strip()

    results = models.db.engine.execute(leaderboard_query, **bind_params).fetchall()
    return jsonify(results=[dict(r.items()) for r in results])


@leaderboard.route('/weight_loss/<gender>/')
@leaderboard.route('/weight_loss/<gender>/<country>/')
@leaderboard.route('/weight_loss/<gender>/<country>/<state>/')
@leaderboard.route('/weight_loss/<gender>/<country>/<state>/<city>/')
@login_required
def weight_loss_leaderboard(gender="male", country=None, state=None, city=None):
    bind_params = {"is_public": True}

    if country:
        bind_params["country"] = country

    if state:
        bind_params["state"] = state

    if city:
        bind_params["city"] = city

    if gender == "female":
        bind_params["gender"] = "female"
    else:
        bind_params["gender"] = "male"

    user_where = " AND ".join("{} = %({})s".format(k, k) for k in bind_params)

    bind_params["limit"] = 30

    user_subquery = '''
        SELECT first_name, last_name, id FROM "user" WHERE {}
    '''.format(user_where)

    weight_subquery = '''
        SELECT DISTINCT
          first_value(value) OVER (PARTITION BY user_id ORDER BY date) as starting_weight,
          first_value(value) OVER (PARTITION BY user_id ORDER BY date DESC) as ending_weight,
          first_value(media) OVER (PARTITION BY user_id ORDER BY date) as before_media,
          first_value(media) OVER (PARTITION BY user_id ORDER BY date DESC) as after_media,
          user_id
        FROM weight_measurement WHERE user_id IN (select id from u)
    '''

    loser_query = '''
        WITH u as ({})
        SELECT
          w.starting_weight, w.ending_weight, w.starting_weight - w.ending_weight as weight_loss,
          w.before_media, w.after_media, w.user_id, u.first_name, u.last_name
        FROM u INNER JOIN ({}) as w ON u.id = w.user_id ORDER BY weight_loss DESC LIMIT %(limit)s
    '''.format(user_subquery, weight_subquery)

    results = models.db.engine.execute(loser_query, **bind_params).fetchall()
    return jsonify(results=[dict(r.items()) for r in results])


@leaderboard.route('/weight_gain/<gender>/')
@leaderboard.route('/weight_gain/<gender>/<country>/')
@leaderboard.route('/weight_gain/<gender>/<country>/<state>/')
@leaderboard.route('/weight_gain/<gender>/<country>/<state>/<city>/')
@login_required
def weight_gain_leaderboard(gender="male", country=None, state=None, city=None):
    bind_params = {"is_public": True}

    if country:
        bind_params["country"] = country

    if state:
        bind_params["state"] = state

    if city:
        bind_params["city"] = city

    if gender == "female":
        bind_params["gender"] = "female"
    else:
        bind_params["gender"] = "male"

    user_where = " AND ".join("{} = %({})s".format(k, k) for k in bind_params)

    bind_params["limit"] = 30

    user_subquery = '''
        SELECT first_name, last_name, id FROM "user" WHERE {}
    '''.format(user_where)

    weight_subquery = '''
        SELECT DISTINCT
          first_value(value) OVER (PARTITION BY user_id ORDER BY date) as starting_weight,
          first_value(value) OVER (PARTITION BY user_id ORDER BY date DESC) as ending_weight,
          first_value(media) OVER (PARTITION BY user_id ORDER BY date) as before_media,
          first_value(media) OVER (PARTITION BY user_id ORDER BY date DESC) as after_media,
          user_id
        FROM weight_measurement WHERE user_id IN (select id from u)
    '''

    loser_query = '''
        WITH u as ({})
        SELECT
          w.starting_weight, w.ending_weight, w.ending_weight - w.starting_weight as weight_gain,
          w.before_media, w.after_media, w.user_id, u.first_name, u.last_name
        FROM u INNER JOIN ({}) as w ON u.id = w.user_id ORDER BY weight_gain DESC LIMIT %(limit)s
    '''.format(user_subquery, weight_subquery)

    results = models.db.engine.execute(loser_query, **bind_params).fetchall()
    return jsonify(results=[dict(r.items()) for r in results])
