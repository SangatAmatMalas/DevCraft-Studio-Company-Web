<?php

namespace App\Console\Commands;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;

class EnsureAdminUser extends Command
{
    protected $signature = 'app:ensure-admin';

    protected $description = 'Create the first super admin from ADMIN_EMAIL/ADMIN_PASSWORD when no user exists';

    public function handle(): int
    {
        if (User::query()->exists()) {
            $this->info('Users already exist; no admin was created.');

            return self::SUCCESS;
        }

        $email = (string) env('ADMIN_EMAIL', '');
        $password = (string) env('ADMIN_PASSWORD', '');
        $name = (string) env('ADMIN_NAME', 'DevCraft Admin');

        if ($email === '' || $password === '') {
            $this->warn('ADMIN_EMAIL and ADMIN_PASSWORD are not set; skipping admin creation.');

            return self::SUCCESS;
        }

        $validator = Validator::make(
            ['email' => $email, 'password' => $password],
            [
                'email' => ['required', 'email', 'max:180'],
                'password' => ['required', 'string', 'min:12'],
            ],
        );

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $error) {
                $this->error($error);
            }

            return self::FAILURE;
        }

        if (app()->isProduction() && $password === 'DevCraft#2026') {
            $this->error('ADMIN_PASSWORD still uses the demo password. Set a unique password before deploying.');

            return self::FAILURE;
        }

        User::query()->create([
            'name' => $name,
            'email' => $email,
            'password' => $password,
            'role' => UserRole::SuperAdmin,
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        $this->info("Super admin {$email} created.");

        return self::SUCCESS;
    }
}
