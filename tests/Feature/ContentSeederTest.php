<?php

use App\Models\Package;
use App\Models\PackageAddon;
use App\Models\Service;
use Database\Seeders\PackageSeeder;
use Database\Seeders\ServiceSeeder;

it('seeds published packages with benchmarked starting prices and SEO metadata', function () {
    $this->seed(PackageSeeder::class);

    $packages = Package::query()->where('status', 'published')->get();

    expect($packages)->toHaveCount(6);

    $prices = $packages->pluck('price_amount', 'slug');

    expect($prices['starter-website'])->toBe(1_500_000)
        ->and($prices['business-presence'])->toBe(3_500_000)
        ->and($prices['product-catalog'])->toBe(5_500_000)
        ->and($prices['automation-integration'])->toBe(2_500_000)
        ->and($prices['care-maintenance'])->toBe(450_000)
        ->and($prices['custom-application'])->toBeNull();

    $custom = $packages->firstWhere('slug', 'custom-application');

    expect($custom->price_label)->toBe('Mulai dari Rp 12.000.000');

    foreach ($packages as $package) {
        expect($package->hasVisiblePrice())->toBeTrue()
            ->and($package->meta_title)->not->toBeEmpty()
            ->and($package->meta_description)->not->toBeEmpty()
            ->and(mb_strlen($package->meta_description))->toBeLessThanOrEqual(158)
            ->and($package->priceDisplay())->not->toContain('Rp X')
            ->and($package->included_items)->not->toBeEmpty()
            ->and($package->excluded_items)->not->toBeEmpty()
            ->and($package->limitations)->not->toBeEmpty();
    }

    $this->artisan('app:verify-placeholders')->assertExitCode(0);
});

it('seeds package addons with explicit prices and descriptions', function () {
    $this->seed(PackageSeeder::class);

    $addons = PackageAddon::query()->get();

    expect($addons)->not->toBeEmpty();

    foreach ($addons as $addon) {
        expect($addon->name)->not->toBeEmpty()
            ->and($addon->description)->not->toBeEmpty()
            ->and($addon->price_label)->not->toBeEmpty()
            ->and($addon->price_label)->not->toContain('Rp X')
            ->and($addon->is_active)->toBeTrue();
    }

    expect(Package::query()->where('slug', 'care-maintenance')->firstOrFail()->addons)->toHaveCount(3);
});

it('seeds services with SEO copy and complete structured content', function () {
    $this->seed(ServiceSeeder::class);

    $services = Service::query()->where('status', 'published')->get();

    expect($services)->toHaveCount(7);

    foreach ($services as $service) {
        expect($service->meta_title)->not->toBeEmpty()
            ->and($service->meta_description)->not->toBeEmpty()
            ->and(mb_strlen($service->meta_description))->toBeLessThanOrEqual(158)
            ->and($service->description)->not->toBeEmpty()
            ->and(mb_strlen($service->description))->toBeGreaterThan(300)
            ->and($service->cost_factors)->not->toBeEmpty()
            ->and($service->deliverables)->toHaveCount(6)
            ->and($service->process)->toHaveCount(6)
            ->and($service->faqs)->toHaveCount(5);
    }

    $this->artisan('app:verify-placeholders')->assertExitCode(0);
});

it('shows seeded prices and metadata on public package pages', function () {
    $this->seed(PackageSeeder::class);

    $this->get('/paket/starter-website')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('package.price_display', 'Mulai dari Rp 1.500.000')
            ->where('package.billing_label', 'Sekali bayar')
            ->where('seo.title', 'Jasa Landing Page untuk UMKM & Personal Brand — DevCraft Studio')
            ->where('seo.description', 'Jasa pembuatan landing page responsif untuk UMKM dan personal brand. Mulai Rp 1.500.000, termasuk SEO dasar, formulir kontak, dan panduan penggunaan.'));

    $this->get('/paket/care-maintenance')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('package.price_display', 'Mulai dari Rp 450.000')
            ->where('package.billing_label', 'Per bulan'));

    $this->get('/paket/custom-application')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('package.price_display', 'Mulai dari Rp 12.000.000')
            ->where('package.price_amount', null));
});

it('shows seeded service metadata on the public service page', function () {
    $this->seed(ServiceSeeder::class);

    $this->get('/layanan/web-development')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('service.title', 'Pembuatan Website & Landing Page')
            ->where('seo.title', 'Jasa Pembuatan Website & Landing Page — DevCraft Studio')
            ->where('seo.description', 'Jasa pembuatan landing page dan website responsif untuk UMKM dan personal brand. Termasuk struktur konten, SEO dasar, formulir kontak, dan panduan penggunaan.'));
});

it('keeps package and addon seeds idempotent', function () {
    $this->seed(PackageSeeder::class);
    $this->seed(PackageSeeder::class);

    expect(Package::query()->count())->toBe(6)
        ->and(PackageAddon::query()->count())->toBe(19)
        ->and(Package::query()->where('slug', 'business-presence')->firstOrFail()->addons)->toHaveCount(4);
});
