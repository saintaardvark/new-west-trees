publish:
	rsync -avr . l2:/var/www/projects/trees/

.PHONY: postgis
postgis:
	-@docker rm trees-postgis
	docker run \
		--name trees-postgis \
		-e POSTGRES_PASSWORD=password \
		-v `pwd`:/trees \
		--publish 5432:5432 \
		postgis/postgis:13-3.1-alpine
