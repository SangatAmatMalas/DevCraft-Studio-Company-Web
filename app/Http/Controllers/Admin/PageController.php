<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ContentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PageRequest;
use App\Models\Page;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/pages/index', [
            'pages' => Page::query()->orderBy('title')->get()->map(fn (Page $page) => [
                'id' => $page->id,
                'title' => $page->title,
                'slug' => $page->slug,
                'status' => $page->status->value,
                'status_label' => $page->status->label(),
                'updated_at' => $page->updated_at?->toIso8601String(),
                'public_url' => '/'.$page->slug,
            ])->all(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/pages/form', ['page' => null]);
    }

    public function store(PageRequest $request): RedirectResponse
    {
        $page = new Page;
        $this->fill($page, $request);
        $page->save();

        ActivityLogger::log('page.created', $page, ['title' => $page->title]);

        return redirect()->route('admin.pages.edit', $page)->with('success', 'Halaman dibuat.');
    }

    public function edit(Page $page): Response
    {
        return Inertia::render('admin/pages/form', [
            'page' => [
                'id' => $page->id,
                'title' => $page->title,
                'slug' => $page->slug,
                'intro' => $page->content['intro'] ?? '',
                'blocks' => $page->content['blocks'] ?? [],
                'status' => $page->status->value,
                'meta_title' => $page->meta_title,
                'meta_description' => $page->meta_description,
                'public_url' => '/'.$page->slug,
            ],
        ]);
    }

    public function update(PageRequest $request, Page $page): RedirectResponse
    {
        $this->fill($page, $request);
        $page->save();

        ActivityLogger::log('page.updated', $page, ['title' => $page->title]);

        return back()->with('success', 'Halaman diperbarui.');
    }

    public function destroy(Page $page): RedirectResponse
    {
        $page->delete();

        ActivityLogger::log('page.deleted', $page, ['title' => $page->title]);

        return redirect()->route('admin.pages.index')->with('success', 'Halaman dihapus.');
    }

    protected function fill(Page $page, PageRequest $request): void
    {
        $data = $request->validated();

        $page->fill([
            'title' => $data['title'],
            'slug' => filled($data['slug'] ?? null) ? $data['slug'] : Str::slug($data['title']),
            'content' => [
                'intro' => $data['intro'] ?? '',
                'blocks' => array_values(array_filter($data['blocks'] ?? [], fn ($block) => filled($block['heading'] ?? null) || filled($block['body'] ?? null))),
            ],
            'meta_title' => $data['meta_title'] ?? null,
            'meta_description' => $data['meta_description'] ?? null,
        ]);

        if ($request->boolean('publish')) {
            $page->status = ContentStatus::Published;
            $page->published_at = $page->published_at ?? now();
        } else {
            $page->status = ContentStatus::Draft;
        }
    }
}
