<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Models\TeamMember;
use App\Services\Seo;
use Inertia\Inertia;
use Inertia\Response;

class AboutController extends Controller
{
    public function index(): Response
    {
        $page = Page::query()->published()->where('slug', 'tentang-kami')->first();

        $team = TeamMember::query()->approved()->get();

        return Inertia::render('site/about', [
            'page' => $page ? [
                'title' => $page->title,
                'content' => $page->content ?? [],
            ] : null,
            'team' => $team->map(fn (TeamMember $member) => [
                'id' => $member->id,
                'name' => $member->name,
                'role' => $member->role,
                'bio' => $member->bio,
                'photo_url' => $member->photo_url,
                'skills' => $member->skills ?? [],
                'github_url' => $member->github_url,
                'linkedin_url' => $member->linkedin_url,
            ])->all(),
            'seo' => Seo::make(
                'Tentang Kami',
                'Cara kerja, prinsip, dan tim di balik DevCraft Studio.',
                url('/tentang-kami'),
            ),
        ]);
    }
}
