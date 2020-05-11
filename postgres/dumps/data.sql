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

SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

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
-- Name: id; Type: DEFAULT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY bodyfat_measurement_type ALTER COLUMN id SET DEFAULT nextval('bodyfat_measurement_type_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY distance_type ALTER COLUMN id SET DEFAULT nextval('distance_type_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY goal_type ALTER COLUMN id SET DEFAULT nextval('goal_type_id_seq'::regclass);


--
-- Data for Name: bodyfat_measurement_type; Type: TABLE DATA; Schema: public; Owner: athlytix
--

INSERT INTO bodyfat_measurement_type VALUES (5, 'Bod Pod', 3);
INSERT INTO bodyfat_measurement_type VALUES (4, 'DXA', 1.5);
INSERT INTO bodyfat_measurement_type VALUES (6, 'Hydrostatic Weighing', 1);
INSERT INTO bodyfat_measurement_type VALUES (2, 'Bioelectric Impedence', 3.5);
INSERT INTO bodyfat_measurement_type VALUES (1, 'Navy Estimator', 4.25);
INSERT INTO bodyfat_measurement_type VALUES (3, 'Caliper (3 site)', 2.5);


--
-- Name: bodyfat_measurement_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: athlytix
--

SELECT pg_catalog.setval('bodyfat_measurement_type_id_seq', 1, false);


--
-- Data for Name: distance_type; Type: TABLE DATA; Schema: public; Owner: athlytix
--

INSERT INTO distance_type VALUES (1, 'Miles', 5280);
INSERT INTO distance_type VALUES (2, 'Kilometers', 3280.84000000000015);
INSERT INTO distance_type VALUES (3, 'Meters', 3.28083999999999998);
INSERT INTO distance_type VALUES (4, 'Feet', 1);
INSERT INTO distance_type VALUES (5, 'Yards', 3);
INSERT INTO distance_type VALUES (6, 'Steps', 2.5);


--
-- Name: distance_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: athlytix
--

SELECT pg_catalog.setval('distance_type_id_seq', 1, false);


--
-- Data for Name: goal_type; Type: TABLE DATA; Schema: public; Owner: athlytix
--

INSERT INTO goal_type VALUES (1, 'Weight');
INSERT INTO goal_type VALUES (2, 'Bodyfat');
INSERT INTO goal_type VALUES (3, 'Strength');
INSERT INTO goal_type VALUES (4, 'Endurance');


--
-- Name: goal_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: athlytix
--

SELECT pg_catalog.setval('goal_type_id_seq', 1, false);


--
-- Name: bodyfat_measurement_type_pkey; Type: CONSTRAINT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY bodyfat_measurement_type
    ADD CONSTRAINT bodyfat_measurement_type_pkey PRIMARY KEY (id);


--
-- Name: distance_type_pkey; Type: CONSTRAINT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY distance_type
    ADD CONSTRAINT distance_type_pkey PRIMARY KEY (id);


--
-- Name: goal_type_pkey; Type: CONSTRAINT; Schema: public; Owner: athlytix
--

ALTER TABLE ONLY goal_type
    ADD CONSTRAINT goal_type_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

