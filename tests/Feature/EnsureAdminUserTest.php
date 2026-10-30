<?php

use App\Enums\UserRole;
use App\Models\User;

function setAdminEnv(array $values): void
{
    foreach ($values as $key => $value) {
        $_ENV[$key] = $value;
        $_SERVER[$key] = $value;
    }
}

function clearAdminEnv(): void
{
    foreach (['ADMIN_EMAIL', 'ADMIN_PASSWORD', 'ADMIN_NAME'] as $key) {
        unset($_ENV[$key], $_SERVER[$key]);
    }
}

afterEach(function () {
    clearAdminEnv();
});

it('creates the first super admin from environment variables', function () {
    setAdminEnv([
        'ADMIN_EMAIL' => 'owner@devcraft.test',
        'ADMIN_PASSWORD' => 'RahasiaKuat#2026',
        'ADMIN_NAME' => 'Owner',
    ]);

    $this->artisan('app:ensure-admin')->assertSuccessful();

    $user = User::query()->where('email', 'owner@devcraft.test')->first();

    expect($user)->not->toBeNull()
        ->and($user->name)->toBe('Owner')
        ->and($user->role)->toBe(UserRole::SuperAdmin)
        ->and($user->is_active)->toBeTrue();
});

it('skips admin creation when a user already exists', function () {
    User::query()->create([
        'name' => 'Existing',
        'email' => 'existing@devcraft.test',
        'password' => 'ExistingPassword#1',
        'role' => UserRole::SuperAdmin,
        'is_active' => true,
    ]);

    setAdminEnv([
        'ADMIN_EMAIL' => 'owner@devcraft.test',
        'ADMIN_PASSWORD' => 'RahasiaKuat#2026',
    ]);

    $this->artisan('app:ensure-admin')->assertSuccessful();

    expect(User::query()->count())->toBe(1)
        ->and(User::query()->where('email', 'owner@devcraft.test')->exists())->toBeFalse();
});

it('skips admin creation when credentials are missing', function () {
    clearAdminEnv();

    $this->artisan('app:ensure-admin')->assertSuccessful();

    expect(User::query()->count())->toBe(0);
});

it('rejects an invalid admin password', function () {
    setAdminEnv([
        'ADMIN_EMAIL' => 'owner@devcraft.test',
        'ADMIN_PASSWORD' => 'short',
    ]);

    $this->artisan('app:ensure-admin')->assertFailed();

    expect(User::query()->count())->toBe(0);
});
