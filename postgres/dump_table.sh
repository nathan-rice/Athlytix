#!/bin/bash
pg_dump --user=athlytix -h localhost --dbname=athlytix --schema-only -t $1 > dumps/$1.sql
