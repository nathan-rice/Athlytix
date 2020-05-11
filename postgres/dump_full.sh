#!/bin/bash
pg_dump --user=athlytix -h localhost --dbname=athlytix > dumps/full.sql