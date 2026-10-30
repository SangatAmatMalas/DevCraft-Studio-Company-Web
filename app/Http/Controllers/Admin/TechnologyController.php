<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\TechnologyRequest;
use App\Models\Technology;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class TechnologyController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/technologies/index', [
            'technologies' => Technology::query()
                ->withCount('portfolioProjects')
                ->orderBy('name')
                ->get()
                ->map(fn (Technology $technology) => [
                    'id' => $technology->id,
                    'name' => $technology->name,
                    'slug' => $technology->slug,
                    'icon_name' => $technology->icon_name,
                    'projects_count' => $technology->portfolio_projects_count,
                ])->all(),
        ]);
    }

    public function store(TechnologyRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $technology = Technology::query()->create([
            'name' => $data['name'],
            'slug' => filled($data['slug'] ?? null) ? $data['slug'] : Str::slug($data['name']),
            'icon_name' => $data['icon_name'] ?? null,
        ]);

        ActivityLogger::log('technology.created', $technology, ['name' => $technology->name]);

        return back()->with('success', 'Teknologi dibuat.');
    }

    public function update(TechnologyRequest $request, Technology $technology): RedirectResponse
    {
        $data = $request->validated();

        $technology->update([
            'name' => $data['name'],
            'slug' => filled($data['slug'] ?? null) ? $data['slug'] : $technology->slug,
            'icon_name' => $data['icon_name'] ?? null,
        ]);

        ActivityLogger::log('technology.updated', $technology, ['name' => $technology->name]);

        return back()->with('success', 'Teknologi diperbarui.');
    }

    public function destroy(Technology $technology): RedirectResponse
    {
        $technology->delete();

        ActivityLogger::log('technology.deleted', $technology, ['name' => $technology->name]);

        return back()->with('success', 'Teknologi dihapus.');
    }
}
