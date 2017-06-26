.PHONY:
.DEFAULT_GOAL := help
bin_dir=vendor/bin

vendor/autoload.php:
	composer install

docker-compose.yml:
	cp docker-compose.yml.dist $@

docker/conf/nginx_vhost.conf:
	cp docker/conf/nginx_vhost.conf.dist $@

docker/docker-compose.env:
	cp docker/docker-compose.env.dist $@
	sed --in-place "s/{your_unix_local_username}/$(shell whoami)/" $@
	sed --in-place "s/{your_unix_local_uid}/$(shell id -u)/" $@

install: docker/docker-compose.env docker/conf/nginx_vhost.conf docker-compose.yml

console:
	docker-compose exec console /bin/login -f -P $(shell whoami)

start: ## Launch project
	docker-compose up -d

stop: ## Stop project
	docker-compose stop

help:
	@grep -E '^[a-zA-Z_-.]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
