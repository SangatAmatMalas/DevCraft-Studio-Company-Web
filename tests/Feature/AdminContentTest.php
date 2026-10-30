<?php

use App\Models\Package;
use App\Models\Page;
use App\Models\PortfolioProject;
use App\Models\Service;

it('lets an admin create and publish a service without code changes', function () {
    $user = adminUser('admin');

    $this->actingAs($user)
        ->post('/admin/services', [
            'title' => 'Web Application Development',
            'slug' => 'web-application-development',
            'summary' => 'Pembuatan aplikasi web sesuai kebutuhan operasional.',
            'description' => 'Lingkup mencakup perancangan, implementasi, dan serah terima.',
            'deliverables' => ['Kode sumber', 'Dokumentasi singkat'],
            'process' => [['title' => 'Discovery', 'description' => 'Memetakan kebutuhan.']],
            'faqs' => [['question' => 'Berapa lama?', 'answer' => 'Bergantung lingkup.']],
            'technologies' => ['Laravel', 'React'],
            'cost_factors' => 'Jumlah fitur dan integrasi.',
            'display_order' => 1,
            'publish' => true,
        ])
        ->assertRedirect();

    $service = Service::query()->where('slug', 'web-application-development')->firstOrFail();

    expect($service->status->value)->toBe('published')
        ->and($service->deliverables)->toBe(['Kode sumber', 'Dokumentasi singkat']);

    $this->get('/layanan/web-application-development')
        ->assertOk();
});

it('refuses to publish a package without a real price', function () {
    $this->actingAs(adminUser('admin'))
        ->post('/admin/packages', [
            'name' => 'Starter Website',
            'slug' => 'starter-website',
            'currency' => 'IDR',
            'billing_type' => 'one_time',
            'publish' => true,
        ])
        ->assertSessionHasErrors('price_amount');

    expect(Package::query()->count())->toBe(0);
});

it('rejects placeholder prices', function () {
    $this->actingAs(adminUser('admin'))
        ->post('/admin/packages', [
            'name' => 'Starter Website',
            'slug' => 'starter-website',
            'currency' => 'IDR',
            'billing_type' => 'one_time',
            'price_label' => 'Rp X',
        ])
        ->assertSessionHasErrors('price_label');
});

it('publishes a custom quotation package with no numeric price', function () {
    $this->actingAs(adminUser('admin'))
        ->post('/admin/packages', [
            'name' => 'Custom Application',
            'slug' => 'custom-application',
            'currency' => 'IDR',
            'billing_type' => 'custom',
            'publish' => true,
        ])
        ->assertRedirect();

    expect(Package::query()->firstOrFail()->status->value)->toBe('published');
});

it('prevents publishing a draft package through the publish endpoint when price is missing', function () {
    $package = Package::query()->create([
        'name' => 'Unpriced',
        'slug' => 'unpriced',
        'currency' => 'IDR',
        'billing_type' => 'one_time',
        'status' => 'draft',
    ]);

    $this->actingAs(adminUser('admin'))
        ->post('/admin/packages/unpriced/publish')
        ->assertSessionHas('error');

    expect($package->fresh()->status->value)->toBe('draft');
});

it('keeps draft content out of the public site', function () {
    Service::query()->create([
        'title' => 'Draft Service',
        'slug' => 'draft-service',
        'summary' => 'Belum siap dipublikasikan.',
        'status' => 'draft',
    ]);

    $this->get('/layanan')->assertOk();
    $this->get('/layanan/draft-service')->assertNotFound();
});

it('creates a portfolio project with sections and publishes it', function () {
    $this->actingAs(adminUser('admin'))
        ->post('/admin/portfolio', [
            'title' => 'Inventory Tool',
            'slug' => 'inventory-tool',
            'excerpt' => 'Alat pencatatan stok sederhana untuk toko kecil.',
            'description' => 'Dibangun sebagai proyek internal.',
            'project_type' => 'internal_project',
            'project_status' => 'completed',
            'sections' => [
                ['heading' => 'Latar', 'body' => 'Pencatatan masih manual.', 'section_type' => 'text', 'display_order' => 0],
            ],
            'publish' => true,
        ])
        ->assertRedirect();

    $project = PortfolioProject::query()->where('slug', 'inventory-tool')->firstOrFail();

    expect($project->status->value)->toBe('published')
        ->and($project->sections()->count())->toBe(1);

    $this->get('/portfolio/inventory-tool')->assertOk();
});

it('accepts empty repeater rows from admin forms without validation errors', function () {
    $this->actingAs(adminUser('admin'))
        ->post('/admin/services', [
            'title' => 'Blank Repeater Service',
            'slug' => 'blank-repeater-service',
            'summary' => 'Menguji baris kosong dari formulir admin.',
            'deliverables' => [''],
            'technologies' => [''],
            'process' => [['title' => '', 'description' => '']],
            'faqs' => [['question' => '', 'answer' => '']],
            'publish' => true,
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    $service = Service::query()->where('slug', 'blank-repeater-service')->firstOrFail();

    expect($service->deliverables)->toBe([])
        ->and($service->technologies)->toBe([])
        ->and($service->process)->toBe([])
        ->and($service->faqs)->toBe([]);
});

it('resolves admin content edit routes by slug', function () {
    $user = adminUser('admin');

    $service = Service::query()->create([
        'title' => 'Slug Service',
        'slug' => 'slug-service',
        'summary' => 'Ringkasan.',
        'status' => 'draft',
    ]);

    $project = PortfolioProject::query()->create([
        'title' => 'Slug Project',
        'slug' => 'slug-project',
        'excerpt' => 'Ringkasan.',
        'project_type' => 'prototype',
        'project_status' => 'completed',
        'status' => 'draft',
    ]);

    $page = Page::query()->create([
        'title' => 'Slug Page',
        'slug' => 'slug-page',
        'content' => ['intro' => '', 'blocks' => []],
        'status' => 'draft',
    ]);

    $this->actingAs($user)->get('/admin/services/'.$service->slug.'/edit')->assertOk();
    $this->actingAs($user)->get('/admin/portfolio/'.$project->slug.'/edit')->assertOk();
    $this->actingAs($user)->get('/admin/pages/'.$page->slug.'/edit')->assertOk();
});
