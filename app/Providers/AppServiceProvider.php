<?php

namespace App\Providers;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        if ($this->app->isProduction()) {
            URL::forceScheme('https');
        }

        Gate::define('manage-content', fn (User $user) => $user->isActive() && $user->role->canManageContent());
        Gate::define('manage-leads', fn (User $user) => $user->isActive() && $user->role->canManageLeads());
        Gate::define('manage-settings', fn (User $user) => $user->isActive() && $user->role->canManageSettings());
        Gate::define('manage-users', fn (User $user) => $user->isActive() && $user->role === UserRole::SuperAdmin);

        RateLimiter::for('lead-submissions', function (Request $request) {
            return [
                Limit::perMinutes(10, 5)->by($request->ip()),
                Limit::perDay(30)->by($request->ip()),
            ];
        });
    }
}
