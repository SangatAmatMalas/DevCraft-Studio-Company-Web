<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Http\Presenters\ContentPresenter;
use App\Models\Faq;
use App\Models\Package;
use App\Models\PortfolioProject;
use App\Models\Service;
use App\Models\Technology;
use App\Models\Testimonial;
use App\Services\Seo;
use App\Support\Settings;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(): Response
    {
        $services = Service::query()->published()->ordered()->limit(6)->get();

        $projects = PortfolioProject::query()
            ->published()
            ->featured()
            ->with(['categories', 'technologies', 'media'])
            ->limit(3)
            ->get();

        if ($projects->isEmpty()) {
            $projects = PortfolioProject::query()
                ->published()
                ->with(['categories', 'technologies', 'media'])
                ->orderByDesc('published_at')
                ->limit(3)
                ->get();
        }

        $packages = Package::query()->published()->ordered()->limit(3)->get();

        $faqs = Faq::query()->active()->limit(6)->get();

        $testimonials = Testimonial::query()->approved()->limit(3)->get();

        $technologies = Technology::query()
            ->whereHas('portfolioProjects', fn ($query) => $query->published())
            ->orderBy('name')
            ->limit(12)
            ->get(['id', 'name', 'slug']);

        return Inertia::render('site/home', [
            'services' => $services->map(fn (Service $service) => ContentPresenter::serviceCard($service))->all(),
            'projects' => $projects->map(fn (PortfolioProject $project) => ContentPresenter::projectCard($project))->all(),
            'packages' => $packages->map(fn (Package $package) => ContentPresenter::packageCard($package))->all(),
            'faqs' => $faqs->map(fn (Faq $faq) => ContentPresenter::faq($faq))->all(),
            'testimonials' => Settings::bool('home_show_testimonials', true)
                ? $testimonials->map(fn (Testimonial $testimonial) => ContentPresenter::testimonial($testimonial))->all()
                : [],
            'technologies' => $technologies->map(fn (Technology $technology) => [
                'name' => $technology->name,
                'slug' => $technology->slug,
            ])->all(),
            'hero' => [
                'badge' => Settings::get('home_hero_badge'),
                'title' => Settings::get('home_hero_title'),
                'subtitle' => Settings::get('home_hero_subtitle'),
            ],
            'seo' => Seo::make(
                'Software Engineering Partner',
                Settings::get('seo_default_description'),
                url('/'),
                'website',
                [Seo::organization()],
            ),
        ]);
    }
}
