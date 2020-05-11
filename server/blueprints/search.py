from flask import Blueprint, request, abort, jsonify
from flask_user import login_required, current_user

import models
from common import gravatar

search = Blueprint('search', __name__)


@search.route('/trainer/', methods=["POST"])
@login_required
def search_trainer():
    data = request.get_json()

    first_name = data.get("first_name")
    last_name = data.get("last_name")
    gender = data.get("gender")
    country = data.get("country")
    state = data.get("state")
    city = data.get("city")
    limit = data.get("limit", 30)
    offset = data.get("offset", 0)

    user_table = models.User.__table__
    where = user_table.c.is_trainer == True
    columns = [user_table.c.id, user_table.c.first_name, user_table.c.last_name, user_table.c.email,
               user_table.c.about, user_table.c.youtube, user_table.c.instagram, user_table.c.twitter]

    if gender:
        where &= user_table.c.gender == gender
    if country:
        where &= user_table.c.country == country
    if state:
        where &= user_table.c.state == state
    if city:
        where &= user_table.c.city == city
    if first_name:
        where &= user_table.c.first_name == first_name
    if last_name:
        where &= user_table.c.last_name == last_name

    select = models.db.select(columns).where(where)

    results = models.db.engine.execute(select.limit(limit).offset(offset)).fetchall()

    def row_to_dict(r):
        d = dict(r.items())
        email = d.pop("email")
        d["gravatar"] = gravatar(email)
        return d

    return jsonify(results=[row_to_dict(r) for r in results])


@search.route('/exercise/<achievement_type>/', methods=["POST"])
@login_required
def search_exercise(achievement_type):
    data = request.get_json()
    if achievement_type not in {"strength", "endurance"}:
        return abort(401)
    statement = 'SELECT DISTINCT exercise, exercise <-> %(q)s::text AS dist FROM {}_achievement ORDER BY dist LIMIT 10;'
    results = models.db.engine.execute(statement.format(achievement_type), q=data["query"]).fetchall()
    return jsonify(results=list({"label": n.title(), "value": n.title()} for (n, d) in results))


@search.route('/city/', methods=["POST"])
@login_required
def search_city():
    data = request.get_json()
    params = {"query": data["query"]}  # Copying over keys rather than using the original data because security
    condition = 'city IS NOT NULL'
    if "country" in data:
        condition += " AND country = %(country)s::text"
        params["country"] = data["country"]
    if "state" in data:
        condition += " AND state = %(state)s::text"
        params["state"] = data["state"]
    statement = 'SELECT DISTINCT city, city <-> %(query)s::text AS dist FROM "user" ' \
                'WHERE {} ORDER BY dist LIMIT 10;'.format(condition)
    results = models.db.engine.execute(statement, **params).fetchall()
    return jsonify(results=list({"label": n.title(), "value": n.title()} for (n, d) in results))


@search.route('/state/', methods=["POST"])
@login_required
def search_state():
    data = request.get_json()
    params = {"query": data["query"]}  # Copying over keys rather than using the original data because security
    condition = 'state IS NOT NULL'
    if "country" in data:
        condition += " AND country = %(country)s::text"
        params["country"] = data["country"]
    statement = 'SELECT DISTINCT state, state <-> %(query)s::text AS dist FROM "user" ' \
                'WHERE {} ORDER BY dist LIMIT 10;'.format(condition)
    results = models.db.engine.execute(statement, **params).fetchall()
    return jsonify(results=list({"label": n.title(), "value": n.title()} for (n, d) in results))


@search.route('/country/', methods=["POST"])
@login_required
def search_country():
    data = request.get_json()
    statement = 'SELECT DISTINCT country, country <-> %(query)s::text AS dist FROM "user" ' \
                'WHERE country IS NOT NULL ORDER BY dist LIMIT 10;'
    results = models.db.engine.execute(statement, query=data["query"]).fetchall()
    return jsonify(results=list({"label": n.title(), "value": n.title()} for (n, d) in results))


@search.route('/calorie/intake/<int:user_id>/', methods=["POST"])
@login_required
def search_calorie_intake(user_id):
    data = request.get_json()
    statement = 'SELECT DISTINCT name, name <-> %(query)s::text AS dist FROM calorie_intake ' \
                'WHERE name IS NOT NULL AND user_id = %(user_id)s ORDER BY dist LIMIT 10;'
    results = models.db.engine.execute(statement, query=data["query"], user_id=user_id).fetchall()
    return jsonify(results=list({"label": n.title(), "value": n.title()} for (n, d) in results))


@search.route('/calorie/expenditure/<int:user_id>/', methods=["POST"])
@login_required
def search_calorie_expenditure(user_id):
    data = request.get_json()
    statement = 'SELECT DISTINCT name, name <-> %(query)s::text AS dist FROM calorie_expenditure ' \
                'WHERE name IS NOT NULL AND user_id = %(user_id)s ORDER BY dist LIMIT 10;'
    results = models.db.engine.execute(statement, query=data["query"], user_id=user_id).fetchall()
    return jsonify(results=list({"label": n.title(), "value": n.title()} for (n, d) in results))


_user_search_fields = {"first_name", "last_name", "gender", "country", "state", "city"}


@search.route('/user/name/first/', methods=["POST"])
@login_required
def search_first_name():
    data = request.get_json()
    query = data.pop("query")
    params = {k: v for k, v in data.items() if k in _user_search_fields}
    where = " AND ".join("{} = %({})s".format(k, k) for k, v in params.items())
    statement = 'SELECT DISTINCT first_name, first_name <-> %(query)s::text AS dist FROM "user" '
    if where:
        statement += where
    statement += ' ORDER BY dist LIMIT 10;'
    results = models.db.engine.execute(statement, query=query, **params).fetchall()
    return jsonify(results=list({"label": n.title(), "value": n.title()} for (n, d) in results))


@search.route('/user/name/last/', methods=["POST"])
@login_required
def search_last_name():
    data = request.get_json()
    query = data.pop("query")
    params = {k: v for k, v in data.items() if k in _user_search_fields}
    where = " AND ".join("{} = %({})s".format(k, k) for k, v in params.items())
    statement = 'SELECT DISTINCT last_name, last_name <-> %(query)s::text AS dist FROM "user" '
    if where:
        statement += where
    statement += ' ORDER BY dist LIMIT 10;'
    results = models.db.engine.execute(statement, query=query, **params).fetchall()
    return jsonify(results=list({"label": n.title(), "value": n.title()} for (n, d) in results))


@search.route('/program/', methods=["POST"])
@login_required
def search_program():
    data = request.get_json()
    params = {"query": data.get("query"), "user_id": current_user.id}
    tags = data.get("tags")

    statement = 'SELECT name, id, user_id = %(user_id)s as is_owner, name <-> %(query)s AS dist FROM program'
    statement += ' WHERE (user_id = %(user_id)s OR shared = TRUE)'

    if tags:
        params["tags"] = ",".join(tags)
        statement += ' AND tags_tsv @@ to_tsquery(%(tags)s)'

    statement += ' ORDER BY is_owner desc, dist LIMIT 10'
    results = models.db.engine.execute(statement, **params).fetchall()
    return jsonify(results=list({"label": n.title(), "value": i} for (n, i, is_owner, d) in results))

