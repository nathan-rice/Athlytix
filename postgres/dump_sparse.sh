#!/bin/bash
pg_dump --user=athlytix -h localhost --dbname=athlytix --schema-only > dumps/schema.sql
pg_dump --user=athlytix -h localhost --dbname=athlytix -t bodyfat_measurement_type -t goal_type -t distance_type -t age_strength_coefficients --inserts > dumps/data.sql
