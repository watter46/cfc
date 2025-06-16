<?php

declare(strict_types=1);

namespace App\Providers;

use App\Repositories\ApiFootball\LocalApiFootballRepository;
use App\Repositories\FlashLiveSports\LocalFlashLiveSportsRepository;
use App\Repositories\FlashLiveSports\MockFlashLiveSportsRepository;
use App\UseCases\Admin\Game\ApiFootballRepositoryInterface;
use App\UseCases\Admin\Game\FlashLiveSportsRepositoryInterface;
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
            // Mock or Fetch API
            $this->app->bind(ApiFootballRepositoryInterface::class, LocalApiFootballRepository::class);
            // $this->app->bind(FlashLiveSportsRepositoryInterface::class, LocalFlashLiveSportsRepository::class);

            // Mock
            $this->app->bind(FlashLiveSportsRepositoryInterface::class, MockFlashLiveSportsRepository::class);

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
