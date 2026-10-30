<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Http\Presenters\ContentPresenter;
use App\Models\Package;
use App\Services\Seo;
use Inertia\Inertia;
use Inertia\Response;

class PackageController extends Controller
{
    public function index(): Response
    {
        $packages = Package::query()->published()->ordered()->with('addons')->get();

        return Inertia::render('site/packages/index', [
            'packages' => $packages->map(fn (Package $package) => ContentPresenter::packageCard($package))->all(),
            'seo' => Seo::make(
                'Paket Layanan',
                'Bandingkan paket website, company profile, katalog produk, aplikasi custom, otomasi, dan maintenance dari DevCraft Studio beserta batas ruang lingkupnya.',
                url('/paket'),
            ),
        ]);
    }

    public function compare(): Response
    {
        $packages = Package::query()->published()->ordered()->with('addons')->get();

        return Inertia::render('site/packages/compare', [
            'packages' => $packages->map(fn (Package $package) => ContentPresenter::packageDetail($package))->all(),
            'seo' => Seo::make(
                'Perbandingan Paket',
                'Perbandingan deliverables, batas ruang lingkup, timeline, dan harga paket layanan DevCraft Studio.',
                url('/paket/bandingkan'),
            ),
        ]);
    }

    public function show(Package $package): Response
    {
        abort_unless($package->status->value === 'published', 404);

        $package->load('addons');

        $others = Package::query()
            ->published()
            ->whereKeyNot($package->getKey())
            ->ordered()
            ->limit(2)
            ->get();

        return Inertia::render('site/packages/show', [
            'package' => ContentPresenter::packageDetail($package),
            'otherPackages' => $others->map(fn (Package $item) => ContentPresenter::packageCard($item))->all(),
            'seo' => Seo::make(
                $package->meta_title ?: $package->name,
                $package->meta_description ?: $package->tagline,
                url('/paket/'.$package->slug),
                'website',
                [
                    Seo::breadcrumbs([
                        'Beranda' => url('/'),
                        'Paket' => url('/paket'),
                        $package->name => url('/paket/'.$package->slug),
                    ]),
                ],
            ),
        ]);
    }
}
