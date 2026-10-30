<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CategoryRequest;
use App\Models\Category;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/categories/index', [
            'categories' => Category::query()
                ->where('type', 'portfolio')
                ->withCount('portfolioProjects')
                ->orderBy('display_order')
                ->get()
                ->map(fn (Category $category) => [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'description' => $category->description,
                    'display_order' => $category->display_order,
                    'is_active' => $category->is_active,
                    'projects_count' => $category->portfolio_projects_count,
                ])->all(),
        ]);
    }

    public function store(CategoryRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $category = Category::query()->create([
            'name' => $data['name'],
            'slug' => filled($data['slug'] ?? null) ? $data['slug'] : Str::slug($data['name']),
            'type' => $data['type'],
            'description' => $data['description'] ?? null,
            'display_order' => $data['display_order'] ?? 0,
            'is_active' => $request->boolean('is_active'),
        ]);

        ActivityLogger::log('category.created', $category, ['name' => $category->name]);

        return back()->with('success', 'Kategori dibuat.');
    }

    public function update(CategoryRequest $request, Category $category): RedirectResponse
    {
        $data = $request->validated();

        $category->update([
            'name' => $data['name'],
            'slug' => filled($data['slug'] ?? null) ? $data['slug'] : $category->slug,
            'type' => $data['type'],
            'description' => $data['description'] ?? null,
            'display_order' => $data['display_order'] ?? 0,
            'is_active' => $request->boolean('is_active'),
        ]);

        ActivityLogger::log('category.updated', $category, ['name' => $category->name]);

        return back()->with('success', 'Kategori diperbarui.');
    }

    public function destroy(Category $category): RedirectResponse
    {
        $category->delete();

        ActivityLogger::log('category.deleted', $category, ['name' => $category->name]);

        return back()->with('success', 'Kategori dihapus.');
    }
}
