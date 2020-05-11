import numpy as np
from scipy.stats import norm
from random import sample, choice


class Diet(object):
    intake_function = None
    expenditure_function = None
    starting_weight = None

    def __init__(self, intake_function=lambda x: 2000, expenditure_function=lambda x: 2000, starting_weight=150):
        self.starting_weight = starting_weight
        self.intake_function = intake_function
        self.expenditure_function = expenditure_function

    def simulate(self, days=30):
        diet_days = []
        for day in range(0, days):
            weight = diet_days[-1].weight if day else self.starting_weight
            intake = self.intake_function(day)
            expenditure = self.expenditure_function(day)
            weight_change = (intake - expenditure) / 3500.0
            new_weight = weight + weight_change
            diet_days.append([day, intake, expenditure, new_weight])
        return np.array(diet_days)


class BodyFat(object):
    bodyfat_function = None
    measurement_error_values = [0.015, 0.015, 0.03, 0.03, 0.03, 0.045]
    percent_points = [norm.ppf(p) for p in np.linspace(0.1, 0.9, 9)]

    def __init__(self, bodyfat_function=lambda x: 0.15):
        self.bodyfat_function = bodyfat_function

    def simulate(self, days=30, bodyfat_measurements=5, regular_measurements=True):
        days_ = range(days)
        predicted_bodyfat = []
        if regular_measurements:
            measurement_days = np.linspace(0, days - 1, bodyfat_measurements, dtype='int')
            print measurement_days
        else:
            measurement_days = sample(days_, bodyfat_measurements)
        measurement_errors = [choice(self.measurement_error_values) for _ in range(bodyfat_measurements)]
        actual_bodyfat = [[d, self.bodyfat_function(d)] for d in days_]
        prediction_parameters = zip(measurement_days, measurement_errors)
        for (d, e) in prediction_parameters:
            predicted_bodyfat.extend([[d, actual_bodyfat[d][1] + p * e] for p in self.percent_points])
        return np.array(actual_bodyfat), np.array(sorted(predicted_bodyfat, key=lambda x: x[0]))



