publish:
	rsync -avr . l2:/var/www/projects/trees/

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
