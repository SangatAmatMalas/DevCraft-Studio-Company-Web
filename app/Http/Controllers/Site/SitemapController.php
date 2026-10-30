<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Models\Page;
use App\Models\PortfolioProject;
use App\Models\Service;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function sitemap(): Response
    {
        $urls = collect([
            ['loc' => url('/'), 'changefreq' => 'weekly', 'priority' => '1.0'],
            ['loc' => url('/layanan'), 'changefreq' => 'monthly', 'priority' => '0.9'],
            ['loc' => url('/paket'), 'changefreq' => 'monthly', 'priority' => '0.9'],
            ['loc' => url('/paket/bandingkan'), 'changefreq' => 'monthly', 'priority' => '0.7'],
            ['loc' => url('/portfolio'), 'changefreq' => 'weekly', 'priority' => '0.9'],
            ['loc' => url('/tentang-kami'), 'changefreq' => 'monthly', 'priority' => '0.6'],
            ['loc' => url('/kontak'), 'changefreq' => 'yearly', 'priority' => '0.6'],
        ]);

        Service::query()->published()->get(['slug', 'updated_at'])->each(function (Service $service) use ($urls) {
            $urls->push([
                'loc' => url('/layanan/'.$service->slug),
                'lastmod' => $service->updated_at?->toAtomString(),
                'changefreq' => 'monthly',
                'priority' => '0.8',
            ]);
        });

        Package::query()->published()->get(['slug', 'updated_at'])->each(function (Package $package) use ($urls) {
            $urls->push([
                'loc' => url('/paket/'.$package->slug),
                'lastmod' => $package->updated_at?->toAtomString(),
                'changefreq' => 'monthly',
                'priority' => '0.8',
            ]);
        });

        PortfolioProject::query()->published()->get(['slug', 'updated_at'])->each(function (PortfolioProject $project) use ($urls) {
            $urls->push([
                'loc' => url('/portfolio/'.$project->slug),
                'lastmod' => $project->updated_at?->toAtomString(),
                'changefreq' => 'monthly',
                'priority' => '0.7',
            ]);
        });

        Page::query()->published()->get(['slug', 'updated_at'])->each(function (Page $page) use ($urls) {
            $urls->push([
                'loc' => url('/'.$page->slug),
                'lastmod' => $page->updated_at?->toAtomString(),
                'changefreq' => 'yearly',
                'priority' => '0.4',
            ]);
        });

        return response()
            ->view('sitemap', ['urls' => $urls])
            ->header('Content-Type', 'application/xml; charset=UTF-8');
    }

    public function robots(): Response
    {
        $lines = [
            'User-agent: *',
            'Allow: /',
            'Disallow: /admin',
            'Disallow: /admin/',
            '',
            'Sitemap: '.url('/sitemap.xml'),
        ];

        return response(implode("\n", $lines), 200, ['Content-Type' => 'text/plain; charset=UTF-8']);
    }
}
