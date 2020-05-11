from datetime import date

import pandas as pd
import config
import application
import models
import sqlalchemy as sa

import predictors


def get_coefficients():
    foster = pd.read_html("http://www.usapl-sd.com/Formulas/Foster.htm", skiprows=1)[0].set_index(0)
    mccullough = pd.read_html("http://www.usapl-sd.com/Formulas/Mcculloch.htm", skiprows=1)[0].set_index(0)

    coefficients = pd.concat([foster, mccullough]).rename(columns={1: "Coefficient"})
    coefficients.index.name = "Age"

    db = sa.create_engine(config.SQLALCHEMY_DATABASE_URI)
    coefficients.to_sql("age_strength_coefficients", db, dtype={"Age": sa.Integer, "Coefficient": sa.Float})


def annotate_strength_achievements():
    achievements = models.StrengthAchievement.query.all()
    user = achievements[0].user
    for a in achievements:
        a.predicted_1rm = predictors.predict_1rm(float(a.weight), float(a.repetitions))
        if not user.gender == None:
            statement = '''SELECT value from weight_measurement WHERE user_id = %(id)s
                           ORDER BY abs(weight_measurement.date - date %(d)s) LIMIT 1'''
            weight = models.db.engine.execute(statement, id=user.id, d=a.date).fetchone()
            if weight:
                age = None
                if user.birthday:
                    age = int((date.today() - user.birthday).days / 365)
                a.adjusted_score = predictors.adjusted_score(a.predicted_1rm, weight[0], user.gender, age)

    models.db.session.commit()

if __name__ == "__main__":
    app = application.create_app()
    with app.app_context():
        annotate_strength_achievements()
