<?php

use App\Models\Package;

it('passes when no placeholder text exists', function () {
    Package::query()->create([
        'name' => 'Starter',
        'slug' => 'starter',
        'currency' => 'IDR',
        'billing_type' => 'one_time',
        'price_amount' => 5000000,
        'status' => 'published',
        'published_at' => now(),
    ]);

    $this->artisan('app:verify-placeholders')
        ->expectsOutputToContain('No placeholder text detected.')
        ->assertExitCode(0);
});

it('fails when published content still contains a placeholder', function () {
    Package::query()->create([
        'name' => 'Starter',
        'slug' => 'starter',
        'currency' => 'IDR',
        'billing_type' => 'one_time',
        'price_label' => 'Rp X',
        'status' => 'published',
        'published_at' => now(),
    ]);

    $this->artisan('app:verify-placeholders')
        ->expectsOutputToContain('placeholder value(s) found in published content')
        ->assertExitCode(1);
});

it('warns but passes when placeholders are limited to drafts', function () {
    Package::query()->create([
        'name' => 'Draft Package',
        'slug' => 'draft-package',
        'currency' => 'IDR',
        'billing_type' => 'one_time',
        'price_label' => 'Rp X',
        'status' => 'draft',
    ]);

    $this->artisan('app:verify-placeholders')
        ->expectsOutputToContain('Placeholder text found only in unpublished content.')
        ->assertExitCode(0);
});
