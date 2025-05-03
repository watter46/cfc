build:
	docker compose build --no-cache --force-rm
up:
	docker compose up -d
down:
	docker compose down --remove-orphans
restart:
	@make down
	@make up
destroy:
	docker compose down --rmi all --volumes --remove-orphans
ps:
	docker ps -a --no-trunc
logs:
	docker compose logs
# ++++++++++++++++++++++++++++++++++++++++
# frontend Container
# ++++++++++++++++++++++++++++++++++++++++
front:
	docker compose exec frontend bash
front-log:
	docker compose logs frontend
dev:
	docker compose exec frontend npm run dev
# ++++++++++++++++++++++++++++++++++++++++
# backend Container
# ++++++++++++++++++++++++++++++++++++++++
back:
	docker compose exec backend bash
back-log:
	docker compose logs backend
laravel-log:
	docker compose exec backend cat storage/logs/laravel.log
rm-log:
	docker compose exec backend rm storage/logs/laravel.log
migrate:
	docker compose exec backend php artisan migrate
fresh:
	docker compose exec backend php artisan migrate:fresh --seed
seed:
	docker compose exec backend php artisan db:seed
tinker:
	docker compose exec backend php artisan tinker
unit:
	docker compose exec backend php artisan test --parallel --processes=2 tests/Unit/$(path)
optimize:
	docker compose exec backend php artisan optimize
optimize-clear:
	docker compose exec backend php artisan optimize:clear
clear:
	docker compose exec backend php artisan cache:clear
	docker compose exec backend php artisan config:clear
	docker compose exec backend php artisan route:clear
cache:
	docker compose exec backend composer dump-autoload -o
	@make optimize
	docker compose exec backend php artisan event:cache
cache-clear:
	docker compose exec backend composer clear-cache
	@make optimize-clear
	docker compose exec backend php artisan event:clear
work:
	docker compose exec backend php artisan schedule:work
queue:
	docker compose exec backend php artisan queue:work
listen:
	docker compose exec backend php artisan queue:listen
# ++++++++++++++++++++++++++++++++++++++++
# web Container
# ++++++++++++++++++++++++++++++++++++++++
web:
	docker compose exec web bash
web-log:
	docker compose logs web
# ++++++++++++++++++++++++++++++++++++++++
# db Container
# ++++++++++++++++++++++++++++++++++++++++
db:
	docker compose exec db bash
log-db:
	docker compose logs db
sql:
	docker compose exec db bash -c 'mysql -u$$MYSQL_USER -p$$MYSQL_PASSWORD $$MYSQL_DATABASE'
