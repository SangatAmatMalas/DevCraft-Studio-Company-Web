<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Http\Presenters\ContentPresenter;
use App\Models\Category;
use App\Models\PortfolioProject;
use App\Models\Technology;
use App\Services\Seo;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PortfolioController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = [
            'q' => trim((string) $request->query('q', '')),
            'category' => (string) $request->query('category', ''),
            'technology' => (string) $request->query('technology', ''),
            'sort' => in_array($request->query('sort'), ['latest', 'featured'], true)
                ? (string) $request->query('sort')
                : 'latest',
        ];

        $query = PortfolioProject::query()
            ->published()
            ->with(['categories', 'technologies', 'media']);

        if ($filters['q'] !== '') {
            $term = '%'.$filters['q'].'%';
            $query->where(function (Builder $builder) use ($term) {
                $builder->where('title', 'like', $term)
                    ->orWhere('excerpt', 'like', $term)
                    ->orWhereHas('technologies', fn (Builder $tech) => $tech->where('name', 'like', $term));
            });
        }

        if ($filters['category'] !== '') {
            $query->whereHas('categories', fn (Builder $category) => $category->where('slug', $filters['category']));
        }

        if ($filters['technology'] !== '') {
            $query->whereHas('technologies', fn (Builder $technology) => $technology->where('slug', $filters['technology']));
        }

        if ($filters['sort'] === 'featured') {
            $query->orderByDesc('is_featured')->orderByDesc('published_at');
        } else {
            $query->orderByDesc('published_at')->orderByDesc('id');
        }

        $projects = $query->paginate(9)->withQueryString();

        $hasFilters = $filters['q'] !== '' || $filters['category'] !== '' || $filters['technology'] !== '';

        return Inertia::render('site/portfolio/index', [
            'projects' => [
                'data' => collect($projects->items())->map(fn (PortfolioProject $project) => ContentPresenter::projectCard($project))->all(),
                'meta' => [
                    'current_page' => $projects->currentPage(),
                    'last_page' => $projects->lastPage(),
                    'per_page' => $projects->perPage(),
                    'total' => $projects->total(),
                    'from' => $projects->firstItem(),
                    'to' => $projects->lastItem(),
                ],
                'links' => [
                    'prev' => $projects->previousPageUrl(),
                    'next' => $projects->nextPageUrl(),
                ],
            ],
            'filters' => $filters,
            'categories' => Category::query()
                ->where('type', 'portfolio')
                ->where('is_active', true)
                ->orderBy('display_order')
                ->get(['name', 'slug'])
                ->map(fn (Category $category) => ['name' => $category->name, 'slug' => $category->slug])
                ->all(),
            'technologies' => Technology::query()
                ->whereHas('portfolioProjects', fn (Builder $builder) => $builder->published())
                ->orderBy('name')
                ->get(['name', 'slug'])
                ->map(fn (Technology $technology) => ['name' => $technology->name, 'slug' => $technology->slug])
                ->all(),
            'seo' => Seo::make(
                'Portfolio',
                'Studi kasus proyek DevCraft Studio: konteks masalah, solusi, kontribusi, teknologi, dan hasil yang dapat diverifikasi.',
                url('/portfolio'),
                'website',
                [],
                null,
                $hasFilters,
            ),
        ]);
    }

    public function show(Request $request, PortfolioProject $project): Response
    {
        abort_unless($project->status->value === 'published' && $project->published_at?->isPast(), 404);

        $project->load(['categories', 'technologies', 'sections', 'media']);

        $related = PortfolioProject::query()
            ->published()
            ->whereKeyNot($project->getKey())
            ->whereHas('categories', fn (Builder $query) => $query->whereIn('categories.id', $project->categories->pluck('id')))
            ->with(['categories', 'technologies', 'media'])
            ->limit(3)
            ->get();

        if ($related->count() < 3) {
            $extra = PortfolioProject::query()
                ->published()
                ->whereKeyNot($project->getKey())
                ->whereNotIn('id', $related->pluck('id'))
                ->with(['categories', 'technologies', 'media'])
                ->orderByDesc('published_at')
                ->limit(3 - $related->count())
                ->get();

            $related = $related->merge($extra);
        }

        $latest = PortfolioProject::query()
            ->published()
            ->whereKeyNot($project->getKey())
            ->with(['categories', 'technologies', 'media'])
            ->orderByDesc('published_at')
            ->limit(3)
            ->get();

        return Inertia::render('site/portfolio/show', [
            'project' => ContentPresenter::projectDetail($project),
            'relatedProjects' => $related->map(fn (PortfolioProject $item) => ContentPresenter::projectCard($item))->all(),
            'latestProjects' => $latest->map(fn (PortfolioProject $item) => ContentPresenter::projectCard($item))->all(),
            'seo' => Seo::make(
                $project->meta_title ?: $project->title,
                $project->meta_description ?: $project->excerpt,
                url('/portfolio/'.$project->slug),
                'article',
                [
                    Seo::creativeWork(
                        $project->title,
                        $project->excerpt,
                        url('/portfolio/'.$project->slug),
                        $project->cover_url,
                    ),
                    Seo::breadcrumbs([
                        'Beranda' => url('/'),
                        'Portfolio' => url('/portfolio'),
                        $project->title => url('/portfolio/'.$project->slug),
                    ]),
                ],
                $project->cover_url,
            ),
        ]);
    }
}
