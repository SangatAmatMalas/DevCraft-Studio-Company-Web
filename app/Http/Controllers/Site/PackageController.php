<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Http\Presenters\ContentPresenter;
use App\Models\DesignBrief;
use App\Models\Package;
use App\Services\AnalyticsRecorder;
use App\Services\Seo;
use App\Services\WhatsAppLink;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PackageController extends Controller
{
    public function index(Request $request): Response
    {
        $packages = Package::query()->published()->ordered()->with('addons')->get();

        $brief = $this->designBrief($request);

        if ($brief) {
            AnalyticsRecorder::record(
                $request,
                'design_cta_packages',
                '/paket',
                'design_brief',
                $brief->id,
                ['template' => $brief->chosen_template, 'design_category' => $brief->category, 'source' => 'preview'],
            );
        }

        return Inertia::render('site/packages/index', [
            'packages' => $packages->map(fn (Package $package) => ContentPresenter::packageCard($package))->all(),
            'designBrief' => $this->designBriefPayload($brief),
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

    public function show(Request $request, Package $package): Response
    {
        abort_unless($package->status->value === 'published', 404);

        $package->load('addons');
        $brief = $this->designBrief($request);

        $others = Package::query()
            ->published()
            ->whereKeyNot($package->getKey())
            ->ordered()
            ->limit(2)
            ->get();

        return Inertia::render('site/packages/show', [
            'package' => ContentPresenter::packageDetail($package),
            'otherPackages' => $others->map(fn (Package $item) => ContentPresenter::packageCard($item))->all(),
            'designBrief' => $this->designBriefPayload($brief),
            'whatsappUrl' => WhatsAppLink::forContext(
                'paket '.$package->name,
                url('/paket/'.$package->slug),
            ),
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

    private function designBrief(Request $request): ?DesignBrief
    {
        $token = $request->query('desain');

        if (! is_string($token) || $token === '') {
            return null;
        }

        return DesignBrief::query()->active()->where('token', $token)->first();
    }

    /** @return array<string, mixed>|null */
    private function designBriefPayload(?DesignBrief $brief): ?array
    {
        if (! $brief) {
            return null;
        }

        return [
            'token' => $brief->token,
            'brand_name' => $brief->brand_name,
            'category_label' => $brief->categoryLabel(),
            'template_label' => $brief->chosen_template ? $brief->templateLabel() : null,
            'preview_url' => $brief->resultUrl(),
        ];
    }
}
