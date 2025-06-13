<?php

declare(strict_types=1);

namespace App\Providers;

use App\Repositories\ApiFootball\LocalApiFootballRepository;
use App\UseCases\Admin\Game\ApiFootballRepositoryInterface;
use Illuminate\Support\ServiceProvider;

final class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        if ($this->app->environment('production') || $this->app->environment('staging')) {
            return;
        }

        if ($this->app->environment('local')) {
            $this->app->bind(ApiFootballRepositoryInterface::class, LocalApiFootballRepository::class);

            return;
        }

        if ($this->app->environment('testing')) {
            return;
        }
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
