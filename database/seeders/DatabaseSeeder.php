<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            SettingsSeeder::class,
            UserSeeder::class,
            TaxonomySeeder::class,
            ServiceSeeder::class,
            PackageSeeder::class,
            PortfolioSeeder::class,
            FaqSeeder::class,
            PageSeeder::class,
        ]);
    }
}
