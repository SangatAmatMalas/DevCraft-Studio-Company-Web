<?php

use App\Models\DesignBrief;
use App\Models\Lead;
use App\Support\Settings;

function validDesignLeadPayload(array $overrides = []): array
{
    return array_merge([
        'name' => 'Rina Pratama',
        'email' => 'rina@example.com',
        'phone' => '081234567890',
        'organization' => 'Toko Rina',
        'budget_range' => 'Rp 5 juta – Rp 15 juta',
        'target_timeline' => '1–3 bulan',
        'preferred_contact' => 'email',
        'message' => 'Kami membutuhkan sistem pencatatan pesanan sederhana untuk toko.',
        'privacy_consent' => true,
        'source_type' => 'contact_page',
    ], $overrides);
}

function validDesignBriefPayload(array $overrides = []): array
{
    return array_merge([
        'category' => 'company-profile',
        'style' => 'minimal',
        'brand_name' => 'Studio Pagi',
        'tagline' => 'Ruang kreatif untuk brand lokal',
        'description' => 'Kami membantu usaha lokal membangun identitas visual dan website yang mudah digunakan.',
        'services' => [
            ['title' => 'Identitas visual', 'description' => 'Logo dan panduan visual.'],
            ['title' => 'Website', 'description' => 'Website profil usaha.'],
        ],
        'contact' => ['whatsapp' => '081234567890', 'email' => 'halo@studiopagi.test', 'city' => 'Bandung'],
        'primary_color' => '#2563eb',
        'sections' => ['hero', 'services', 'about', 'contact'],
        'privacy_consent' => true,
        'website' => '',
    ], $overrides);
}

it('shows the design brief wizard', function () {
    $this->get('/desain')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('site/design/index')
            ->has('categories', 5)
            ->has('styles', 3));
});

it('generates three deterministic design variants and protects them from indexing', function () {
    $this->post('/desain', validDesignBriefPayload())
        ->assertRedirect();

    $brief = DesignBrief::query()->firstOrFail();

    expect($brief->templates)->toBe(['bold-hero', 'editorial-split', 'grid-catalog'])
        ->and($brief->expires_at)->not->toBeNull();

    $this->get("/desain/{$brief->token}")
        ->assertOk()
        ->assertHeader('X-Robots-Tag', 'noindex, nofollow')
        ->assertHeader('Cache-Control', 'no-store, private')
        ->assertInertia(fn ($page) => $page
            ->component('site/design/result')
            ->has('brief.variants', 3));

    $this->get("/desain/{$brief->token}/preview/bold-hero?embed=1")
        ->assertOk()
        ->assertHeader('X-Robots-Tag', 'noindex, nofollow')
        ->assertInertia(fn ($page) => $page->component('site/preview/show'));
});

it('allows a visitor to select a design then links its consultation lead', function () {
    $brief = DesignBrief::query()->create([
        ...validDesignBriefPayload(),
        'templates' => ['bold-hero', 'editorial-split', 'grid-catalog'],
        'expires_at' => now()->addDays(30),
        'status' => 'generated',
    ]);

    $this->post("/desain/{$brief->token}/pilih", ['template' => 'editorial-split'])
        ->assertRedirect("/desain/{$brief->token}");

    expect($brief->fresh()->chosen_template)->toBe('editorial-split')
        ->and($brief->fresh()->status)->toBe('selected');

    $this->post('/kontak', validDesignLeadPayload([
        'email' => 'preview@example.com',
        'design_brief' => $brief->token,
        'source_type' => 'design_preview',
    ]))->assertRedirect('/kontak');

    $lead = Lead::query()->where('email', 'preview@example.com')->firstOrFail();

    expect($lead->design_brief_id)->toBe($brief->id)
        ->and($lead->source_type)->toBe('design_preview')
        ->and($brief->fresh()->lead_id)->toBe($lead->id)
        ->and($brief->fresh()->status)->toBe('claimed');
});

it('does not expose expired previews', function () {
    $brief = DesignBrief::query()->create([
        ...validDesignBriefPayload(),
        'templates' => ['bold-hero', 'editorial-split', 'grid-catalog'],
        'expires_at' => now()->subMinute(),
        'status' => 'generated',
    ]);

    $this->get("/desain/{$brief->token}")->assertGone();
});

it('includes the design context in the result whatsapp link', function () {
    Settings::set('contact_whatsapp', '081234567890');
    Settings::forget();

    $this->post('/desain', validDesignBriefPayload())->assertRedirect();

    $brief = DesignBrief::query()->firstOrFail();

    $this->get("/desain/{$brief->token}")
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where(
            'brief.whatsapp_url',
            fn ($url) => is_string($url) && str_contains(urldecode($url), 'preview desain Studio Pagi'),
        ));
});
