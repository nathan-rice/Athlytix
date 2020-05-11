--
-- PostgreSQL database dump
--

-- Dumped from database version 9.5.7
-- Dumped by pg_dump version 9.5.7

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


--
-- Name: btree_gist; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA public;


--
-- Name: EXTENSION btree_gist; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION btree_gist IS 'support for indexing common datatypes in GiST';


--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


SET search_path = public, pg_catalog;

--
-- Name: clear_bodyfat_measurement_estimator_tf(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION clear_bodyfat_measurement_estimator_tf() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION public.clear_bodyfat_measurement_estimator_tf() OWNER TO postgres;

--
-- Name: clear_endurance_achievement_estimator_tf(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION clear_endurance_achievement_estimator_tf() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION public.clear_endurance_achievement_estimator_tf() OWNER TO postgres;

--
-- Name: clear_girth_measurement_estimator_tf(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION clear_girth_measurement_estimator_tf() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION public.clear_girth_measurement_estimator_tf() OWNER TO postgres;

--
-- Name: clear_strength_achievement_estimator_tf(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION clear_strength_achievement_estimator_tf() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF (TG_OP = 'DELETE')
  THEN
    DELETE FROM strength_estimator
    WHERE OLD.exercise = strength_estimator.exercise AND OLD.user_id = strength_estimator.user_id;
  ELSIF (TG_OP = 'INSERT')
    THEN
      DELETE FROM strength_estimator
      WHERE NEW.exercise = strength_estimator.exercise AND NEW.user_id = strength_estimator.user_id;
  ELSIF (TG_OP = 'UPDATE')
    THEN
      DELETE FROM strength_estimator
      WHERE NEW.exercise = strength_estimator.exercise AND NEW.user_id = strength_estimator.user_id;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.clear_strength_achievement_estimator_tf() OWNER TO postgres;

--
-- Name: clear_weight_measurement_estimator_tf(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION clear_weight_measurement_estimator_tf() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION public.clear_weight_measurement_estimator_tf() OWNER TO postgres;

--
-- Name: set_user_fields(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION set_user_fields() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.join_date := current_date;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.set_user_fields() OWNER TO postgres;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: age_strength_coefficients; Type: TABLE; Schema: public; Owner: athlytix
--

CREATE TABLE age_strength_coefficients (
    "Age" integer,
    "Coefficient" double precision
);


ALTER TABLE age_strength_coefficients OWNER TO athlytix;

--
-- Name: body fat_measurement_type; Type: TABLE; Schema: public; Owner: athlytix
--

CREATE TABLE "body fat_measurement_type" (
    id integer NOT NULL,
    name text,
    std_err double precision
);


ALTER TABLE "body fat_measurement_type" OWNER TO athlytix;

--
-- Name: body fat_measurement_type_id_seq; Type: SEQUENCE; Schema: public; Owner: athlytix
--

CREATE SEQUENCE "body fat_measurement_type_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "body fat_measurement_type_id_seq" OWNER TO athlytix;

--
-- Name: body fat_measurement_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: athlytix
--

ALTER SEQUENCE "body fat_measurement_type_id_seq" OWNED BY "body fat_measurement_type".id;


--
-- Name: bodyfat_estimator; Type: TABLE; Schema: public; Owner: athlytix
--

CREATE TABLE bodyfat_estimator (
    id integer NOT NULL,
    user_id integer,
    date date,
    version double precision,
    model bytea
);


ALTER TABLE bodyfat_estimator OWNER TO athlytix;

--
-- Name: bodyfat_estimator_id_seq; Type: SEQUENCE; Schema: public; Owner: athlytix
--

CREATE SEQUENCE bodyfat_estimator_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE bodyfat_estimator_id_seq OWNER TO athlytix;

--
-- Name: bodyfat_estimator_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: athlytix
--

ALTER SEQUENCE bodyfat_estimator_id_seq OWNED BY bodyfat_estimator.id;


--
-- Name: bodyfat_measurement; Type: TABLE; Schema: public; Owner: athlytix
--

CREATE TABLE bodyfat_measurement (
    id integer NOT NULL,
    user_id integer,
    measurement_type_id integer,
    date date,
    value double precision,
    picture text
);


ALTER TABLE bodyfat_measurement OWNER TO athlytix;

--
-- Name: bodyfat_measurement_id_seq; Type: SEQUENCE; Schema: public; Owner: athlytix
--

CREATE SEQUENCE bodyfat_measurement_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE bodyfat_measurement_id_seq OWNER TO athlytix;

--
-- Name: bodyfat_measurement_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: athlytix
--

ALTER SEQUENCE bodyfat_measurement_id_seq OWNED BY bodyfat_measurement.id;


--
-- Name: bodyfat_measurement_type; Type: TABLE; Schema: public; Owner: athlytix
--

CREATE TABLE bodyfat_measurement_type (
    id integer NOT NULL,
    name text,
    std_err double precision
);


ALTER TABLE bodyfat_measurement_type OWNER TO athlytix;

--
-- Name: bodyfat_measurement_type_id_seq; Type: SEQUENCE; Schema: public; Owner: athlytix
--

CREATE SEQUENCE bodyfat_measurement_type_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE bodyfat_measurement_type_id_seq OWNER TO athlytix;

--
-- Name: bodyfat_measurement_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: athlytix
--

ALTER SEQUENCE bodyfat_measurement_type_id_seq OWNED BY bodyfat_measurement_type.id;


--
-- Name: calorie_expenditure; Type: TABLE; Schema: public; Owner: athlytix
--

CREATE TABLE calorie_expenditure (
    id integer NOT NULL,
    user_id integer,
    date date,
    value double precision,
    details jsonb
);


ALTER TABLE calorie_expenditure OWNER TO athlytix;

--
-- Name: calorie_expenditure_id_seq; Type: SEQUENCE; Schema: public; Owner: athlytix
--

CREATE SEQUENCE calorie_expenditure_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE calorie_expenditure_id_seq OWNER TO athlytix;

--
-- Name: calorie_expenditure_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: athlytix
--

ALTER SEQUENCE calorie_expenditure_id_seq OWNED BY calorie_expenditure.id;


--
-- Name: calorie_intake; Type: TABLE; Schema: public; Owner: athlytix
--

CREATE TABLE calorie_intake (
    id integer NOT NULL,
    user_id integer,
    date date,
    value double precision,
    protein double precision,
    carbohydrates double precision,
    fat double precision,
    details jsonb
);


ALTER TABLE calorie_intake OWNER TO athlytix;

--
-- Name: calorie_intake_id_seq; Type: SEQUENCE; Schema: public; Owner: athlytix
--

CREATE SEQUENCE calorie_intake_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE calorie_intake_id_seq OWNER TO athlytix;

--
-- Name: calorie_intake_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: athlytix
--

ALTER SEQUENCE calorie_intake_id_seq OWNED BY calorie_intake.id;


--
-- Name: challenge_type; Type: TABLE; Schema: public; Owner: athlytix
--

CREATE TABLE challenge_type (
    id integer NOT NULL,
    name text,
    primary_parameter_name text,
    secondary_parameter_name text
);


ALTER TABLE challenge_type OWNER TO athlytix;

--
-- Name: challenge_type_id_seq; Type: SEQUENCE; Schema: public; Owner: athlytix
--

CREATE SEQUENCE challenge_type_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE challenge_type_id_seq OWNER TO athlytix;

--
-- Name: challenge_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: athlytix
--

ALTER SEQUENCE challenge_type_id_seq OWNED BY challenge_type.id;


--
-- Name: diet_period; Type: TABLE; Schema: public; Owner: athlytix
--

CREATE TABLE diet_period (
    id integer NOT NULL,
    user_id integer,
    start_date date,
    end_date date,
    name text
);


ALTER TABLE diet_period OWNER TO athlytix;

--
-- Name: diet_period_id_seq; Type: SEQUENCE; Schema: public; Owner: athlytix
--

CREATE SEQUENCE diet_period_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE diet_period_id_seq OWNER TO athlytix;

--
-- Name: diet_period_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: athlytix
--

ALTER SEQUENCE diet_period_id_seq OWNED BY diet_period.id;


--
-- Name: distance_type; Type: TABLE; Schema: public; Owner: athlytix
--

CREATE TABLE distance_type (
    id integer NOT NULL,
    name text,
    value double precision
);


ALTER TABLE distance_type OWNER TO athlytix;

--
-- Name: distance_type_id_seq; Type: SEQUENCE; Schema: public; Owner: athlytix
--

CREATE SEQUENCE distance_type_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE distance_type_id_seq OWNER TO athlytix;

--
-- Name: distance_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: athlytix
--

ALTER SEQUENCE distance_type_id_seq OWNED BY distance_type.id;


--
-- Name: endurance_achievement; Type: TABLE; Schema: public; Owner: athlytix
--

CREATE TABLE endurance_achievement (
    id integer NOT NULL,
    user_id integer,
    date date,
    exercise text,
    distance double precision,
    distance_type_id integer,
    fixed text,
    "time" double precision,
    average_heart_rate double precision,
    climb double precision,
    altitude double precision
);


ALTER TABLE endurance_achievement OWNER TO athlytix;

--
-- Name: endurance_achievement_id_seq; Type: SEQUENCE; Schema: public; Owner: athlytix
--

CREATE SEQUENCE endurance_achievement_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE endurance_achievement_id_seq OWNER TO athlytix;

--
-- Name: endurance_achievement_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: athlytix
--

ALTER SEQUENCE endurance_achievement_id_seq OWNED BY endurance_achievement.id;


--
-- Name: endurance_estimator; Type: TABLE; Schema: public; Owner: athlytix
--

CREATE TABLE endurance_estimator (
    id integer NOT NULL,
    user_id integer,
    date date,
    version double precision,
    exercise text,
    distance double precision,
    "time" double precision,
    fixed text,
    model bytea,
    distance_type_id integer
);


ALTER TABLE endurance_estimator OWNER TO athlytix;

--
-- Name: endurance_estimator_id_seq; Type: SEQUENCE; Schema: public; Owner: athlytix
--

CREATE SEQUENCE endurance_estimator_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE endurance_estimator_id_seq OWNER TO athlytix;

--
-- Name: endurance_estimator_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: athlytix
--

ALTER SEQUENCE endurance_estimator_id_seq OWNED BY endurance_estimator.id;


--
-- Name: exercise; Type: TABLE; Schema: public; Owner: athlytix
--

CREATE TABLE exercise (
    id integer NOT NULL,
    name text,
    type integer,
    description text
);


ALTER TABLE exercise OWNER TO athlytix;

--
-- Name: exercise_id_seq; Type: SEQUENCE; Schema: public; Owner: athlytix
--

CREATE SEQUENCE exercise_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE exercise_id_seq OWNER TO athlytix;

--
-- Name: exercise_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: athlytix
--

ALTER SEQUENCE exercise_id_seq OWNED BY exercise.id;


--
-- Name: exercise_type; Type: TABLE; Schema: public; Owner: athlytix
--

CREATE TABLE exercise_type (
    id integer NOT NULL,
    name text
);


ALTER TABLE exercise_type OWNER TO athlytix;

--
-- Name: exercise_type_id_seq; Type: SEQUENCE; Schema: public; Owner: athlytix
--

CREATE SEQUENCE exercise_type_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE exercise_type_id_seq OWNER TO athlytix;

--
-- Name: exercise_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: athlytix
--

ALTER SEQUENCE exercise_type_id_seq OWNED BY exercise_type.id;


--
-- Name: girth_estimator; Type: TABLE; Schema: public; Owner: athlytix
--

CREATE TABLE girth_estimator (
    id integer NOT NULL,
    user_id integer,
    date date,
    version double precision,
    location text,
    model bytea
);


ALTER TABLE girth_estimator OWNER TO athlytix;

--
-- Name: girth_estimator_id_seq; Type: SEQUENCE; Schema: public; Owner: athlytix
--

CREATE SEQUENCE girth_estimator_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE girth_estimator_id_seq OWNER TO athlytix;

--
-- Name: girth_estimator_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: athlytix
--

ALTER SEQUENCE girth_estimator_id_seq OWNED BY girth_estimator.id;


--
-- Name: girth_measurement; Type: TABLE; Schema: public; Owner: athlytix
--

CREATE TABLE girth_measurement (
    id integer NOT NULL,
    user_id integer,
    date date,
    location text,
    value double precision
);


ALTER TABLE girth_measurement OWNER TO athlytix;

--
-- Name: girth_measurement_id_seq; Type: SEQUENCE; Schema: public; Owner: athlytix
--

CREATE SEQUENCE girth_measurement_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE girth_measurement_id_seq OWNER TO athlytix;

--
-- Name: girth_measurement_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: athlytix
--

ALTER SEQUENCE girth_measurement_id_seq OWNED BY girth_measurement.id;


--
-- Name: girth_measurement_type; Type: TABLE; Schema: public; Owner: athlytix
--

CREATE TABLE girth_measurement_type (
    id integer NOT NULL,
    name integer
);


ALTER TABLE girth_measurement_type OWNER TO athlytix;

--
-- Name: girth_measurement_type_id_seq; Type: SEQUENCE; Schema: public; Owner: athlytix
--

CREATE SEQUENCE girth_measurement_type_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE girth_measurement_type_id_seq OWNER TO athlytix;

--
-- Name: girth_measurement_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: athlytix
--

ALTER SEQUENCE girth_measurement_type_id_seq OWNED BY girth_measurement_type.id;


--
-- Name: goal; Type: TABLE; Schema: public; Owner: athlytix
--

CREATE TABLE goal (
    id integer NOT NULL,
    goal_type_id integer,
    user_id integer,
    date date,
    value double precision,
    parameters jsonb,
    creation_date date
);


ALTER TABLE goal OWNER TO athlytix;

--
-- Name: goal_id_seq; Type: SEQUENCE; Schema: public; Owner: athlytix
--

CREATE SEQUENCE goal_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE goal_id_seq OWNER TO athlytix;

--
-- Name: goal_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: athlytix
--

ALTER SEQUENCE goal_id_seq OWNED BY goal.id;


--
-- Name: goal_type; Type: TABLE; Schema: public; Owner: athlytix
--

CREATE TABLE goal_type (
    id integer NOT NULL,
    name text
);


ALTER TABLE goal_type OWNER TO athlytix;

--
-- Name: goal_type_id_seq; Type: SEQUENCE; Schema: public; Owner: athlytix
--

CREATE SEQUENCE goal_type_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE goal_type_id_seq OWNER TO athlytix;

--
-- Name: goal_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: athlytix
--

ALTER SEQUENCE goal_type_id_seq OWNED BY goal_type.id;


--
-- Name: strength_achievement; Type: TABLE; Schema: public; Owner: athlytix
--

CREATE TABLE strength_achievement (
    id integer NOT NULL,
    user_id integer,
    date date,
    exercise text,
    weight double precision,
    repetitions integer,
    comment text,
    video text,
    predicted_1rm double precision,
    adjusted_score double precision,
    rpe double precision,
    average_velocity double precision
);


ALTER TABLE strength_achievement OWNER TO athlytix;

--
-- Name: strength_achievements_id_seq; Type: SEQUENCE; Schema: public; Owner: athlytix
--

CREATE SEQUENCE strength_achievements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE strength_achievements_id_seq OWNER TO athlytix;

--
-- Name: strength_achievements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: athlytix
--

ALTER SEQUENCE strength_achievements_id_seq OWNED BY strength_achievement.id;


--
-- Name: strength_estimator; Type: TABLE; Schema: public; Owner: athlytix
--

CREATE TABLE strength_estimator (
    id integer NOT NULL,
    user_id integer,
    date date,
    version double precision,
    exercise text,
    model bytea
);


ALTER TABLE strength_estimator OWNER TO athlytix;

--
-- Name: strength_estimator_id_seq; Type: SEQUENCE; Schema: public; Owner: athlytix
--

CREATE SEQUENCE strength_estimator_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE strength_estimator_id_seq OWNER TO athlytix;

--
-- Name: strength_estimator_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: athlytix
--

ALTER SEQUENCE strength_estimator_id_seq OWNED BY strength_estimator.id;


--
-- Name: trainer_request; Type: TABLE; Schema: public; Owner: athlytix
--

CREATE TABLE trainer_request (
    id integer NOT NULL,
    user_id integer,
    trainer_id integer,
    date date,
    message text
);


ALTER TABLE trainer_request OWNER TO athlytix;

--
-- Name: trainer_request_id_seq; Type: SEQUENCE; Schema: public; Owner: athlytix
--

CREATE SEQUENCE trainer_request_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE trainer_request_id_seq OWNER TO athlytix;

--
-- Name: trainer_request_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: athlytix
--

ALTER SEQUENCE trainer_request_id_seq OWNED BY trainer_request.id;


--
-- Name: training_period; Type: TABLE; Schema: public; Owner: athlytix
--

CREATE TABLE training_period (
    id integer NOT NULL,
    user_id integer,
    start_date date,
    end_date date,
    name text
);


ALTER TABLE training_period OWNER TO athlytix;

--
-- Name: training_period_id_seq; Type: SEQUENCE; Schema: public; Owner: athlytix
--

CREATE SEQUENCE training_period_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE training_period_id_seq OWNER TO athlytix;

--
-- Name: training_period_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: athlytix
--

ALTER SEQUENCE training_period_id_seq OWNED BY training_period.id;


--
-- Name: user; Type: TABLE; Schema: public; Owner: athlytix
--

CREATE TABLE "user" (
    id integer NOT NULL,
    username text,
    password text,
    email text,
    active boolean NOT NULL,
    is_confirmed boolean,
    confirmation_code text,
    is_trainer boolean,
    is_premium boolean,
    next_bill_date date,
    first_name text,
    last_name text,
    birthday date,
    height double precision,
    trainer_id integer,
    layouts jsonb,
    city text,
    state text,
    zip_code text,
    about text,
    is_public boolean,
    country text,
    gender text,
    metric_units boolean,
    join_date date,
    referrer_id integer,
    youtube text,
    instagram text,
    twitter text,
    is_admin boolean
);


ALTER TABLE "user" OWNER TO athlytix;

--
-- Name: user_id_seq; Type: SEQUENCE; Schema: public; Owner: athlytix
--

CREATE SEQUENCE user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE user_id_seq OWNER TO athlytix;

--
-- Name: user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: athlytix
--

ALTER SEQUENCE user_id_seq OWNED BY "user".id;


--
-- Name: weight_estimator; Type: TABLE; Schema: public; Owner: athlytix
--

CREATE TABLE weight_estimator (
    id integer NOT NULL,
    user_id integer,
    date date,
    version double precision,
    model bytea
);


ALTER TABLE weight_estimator OWNER TO athlytix;

--
-- Name: weight_estimator_id_seq; Type: SEQUENCE; Schema: public; Owner: athlytix
--

CREATE SEQUENCE weight_estimator_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE weight_estimator_id_seq OWNER TO athlytix;

--
-- Name: weight_estimator_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: athlytix
--

ALTER SEQUENCE weight_estimator_id_seq OWNED BY weight_estimator.id;


--
-- Name: weight_measurement; Type: TABLE; Schema: public; Owner: athlytix
--

CREATE TABLE weight_measurement (
    id integer NOT NULL,
    user_id integer,
    date date,
    value double precision,
    picture text
);


ALTER TABLE weight_measurement OWNER TO athlytix;

--
-- Name: weight_measurement_id_seq; Type: SEQUENCE; Schema: public; Owner: athlytix
--

CREATE SEQUENCE weight_measurement_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE weight_measurement_id_seq OWNER TO athlytix;

--
-- Name: weight_measurement_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: athlytix
--

ALTER SEQUENCE weight_measurement_id_seq OWNED BY weight_measurement.id;


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY "body fat_measurement_type" ALTER COLUMN id SET DEFAULT nextval('"body fat_measurement_type_id_seq"'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY bodyfat_estimator ALTER COLUMN id SET DEFAULT nextval('bodyfat_estimator_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY bodyfat_measurement ALTER COLUMN id SET DEFAULT nextval('bodyfat_measurement_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY bodyfat_measurement_type ALTER COLUMN id SET DEFAULT nextval('bodyfat_measurement_type_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY calorie_expenditure ALTER COLUMN id SET DEFAULT nextval('calorie_expenditure_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY calorie_intake ALTER COLUMN id SET DEFAULT nextval('calorie_intake_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY challenge_type ALTER COLUMN id SET DEFAULT nextval('challenge_type_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY diet_period ALTER COLUMN id SET DEFAULT nextval('diet_period_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY distance_type ALTER COLUMN id SET DEFAULT nextval('distance_type_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY endurance_achievement ALTER COLUMN id SET DEFAULT nextval('endurance_achievement_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY endurance_estimator ALTER COLUMN id SET DEFAULT nextval('endurance_estimator_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY exercise ALTER COLUMN id SET DEFAULT nextval('exercise_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY exercise_type ALTER COLUMN id SET DEFAULT nextval('exercise_type_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY girth_estimator ALTER COLUMN id SET DEFAULT nextval('girth_estimator_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY girth_measurement ALTER COLUMN id SET DEFAULT nextval('girth_measurement_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY girth_measurement_type ALTER COLUMN id SET DEFAULT nextval('girth_measurement_type_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY goal ALTER COLUMN id SET DEFAULT nextval('goal_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY goal_type ALTER COLUMN id SET DEFAULT nextval('goal_type_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY strength_achievement ALTER COLUMN id SET DEFAULT nextval('strength_achievements_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY strength_estimator ALTER COLUMN id SET DEFAULT nextval('strength_estimator_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY trainer_request ALTER COLUMN id SET DEFAULT nextval('trainer_request_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY training_period ALTER COLUMN id SET DEFAULT nextval('training_period_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY "user" ALTER COLUMN id SET DEFAULT nextval('user_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY weight_estimator ALTER COLUMN id SET DEFAULT nextval('weight_estimator_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY weight_measurement ALTER COLUMN id SET DEFAULT nextval('weight_measurement_id_seq'::regclass);


--
-- Name: body fat_measurement_type_pkey; Type: CONSTRAINT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY "body fat_measurement_type"
    ADD CONSTRAINT "body fat_measurement_type_pkey" PRIMARY KEY (id);


--
-- Name: bodyfat_estimator_pkey; Type: CONSTRAINT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY bodyfat_estimator
    ADD CONSTRAINT bodyfat_estimator_pkey PRIMARY KEY (id);


--
-- Name: bodyfat_measurement_pkey; Type: CONSTRAINT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY bodyfat_measurement
    ADD CONSTRAINT bodyfat_measurement_pkey PRIMARY KEY (id);


--
-- Name: bodyfat_measurement_type_pkey; Type: CONSTRAINT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY bodyfat_measurement_type
    ADD CONSTRAINT bodyfat_measurement_type_pkey PRIMARY KEY (id);


--
-- Name: calorie_expenditure_pkey; Type: CONSTRAINT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY calorie_expenditure
    ADD CONSTRAINT calorie_expenditure_pkey PRIMARY KEY (id);


--
-- Name: calorie_intake_pkey; Type: CONSTRAINT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY calorie_intake
    ADD CONSTRAINT calorie_intake_pkey PRIMARY KEY (id);


--
-- Name: challenge_type_pkey; Type: CONSTRAINT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY challenge_type
    ADD CONSTRAINT challenge_type_pkey PRIMARY KEY (id);


--
-- Name: diet_period_pkey; Type: CONSTRAINT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY diet_period
    ADD CONSTRAINT diet_period_pkey PRIMARY KEY (id);


--
-- Name: distance_type_pkey; Type: CONSTRAINT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY distance_type
    ADD CONSTRAINT distance_type_pkey PRIMARY KEY (id);


--
-- Name: endurance_achievement_pkey; Type: CONSTRAINT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY endurance_achievement
    ADD CONSTRAINT endurance_achievement_pkey PRIMARY KEY (id);


--
-- Name: endurance_estimator_pkey; Type: CONSTRAINT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY endurance_estimator
    ADD CONSTRAINT endurance_estimator_pkey PRIMARY KEY (id);


--
-- Name: exercise_pkey; Type: CONSTRAINT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY exercise
    ADD CONSTRAINT exercise_pkey PRIMARY KEY (id);


--
-- Name: exercise_type_pkey; Type: CONSTRAINT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY exercise_type
    ADD CONSTRAINT exercise_type_pkey PRIMARY KEY (id);


--
-- Name: girth_estimator_pkey; Type: CONSTRAINT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY girth_estimator
    ADD CONSTRAINT girth_estimator_pkey PRIMARY KEY (id);


--
-- Name: girth_measurement_pkey; Type: CONSTRAINT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY girth_measurement
    ADD CONSTRAINT girth_measurement_pkey PRIMARY KEY (id);


--
-- Name: girth_measurement_type_pkey; Type: CONSTRAINT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY girth_measurement_type
    ADD CONSTRAINT girth_measurement_type_pkey PRIMARY KEY (id);


--
-- Name: goal_pkey; Type: CONSTRAINT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY goal
    ADD CONSTRAINT goal_pkey PRIMARY KEY (id);


--
-- Name: goal_type_pkey; Type: CONSTRAINT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY goal_type
    ADD CONSTRAINT goal_type_pkey PRIMARY KEY (id);


--
-- Name: strength_achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY strength_achievement
    ADD CONSTRAINT strength_achievements_pkey PRIMARY KEY (id);


--
-- Name: strength_estimator_pkey; Type: CONSTRAINT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY strength_estimator
    ADD CONSTRAINT strength_estimator_pkey PRIMARY KEY (id);


--
-- Name: trainer_request_pkey; Type: CONSTRAINT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY trainer_request
    ADD CONSTRAINT trainer_request_pkey PRIMARY KEY (id);


--
-- Name: training_period_pkey; Type: CONSTRAINT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY training_period
    ADD CONSTRAINT training_period_pkey PRIMARY KEY (id);


--
-- Name: unique_name; Type: CONSTRAINT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY exercise
    ADD CONSTRAINT unique_name UNIQUE (name);


--
-- Name: user_email_key; Type: CONSTRAINT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY "user"
    ADD CONSTRAINT user_email_key UNIQUE (email);


--
-- Name: user_pkey; Type: CONSTRAINT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY "user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: user_username_key; Type: CONSTRAINT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY "user"
    ADD CONSTRAINT user_username_key UNIQUE (username);


--
-- Name: weight_estimator_pkey; Type: CONSTRAINT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY weight_estimator
    ADD CONSTRAINT weight_estimator_pkey PRIMARY KEY (id);


--
-- Name: weight_measurement_pkey; Type: CONSTRAINT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY weight_measurement
    ADD CONSTRAINT weight_measurement_pkey PRIMARY KEY (id);


--
-- Name: endurance_achievement_exercise_idx; Type: INDEX; Schema: public; Owner: athlytix
--

CREATE INDEX endurance_achievement_exercise_idx ON endurance_achievement USING gist (exercise);


--
-- Name: index_user_city; Type: INDEX; Schema: public; Owner: athlytix
--

CREATE INDEX index_user_city ON "user" USING gist (city gist_trgm_ops);


--
-- Name: index_user_country; Type: INDEX; Schema: public; Owner: athlytix
--

CREATE INDEX index_user_country ON "user" USING gist (country gist_trgm_ops);


--
-- Name: index_user_firstname; Type: INDEX; Schema: public; Owner: athlytix
--

CREATE INDEX index_user_firstname ON "user" USING gist (first_name gist_trgm_ops);


--
-- Name: index_user_lastname; Type: INDEX; Schema: public; Owner: athlytix
--

CREATE INDEX index_user_lastname ON "user" USING gist (last_name gist_trgm_ops);


--
-- Name: index_user_state; Type: INDEX; Schema: public; Owner: athlytix
--

CREATE INDEX index_user_state ON "user" USING gist (state gist_trgm_ops);


--
-- Name: ix_age_strength_coefficients_Age; Type: INDEX; Schema: public; Owner: athlytix
--

CREATE INDEX "ix_age_strength_coefficients_Age" ON age_strength_coefficients USING btree ("Age");


--
-- Name: strength_achievements_epley_idx; Type: INDEX; Schema: public; Owner: athlytix
--

CREATE INDEX strength_achievements_epley_idx ON strength_achievement USING gist (predicted_1rm);


--
-- Name: strength_achievements_exercise_idx; Type: INDEX; Schema: public; Owner: athlytix
--

CREATE INDEX strength_achievements_exercise_idx ON strength_achievement USING gist (exercise);


--
-- Name: strength_achievements_wilks_idx; Type: INDEX; Schema: public; Owner: athlytix
--

CREATE INDEX strength_achievements_wilks_idx ON strength_achievement USING gist (adjusted_score);


--
-- Name: trgm_idx; Type: INDEX; Schema: public; Owner: athlytix
--

CREATE INDEX trgm_idx ON exercise USING gist (name gist_trgm_ops);


--
-- Name: user_full_name_index; Type: INDEX; Schema: public; Owner: athlytix
--

CREATE INDEX user_full_name_index ON "user" USING btree ((((first_name || ' '::text) || last_name)));


--
-- Name: user_gender_idx; Type: INDEX; Schema: public; Owner: athlytix
--

CREATE INDEX user_gender_idx ON "user" USING gist (gender);


--
-- Name: weight_measurement_date_idx; Type: INDEX; Schema: public; Owner: athlytix
--

CREATE INDEX weight_measurement_date_idx ON weight_measurement USING gist (date);


--
-- Name: clear_bodyfat_measurement_estimator_trigger; Type: TRIGGER; Schema: public; Owner: athlytix
--

CREATE TRIGGER clear_bodyfat_measurement_estimator_trigger AFTER INSERT OR DELETE OR UPDATE ON bodyfat_measurement FOR EACH ROW EXECUTE PROCEDURE clear_bodyfat_measurement_estimator_tf();


--
-- Name: clear_endurance_achievement_estimator_trigger; Type: TRIGGER; Schema: public; Owner: athlytix
--

CREATE TRIGGER clear_endurance_achievement_estimator_trigger AFTER INSERT OR DELETE OR UPDATE ON endurance_achievement FOR EACH ROW EXECUTE PROCEDURE clear_endurance_achievement_estimator_tf();


--
-- Name: clear_girth_measurement_estimator_trigger; Type: TRIGGER; Schema: public; Owner: athlytix
--

CREATE TRIGGER clear_girth_measurement_estimator_trigger AFTER INSERT OR DELETE OR UPDATE ON girth_measurement FOR EACH ROW EXECUTE PROCEDURE clear_girth_measurement_estimator_tf();


--
-- Name: clear_strength_achievement_estimator_trigger; Type: TRIGGER; Schema: public; Owner: athlytix
--

CREATE TRIGGER clear_strength_achievement_estimator_trigger AFTER INSERT OR DELETE OR UPDATE OF weight, repetitions ON strength_achievement FOR EACH ROW EXECUTE PROCEDURE clear_strength_achievement_estimator_tf();


--
-- Name: clear_weight_achievement_estimator_trigger; Type: TRIGGER; Schema: public; Owner: athlytix
--

CREATE TRIGGER clear_weight_achievement_estimator_trigger AFTER INSERT OR DELETE OR UPDATE ON weight_measurement FOR EACH ROW EXECUTE PROCEDURE clear_weight_measurement_estimator_tf();


--
-- Name: set_user_fields_trigger; Type: TRIGGER; Schema: public; Owner: athlytix
--

CREATE TRIGGER set_user_fields_trigger BEFORE INSERT ON "user" FOR EACH ROW EXECUTE PROCEDURE set_user_fields();


--
-- Name: bodyfat_estimator_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY bodyfat_estimator
    ADD CONSTRAINT bodyfat_estimator_user_id_fkey FOREIGN KEY (user_id) REFERENCES "user"(id);


--
-- Name: bodyfat_measurement_measurement_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY bodyfat_measurement
    ADD CONSTRAINT bodyfat_measurement_measurement_type_id_fkey FOREIGN KEY (measurement_type_id) REFERENCES bodyfat_measurement_type(id);


--
-- Name: bodyfat_measurement_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY bodyfat_measurement
    ADD CONSTRAINT bodyfat_measurement_user_id_fkey FOREIGN KEY (user_id) REFERENCES "user"(id);


--
-- Name: calorie_expenditure_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY calorie_expenditure
    ADD CONSTRAINT calorie_expenditure_user_id_fkey FOREIGN KEY (user_id) REFERENCES "user"(id);


--
-- Name: calorie_intake_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY calorie_intake
    ADD CONSTRAINT calorie_intake_user_id_fkey FOREIGN KEY (user_id) REFERENCES "user"(id);


--
-- Name: diet_period_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY diet_period
    ADD CONSTRAINT diet_period_user_id_fkey FOREIGN KEY (user_id) REFERENCES "user"(id);


--
-- Name: endurance_achievement_distance_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY endurance_achievement
    ADD CONSTRAINT endurance_achievement_distance_type_id_fkey FOREIGN KEY (distance_type_id) REFERENCES distance_type(id);


--
-- Name: endurance_achievement_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY endurance_achievement
    ADD CONSTRAINT endurance_achievement_user_id_fkey FOREIGN KEY (user_id) REFERENCES "user"(id);


--
-- Name: endurance_estimator_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY endurance_estimator
    ADD CONSTRAINT endurance_estimator_user_id_fkey FOREIGN KEY (user_id) REFERENCES "user"(id);


--
-- Name: exercise_type_fkey; Type: FK CONSTRAINT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY exercise
    ADD CONSTRAINT exercise_type_fkey FOREIGN KEY (type) REFERENCES exercise_type(id);


--
-- Name: girth_estimator_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY girth_estimator
    ADD CONSTRAINT girth_estimator_user_id_fkey FOREIGN KEY (user_id) REFERENCES "user"(id);


--
-- Name: girth_measurement_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY girth_measurement
    ADD CONSTRAINT girth_measurement_user_id_fkey FOREIGN KEY (user_id) REFERENCES "user"(id);


--
-- Name: goal_goal_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY goal
    ADD CONSTRAINT goal_goal_type_id_fkey FOREIGN KEY (goal_type_id) REFERENCES goal_type(id);


--
-- Name: goal_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY goal
    ADD CONSTRAINT goal_user_id_fkey FOREIGN KEY (user_id) REFERENCES "user"(id);


--
-- Name: strength_achievements_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY strength_achievement
    ADD CONSTRAINT strength_achievements_user_id_fkey FOREIGN KEY (user_id) REFERENCES "user"(id);


--
-- Name: strength_estimator_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY strength_estimator
    ADD CONSTRAINT strength_estimator_user_id_fkey FOREIGN KEY (user_id) REFERENCES "user"(id);


--
-- Name: trainer_request_trainer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY trainer_request
    ADD CONSTRAINT trainer_request_trainer_id_fkey FOREIGN KEY (trainer_id) REFERENCES "user"(id);


--
-- Name: trainer_request_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY trainer_request
    ADD CONSTRAINT trainer_request_user_id_fkey FOREIGN KEY (user_id) REFERENCES "user"(id);


--
-- Name: training_period_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY training_period
    ADD CONSTRAINT training_period_user_id_fkey FOREIGN KEY (user_id) REFERENCES "user"(id);


--
-- Name: user_trainer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY "user"
    ADD CONSTRAINT user_trainer_id_fkey FOREIGN KEY (trainer_id) REFERENCES "user"(id);


--
-- Name: weight_estimator_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY weight_estimator
    ADD CONSTRAINT weight_estimator_user_id_fkey FOREIGN KEY (user_id) REFERENCES "user"(id);


--
-- Name: weight_measurement_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY weight_measurement
    ADD CONSTRAINT weight_measurement_user_id_fkey FOREIGN KEY (user_id) REFERENCES "user"(id);


--
-- Name: public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

