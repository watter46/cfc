laravel-log:
	cat storage/logs/laravel.log
rm-log:
	rm storage/logs/laravel.log
migrate:
	php artisan migrate
fresh:
	php artisan migrate:fresh --seed
seed:
	php artisan db:seed
tinker:
	php artisan tinker
test:
	php artisan test --parallel --processes=2
feature:
	php artisan test --parallel --processes=2 tests/Feature/$(path)
unit:
	php artisan test --parallel --processes=2 tests/Unit/$(path)
optimize:
	php artisan optimize
optimize-clear:
	php artisan optimize:clear
clear:
	php artisan cache:clear
	php artisan config:clear
	php artisan route:clear
cache:
	composer dump-autoload -o
	@make optimize
	php artisan event:cache
cache-clear:
	composer clear-cache
	@make optimize-clear
	php artisan event:clear
work:
	php artisan schedule:work
queue:
	php artisan queue:work
listen:
    php artisan queue:listen
ide:
	php artisan ide-helper:generate
	php artisan ide-helper:meta
	php artisan ide-helper:models -N
pint:
	./vendor/bin/pint app