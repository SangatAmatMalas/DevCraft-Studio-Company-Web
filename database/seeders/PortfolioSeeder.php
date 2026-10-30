<?php

namespace Database\Seeders;

use App\Enums\ContentStatus;
use App\Enums\ProjectStatus;
use App\Enums\ProjectType;
use App\Models\Category;
use App\Models\PortfolioProject;
use App\Models\Technology;
use Illuminate\Database\Seeder;

/**
 * Seeded as drafts on purpose: PRD §8.4 requires the owner to verify
 * contribution, links, and classification before publishing.
 */
class PortfolioSeeder extends Seeder
{
    public function run(): void
    {
        $projects = [
            [
                'title' => 'Bubur-Onic — Backend Engineering',
                'slug' => 'bubur-onic-backend',
                'excerpt' => 'Proyek repository publik yang berfokus pada pekerjaan backend. Detail kontribusi dan tautan demo perlu dilengkapi sebelum dipublikasikan.',
                'project_type' => ProjectType::OpenSource,
                'project_status' => ProjectStatus::Completed,
                'role_summary' => 'Kontribusi backend pada proyek repository. Rincian peran akan dilengkapi setelah verifikasi.',
                'categories' => ['Web Application'],
                'technologies' => ['Laravel', 'PHP', 'MySQL'],
                'display_order' => 0,
            ],
            [
                'title' => 'ClaimFlow — Monad Testnet',
                'slug' => 'claimflow-monad-testnet',
                'excerpt' => 'Prototipe alur klaim di Monad testnet. Bukan aplikasi produksi; batasan dan arsitektur akan dijelaskan pada studi kasus.',
                'project_type' => ProjectType::Prototype,
                'project_status' => ProjectStatus::InProgress,
                'role_summary' => 'Kontribusi pengembangan prototipe. Detail kontrak dan jaringan akan dilengkapi.',
                'categories' => ['Web3'],
                'technologies' => ['Solidity', 'React', 'TypeScript'],
                'display_order' => 1,
            ],
            [
                'title' => 'PySpark Lab',
                'slug' => 'pyspark-lab',
                'excerpt' => 'Eksperimen data engineering untuk mempelajari pengolahan dataset dengan PySpark. Bersifat pembelajaran, bukan proyek komersial.',
                'project_type' => ProjectType::LearningProject,
                'project_status' => ProjectStatus::Completed,
                'role_summary' => 'Eksperimen personal: menyiapkan data, menulis transformasi, dan mengevaluasi hasil.',
                'categories' => ['Data/Experiment'],
                'technologies' => ['Python', 'PySpark'],
                'display_order' => 2,
            ],
        ];

        foreach ($projects as $data) {
            $categoryNames = $data['categories'];
            $technologyNames = $data['technologies'];
            unset($data['categories'], $data['technologies']);

            $project = PortfolioProject::query()->updateOrCreate(
                ['slug' => $data['slug']],
                array_merge($data, [
                    'status' => ContentStatus::Draft,
                    'is_featured' => true,
                    'meta_title' => null,
                    'meta_description' => null,
                    'published_at' => null,
                ]),
            );

            $project->categories()->sync(
                Category::query()->whereIn('name', $categoryNames)->pluck('id')->all(),
            );

            $project->technologies()->sync(
                Technology::query()->whereIn('name', $technologyNames)->pluck('id')->all(),
            );
        }
    }
}
