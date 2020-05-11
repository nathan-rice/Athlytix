-- STRENGTH ACHIEVEMENT --
CREATE OR REPLACE FUNCTION clear_strength_achievement_estimator_tf()
  RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE')
  THEN
    DELETE FROM strength_estimator
    WHERE OLD.exercise = strength_estimator.exercise AND OLD.user_id = strength_estimator.user_id;
    RETURN OLD;
  ELSIF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE')
    THEN
      DELETE FROM strength_estimator
      WHERE NEW.exercise = strength_estimator.exercise AND NEW.user_id = strength_estimator.user_id;
      RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clear_strength_achievement_estimator_trigger
AFTER
INSERT OR
UPDATE OR
DELETE
  ON strength_achievement
FOR EACH ROW EXECUTE PROCEDURE clear_strength_achievement_estimator_tf();

-- ENDURANCE ACHIEVEMENT --
CREATE OR REPLACE FUNCTION clear_endurance_achievement_estimator_tf()
  RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE')
  THEN
    IF (OLD.fixed = 'distance')
    THEN
      DELETE FROM endurance_estimator
      WHERE OLD.exercise = endurance_estimator.exercise AND
            OLD.user_id = endurance_estimator.user_id AND
            OLD.distance = endurance_estimator.distance AND
            OLD.distance_type_id = endurance_estimator.distance_type_id AND
            OLD.fixed = endurance_estimator.fixed;
    ELSIF (OLD.fixed = 'time')
      THEN
        DELETE FROM endurance_estimator
        WHERE OLD.exercise = endurance_estimator.exercise AND
              OLD.user_id = endurance_estimator.user_id AND
              OLD.time = endurance_estimator.time AND
              OLD.fixed = endurance_estimator.fixed;
        RETURN OLD;
    END IF;
  ELSIF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE')
    THEN
      IF (NEW.fixed = 'distance')
      THEN
        DELETE FROM endurance_estimator
        WHERE NEW.exercise = endurance_estimator.exercise AND
              NEW.user_id = endurance_estimator.user_id AND
              NEW.distance = endurance_estimator.distance AND
              NEW.distance_type_id = endurance_estimator.distance_type_id AND
              NEW.fixed = endurance_estimator.fixed;
      ELSIF (NEW.fixed = 'time')
        THEN
          DELETE FROM endurance_estimator
          WHERE NEW.exercise = endurance_estimator.exercise AND
                NEW.user_id = endurance_estimator.user_id AND
                NEW.time = endurance_estimator.time AND
                NEW.fixed = endurance_estimator.fixed;
          RETURN NEW;
      END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clear_endurance_achievement_estimator_trigger
AFTER
INSERT OR
UPDATE OR
DELETE
  ON endurance_achievement
FOR EACH ROW EXECUTE PROCEDURE clear_endurance_achievement_estimator_tf();

-- WEIGHT --
CREATE OR REPLACE FUNCTION clear_weight_measurement_estimator_tf()
  RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE')
  THEN
    DELETE FROM weight_estimator
    WHERE OLD.user_id = weight_estimator.user_id;
    RETURN OLD;
  ELSIF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE')
    THEN
      DELETE FROM weight_estimator
      WHERE NEW.user_id = weight_estimator.user_id;
      RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clear_weight_achievement_estimator_trigger
AFTER
INSERT OR
UPDATE OR
DELETE
  ON weight_measurement
FOR EACH ROW EXECUTE PROCEDURE clear_weight_measurement_estimator_tf();

-- BODYFAT --
CREATE OR REPLACE FUNCTION clear_bodyfat_measurement_estimator_tf()
  RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE')
  THEN
    DELETE FROM bodyfat_estimator
    WHERE OLD.user_id = bodyfat_estimator.user_id;
    RETURN OLD;
  ELSIF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE')
    THEN
      DELETE FROM bodyfat_estimator
      WHERE NEW.user_id = bodyfat_estimator.user_id;
      RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clear_bodyfat_measurement_estimator_trigger
AFTER
INSERT OR
UPDATE OR
DELETE
  ON bodyfat_measurement
FOR EACH ROW EXECUTE PROCEDURE clear_bodyfat_measurement_estimator_tf();

-- GIRTH --
CREATE OR REPLACE FUNCTION clear_girth_measurement_estimator_tf()
  RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE')
  THEN
    DELETE FROM girth_estimator
    WHERE OLD.user_id = girth_estimator.user_id AND OLD.location = girth_estimator.location;
    RETURN OLD;
  ELSIF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE')
    THEN
      DELETE FROM girth_estimator
      WHERE NEW.user_id = girth_estimator.user_id AND NEW.location = girth_estimator.location;
      RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clear_girth_measurement_estimator_trigger
AFTER
INSERT OR
UPDATE OR
DELETE
  ON girth_measurement
FOR EACH ROW EXECUTE PROCEDURE clear_girth_measurement_estimator_tf();

-- USER UPDATE FIELDS --

CREATE OR REPLACE FUNCTION set_user_fields()
  RETURNS TRIGGER AS $$
BEGIN
  NEW.join_date := current_date;
  NEW.country := initcap(trim(NEW.country));
  NEW.state := initcap(trim(NEW.state));
  NEW.city := initcap(trim(NEW.city));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_user_fields_trigger
BEFORE INSERT ON "user"
FOR EACH ROW EXECUTE PROCEDURE set_user_fields();


-- STRENGTH ACHIEVEMENT --
CREATE OR REPLACE FUNCTION set_strength_achievement_fields()
  RETURNS TRIGGER AS $$
DECLARE
  birthday    DATE;
  gender      TEXT;
  user_age    INTEGER;
  age_coef    FLOAT;
  w_          FLOAT;
  a_          FLOAT;
  b_          FLOAT;
  c_          FLOAT;
  d_          FLOAT;
  e_          FLOAT;
  f_          FLOAT;
BEGIN
  NEW.exercise := initcap(trim(NEW.exercise));
  NEW.predicted_1rm := NEW.weight * (1 + NEW.repetitions::float / 30);
  SELECT
    "user".birthday,
    "user".gender
  INTO birthday, gender
  FROM "user"
  WHERE id = NEW.user_id;

  IF (gender IS NOT NULL)
  THEN
    w_ := (SELECT value
           FROM weight_measurement
           WHERE user_id = NEW.user_id
           ORDER BY abs(weight_measurement.date - NEW.date)
           LIMIT 1) * 0.453592;
    user_age := DATE_PART('year', NEW.date) - DATE_PART('year', birthday);
    age_coef := COALESCE((SELECT coefficient
                 FROM age_strength_coefficients
                 WHERE age = user_age), 1);
    IF (w_ IS NOT NULL)
    THEN
      IF (gender = 'male')
      THEN
        a_ := -216.0475144;
        b_ := 16.2606339;
        c_ := -0.002388645;
        d_ := -0.00113732;
        e_ := 7.01863E-06;
        f_ := -1.291E-08;
      END IF;
      IF (gender = 'female')
      THEN
        a_ := 594.31747775582;
        b_ := -27.23842536447;
        c_ := 0.82112226871;
        d_ := -0.00930733913;
        e_ := 4.731582E-05;
        f_ := -9.054E-08;
      END IF;
      NEW.adjusted_score := NEW.weight * 0.453592 * age_coef * 500 /
                            (a_ + b_ * w_ + c_ * power(w_, 2) + d_ * power(w_, 3) + e_ * power(w_, 4) +
                             f_ * power(w_, 5));
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_strength_achievement_fields_trigger
BEFORE INSERT OR UPDATE OF date, weight, repetitions
  ON strength_achievement
FOR EACH ROW EXECUTE PROCEDURE set_strength_achievement_fields();

-- DIET PERIOD --
CREATE OR REPLACE FUNCTION set_diet_period_fields()
  RETURNS TRIGGER AS $$
BEGIN

END;
$$