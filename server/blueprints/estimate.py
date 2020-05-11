from datetime import timedelta, date
from urllib.parse import unquote

from scipy.stats import norm
from flask import Blueprint, request, abort, jsonify
from flask_user import login_required

import models
import predictors
from common import access_user

estimate = Blueprint('estimate', __name__)


@estimate.route('/<int:user_id>/strength/<exercise>/')
@login_required
def strength_curve(user_id, exercise):
    user = access_user(user_id)
    name = unquote(exercise)
    condition = (models.StrengthAchievement.user_id == user_id) & \
                (models.StrengthAchievement.exercise == name)
    if user.is_premium or user.trainer_id is not None:
        predict = predictors.create_1rm_predictor(exercise, user_id)
    else:
        achievements = models.StrengthAchievement.query.filter(condition).all()
        predict = predictors.create_ridge_1rm_predictor(achievements)
    if predict:
        (means, stds, days) = predict()
        return jsonify(means=means, stds=stds, days=days)
    else:
        return jsonify(means=[], stds=[], days=[])


@estimate.route('/<int:user_id>/workout/<int:period_id>/<int:workout_id>/')
@login_required
def workout_weights(user_id, period_id, workout_id):
    access_user(user_id)
    p = models.TrainingPeriod
    period = p.query.filter(p.id == period_id).first()
    program = period.program
    predictors_ = {}
    estimates = {}

    for w in program.workouts:
        if w["id"] == workout_id:
            workout = w
            break
    else:
        return abort(404)

    day = period.start_date + timedelta(days=workout["day"] - 1)

    for s in workout["sets"]:
        exercise = s["exercise"].strip().title()
        if s["exercise"] not in estimates:
            if exercise not in predictors_:
                predictors_[exercise] = predictors.create_1rm_predictor(exercise, user_id)
            if predictors_[exercise]:
                (means, stds, days) = predictors_[exercise]([day])
                estimates[s["exercise"]] = norm.ppf(period.difficulty, means[0], stds[0])
            else:
                estimates[s["exercise"]] = 0
    return jsonify(estimates=estimates)


@estimate.route('/<int:user_id>/weight/')
@login_required
def weight_curve(user_id):
    access_user(user_id)
    predict = predictors.create_weight_predictor(user_id)
    if predict:
        (means, stds, days) = predict()
        return jsonify(means=means, stds=stds, days=days)
    else:
        return jsonify(means=[], stds=[], days=[])


@estimate.route('/<int:user_id>/girth/<location>/')
@login_required
def girth_curve(user_id, location):
    access_user(user_id)
    m = models.GirthMeasurement
    girths = m.query.filter((m.user_id == user_id) & (m.location == location)).all()
    predict = predictors.create_girth_predictor(girths)
    if predict:
        (means, stds, days) = predict()
        return jsonify(means=means, stds=stds, days=days)
    else:
        return jsonify(means=[], stds=[], days=[])


@estimate.route('/<int:user_id>/bodyfat/')
@login_required
def bodyfat_curve(user_id):
    access_user(user_id)
    m = models.BodyfatMeasurement
    bodyfats = m.query.filter(m.user_id == user_id).all()
    predict = predictors.create_bodyfat_predictor(bodyfats)
    if predict:
        (means, stds, days) = predict()
        return jsonify(means=means, stds=stds, days=days)
    else:
        return jsonify(means=[], stds=[], days=[])


@estimate.route('/<int:user_id>/tdee/')
@login_required
def tdee_curve(user_id):
    user = access_user(user_id)
    predict = predictors.create_tdee_predictor(user)
    if predict:
        (means, stds, days) = predict()
        return jsonify(means=means, stds=stds, days=days)
    else:
        return jsonify(means=[], stds=[], days=[])


@estimate.route('/<int:user_id>/endurance/<exercise>/<fixed>/<value>/')
@estimate.route('/<int:user_id>/endurance/<exercise>/')
@login_required
def endurance_curve(user_id, exercise, fixed="distance", value=None):
    if value:
        value = float(value)
    access_user(user_id)
    m = models.EnduranceAchievement
    endurances = m.query.filter((m.user_id == user_id) & (m.exercise == exercise)).all()
    predict = predictors.create_endurance_predictor(endurances, fixed, value)
    if predict:
        (means, stds, days) = predict()
        return jsonify(means=means, stds=stds, days=days)
    else:
        return jsonify(means=[], stds=[], days=[])
