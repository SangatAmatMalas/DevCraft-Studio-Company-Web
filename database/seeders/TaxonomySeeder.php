<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Technology;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TaxonomySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['Website', 'company profile, landing page, dan situs bisnis'],
            ['Web Application', 'aplikasi web dengan alur kerja dan data'],
            ['API/Integration', 'API dan integrasi antar sistem'],
            ['Automation', 'otomasi proses bisnis dan pekerjaan berulang'],
            ['Web3', 'eksperimen dan prototipe berbasis blockchain'],
            ['Data/Experiment', 'eksperimen data dan eksplorasi teknis'],
            ['QA', 'pengujian manual maupun otomatis'],
        ];

        foreach ($categories as $index => [$name, $description]) {
            Category::query()->updateOrCreate(
                ['slug' => Str::slug($name)],
                [
                    'name' => $name,
                    'type' => 'portfolio',
                    'description' => $description,
                    'display_order' => $index,
                    'is_active' => true,
                ],
            );
        }

        $technologies = [
            'Laravel', 'PHP', 'React', 'TypeScript', 'Tailwind CSS', 'MySQL',
            'Node.js', 'Python', 'PySpark', 'Solidity', 'REST API', 'Docker',
            'Pest', 'Playwright', 'GitHub Actions', 'PostgreSQL',
        ];

        foreach ($technologies as $name) {
            Technology::query()->updateOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => $name],
            );
        }
    }
}
