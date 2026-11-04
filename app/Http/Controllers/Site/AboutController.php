<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Models\TeamMember;
use App\Services\Seo;
use App\Support\TeamPresenter;
use Inertia\Inertia;
use Inertia\Response;

class AboutController extends Controller
{
    public function index(): Response
    {
        $page = Page::query()->published()->where('slug', 'tentang-kami')->first();

        $team = TeamMember::query()->approved()->limit(3)->get();

        return Inertia::render('site/about', [
            'page' => $page ? [
                'title' => $page->title,
                'content' => $page->content ?? [],
            ] : null,
            'team' => TeamPresenter::collection($team),
            'seo' => Seo::make(
                'Tentang Kami',
                'Cara kerja, prinsip, dan tim di balik DevCraft Studio.',
                url('/tentang-kami'),
            ),
        ]);
    }
}
