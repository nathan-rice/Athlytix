from datetime import date, timedelta
from collections import Iterable
from itertools import count
import numpy as np
import GPy
from scipy.stats import norm
from sklearn.linear_model import BayesianRidge
from scipy.optimize import newton
from io import BytesIO
import models

_norm_percent_points = norm.ppf(np.linspace(0.1, 0.9, 9))

distance_types = {
    1: 5280,
    2: 3280.84,
    3: 3.28084,
    4: 1,
    5: 3,
    6: 2.5
}


# Values derived from empirical standard errors of Epley 1RM formula with different repetitions.
def strength_fixed_variance(w, r):
    slope = 0.0036656891495601175
    intercept = 0.03201368523949169
    p_error = slope * r + intercept
    stdev = w * p_error
    return stdev ** 2


class Prior(object):
    @staticmethod
    def gamma(e, v):
        return GPy.priors.Gamma.from_EV(e, v)


def predict_1rm(w, r):
    return w * (1 + r / 30)


def _days_to_integers(days, start_day=None):
    if not isinstance(days, Iterable):
        days = [days]
    if not start_day:
        start_day = days[0]
    if isinstance(start_day, date):
        return np.array([(d - start_day).days for d in days])
    else:
        return np.array(days)


def create_1rm_predictor(exercise=None, user_id=None):
    version = 1.23

    em = models.StrengthEstimator
    am = models.StrengthAchievement

    est = em.query.filter((em.version == version) & (em.exercise == exercise) & (em.user_id == user_id)).first()

    if est:
        with BytesIO(est.model) as f:
            model = GPy.load(f)
    else:
        achievements = am.query.filter((am.user_id == user_id) & (am.exercise == exercise)).all()
        if not achievements:
            return None
        a = achievements[0]
        days = [a.date for a in achievements]
        start_day = min(days)
        observation_weights = np.diag([0 if a.repetitions == 1 else strength_fixed_variance(a.weight, a.repetitions)
                                       for a in achievements])
        observations = np.array([[a.weight] if a.repetitions == 1 else [predict_1rm(a.weight, a.repetitions)]
                                 for a in achievements])
        integer_days = _days_to_integers(days, start_day).reshape(len(days), 1)

        if len(days) > 1:
            k_rbf = GPy.kern.RBF(1)
            k_rbf.lengthscale.set_prior(Prior.gamma(200, 500))
            k_rbf.variance.set_prior(Prior.gamma(250, 10000))

            k_fixed = GPy.kern.Fixed(1, observation_weights, variance=0.1)
            k_fixed.variance.set_prior(Prior.gamma(2.5, 2.5))

            k_bias = GPy.kern.Bias(1)

            kernel = k_rbf * k_bias + k_fixed
            model = GPy.models.GPRegression(integer_days, observations, kernel=kernel)
            model.Gaussian_noise.variance.set_prior(Prior.gamma(1, 5))

        else:
            noise_var = strength_fixed_variance(a.weight, a.repetitions)

            k_var = (predict_1rm(a.weight, a.repetitions) / 1500) ** 2
            kernel = GPy.kern.Linear(1, variances=k_var)

            mf = GPy.mappings.Constant(1, 1, a.weight)

            model = GPy.models.GPRegression(integer_days, observations, kernel=kernel, noise_var=noise_var,
                                            mean_function=mf)

        model.optimize()
        model.start_day = start_day
        with BytesIO() as f:
            model.pickle(f, protocol=3)
            f.seek(0)
            m_pickle = f.read()
        est = em(version=version, date=date.today(), exercise=a.exercise, model=m_pickle, user_id=a.user_id)
        models.db.session.add(est)
        models.db.session.commit()

    def model_predictor(d):
        try:
            return model.predict(d)
        except ValueError:
            return model.predict(d, kern=model.kern.mul.rbf * model.kern.mul.bias)

    print(model)

    def predict(days_=tuple()):
        if days_:
            integer_days_ = _days_to_integers(days_, model.start_day).reshape(len(days_), 1)
        else:
            duration = (date.today() + timedelta(days=30) - model.start_day).days
            days_ = tuple(model.start_day + timedelta(days=1 * i) for i in range(duration))
            integer_days_ = np.array([[i] for i in range(duration)])
        (means, variances) = model_predictor(integer_days_)
        stds = np.sqrt(variances)
        return tuple(means.flatten()), tuple(stds.flatten()), tuple(days_)

    return predict


def create_ridge_1rm_predictor(achievements):
    observations = np.array([[a.weight] if a.repetitions == 1 else [predict_1rm(a.weight, a.repetitions)]
                             for a in achievements])

    days = [a.date for a in achievements]

    if not days:
        return None

    start_day = min(days)
    integer_days = _days_to_integers(days, start_day).reshape(len(days), 1)

    model = BayesianRidge()
    model.fit(integer_days, observations)

    def predict(days_=tuple()):
        if days_:
            integer_days_ = _days_to_integers(days_, start_day).reshape(len(days_), 1)
        else:
            duration = (date.today() + timedelta(days=30) - start_day).days
            days_ = tuple(start_day + timedelta(days=1 * i) for i in range(duration))
            integer_days_ = np.array([[i] for i in range(duration)])
        (means, variances) = model.predict(integer_days_, return_std=True)
        stds = np.sqrt(variances)
        return tuple(means.flatten()), tuple(stds.flatten()), tuple(days_)

    predict.start_day = start_day
    return predict


def create_weight_predictor(user_id):
    version = 1.24

    m = models.WeightEstimator
    est = m.query.filter((m.version == version) & (m.user_id == user_id)).first()

    if est:
        with BytesIO(est.model) as f:
            model = GPy.load(f)
    else:
        weights = models.WeightMeasurement.query.filter(models.WeightMeasurement.user_id == user_id).all()

        if not weights:
            return None

        days = [w.date for w in weights]

        w = weights[0]

        observations = np.array([[w.value] for w in weights])
        start_day = min(days)
        integer_days = _days_to_integers(days, start_day).reshape(len(days), 1)

        if len(days) > 1:
            k_rbf = GPy.kern.RBF(1)
            k_rbf.lengthscale.set_prior(Prior.gamma(100, 1000))
            k_bias = GPy.kern.Bias(1)
            kernel = k_rbf + k_bias
            noise_var = (observations.mean() * 0.0325) ** 2
            model = GPy.models.GPRegression(integer_days, observations, kernel=kernel, noise_var=noise_var, normalizer=None)
        else:
            k_var = (w.value / 1000) ** 2
            kernel = GPy.kern.Linear(1, variances=k_var)
            mf = GPy.mappings.Constant(1, 1, w.value)
            model = GPy.models.GPRegression(integer_days, observations, kernel=kernel, mean_function=mf)

        model.optimize()
        model.start_day = start_day

        with BytesIO() as f:
            model.pickle(f, protocol=3)
            f.seek(0)
            m_pickle = f.read()
        est = m(version=version, date=date.today(), model=m_pickle, user_id=w.user_id)
        models.db.session.add(est)
        models.db.session.commit()

    print(model)

    def predict(days_=tuple()):
        if days_:
            integer_days_ = _days_to_integers(days_, model.start_day).reshape(len(days_), 1)
        else:
            duration = (date.today() + timedelta(days=30) - model.start_day).days
            days_ = tuple(model.start_day + timedelta(days=1 * i) for i in range(duration))
            integer_days_ = np.array([[i] for i in range(duration)])
        (means, variances) = model.predict(integer_days_)
        stds = np.sqrt(variances)
        return tuple(means.flatten()), tuple(stds.flatten()), tuple(days_)

    return predict


def create_girth_predictor(girths):
    version = 1

    if not girths:
        return None

    g = girths[0]
    m = models.GirthEstimator
    est = m.query.filter((m.version == version) & (m.user_id == g.user_id) & (m.location == g.location)).first()

    days = [w.date for w in girths]
    start_day = min(days)

    if est:
        with BytesIO(est.model) as f:
            model = GPy.load(f)
    else:
        observations = np.array([[w.value] for w in girths])
        integer_days = _days_to_integers(days, start_day).reshape(len(days), 1)

        if len(days) > 1:
            k_rbf = GPy.kern.RBF(1)
            k_rbf.lengthscale.set_prior(Prior.gamma(200, 200))

            kernel = k_rbf

            model = GPy.models.GPRegression(integer_days, observations, kernel=kernel)
        else:
            w = girths[0]

            k_var = (w.value / 3000) ** 2
            kernel = GPy.kern.Linear(1, variances=k_var)

            mf = GPy.mappings.Constant(1, 1, w.value)

            model = GPy.models.GPRegression(integer_days, observations, kernel=kernel, mean_function=mf)

        model.optimize()
        with BytesIO() as f:
            model.pickle(f, protocol=3)
            f.seek(0)
            m_pickle = f.read()
        est = m(version=version, date=date.today(), location=g.location, model=m_pickle, user_id=g.user_id)
        models.db.session.add(est)
        models.db.session.commit()

    def predict(days_=tuple()):
        if days_:
            integer_days_ = _days_to_integers(days_, start_day).reshape(len(days_), 1)
        else:
            duration = (date.today() + timedelta(days=30) - start_day).days
            days_ = tuple(start_day + timedelta(days=1 * i) for i in range(duration))
            integer_days_ = np.array([[i] for i in range(duration)])
        (means, variances) = model.predict(integer_days_)
        stds = np.sqrt(variances)
        return tuple(means.flatten()), tuple(stds.flatten()), tuple(days_)

    predict.start_day = start_day
    return predict


def create_bodyfat_predictor(bodyfats):
    version = 1.57

    if not bodyfats:
        return None

    days = [a.date for a in bodyfats]
    start_day = min(days)
    integer_days = _days_to_integers(days, start_day).reshape(len(days), 1)

    a = bodyfats[0]
    m = models.BodyfatEstimator
    est = m.query.filter((m.version == version) & (m.user_id == m.user_id) & (m.user_id == a.user_id)).first()

    if est:
        with BytesIO(est.model) as f:
            model = GPy.load(f)
    else:
        observation_weights = np.diag([b.measurement_type.std_err ** 2 for b in bodyfats])
        observations = np.array([[b.value] for b in bodyfats])

        if len(days) > 1:
            k_rbf = GPy.kern.RBF(1)
            k_rbf.lengthscale.set_prior(Prior.gamma(75, 500))
            k_rbf.variance.set_prior(Prior.gamma(12.5, 20))

            k_bias = GPy.kern.Bias(1)
            k_bias.variance.set_prior(Prior.gamma(10, 10))

            k_fixed = GPy.kern.Fixed(1, observation_weights)
            k_fixed.variance.set_prior(Prior.gamma(0.5, 2.5))

            kernel = k_rbf + k_fixed + k_bias

            mean = np.average([b.value for b in bodyfats], weights=[1/b.measurement_type.std_err for b in bodyfats])
            mf = GPy.mappings.Constant(1, 1, mean)

            model = GPy.models.GPRegression(integer_days, observations, kernel=kernel, mean_function=mf,
                                            noise_var=1E-10, normalizer=None)
        else:
            total_precision = sum(1 / (b.measurement_type.std_err ** 2) for b in bodyfats)
            mean = sum(b.value / (b.measurement_type.std_err ** 2) for b in bodyfats) / total_precision

            k_var = (mean / 1000) ** 2
            kernel = GPy.kern.Linear(1, variances=k_var)

            model = GPy.models.GPRegression(integer_days, observations, kernel=kernel)

        model.optimize()
        with BytesIO() as f:
            model.pickle(f, protocol=3)
            f.seek(0)
            m_pickle = f.read()
        est = m(version=version, date=date.today(), model=m_pickle, user_id=a.user_id)
        models.db.session.add(est)
        models.db.session.commit()

    print(model)

    def model_predictor(d):
        try:
            return model.predict(d)
        except ValueError:
            return model.predict(d, kern=model.kern.rbf + model.kern.bias)

    def predict(days_=tuple()):
        if days_:
            integer_days_ = _days_to_integers(days_, start_day).reshape(len(days_), 1)
        else:
            duration = (date.today() + timedelta(days=30) - start_day).days
            days_ = tuple(start_day + timedelta(days=1 * i) for i in range(duration))
            integer_days_ = np.array([[i] for i in range(duration)])
        (means, variances) = model_predictor(integer_days_)
        stds = np.sqrt(variances)
        return tuple(means.flatten()), tuple(stds.flatten()), tuple(days_)

    predict.start_day = start_day

    return predict


exercise_distances = {
    "Running": [328.084, 656.16800000000001, 1312.336, 2624.672, 3280.8400000000001, 4921.2600000000002, 5280.0,
                6561.6800000000003, 9842.5200000000004, 10560.0, 16404.200000000001, 32808.400000000001,
                49212.600000000006, 52800.0, 65616.800000000003, 69168.0, 82021.0, 98425.200000000012, 138336.0,
                164042.0, 264000.0, 328084.0, 528000.0]
}


def create_endurance_predictor(achievements, fixed="distance", value=None):
    version = 1

    if not achievements:
        return None

    a = achievements[0]
    m = models.EnduranceEstimator
    where = (m.version == version) & \
            (m.exercise == a.exercise) & \
            (m.fixed == fixed) & \
            (m.user_id == a.user_id)
    if fixed == "time":
        where &= m.time == value
    else:
        where &= (m.distance == a.distance) & (m.distance_type_id == a.distance_type_id)

    est = m.query.filter(where).first()

    days = [w.date for w in achievements]
    start_day = min(days)

    if est:
        with BytesIO(est.model) as f:
            model = GPy.load(f)
    else:
        observations = np.array([[e.foot_second_pace] for e in achievements])
        integer_days = _days_to_integers(days, start_day)

        if fixed == "distance":
            distances = np.array([e.foot_distance for e in achievements])
            # The distances are rescaled here so that a single lengthscale works across the entire input space
            x = np.power(distances, 1 / 5)
            if not value:
                average_distance = distances.mean()
                possible_distances = exercise_distances.get(achievements[0].exercise, [5280])
                value = min(possible_distances, key=lambda d: abs(d - average_distance))
        else:
            times = np.array([e.time for e in achievements])
            # The times are rescaled here so that a single lengthscale works across the entire input space
            x = np.power(times, 1 / 5)
            if not value:
                value = np.median(times)

        inputs = np.column_stack((integer_days, x))

        if len(days) > 1:
            k_rbf_date = GPy.kern.RBF(1, active_dims=0)
            k_rbf_date.lengthscale.set_prior(Prior.gamma(300, 200))

            k_rbf_distance = GPy.kern.RBF(1, active_dims=1)
            k_rbf_distance.lengthscale.set_prior(Prior.gamma(0.5, 0.1))

            kernel = k_rbf_date * k_rbf_distance

            model = GPy.models.GPRegression(inputs, observations, kernel=kernel)
        else:
            e = achievements[0]

            k_var = (e.value / 3000) ** 2
            kernel = GPy.kern.Linear(1, variances=k_var)

            mf = GPy.mappings.Constant(1, 1, e.value)

            model = GPy.models.GPRegression(integer_days, observations, kernel=kernel, mean_function=mf)

        model.optimize()
        with BytesIO() as f:
            model.pickle(f, protocol=3)
            f.seek(0)
            m_pickle = f.read()
        est = m(version=version, date=date.today(), exercise=a.exercise, fixed=fixed, model=m_pickle, user_id=a.user_id)
        if fixed == "time":
            est.time = a.time
        else:
            est.distance = a.distance
            est.distance_type_id = a.distance_type_id
        models.db.session.add(est)
        models.db.session.commit()

    def predict(days_=tuple()):
        if days_:
            integer_days_ = _days_to_integers(days_, start_day).reshape(len(days_), 1)
        else:
            duration = (date.today() + timedelta(days=30) - start_day).days
            days_ = tuple(start_day + timedelta(days=1 * i) for i in range(duration))
            integer_days_ = np.array([i for i in range(duration)])
        x_ = np.power(np.array([value] * len(integer_days_)), 1 / 5)
        inputs_ = np.column_stack((integer_days_, x_))
        (means, variances) = model.predict(inputs_)
        stds = np.sqrt(variances)
        return tuple(means.flatten()), tuple(stds.flatten()), tuple(days_)

    predict.start_day = start_day

    return predict


def create_intake_predictor(user, min_date=None):
    version = 1.04
    m = models.IntakeEstimator
    est = m.query.filter((m.version == version) & (m.user_id == user.id)).first()

    if est:
        with BytesIO(est.model) as f:
            model = GPy.load(f)
    else:
        intakes = models.get_intakes(user.id)

        if not intakes:
            return None

        date_intakes = {i.date: i.total_calories for i in intakes}

        if not min_date:
            min_date = user.join_date
        max_date = date.today()

        dp = models.DietPeriod
        diet_periods = dp.query.filter(dp.user_id == user.id).all()

        for i in range((max_date - min_date).days):
            day = min_date + timedelta(days=i)
            for period in diet_periods:
                if (period.start_date or min_date) <= day <= (period.end_date or max_date):
                    if period.example_date in date_intakes and day not in date_intakes:
                        date_intakes[day] = date_intakes[period.example_date]
                    break

        days = list(date_intakes.keys())
        calories = np.array([[date_intakes[d]] for d in days])

        start_day = min(days)
        integer_days = _days_to_integers(days, start_day).reshape(len(days), 1)

        if len(days) > 1:
            k_exp = GPy.kern.Exponential(1)
            k_exp.lengthscale.set_prior(Prior.gamma(1, 10))
            k_bias = GPy.kern.Bias(1)
            kernel = k_exp + k_bias
            model = GPy.models.GPRegression(integer_days, calories, kernel=kernel, normalizer=None)
        else:
            c = calories[0]
            k_var = (c / 1000) ** 2
            kernel = GPy.kern.Linear(1, variances=k_var)
            mf = GPy.mappings.Constant(1, 1, c)
            model = GPy.models.GPRegression(integer_days, calories, kernel=kernel, mean_function=mf)

        model.optimize()
        print(model)
        model.start_day = start_day

        with BytesIO() as f:
            model.pickle(f, protocol=3)
            f.seek(0)
            m_pickle = f.read()
        est = m(version=version, date=date.today(), model=m_pickle, user_id=user.id)
        models.db.session.add(est)
        models.db.session.commit()

    def predict(days_=tuple()):
        if days_:
            integer_days_ = _days_to_integers(days_, model.start_day).reshape(len(days_), 1)
        else:
            duration = (date.today() + timedelta(days=30) - model.start_day).days
            days_ = tuple(model.start_day + timedelta(days=1 * i) for i in range(duration))
            integer_days_ = np.array([[i] for i in range(duration)])
        (means, variances) = model.predict(integer_days_)
        stds = np.sqrt(np.abs(variances))
        return tuple(means.flatten()), tuple(stds.flatten()), tuple(days_)

    return predict


def create_tdee_predictor(user):
    version = 1.01

    weight_predictor = create_weight_predictor(user.id)

    if not weight_predictor:
        return None

    (weight_mean, weight_std, weight_days) = weight_predictor()
    start_day = weight_days[0]

    intake_predictor = create_intake_predictor(user, start_day)

    if not intake_predictor:
        return None

    (intake_mean, intake_std, intake_days) = intake_predictor()

    intake_mean = np.array(intake_mean)
    weight_mean = np.array(weight_mean)
    calorie_delta = 3500 * (weight_mean[1:] - weight_mean[:-1])
    tdees = (intake_mean[:-1] - calorie_delta).reshape(len(calorie_delta), 1)
    tdee_days = _days_to_integers(intake_days[:-1], start_day).reshape(len(calorie_delta), 1)

    k_bias = GPy.kern.Bias(1)
    k_rbf = GPy.kern.RBF(1)
    k_rbf.lengthscale.set_prior(Prior.gamma(100, 500))
    kernel = k_rbf + k_bias
    model = GPy.models.GPRegression(tdee_days, tdees, kernel=kernel, normalizer=None)
    model.optimize()
    model.start_day = start_day

    def predict(days_=tuple()):
        if days_:
            integer_days_ = _days_to_integers(days_, model.start_day).reshape(len(days_), 1)
        else:
            duration = (date.today() - model.start_day).days + 1
            days_ = tuple(model.start_day + timedelta(days=i) for i in range(duration))
            integer_days_ = np.array([[i] for i in range(duration)])
        (means, variances) = model.predict(integer_days_)
        stds = np.sqrt(np.abs(variances))
        return tuple(means.flatten()), tuple(stds.flatten()), tuple(days_)

    return predict


def goal_achievement_probability(predictor, goal):
    (means, stds, days) = predictor([goal.date])
    if goal.goal_type_id in {1, 2}:
        return norm.cdf(goal.value, means[0], stds[0])
    if goal.goal_type_id == 4:
        # Have to convert the goal to ft/sec for estimation purposes
        if goal.parameters["fixed"] == "distance":
            required_fps = goal.parameters["distance"] * distance_types[goal.parameters["distance_type_id"]] / goal.value
        else:
            required_fps = goal.value * distance_types[goal.parameters["distance_type_id"]] / goal.parameters["time"]
        return 1 - norm.cdf(required_fps, means[0], stds[0])
    else:
        return 1 - norm.cdf(goal.value, means[0], stds[0])


def predict_goal_completion_date(predictor, goal_value):
    # First we need a good starting location for the optimizer
    today = date.today()
    x0 = (today - predictor.start_day).days

    # Since newton's method finds roots, subtract the goal from the prediction
    def root(x):
        return predictor(np.array([x]).reshape(1, 1))[0] - goal_value

    try:
        prediction = newton(root, x0, maxiter=20)
        return today + timedelta(days=round(prediction))
    except RuntimeError:
        # The maximum iterations were exceeded
        return None


def predict_goal_completion_date_range(predictor, goal_value, min_probability=0.05, max_probability=0.95):
    current_day = date.today()
    max_day = current_day + timedelta(days=365)
    days_in_range = []
    while current_day < max_day:
        (mean, variance) = predictor([current_day])
        cumulative_density = norm.cdf(goal_value, mean, np.sqrt(variance))
        if cumulative_density >= min_probability:
            days_in_range.append((current_day, cumulative_density))
        if cumulative_density >= max_probability:
            break
        current_day += timedelta(days=1)
    return days_in_range
