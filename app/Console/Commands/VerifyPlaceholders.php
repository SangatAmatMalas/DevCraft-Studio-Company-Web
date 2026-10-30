<?php

namespace App\Console\Commands;

use App\Enums\ContentStatus;
use App\Models\Package;
use App\Models\PackageAddon;
use App\Models\Page;
use App\Models\PortfolioProject;
use App\Models\Service;
use App\Models\Setting;
use App\Models\TeamMember;
use App\Models\Testimonial;
use App\Support\PlaceholderGuard;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class VerifyPlaceholders extends Command
{
    protected $signature = 'app:verify-placeholders';

    protected $description = 'Detect placeholder text (e.g. "Rp X", TODO, lorem ipsum) in content before deployment.';

    /** @var list<array{type: string, id: int|null, field: string, published: bool, value: string}> */
    protected array $findings = [];

    public function handle(): int
    {
        $this->scanPackages();
        $this->scanServices();
        $this->scanPages();
        $this->scanPortfolio();
        $this->scanTestimonials();
        $this->scanTeam();
        $this->scanSettings();

        if ($this->findings === []) {
            $this->info('No placeholder text detected.');

            return self::SUCCESS;
        }

        $this->table(
            ['Type', 'ID', 'Field', 'Published', 'Value'],
            array_map(fn (array $row) => [
                $row['type'],
                $row['id'] ?? '—',
                $row['field'],
                $row['published'] ? 'yes' : 'no',
                Str::limit($row['value'], 60),
            ], $this->findings),
        );

        $published = array_filter($this->findings, fn (array $row) => $row['published']);

        if ($published !== []) {
            $this->error(count($published).' placeholder value(s) found in published content. Fix them before deploying.');

            return self::FAILURE;
        }

        $this->warn('Placeholder text found only in unpublished content. It will not reach the public site.');

        return self::SUCCESS;
    }

    protected function scanPackages(): void
    {
        Package::query()->with('addons')->each(function (Package $package) {
            $published = $package->status === ContentStatus::Published;

            $this->check('package', $package->id, 'price_label', $package->price_label, $published);
            $this->checkArray('package', $package->id, 'included_items', $package->included_items, $published);
            $this->checkArray('package', $package->id, 'excluded_items', $package->excluded_items, $published);
            $this->checkArray('package', $package->id, 'limitations', $package->limitations, $published);
            $this->check('package', $package->id, 'meta_title', $package->meta_title, $published);
            $this->check('package', $package->id, 'meta_description', $package->meta_description, $published);

            $package->addons->each(function (PackageAddon $addon) use ($published) {
                $this->check('package_addon', $addon->id, 'name', $addon->name, $published);
                $this->check('package_addon', $addon->id, 'description', $addon->description, $published);
                $this->check('package_addon', $addon->id, 'price_label', $addon->price_label, $published);
            });
        });
    }

    protected function scanServices(): void
    {
        Service::query()->each(function (Service $service) {
            $published = $service->status === ContentStatus::Published;

            $this->check('service', $service->id, 'title', $service->title, $published);
            $this->check('service', $service->id, 'summary', $service->summary, $published);
            $this->check('service', $service->id, 'description', $service->description, $published);
            $this->check('service', $service->id, 'cost_factors', $service->cost_factors, $published);
            $this->checkArray('service', $service->id, 'deliverables', $service->deliverables, $published);
            $this->checkArray('service', $service->id, 'technologies', $service->technologies, $published);

            foreach ($service->process ?? [] as $step) {
                $this->check('service', $service->id, 'process.title', $step['title'] ?? null, $published);
                $this->check('service', $service->id, 'process.description', $step['description'] ?? null, $published);
            }

            foreach ($service->faqs ?? [] as $faq) {
                $this->check('service', $service->id, 'faq.question', $faq['question'] ?? null, $published);
                $this->check('service', $service->id, 'faq.answer', $faq['answer'] ?? null, $published);
            }
        });
    }

    protected function scanPages(): void
    {
        Page::query()->each(function (Page $page) {
            $published = $page->status === ContentStatus::Published;

            $this->check('page', $page->id, 'title', $page->title, $published);
            $this->check('page', $page->id, 'intro', $page->content['intro'] ?? null, $published);

            foreach ($page->content['blocks'] ?? [] as $block) {
                $this->check('page', $page->id, 'block.heading', $block['heading'] ?? null, $published);
                $this->check('page', $page->id, 'block.body', $block['body'] ?? null, $published);
            }
        });
    }

    protected function scanPortfolio(): void
    {
        PortfolioProject::query()->each(function (PortfolioProject $project) {
            $published = $project->status === ContentStatus::Published;

            $this->check('portfolio', $project->id, 'title', $project->title, $published);
            $this->check('portfolio', $project->id, 'excerpt', $project->excerpt, $published);
            $this->check('portfolio', $project->id, 'description', $project->description, $published);
            $this->check('portfolio', $project->id, 'problem', $project->problem, $published);
            $this->check('portfolio', $project->id, 'outcome', $project->outcome, $published);
            $this->checkArray('portfolio', $project->id, 'goals', $project->goals, $published);
        });
    }

    protected function scanTestimonials(): void
    {
        Testimonial::query()->each(function (Testimonial $testimonial) {
            $published = $testimonial->is_active && $testimonial->permission_confirmed_at !== null;

            $this->check('testimonial', $testimonial->id, 'quote', $testimonial->quote, $published);
        });
    }

    protected function scanTeam(): void
    {
        TeamMember::query()->each(function (TeamMember $member) {
            $published = $member->is_active && $member->approved_at !== null;

            $this->check('team_member', $member->id, 'bio', $member->bio, $published);
        });
    }

    protected function scanSettings(): void
    {
        Setting::query()->each(function (Setting $setting) {
            $this->check('setting', null, $setting->key, is_string($setting->value) ? $setting->value : null, true);
        });
    }

    /** @param array<int, mixed>|null $values */
    protected function checkArray(string $type, ?int $id, string $field, ?array $values, bool $published): void
    {
        foreach ($values ?? [] as $index => $value) {
            if (is_string($value)) {
                $this->check($type, $id, $field.'.'.$index, $value, $published);
            }
        }
    }

    protected function check(string $type, ?int $id, string $field, ?string $value, bool $published): void
    {
        if (PlaceholderGuard::isPlaceholder($value)) {
            $this->findings[] = [
                'type' => $type,
                'id' => $id,
                'field' => $field,
                'published' => $published,
                'value' => (string) $value,
            ];
        }
    }
}
