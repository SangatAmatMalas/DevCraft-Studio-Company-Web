<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Models\TeamMember;
use App\Services\Seo;
use App\Support\TeamPresenter;
use Inertia\Inertia;
use Inertia\Response;

class TeamController extends Controller
{
    public function index(): Response
    {
        $members = TeamMember::query()->approved()->get();

        $profilePage = [
            '@context' => 'https://schema.org',
            '@type' => 'ProfilePage',
            'name' => 'Tim',
            'url' => url('/tim'),
            'mainEntity' => $members->map(fn (TeamMember $member) => array_filter([
                '@type' => 'Person',
                'name' => $member->name,
                'jobTitle' => $member->role,
                'description' => $member->bio,
                'image' => $member->photo_url,
                'sameAs' => array_values(array_filter([$member->github_url, $member->linkedin_url])) ?: null,
            ]))->values()->all(),
        ];

        return Inertia::render('site/team', [
            'members' => TeamPresenter::collection($members),
            'seo' => Seo::make(
                'Tim',
                'Profil anggota DevCraft Studio yang telah menyetujui publikasi nama, peran, dan tautan profesionalnya.',
                url('/tim'),
                'website',
                $members->isEmpty() ? [] : [$profilePage],
                noindex: $members->isEmpty(),
            ),
        ]);
    }
}
