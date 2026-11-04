<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Http\Presenters\ContentPresenter;
use App\Models\Package;
use App\Models\Service;
use App\Services\Seo;
use App\Services\WhatsAppLink;
use Inertia\Inertia;
use Inertia\Response;

class ServiceController extends Controller
{
    public function index(): Response
    {
        $services = Service::query()->published()->ordered()->get();

        return Inertia::render('site/services/index', [
            'services' => $services->map(fn (Service $service) => ContentPresenter::serviceCard($service))->all(),
            'seo' => Seo::make(
                'Layanan',
                'Layanan pengembangan website, aplikasi web, integrasi API, otomasi, dan quality assurance dari DevCraft Studio.',
                url('/layanan'),
            ),
        ]);
    }

    public function show(Service $service): Response
    {
        abort_unless($service->status->value === 'published', 404);

        $relatedServices = Service::query()
            ->published()
            ->whereKeyNot($service->getKey())
            ->ordered()
            ->limit(3)
            ->get();

        $packages = Package::query()->published()->ordered()->get();

        return Inertia::render('site/services/show', [
            'service' => ContentPresenter::serviceDetail($service),
            'relatedServices' => $relatedServices->map(fn (Service $item) => ContentPresenter::serviceCard($item))->all(),
            'packages' => $packages->map(fn (Package $package) => ContentPresenter::packageCard($package))->all(),
            'whatsappUrl' => WhatsAppLink::forContext(
                'layanan '.$service->title,
                url('/layanan/'.$service->slug),
            ),
            'seo' => Seo::make(
                $service->meta_title ?: $service->title,
                $service->meta_description ?: $service->summary,
                url('/layanan/'.$service->slug),
                'website',
                array_filter([
                    Seo::service($service->title, $service->summary, url('/layanan/'.$service->slug)),
                    Seo::breadcrumbs([
                        'Beranda' => url('/'),
                        'Layanan' => url('/layanan'),
                        $service->title => url('/layanan/'.$service->slug),
                    ]),
                    Seo::faqPage($service->faqs ?? []),
                ]),
            ),
        ]);
    }
}
