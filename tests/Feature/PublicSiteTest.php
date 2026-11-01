<?php

use App\Models\AnalyticsEvent;
use App\Models\Package;
use App\Models\Page;
use App\Models\PortfolioProject;
use App\Models\Service;
use App\Models\TeamMember;
use App\Models\Testimonial;
use App\Support\Settings;

it('renders the public home page', function () {
    Service::query()->create([
        'title' => 'Website Development',
        'slug' => 'website-development',
        'summary' => 'Website yang jelas dan cepat.',
        'status' => 'published',
        'published_at' => now(),
    ]);

    $this->get('/')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('site/home'));
});

it('hides unpublished portfolio projects from index and detail pages', function () {
    $published = PortfolioProject::query()->create([
        'title' => 'Internal Tool',
        'slug' => 'internal-tool',
        'excerpt' => 'Alat internal untuk operasional.',
        'project_type' => 'internal_project',
        'project_status' => 'completed',
        'status' => 'published',
        'published_at' => now(),
    ]);

    PortfolioProject::query()->create([
        'title' => 'Draft Project',
        'slug' => 'draft-project',
        'excerpt' => 'Belum diverifikasi.',
        'project_type' => 'prototype',
        'project_status' => 'in_progress',
        'status' => 'draft',
    ]);

    $this->get('/portfolio')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('site/portfolio/index')
            ->has('projects.data', 1)
            ->where('projects.data.0.slug', $published->slug));

    $this->get('/portfolio/internal-tool')->assertOk();
    $this->get('/portfolio/draft-project')->assertNotFound();
});

it('serves only published static pages', function () {
    Page::query()->create([
        'title' => 'Kebijakan Privasi',
        'slug' => 'kebijakan-privasi',
        'content' => ['intro' => 'Kami menghormati privasi Anda.', 'blocks' => []],
        'status' => 'published',
        'published_at' => now(),
    ]);

    Page::query()->create([
        'title' => 'Syarat Layanan',
        'slug' => 'syarat-layanan',
        'content' => ['intro' => 'Draft.', 'blocks' => []],
        'status' => 'draft',
    ]);

    $this->get('/kebijakan-privasi')->assertOk();
    $this->get('/syarat-layanan')->assertNotFound();
});

it('lists published URLs in the sitemap only', function () {
    Service::query()->create([
        'title' => 'Published Service',
        'slug' => 'published-service',
        'summary' => 'Layanan aktif.',
        'status' => 'published',
        'published_at' => now(),
    ]);

    Service::query()->create([
        'title' => 'Draft Service',
        'slug' => 'draft-service',
        'summary' => 'Belum aktif.',
        'status' => 'draft',
    ]);

    $response = $this->get('/sitemap.xml')->assertOk();

    expect($response->getContent())
        ->toContain('/layanan/published-service')
        ->not->toContain('/layanan/draft-service');
});

it('renders the branded error page for unknown routes', function () {
    $this->get('/halaman-tidak-ada')
        ->assertNotFound()
        ->assertInertia(fn ($page) => $page
            ->component('site/error')
            ->where('status', 404));
});

it('shows only testimonials with recorded publication permission', function () {
    Testimonial::query()->create([
        'person_name' => 'Tanpa Izin',
        'quote' => 'Kutipan tanpa izin.',
        'is_active' => true,
    ]);

    Testimonial::query()->create([
        'person_name' => 'Dengan Izin',
        'quote' => 'Kutipan dengan izin.',
        'is_active' => true,
        'permission_confirmed_at' => now(),
    ]);

    $this->get('/')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('testimonials', 1)
            ->where('testimonials.0.person_name', 'Dengan Izin'));
});

it('shows only approved team members on the about page', function () {
    TeamMember::query()->create([
        'name' => 'Belum Disetujui',
        'role' => 'Developer',
        'is_active' => true,
    ]);

    TeamMember::query()->create([
        'name' => 'Sudah Disetujui',
        'role' => 'Developer',
        'is_active' => true,
        'approved_at' => now(),
    ]);

    $this->get('/tentang-kami')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('team', 1)
            ->where('team.0.name', 'Sudah Disetujui'));
});

it('adds page context to whatsapp links on detail pages', function () {
    Settings::set('contact_whatsapp', '081234567890');
    Settings::forget();

    $service = Service::query()->create([
        'title' => 'Website Development',
        'slug' => 'website-development',
        'summary' => 'Website yang jelas dan cepat.',
        'status' => 'published',
        'published_at' => now(),
    ]);

    $package = Package::query()->create([
        'name' => 'Company Profile',
        'slug' => 'company-profile',
        'currency' => 'IDR',
        'billing_type' => 'one_time',
        'status' => 'published',
    ]);

    $project = PortfolioProject::query()->create([
        'title' => 'Internal Tool',
        'slug' => 'internal-tool',
        'excerpt' => 'Alat internal untuk operasional.',
        'project_type' => 'internal_project',
        'project_status' => 'completed',
        'status' => 'published',
        'published_at' => now()->subDay(),
    ]);

    $this->get('/layanan/'.$service->slug)
        ->assertInertia(fn ($page) => $page->where(
            'whatsappUrl',
            fn ($url) => is_string($url) && str_contains(urldecode($url), 'layanan Website Development'),
        ));

    $this->get('/paket/'.$package->slug)
        ->assertInertia(fn ($page) => $page->where(
            'whatsappUrl',
            fn ($url) => is_string($url) && str_contains(urldecode($url), 'paket Company Profile'),
        ));

    $this->get('/portfolio/'.$project->slug)
        ->assertInertia(fn ($page) => $page->where(
            'whatsappUrl',
            fn ($url) => is_string($url) && str_contains(urldecode($url), 'proyek serupa dengan Internal Tool'),
        ));
});

it('exposes booking and resource settings to the public site', function () {
    Settings::set('booking_url', 'https://cal.com/devcraft');
    Settings::set('lead_magnet_url', 'https://example.com/checklist-brief.pdf');
    Settings::forget();

    $this->get('/')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('site.conversion.booking_url', 'https://cal.com/devcraft')
            ->where('site.conversion.lead_magnet_url', 'https://example.com/checklist-brief.pdf'));
});

it('accepts the new conversion analytics events', function (string $event) {
    $this->postJson('/analytics/event', [
        'event' => $event,
        'metadata' => ['source' => 'test'],
    ])->assertOk();

    expect(AnalyticsEvent::query()->where('event_name', $event)->exists())->toBeTrue();
})->with(['design_shared', 'booking_click', 'lead_magnet_click']);
