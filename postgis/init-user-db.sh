#!/bin/bash

set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER nwtrees PASSWORD 'nwtrees';
    CREATE DATABASE nwtrees;
    GRANT ALL PRIVILEGES ON DATABASE nwtrees TO nwtrees;
    CREATE EXTENSION postgis;
EOSQL
