publish:
	rsync --delete --exclude .git/ -avr . l2:/var/www/projects/trees/

serve:
	python3 -mhttp.server

.PHONY: postgis
postgis:
	-@docker stop trees-postgis
	-@docker rm trees-postgis
	docker run \
		--name trees-postgis \
		--env POSTGRES_PASSWORD=password \
		--volume `pwd`:/trees \
		--volume `pwd`/postgis:/docker-entrypoint-initdb.d \
		--detach \
		--publish 5432:5432 \
		postgis/postgis:13-3.1-alpine

init: postgis sleep setup import

# Really should be using docker-compose here
sleep:
	sleep 5

# Needs package gdal
import:
	ogr2ogr \
		-f "PostgreSQL" \
		PG:"host=localhost user=nwtrees password=password dbname=nwtrees user=postgres" \
		TREES_EAST.json \
		-nln nwtrees

dump:
	ogr2ogr -f "PGDUMP" TREES_EAST.json

console:
	docker exec \
		-it \
		trees-postgis \
		sh -c 'exec psql -h "$$POSTGRES_PORT_5432_TCP_ADDR" -p "$$POSTGRES_PORT_5432_TCP_PORT" -U postgres nwtrees'

setup:
	docker exec \
		-it \
		trees-postgis \
		sh -c 'exec psql -h "$$POSTGRES_PORT_5432_TCP_ADDR" -p "$$POSTGRES_PORT_5432_TCP_PORT" -U postgres nwtrees -c  "CREATE EXTENSION postgis; SELECT postgis_full_version();"'

# SELECT * FROM nwtrees WHERE common_name='SWEETGUM' ORDER BY wkb_geometry <-> ST_SetSRID(ST_MakePoint(49.217,-122.9), 4326) LIMIT 5
