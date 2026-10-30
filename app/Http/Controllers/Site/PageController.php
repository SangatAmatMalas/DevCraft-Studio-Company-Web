<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Services\Seo;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function show(string $slug): Response
    {
        $page = Page::query()->published()->where('slug', $slug)->first();

        abort_if($page === null, 404);

        return Inertia::render('site/page', [
            'page' => [
                'title' => $page->title,
                'slug' => $page->slug,
                'content' => $page->content ?? [],
                'updated_at' => $page->updated_at?->toIso8601String(),
            ],
            'seo' => Seo::page($page),
        ]);
    }
}
