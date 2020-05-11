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
    details text,
    name text
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
    details text,
    name text,
    amount double precision,
    fiber double precision
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
-- Name: diet_period; Type: TABLE; Schema: public; Owner: athlytix
--

CREATE TABLE diet_period (
    id integer NOT NULL,
    user_id integer,
    start_date date,
    end_date date,
    name text,
    details text,
    example_date date
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
    altitude double precision,
    descent double precision,
    temperature double precision
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
    name text,
    details text
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
-- Data for Name: age_strength_coefficients; Type: TABLE DATA; Schema: public; Owner: athlytix
--

COPY age_strength_coefficients ("Age", "Coefficient") FROM stdin;
14	1.22999999999999998
15	1.17999999999999994
16	1.12999999999999989
17	1.08000000000000007
18	1.06000000000000005
19	1.04000000000000004
20	1.03000000000000003
21	1.02000000000000002
22	1.01000000000000001
23	1
40	1
41	1.01000000000000001
42	1.02000000000000002
43	1.03099999999999992
44	1.04299999999999993
45	1.05499999999999994
46	1.06800000000000006
47	1.08200000000000007
48	1.09699999999999998
49	1.11299999999999999
50	1.12999999999999989
51	1.14700000000000002
52	1.16500000000000004
53	1.18400000000000016
54	1.20399999999999996
55	1.22500000000000009
56	1.246
57	1.25800000000000001
58	1.29199999999999982
59	1.31499999999999995
60	1.34000000000000008
61	1.36599999999999988
62	1.39300000000000002
63	1.42100000000000004
64	1.44999999999999996
65	1.47999999999999998
66	1.5109999999999999
67	1.54300000000000015
68	1.57800000000000007
69	1.6100000000000001
70	1.64500000000000002
71	1.68100000000000005
72	1.71800000000000019
73	1.75600000000000001
74	1.79499999999999993
75	1.83499999999999996
76	1.87599999999999989
77	1.91800000000000015
78	1.96099999999999985
79	2.00499999999999989
80	2.04999999999999982
\.


--
-- Data for Name: bodyfat_estimator; Type: TABLE DATA; Schema: public; Owner: athlytix
--

COPY bodyfat_estimator (id, user_id, date, version, model) FROM stdin;
\.


--
-- Name: bodyfat_estimator_id_seq; Type: SEQUENCE SET; Schema: public; Owner: athlytix
--

SELECT pg_catalog.setval('bodyfat_estimator_id_seq', 57, true);


--
-- Data for Name: bodyfat_measurement; Type: TABLE DATA; Schema: public; Owner: athlytix
--

COPY bodyfat_measurement (id, user_id, measurement_type_id, date, value, picture) FROM stdin;
2	1	3	2017-08-27	11.2096359432847521	\N
5	1	1	2017-08-27	22.9717930002158326	\N
6	1	1	2017-09-09	21.2736065547987678	\N
7	1	3	2017-09-09	10.5945233922323609	\N
9	1	3	2017-09-19	9.34830147724937888	\N
\.


--
-- Name: bodyfat_measurement_id_seq; Type: SEQUENCE SET; Schema: public; Owner: athlytix
--

SELECT pg_catalog.setval('bodyfat_measurement_id_seq', 9, true);


--
-- Data for Name: bodyfat_measurement_type; Type: TABLE DATA; Schema: public; Owner: athlytix
--

COPY bodyfat_measurement_type (id, name, std_err) FROM stdin;
5	Bod Pod	3
4	DXA	1.5
6	Hydrostatic Weighing	1
2	Bioelectric Impedence	3.5
1	Navy Estimator	4.25
3	Caliper (3 site)	2.5
\.


--
-- Name: bodyfat_measurement_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: athlytix
--

SELECT pg_catalog.setval('bodyfat_measurement_type_id_seq', 1, false);


--
-- Data for Name: calorie_expenditure; Type: TABLE DATA; Schema: public; Owner: athlytix
--

COPY calorie_expenditure (id, user_id, date, value, details, name) FROM stdin;
2	1	2017-09-13	617	60 minutes, incline 13, resistance 17	Elliptical
3	1	2017-09-11	617	60 minutes, incline 13, resistance 17	Elliptical
4	1	2017-09-08	617	60 minutes, incline 13, resistance 17	Elliptical
5	1	2017-09-06	617	60 minutes, incline 13, resistance 17	Elliptical
6	1	2017-09-04	617	60 minutes, incline 13, resistance 17	Elliptical
7	1	2017-09-01	617	60 minutes, incline 13, resistance 17	Elliptical
8	1	2017-09-15	617	60 minutes, incline 13, resistance 17	Elliptical
\.


--
-- Name: calorie_expenditure_id_seq; Type: SEQUENCE SET; Schema: public; Owner: athlytix
--

SELECT pg_catalog.setval('calorie_expenditure_id_seq', 8, true);


--
-- Data for Name: calorie_intake; Type: TABLE DATA; Schema: public; Owner: athlytix
--

COPY calorie_intake (id, user_id, date, value, protein, carbohydrates, fat, details, name, amount, fiber) FROM stdin;
22	1	2017-09-18	812	59.2999999999999972	138.199999999999989	2.39999999999999991	\N	Lentils, raw	230	70.0999999999999943
24	1	2017-09-18	523	71.5999999999999943	0	24.1000000000000014	\N	Pork Loin	250	0
25	1	2017-09-18	429	37.7000000000000028	2.20000000000000018	28.5	\N	Egg	306.199999999999989	0
26	1	2017-09-18	105	2.29999999999999982	25.3000000000000007	0.200000000000000011	\N	Onions	250	3.5
28	1	2017-09-18	64	1.30000000000000004	15.4000000000000004	0.599999999999999978	\N	Strawberries	200	4
30	1	2017-09-18	178	2.20000000000000018	45.7000000000000028	0.699999999999999956	\N	Bananas	200	5.20000000000000018
33	1	2017-09-18	362	34.8999999999999986	49.1000000000000014	2.39999999999999991	\N	Nonfat Milk	907.200000000000045	0
34	1	2017-09-18	56	5	7.5	1.19999999999999996	\N	Powdered Peanut Butter	15	1.19999999999999996
23	1	2017-09-18	25	2.10000000000000009	6.29999999999999982	1.5	\N	Cocoa Powder	11.3000000000000007	3.60000000000000009
31	1	2017-09-18	143	4.40000000000000036	5.90000000000000036	12.4000000000000004	\N	Sesame Seeds	25	2.89999999999999991
27	1	2017-09-18	116	9.59999999999999964	22.6000000000000014	1.30000000000000004	\N	Broccoli	340.199999999999989	8.80000000000000071
29	1	2017-09-18	258	61.5	0	1.19999999999999996	\N	Whey Protein Isolate	75	0
32	1	2017-09-18	123	3.89999999999999991	11	7.70000000000000018	\N	Chia Seeds, dried	25	9.40000000000000036
\.


--
-- Name: calorie_intake_id_seq; Type: SEQUENCE SET; Schema: public; Owner: athlytix
--

SELECT pg_catalog.setval('calorie_intake_id_seq', 34, true);


--
-- Data for Name: diet_period; Type: TABLE DATA; Schema: public; Owner: athlytix
--

COPY diet_period (id, user_id, start_date, end_date, name, details, example_date) FROM stdin;
10	1	\N	\N	Normal Diet	\N	2017-09-18
\.


--
-- Name: diet_period_id_seq; Type: SEQUENCE SET; Schema: public; Owner: athlytix
--

SELECT pg_catalog.setval('diet_period_id_seq', 10, true);


--
-- Data for Name: distance_type; Type: TABLE DATA; Schema: public; Owner: athlytix
--

COPY distance_type (id, name, value) FROM stdin;
1	Miles	5280
2	Kilometers	3280.84000000000015
3	Meters	3.28083999999999998
4	Feet	1
5	Yards	3
6	Steps	2.5
\.


--
-- Name: distance_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: athlytix
--

SELECT pg_catalog.setval('distance_type_id_seq', 1, false);


--
-- Data for Name: endurance_achievement; Type: TABLE DATA; Schema: public; Owner: athlytix
--

COPY endurance_achievement (id, user_id, date, exercise, distance, distance_type_id, fixed, "time", average_heart_rate, climb, altitude, descent, temperature) FROM stdin;
7	1	2017-08-27	Running	13.0999999999999996	1	distance	3983	\N	\N	\N	\N	\N
8	1	2017-06-10	Running	5	2	distance	861	\N	\N	\N	\N	\N
9	1	2017-05-28	Running	5	2	distance	852.259999999999991	\N	\N	\N	\N	\N
11	1	2017-05-25	Running	10	2	distance	1784.97000000000003	\N	\N	\N	\N	\N
10	1	2017-05-30	Running	10	2	distance	1750	\N	\N	\N	\N	\N
13	1	2017-04-01	Running	5	2	distance	837.509999999999991	\N	\N	\N	\N	\N
14	1	2017-03-05	Running	13.0999999999999996	1	distance	3735	\N	\N	\N	\N	\N
15	1	2017-01-02	Running	23.1999999999999993	2	distance	4089	\N	\N	\N	\N	\N
19	1	2016-10-10	Running	8.5	2	distance	1516	\N	\N	\N	\N	\N
18	1	2016-11-06	Running	14.5999999999999996	2	distance	2627	\N	\N	\N	\N	\N
17	1	2016-11-26	Running	10	2	distance	1758	\N	\N	\N	\N	\N
12	1	2017-04-23	Running	10	2	distance	1747	\N	\N	\N	\N	\N
\.


--
-- Name: endurance_achievement_id_seq; Type: SEQUENCE SET; Schema: public; Owner: athlytix
--

SELECT pg_catalog.setval('endurance_achievement_id_seq', 19, true);


--
-- Data for Name: endurance_estimator; Type: TABLE DATA; Schema: public; Owner: athlytix
--

COPY endurance_estimator (id, user_id, date, version, exercise, distance, "time", fixed, model, distance_type_id) FROM stdin;
\.


--
-- Name: endurance_estimator_id_seq; Type: SEQUENCE SET; Schema: public; Owner: athlytix
--

SELECT pg_catalog.setval('endurance_estimator_id_seq', 2, true);


--
-- Data for Name: exercise; Type: TABLE DATA; Schema: public; Owner: athlytix
--

COPY exercise (id, name, type, description) FROM stdin;
95	Running	\N	\N
3	Decline Bench Press	\N	\N
6	Deadlift	\N	\N
8	Squat	\N	\N
9	Good Morning	\N	\N
10	Preacher Ez-Bar Curl	\N	\N
12	Incline Bench Press	\N	\N
13	Cable Fly	\N	\N
16	Guillotine Press	\N	\N
17	T-Bar Row	\N	\N
21	Lat Pressdown	\N	\N
30	Db Curl	\N	\N
38	Db Lateral Raise	\N	\N
40	Snatch Grip Stiff-Leg Deadlift	\N	\N
42	Suitcase Row	\N	\N
45	Reverse Fly	\N	\N
48	Reverse Grip Curl	\N	\N
67	Seated Cable Fly	\N	\N
69	Reverse Grip Bench	\N	\N
85	Wide Grip Bench	\N	\N
88	Seated Dip Machine	\N	\N
89	Cross Bar Lat Pulldown	\N	\N
92	Triceps Pressdown	\N	\N
\.


--
-- Name: exercise_id_seq; Type: SEQUENCE SET; Schema: public; Owner: athlytix
--

SELECT pg_catalog.setval('exercise_id_seq', 135, true);


--
-- Data for Name: exercise_type; Type: TABLE DATA; Schema: public; Owner: athlytix
--

COPY exercise_type (id, name) FROM stdin;
\.


--
-- Name: exercise_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: athlytix
--

SELECT pg_catalog.setval('exercise_type_id_seq', 1, false);


--
-- Data for Name: girth_estimator; Type: TABLE DATA; Schema: public; Owner: athlytix
--

COPY girth_estimator (id, user_id, date, version, location, model) FROM stdin;
\.


--
-- Name: girth_estimator_id_seq; Type: SEQUENCE SET; Schema: public; Owner: athlytix
--

SELECT pg_catalog.setval('girth_estimator_id_seq', 3, true);


--
-- Data for Name: girth_measurement; Type: TABLE DATA; Schema: public; Owner: athlytix
--

COPY girth_measurement (id, user_id, date, location, value) FROM stdin;
12	1	2017-08-27	Neck	16
13	1	2017-08-27	Waist	38.5
14	1	2017-08-28	Arm	17.625
15	1	2017-08-28	Thigh	26.5
16	1	2017-08-28	Forearm	13.625
17	1	2017-08-28	Calf	17
18	1	2017-08-28	Chest	47
19	1	2017-09-09	Neck	16
20	1	2017-09-09	Waist	37.5
\.


--
-- Name: girth_measurement_id_seq; Type: SEQUENCE SET; Schema: public; Owner: athlytix
--

SELECT pg_catalog.setval('girth_measurement_id_seq', 20, true);


--
-- Data for Name: girth_measurement_type; Type: TABLE DATA; Schema: public; Owner: athlytix
--

COPY girth_measurement_type (id, name) FROM stdin;
\.


--
-- Name: girth_measurement_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: athlytix
--

SELECT pg_catalog.setval('girth_measurement_type_id_seq', 1, false);


--
-- Data for Name: goal; Type: TABLE DATA; Schema: public; Owner: athlytix
--

COPY goal (id, goal_type_id, user_id, date, value, parameters, creation_date) FROM stdin;
5	3	1	2017-10-03	325	{"exercise": "Cross Bar Lat Pulldown", "repetitions": "1"}	2017-09-04
9	3	1	2017-10-10	480	{"exercise": "Seated Dip Machine", "repetitions": "1"}	\N
1	1	1	2017-11-01	205	{}	2017-09-08
\.


--
-- Name: goal_id_seq; Type: SEQUENCE SET; Schema: public; Owner: athlytix
--

SELECT pg_catalog.setval('goal_id_seq', 12, true);


--
-- Data for Name: goal_type; Type: TABLE DATA; Schema: public; Owner: athlytix
--

COPY goal_type (id, name) FROM stdin;
1	Weight
2	Bodyfat
3	Strength
4	Endurance
\.


--
-- Name: goal_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: athlytix
--

SELECT pg_catalog.setval('goal_type_id_seq', 1, false);


--
-- Data for Name: strength_achievement; Type: TABLE DATA; Schema: public; Owner: athlytix
--

COPY strength_achievement (id, user_id, date, exercise, weight, repetitions, comment, video, predicted_1rm, adjusted_score, rpe, average_velocity) FROM stdin;
17	1	2017-07-21	Decline Bench Press	115	36	\N	\N	253.000000000000028	69.8997171399699795	\N	\N
18	1	2017-07-21	Preacher Ez-Bar Curl	75	20	\N	\N	124.999999999999986	34.5354333695503755	\N	\N
19	1	2017-07-19	Guillotine Press	75	40	\N	\N	174.999999999999972	48.3496067173705271	\N	\N
20	1	2017-07-19	T-Bar Row	90	24	\N	\N	162	44.757921646937298	\N	\N
21	1	2017-07-17	Seated Dip Machine	130	62	\N	\N	398.666666666666686	110.145008826619346	\N	\N
22	1	2017-07-14	Decline Bench Press	115	29	\N	\N	226.166666666666686	62.4861107766398334	\N	\N
23	1	2017-07-14	Preacher Ez-Bar Curl	60	40	\N	\N	139.999999999999972	38.6796853738964188	\N	\N
24	1	2017-07-14	Lat Pressdown	145	56	\N	\N	415.666666666666686	114.841827764878218	\N	\N
25	1	2017-07-12	Guillotine Press	70	45	\N	\N	175	48.3496067173705413	\N	\N
26	1	2017-07-12	T-Bar Row	80	35	\N	\N	173.333333333333371	47.8891342724432079	\N	\N
100	1	2017-09-01	Cross Bar Lat Pulldown	180	21	\N	\N	306	86.8018008738813052	\N	\N
27	1	2017-07-10	Seated Dip Machine	120	74	\N	\N	416	114.933922253863685	\N	\N
28	1	2017-07-07	Guillotine Press	65	43	\N	\N	158.166666666666686	43.6988350236044241	\N	\N
29	1	2017-07-05	T-Bar Row	75	37	\N	\N	167.5	46.2774807151975125	\N	\N
30	1	2017-07-05	Triceps Pressdown	130	55	\N	\N	368.333333333333314	101.764410328941779	\N	\N
31	1	2017-07-03	Seated Dip Machine	110	71	\N	\N	370.333333333333314	102.316977262854593	\N	\N
32	1	2017-06-30	Preacher Ez-Bar Curl	55	43	\N	\N	133.833333333333343	36.9759373276652781	\N	\N
98	1	2017-09-01	Seated Dip Machine	165	54	\N	\N	461.999999999999943	131.053699358605087	\N	\N
112	1	2017-09-11	Reverse Grip Bench	135	29	\N	\N	265.5	74.661066215761295	\N	\N
115	1	2017-09-13	Triceps Pressdown	150	67	\N	\N	485	136.971616865405196	\N	\N
117	1	2017-09-13	Seated Cable Fly	52	35	\N	\N	112.666666666666686	31.8188360828226564	\N	\N
121	1	2017-09-15	Db Curl	40	38	\N	\N	90.6666666666666572	25.661864870693897	\N	\N
33	1	2017-06-29	Db Curl	35	43	\N	\N	85.1666666666666714	23.5301419357869932	\N	\N
123	1	2017-09-13	Front Squat	135	10	\N	\N	180	50.8348268778823353	\N	\N
124	1	2017-09-18	Front Squat	145	12	\N	\N	203	57.0854856564954574	\N	\N
127	1	2017-09-20	Lat Pressdown	160	99	\N	\N	688	193.883290466973392	\N	\N
34	1	2017-06-28	Triceps Pressdown	125	58	\N	\N	366.666666666666686	101.303937884014459	\N	\N
35	1	2017-06-28	T-Bar Row	70	40	\N	\N	163.333333333333314	45.1262996028791648	\N	\N
36	1	2017-06-23	T-Bar Row	70	35	\N	\N	151.666666666666686	41.9029924883878024	\N	\N
37	1	2017-06-23	Triceps Pressdown	120	53	\N	\N	332	91.7261110295258106	\N	\N
38	1	2017-06-21	Db Curl	35	37	\N	\N	78.1666666666666714	21.5961576670921751	\N	\N
39	1	2017-06-21	Lat Pressdown	145	68	\N	\N	473.666666666666686	130.866268848349591	\N	\N
40	1	2017-06-16	Preacher Ez-Bar Curl	45	27	\N	\N	85.5	23.6222364247724634	\N	\N
82	1	2017-08-16	Reverse Grip Bench	120	34	\N	\N	256	71.6187247192862202	\N	\N
83	1	2017-08-16	Seated Cable Fly	52	23	\N	\N	91.86666666666666	25.7006777768688508	\N	\N
84	1	2017-08-17	Wide Grip Bench	115	29	\N	\N	226.166666666666686	63.2725321901506561	\N	\N
85	1	2017-08-18	Suitcase Row	40	55	\N	\N	113.333333333333314	31.9381389335130486	\N	\N
86	1	2017-08-18	Triceps Pressdown	140	63	\N	\N	434	122.304284974805881	\N	\N
87	1	2017-08-21	Seated Dip Machine	165	50	\N	\N	440.000000000000057	122.970583016465937	\N	\N
88	1	2017-08-21	Cross Bar Lat Pulldown	180	19	\N	\N	294	82.1667077428204067	\N	\N
92	1	2017-08-28	Reverse Grip Bench	130	28	\N	\N	251.333333333333343	70.9804804924505248	\N	\N
93	1	2017-08-28	T-Bar Row	105	25	\N	\N	192.500000000000028	54.3650231888463935	\N	\N
96	1	2017-08-29	Reverse Fly	35	48	\N	\N	91	25.6998291438182918	\N	\N
97	1	2017-08-29	Suitcase Row	45	49	\N	\N	118.5	33.4662610279392041	\N	\N
99	1	2017-09-01	Preacher Ez-Bar Curl	90	14	\N	\N	132	37.4439141024586064	\N	\N
101	1	2017-09-04	Seated Cable Fly	52	31	\N	\N	105.73333333333332	29.8284356640877952	\N	\N
102	1	2017-09-04	T-Bar Row	110	26	\N	\N	205.333333333333343	57.9265963716206969	\N	\N
103	1	2017-09-04	Triceps Pressdown	150	60	\N	\N	450	126.949521268973925	\N	\N
106	1	2017-09-06	Db Curl	40	31	\N	\N	81.3333333333333286	22.7770112075236817	\N	\N
107	1	2017-09-06	Medium Grip Decline Bench Press	115	31	\N	\N	233.833333333333314	65.483907221630588	\N	\N
105	1	2017-09-06	Lat Pressdown	150	104	\N	\N	670	187.630297242305772	\N	\N
113	1	2017-09-11	Preacher Ez-Bar Curl	95	13	\N	\N	136.166666666666657	38.2913315117871775	\N	\N
114	1	2017-09-11	Cross Bar Lat Pulldown	190	19	\N	\N	310.333333333333314	87.2686160036079883	\N	\N
116	1	2017-09-13	T-Bar Row	115	24	\N	\N	207	58.4600509095646927	\N	\N
120	1	2017-09-15	Seated Dip Machine	170	54	\N	\N	475.999999999999943	134.724790571142961	\N	\N
122	1	2017-09-15	Machine Reverse Fly	70	29	\N	\N	137.666666666666686	38.9645227632227247	\N	\N
125	1	2017-09-18	Medium Grip Decline Bench Press	125	27	\N	\N	237.5	66.7872061252102043	\N	\N
41	1	2017-06-16	Db Lateral Raise	15	68	\N	\N	49	13.5378898808637498	\N	\N
42	1	2017-06-14	Triceps Pressdown	110	52	\N	\N	300.666666666666686	83.0692290648918572	\N	\N
43	1	2017-06-13	Snatch Grip Stiff-Leg Deadlift	275	38	\N	\N	623.333333333333371	172.216694402824572	\N	\N
44	1	2017-06-13	Suitcase Row	40	44	\N	\N	98.6666666666666714	27.2599687396984329	\N	\N
45	1	2017-06-12	Db Curl	35	33	\N	\N	73.5	20.3068348212956238	\N	\N
46	1	2017-06-12	Lat Pressdown	140	61	\N	\N	424.666666666666629	117.328378967485818	\N	\N
47	1	2017-06-12	Reverse Fly	35	46	\N	\N	88.6666666666666572	24.4971340701344005	\N	\N
48	1	2017-06-12	Squat	245	38	\N	\N	555.333333333333371	153.42941864978917	\N	\N
49	1	2017-06-09	Db Lateral Raise	15	54	\N	\N	42	11.6039056121689281	\N	\N
50	1	2017-06-09	Reverse Grip Curl	85	24	\N	\N	153	42.2713704443296621	\N	\N
51	1	2017-06-05	Seated Dip Machine	110	55	\N	\N	311.666666666666629	86.1083472014122719	\N	\N
52	1	2017-07-26	Triceps Pressdown	130	60	\N	\N	390	107.750552112997198	\N	\N
53	1	2017-07-24	Seated Dip Machine	135	66	\N	\N	432	119.354457725166114	\N	\N
54	1	2017-07-24	Lat Pressdown	150	68	\N	\N	490	135.378898808637501	\N	\N
55	1	2017-07-24	Db Lateral Raise	15	76	\N	\N	53	14.6430237486893606	\N	\N
56	1	2017-07-28	Decline Bench Press	120	36	\N	\N	264	72.9388352764904084	\N	\N
57	1	2017-07-28	T-Bar Row	90	29	\N	\N	177	48.9021736512833343	\N	\N
58	1	2017-07-28	Preacher Ez-Bar Curl	75	23	\N	\N	132.5	36.6075593717234042	\N	\N
59	1	2017-07-31	Seated Dip Machine	140	60	\N	\N	420	116.039056121689271	\N	\N
60	1	2017-07-31	Lat Pressdown	150	78	\N	\N	540	149.193072156457646	\N	\N
126	1	2017-09-18	Cross Bar Lat Pulldown	190	21	\N	\N	323	90.8306003302858613	\N	\N
61	1	2017-08-02	Guillotine Press	80	41	\N	\N	189.333333333333343	52.705718786155721	\N	\N
62	1	2017-08-04	Decline Bench Press	125	36	\N	\N	275	76.4790262354563026	\N	\N
63	1	2017-08-04	T-Bar Row	92.5	30	\N	\N	185	51.4495267402160579	\N	\N
64	1	2017-08-04	Db Curl	35	49	\N	\N	92.1666666666666714	25.6320615201256601	\N	\N
65	1	2017-08-07	Seated Dip Machine	145	60	\N	\N	435	119.542299557909715	\N	\N
66	1	2017-08-04	Seated Cable Fly	44	29	\N	\N	86.5333333333333314	24.0654002554235831	\N	\N
67	1	2017-08-02	Seated Cable Fly	44	18	\N	\N	70.4000000000000057	19.5976193796409994	\N	\N
68	1	2017-08-09	Reverse Grip Bench	115	36	\N	\N	253.000000000000028	69.8997171399699795	\N	\N
69	1	2017-08-09	Seated Cable Fly	44	37	\N	\N	98.2666666666666657	27.1494553529158722	\N	\N
70	1	2017-08-12	Decline Bench Press	130	39	\N	\N	299	82.6087566199645096	\N	\N
71	1	2017-08-12	T-Bar Row	95	28	\N	\N	183.666666666666657	50.7440634309926963	\N	\N
72	1	2017-08-12	Preacher Ez-Bar Curl	75	26	\N	\N	140	38.6796853738964259	\N	\N
73	1	2017-08-12	Triceps Pressdown	135	59	\N	\N	400.5	110.65152851603942	\N	\N
74	1	2017-08-12	Db Lateral Raise	15	84	\N	\N	57	15.748157616514975	\N	\N
75	1	2017-08-07	Cross Bar Lat Pulldown	180	18	\N	\N	288	79.1452466038574727	\N	\N
76	1	2017-08-14	Lat Pressdown	150	94	\N	\N	619.999999999999886	172.425440967210534	\N	\N
77	1	2017-08-14	Seated Dip Machine	150	58	\N	\N	440.000000000000057	122.366441976730101	\N	\N
89	1	2017-08-24	Triceps Pressdown	145	65	\N	\N	459.166666666666629	128.071688994209779	\N	\N
90	1	2017-08-28	Seated Cable Fly	52	28	\N	\N	100.533333333333331	28.3921921969802078	\N	\N
91	1	2017-08-28	Preacher Ez-Bar Curl	90	10	\N	\N	120	33.8898845852548902	\N	\N
\.


--
-- Name: strength_achievements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: athlytix
--

SELECT pg_catalog.setval('strength_achievements_id_seq', 127, true);


--
-- Data for Name: strength_estimator; Type: TABLE DATA; Schema: public; Owner: athlytix
--

COPY strength_estimator (id, user_id, date, version, exercise, model) FROM stdin;
\.


--
-- Name: strength_estimator_id_seq; Type: SEQUENCE SET; Schema: public; Owner: athlytix
--

SELECT pg_catalog.setval('strength_estimator_id_seq', 183, true);


--
-- Data for Name: trainer_request; Type: TABLE DATA; Schema: public; Owner: athlytix
--

COPY trainer_request (id, user_id, trainer_id, date, message) FROM stdin;
\.


--
-- Name: trainer_request_id_seq; Type: SEQUENCE SET; Schema: public; Owner: athlytix
--

SELECT pg_catalog.setval('trainer_request_id_seq', 20, true);


--
-- Data for Name: training_period; Type: TABLE DATA; Schema: public; Owner: athlytix
--

COPY training_period (id, user_id, start_date, end_date, name, details) FROM stdin;
\.


--
-- Name: training_period_id_seq; Type: SEQUENCE SET; Schema: public; Owner: athlytix
--

SELECT pg_catalog.setval('training_period_id_seq', 1, true);


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: athlytix
--

COPY "user" (id, username, password, email, active, is_confirmed, confirmation_code, is_trainer, is_premium, next_bill_date, first_name, last_name, birthday, height, trainer_id, layouts, city, state, zip_code, about, is_public, country, gender, metric_units, join_date, referrer_id, youtube, instagram, twitter, is_admin) FROM stdin;
1	nathanrice	$2b$12$v0rQslh8NbW3tVGV91QwKeZHkyiH6aK69kzNxOptEa/FjB6UoXrSa	nathan.alexander.rice@gmail.com	t	t	\N	t	t	\N	Nathan	Rice	1979-05-13	72	\N	\N	Durham	North Carolina	\N	Test	t	United States	male	\N	\N	\N	https://www.youtube.com/channel/UCNUbyykBWsaWvNsBs1QA0Sw	nathan.alexander.rice	athlytix_help	t
\.


--
-- Name: user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: athlytix
--

SELECT pg_catalog.setval('user_id_seq', 13, true);


--
-- Data for Name: weight_estimator; Type: TABLE DATA; Schema: public; Owner: athlytix
--

COPY weight_estimator (id, user_id, date, version, model) FROM stdin;
\.


--
-- Name: weight_estimator_id_seq; Type: SEQUENCE SET; Schema: public; Owner: athlytix
--

SELECT pg_catalog.setval('weight_estimator_id_seq', 13, true);


--
-- Data for Name: weight_measurement; Type: TABLE DATA; Schema: public; Owner: athlytix
--

COPY weight_measurement (id, user_id, date, value, picture) FROM stdin;
8	1	2017-07-31	220	\N
9	1	2017-08-01	217.5	\N
10	1	2017-08-02	216	\N
11	1	2017-08-03	217.5	\N
12	1	2017-08-04	216.5	\N
13	1	2017-08-05	214	\N
14	1	2017-08-07	223	\N
15	1	2017-08-08	220	\N
16	1	2017-08-09	220	\N
17	1	2017-08-10	214	\N
18	1	2017-08-11	220	\N
19	1	2017-08-12	220	\N
20	1	2017-08-13	216.5	\N
21	1	2017-08-14	216.5	\N
22	1	2017-08-15	214.5	\N
23	1	2017-08-16	213.5	\N
24	1	2017-08-17	213.5	\N
25	1	2017-08-18	210	\N
26	1	2017-08-19	214	\N
27	1	2017-08-20	213	\N
28	1	2017-08-21	214	\N
29	1	2017-08-22	214	\N
30	1	2017-08-23	214	\N
31	1	2017-08-24	215	\N
32	1	2017-08-25	211	\N
33	1	2017-08-26	207	\N
34	1	2017-08-27	209	\N
35	1	2017-08-28	209	\N
36	1	2017-08-29	209	\N
37	1	2017-08-31	207	\N
38	1	2017-08-30	209	\N
39	1	2017-09-02	207.5	\N
40	1	2017-09-03	209.5	\N
41	1	2017-09-05	213	\N
42	1	2017-09-04	211.5	\N
43	1	2017-09-07	209	\N
44	1	2017-09-08	212.5	\N
46	1	2017-09-09	211	\N
47	1	2017-09-12	209	\N
48	1	2017-09-14	208	\N
49	1	2017-09-16	211	\N
50	1	2017-09-17	208.5	\N
51	1	2017-09-18	211	\N
52	1	2017-09-19	211	\N
53	1	2017-09-20	210	\N
54	1	2017-09-21	212	\N
\.


--
-- Name: weight_measurement_id_seq; Type: SEQUENCE SET; Schema: public; Owner: athlytix
--

SELECT pg_catalog.setval('weight_measurement_id_seq', 54, true);


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

