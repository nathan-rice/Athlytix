from flask import Blueprint, abort, jsonify
from flask_user import login_required

import models
from common import access_user

percentile = Blueprint('percentile', __name__)


@percentile.route('/strength/<exercise>/<int:user_id>/<level>/')
@login_required
def strength_percentile(user_id, exercise, level='city'):
    user = access_user(user_id)
    bind_params = {}

    if level in {"country", "state", "city"} and user.country:
        bind_params["country"] = user.country

    if level in {"state", "city"} and user.state:
        bind_params["state"] = user.state

    if level == "city" and user.city:
        bind_params["city"] = user.city

    if user.gender == "female":
        bind_params["gender"] = "female"
    else:
        bind_params["gender"] = "male"

    if bind_params:
        user_where = "WHERE " + " AND ".join("{} = %({})s".format(k, k) for k in bind_params)
    else:
        user_where = ""

    user_subquery = '''
        SELECT first_name, last_name, id FROM "user" {}
    '''.format(user_where)

    bind_params["user_id"] = user_id
    bind_params["exercise"] = exercise

    sa_sub_subquery = '''
        SELECT predicted_1rm, id, date, exercise, weight, repetitions, user_id, adjusted_score
        FROM strength_achievement WHERE exercise = %(exercise)s
    '''

    strength_achievement_subquery = '''
        SELECT DENSE_RANK() OVER (PARTITION BY sa.user_id ORDER BY sa.adjusted_score DESC) as r, *
        FROM ({}) as sa'''.format(sa_sub_subquery)

    rank_query = '''
        SELECT RANK() OVER (PARTITION BY exercise ORDER BY s.adjusted_score ASC) as r, u.id as id
        FROM ({}) as u INNER JOIN ({}) as s ON u.id = s.user_id WHERE s.r = 1
    '''.format(user_subquery, strength_achievement_subquery).strip()

    percent_query = '''
        WITH rankings as ({})
        SELECT 100 * rankings.r::float / (SELECT count(*) FROM rankings) FROM rankings
        WHERE rankings.id = %(user_id)s
    '''.format(rank_query)

    result = models.db.engine.execute(percent_query, **bind_params).fetchone()
    return jsonify(result=result[0])


@percentile.route('/endurance/<exercise>/<fixed>/<value>/<int:user_id>/<level>/')
@login_required
def endurance_percentile(user_id, exercise, fixed='distance', value='', level='city'):
    user = access_user(user_id)
    bind_params = {}

    if level in {"country", "state", "city"} and user.country:
        bind_params["country"] = user.country

    if level in {"state", "city"} and user.state:
        bind_params["state"] = user.state

    if level == "city" and user.city:
        bind_params["city"] = user.city

    if user.gender == "female":
        bind_params["gender"] = "female"
    else:
        bind_params["gender"] = "male"

    user_where = " AND ".join("{} = %({})s".format(k, k) for k in bind_params)

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

    bind_params["user_id"] = user_id
    bind_params["exercise"] = exercise

    user_subquery = '''
        SELECT first_name, last_name, id FROM "user" WHERE {}
    '''.format(user_where)

    ea_table_subsubquery = '''
        SELECT user_id, id, date, exercise, distance, time, distance_type_id
        FROM endurance_achievement WHERE exercise = %(exercise)s AND {}
    '''.format(sq_where)

    endurance_achievement_subquery = '''
        SELECT DENSE_RANK() OVER (PARTITION BY ea.user_id ORDER BY ea.{}, ea.date DESC) as r, ea.id, ea.date,
            ea.exercise, ea.distance, ea.time, ea.distance_type_id, ea.user_id
        FROM ({}) as ea'''.format(rank_order, ea_table_subsubquery)

    rank_query = '''
        SELECT RANK() OVER (PARTITION BY e.exercise ORDER BY e.{}, e.date DESC) as r, u.id as id
        FROM ({}) as u INNER JOIN ({}) as e ON u.id = e.user_id WHERE e.r = 1
    '''.format(rank_order, user_subquery, endurance_achievement_subquery).strip()

    percent_query = '''
        WITH rankings as ({})
        SELECT 100 * rankings.r::float / (SELECT count(*) FROM rankings) FROM rankings
        WHERE rankings.id = %(user_id)s
    '''.format(rank_query)

    result = models.db.engine.execute(percent_query, **bind_params).fetchone()
    return jsonify(result=result[0])


@percentile.route('/bodyfat/<int:user_id>/<level>/')
@login_required
def bodyfat_percentile(user_id, level='city'):
    user = access_user(user_id)
    bind_params = {}

    if level in {"country", "state", "city"} and user.country:
        bind_params["country"] = user.country

    if level in {"state", "city"} and user.state:
        bind_params["state"] = user.state

    if level == "city" and user.city:
        bind_params["city"] = user.city

    if user.gender == "female":
        bind_params["gender"] = "female"
    else:
        bind_params["gender"] = "male"

    if bind_params:
        user_where = "WHERE " + " AND ".join("{} = %({})s".format(k, k) for k in bind_params)
    else:
        user_where = ""

    user_subquery = '''
        SELECT first_name, last_name, id FROM "user" {}
    '''.format(user_where)

    bind_params["user_id"] = user_id

    bm_sub_subquery = '''
            SELECT id, user_id, date, value, measurement_type_id
            FROM bodyfat_measurement
        '''

    # For bodyfat measurements, use the latest value rather than the all time best
    bodyfat_measurement_subquery = '''
        SELECT ROW_NUMBER() OVER (PARTITION BY bm.user_id ORDER BY bm.date DESC, bm.value ASC) as r, *
        FROM ({}) as bm
    '''.format(bm_sub_subquery)

    rank_query = '''
        SELECT RANK() OVER (PARTITION BY m.r ORDER BY m.value ASC) as r, u.id as id
        FROM ({}) as u INNER JOIN ({}) as m ON u.id = m.user_id WHERE m.r = 1
    '''.format(user_subquery, bodyfat_measurement_subquery).strip()

    percent_query = '''
        WITH rankings as ({})
        SELECT 100 * rankings.r::float / (SELECT count(*) FROM rankings) FROM rankings
        WHERE rankings.id = %(user_id)s
    '''.format(rank_query)

    result = models.db.engine.execute(percent_query, **bind_params).fetchone()
    return jsonify(result=result[0])
