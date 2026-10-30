<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ContentStatus;
use App\Enums\ProjectStatus;
use App\Enums\ProjectType;
use App\Http\Controllers\Controller;
use App\Http\Presenters\ContentPresenter;
use App\Http\Requests\Admin\PortfolioProjectRequest;
use App\Models\Category;
use App\Models\PortfolioMedia;
use App\Models\PortfolioProject;
use App\Models\PortfolioSection;
use App\Models\Technology;
use App\Services\ActivityLogger;
use App\Services\ImageUploader;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PortfolioProjectController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = [
            'q' => trim((string) $request->query('q', '')),
            'status' => (string) $request->query('status', ''),
            'type' => (string) $request->query('type', ''),
        ];

        $projects = PortfolioProject::query()
            ->withCount('media')
            ->when($filters['q'] !== '', fn ($query) => $query->where('title', 'like', '%'.$filters['q'].'%'))
            ->when($filters['status'] !== '', fn ($query) => $query->where('status', $filters['status']))
            ->when($filters['type'] !== '', fn ($query) => $query->where('project_type', $filters['type']))
            ->orderByDesc('updated_at')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('admin/portfolio/index', [
            'projects' => [
                'data' => collect($projects->items())->map(fn (PortfolioProject $project) => [
                    'id' => $project->id,
                    'title' => $project->title,
                    'slug' => $project->slug,
                    'status' => $project->status->value,
                    'status_label' => $project->status->label(),
                    'type_label' => $project->project_type->label(),
                    'is_featured' => $project->is_featured,
                    'media_count' => $project->media_count,
                    'published_at' => $project->published_at?->toIso8601String(),
                    'updated_at' => $project->updated_at?->toIso8601String(),
                    'public_url' => '/portfolio/'.$project->slug,
                ])->all(),
                'meta' => [
                    'current_page' => $projects->currentPage(),
                    'last_page' => $projects->lastPage(),
                    'total' => $projects->total(),
                ],
            ],
            'filters' => $filters,
            'statuses' => ContentStatus::options(),
            'types' => ProjectType::options(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/portfolio/form', [
            'project' => null,
            'options' => $this->options(),
        ]);
    }

    public function store(PortfolioProjectRequest $request): RedirectResponse
    {
        $project = new PortfolioProject;
        $this->fill($project, $request);
        $project->save();

        $this->syncRelations($project, $request);

        ActivityLogger::log('portfolio.created', $project, ['title' => $project->title]);

        return redirect()
            ->route('admin.portfolio.edit', $project)
            ->with('success', 'Proyek portfolio dibuat.');
    }

    public function edit(PortfolioProject $project): Response
    {
        $project->load(['categories', 'technologies', 'sections', 'media']);

        return Inertia::render('admin/portfolio/form', [
            'project' => [
                'id' => $project->id,
                'title' => $project->title,
                'slug' => $project->slug,
                'excerpt' => $project->excerpt,
                'description' => $project->description,
                'project_type' => $project->project_type->value,
                'project_status' => $project->project_status->value,
                'client_name' => $project->client_name,
                'role_summary' => $project->role_summary,
                'problem' => $project->problem,
                'goals' => $project->goals ?? [],
                'solution' => $project->solution,
                'outcome' => $project->outcome,
                'started_at' => $project->started_at?->toDateString(),
                'completed_at' => $project->completed_at?->toDateString(),
                'repository_url' => $project->repository_url,
                'demo_url' => $project->demo_url,
                'is_featured' => $project->is_featured,
                'display_order' => $project->display_order,
                'status' => $project->status->value,
                'categories' => $project->categories->pluck('id')->all(),
                'technologies' => $project->technologies->pluck('id')->all(),
                'sections' => $project->sections->map(fn (PortfolioSection $section) => [
                    'id' => $section->id,
                    'heading' => $section->heading,
                    'body' => $section->body,
                    'section_type' => $section->section_type,
                    'display_order' => $section->display_order,
                ])->all(),
                'media' => $project->media->map(fn (PortfolioMedia $media) => [
                    'id' => $media->id,
                    'url' => $media->url,
                    'alt_text' => $media->alt_text,
                    'caption' => $media->caption,
                    'is_cover' => $media->is_cover,
                ])->all(),
                'meta_title' => $project->meta_title,
                'meta_description' => $project->meta_description,
                'public_url' => '/portfolio/'.$project->slug,
            ],
            'options' => $this->options(),
        ]);
    }

    public function update(PortfolioProjectRequest $request, PortfolioProject $project): RedirectResponse
    {
        $this->fill($project, $request);
        $project->save();

        $this->syncRelations($project, $request);

        ActivityLogger::log('portfolio.updated', $project, ['title' => $project->title]);

        return back()->with('success', 'Proyek portfolio diperbarui.');
    }

    public function destroy(PortfolioProject $project): RedirectResponse
    {
        $project->delete();

        ActivityLogger::log('portfolio.deleted', $project, ['title' => $project->title]);

        return redirect()->route('admin.portfolio.index')->with('success', 'Proyek portfolio dihapus.');
    }

    public function publish(PortfolioProject $project): RedirectResponse
    {
        $project->forceFill([
            'status' => ContentStatus::Published,
            'published_at' => $project->published_at ?? now(),
        ])->save();

        ActivityLogger::log('portfolio.published', $project, ['title' => $project->title]);

        return back()->with('success', 'Proyek portfolio dipublikasikan.');
    }

    public function unpublish(PortfolioProject $project): RedirectResponse
    {
        $project->forceFill(['status' => ContentStatus::Draft])->save();

        ActivityLogger::log('portfolio.unpublished', $project, ['title' => $project->title]);

        return back()->with('success', 'Proyek portfolio dikembalikan ke draft.');
    }

    public function preview(PortfolioProject $project): Response
    {
        $project->load(['categories', 'technologies', 'sections', 'media']);

        return Inertia::render('site/portfolio/show', [
            'project' => ContentPresenter::projectDetail($project),
            'relatedProjects' => [],
            'latestProjects' => [],
            'preview' => true,
            'seo' => [
                'title' => $project->title.' (preview)',
                'description' => $project->excerpt,
                'canonical' => url('/portfolio/'.$project->slug),
                'type' => 'article',
                'image' => $project->cover_url,
                'siteName' => null,
                'robots' => 'noindex,nofollow',
                'jsonLd' => [],
            ],
        ]);
    }

    protected function fill(PortfolioProject $project, PortfolioProjectRequest $request): void
    {
        $data = $request->validated();
        $publish = $request->boolean('publish');

        $project->fill([
            'title' => $data['title'],
            'slug' => filled($data['slug'] ?? null) ? $data['slug'] : Str::slug($data['title']),
            'excerpt' => $data['excerpt'],
            'description' => $data['description'] ?? null,
            'project_type' => $data['project_type'],
            'project_status' => $data['project_status'],
            'client_name' => $data['client_name'] ?? null,
            'role_summary' => $data['role_summary'] ?? null,
            'problem' => $data['problem'] ?? null,
            'goals' => array_values(array_filter($data['goals'] ?? [])),
            'solution' => $data['solution'] ?? null,
            'outcome' => $data['outcome'] ?? null,
            'started_at' => $data['started_at'] ?? null,
            'completed_at' => $data['completed_at'] ?? null,
            'repository_url' => $data['repository_url'] ?? null,
            'demo_url' => $data['demo_url'] ?? null,
            'is_featured' => $request->boolean('is_featured'),
            'display_order' => $data['display_order'] ?? 0,
            'status' => $publish ? ContentStatus::Published : ($project->status ?? ContentStatus::Draft),
            'published_at' => $publish ? ($project->published_at ?? now()) : $project->published_at,
            'meta_title' => $data['meta_title'] ?? null,
            'meta_description' => $data['meta_description'] ?? null,
        ]);
    }

    protected function syncRelations(PortfolioProject $project, PortfolioProjectRequest $request): void
    {
        $data = $request->validated();

        $project->categories()->sync($data['categories'] ?? []);
        $project->technologies()->sync($data['technologies'] ?? []);

        $keptSectionIds = [];

        foreach ($data['sections'] ?? [] as $index => $section) {
            if (blank($section['heading'] ?? null) && blank($section['body'] ?? null)) {
                continue;
            }

            $model = PortfolioSection::query()->firstOrNew([
                'id' => $section['id'] ?? null,
                'portfolio_project_id' => $project->id,
            ]);

            $model->fill([
                'portfolio_project_id' => $project->id,
                'heading' => $section['heading'] ?? '',
                'body' => $section['body'] ?? null,
                'section_type' => $section['section_type'] ?? 'text',
                'display_order' => $section['display_order'] ?? $index,
            ])->save();

            $keptSectionIds[] = $model->id;
        }

        PortfolioSection::query()
            ->where('portfolio_project_id', $project->id)
            ->whereNotIn('id', $keptSectionIds)
            ->delete();

        foreach ($data['remove_media'] ?? [] as $mediaId) {
            $media = PortfolioMedia::query()->where('portfolio_project_id', $project->id)->find($mediaId);

            if ($media) {
                ImageUploader::delete($media->media_path);
                $media->delete();
            }
        }

        if ($request->hasFile('cover')) {
            PortfolioMedia::query()->where('portfolio_project_id', $project->id)->update(['is_cover' => false]);

            $stored = ImageUploader::store($request->file('cover'), 'portfolio');

            PortfolioMedia::query()->create([
                'portfolio_project_id' => $project->id,
                'media_path' => $stored['path'],
                'alt_text' => $project->title.' — cover',
                'media_type' => 'image',
                'display_order' => 0,
                'is_cover' => true,
            ]);
        }

        foreach ($request->file('gallery', []) as $index => $file) {
            $stored = ImageUploader::store($file, 'portfolio');

            PortfolioMedia::query()->create([
                'portfolio_project_id' => $project->id,
                'media_path' => $stored['path'],
                'alt_text' => $project->title.' — gambar '.($index + 1),
                'media_type' => 'image',
                'display_order' => $index + 1,
                'is_cover' => false,
            ]);
        }
    }

    /** @return array<string, mixed> */
    protected function options(): array
    {
        return [
            'categories' => Category::query()->where('type', 'portfolio')->orderBy('display_order')->get(['id', 'name'])->all(),
            'technologies' => Technology::query()->orderBy('name')->get(['id', 'name'])->all(),
            'types' => ProjectType::options(),
            'projectStatuses' => ProjectStatus::options(),
        ];
    }
}
