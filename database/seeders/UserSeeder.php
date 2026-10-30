<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $email = (string) env('ADMIN_EMAIL', 'admin@devcraft.test');
        $password = (string) env('ADMIN_PASSWORD', 'DevCraft#2026');

        User::query()->updateOrCreate(
            ['email' => $email],
            [
                'name' => 'DevCraft Admin',
                'password' => $password,
                'role' => UserRole::SuperAdmin,
                'is_active' => true,
                'email_verified_at' => now(),
            ],
        );
    }
}
