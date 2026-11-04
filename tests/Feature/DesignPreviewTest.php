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

it('ignores untouched service rows so an empty second row does not block the brief', function () {
    $this->post('/desain', validDesignBriefPayload([
        'services' => [
            ['title' => 'Identitas visual', 'description' => 'Logo dan panduan visual.'],
            ['title' => '', 'description' => ''],
        ],
    ]))->assertRedirect()->assertSessionHasNoErrors();

    $brief = DesignBrief::query()->firstOrFail();

    expect($brief->services)->toHaveCount(1)
        ->and($brief->services[0]['title'])->toBe('Identitas visual');
});

it('still rejects a service row that has description but no title', function () {
    $this->post('/desain', validDesignBriefPayload([
        'services' => [
            ['title' => 'Identitas visual', 'description' => 'Logo dan panduan visual.'],
            ['title' => '', 'description' => 'Deskripsi tanpa nama.'],
        ],
    ]))->assertSessionHasErrors('services.1.title');

    expect(DesignBrief::query()->count())->toBe(0);
});

it('normalises phone numbers and email before storing the brief', function () {
    $this->post('/desain', validDesignBriefPayload([
        'contact' => [
            'whatsapp' => '+62 (812) 3456-7890',
            'email' => 'Halo@StudioPagi.Test',
            'city' => 'Bandung',
        ],
    ]))->assertRedirect()->assertSessionHasNoErrors();

    $brief = DesignBrief::query()->firstOrFail();

    expect($brief->contact['whatsapp'])->toBe('+6281234567890')
        ->and($brief->contact['email'])->toBe('halo@studiopagi.test');
});

it('shows the wizard prefilled for editing and keeps the same token after update', function () {
    $brief = DesignBrief::query()->create([
        ...validDesignBriefPayload(),
        'templates' => ['bold-hero', 'editorial-split', 'grid-catalog'],
        'chosen_template' => 'editorial-split',
        'chosen_at' => now(),
        'expires_at' => now()->addDays(30),
        'status' => 'selected',
    ]);

    $this->get("/desain/{$brief->token}/edit")
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('site/design/index')
            ->where('brief.token', $brief->token)
            ->where('brief.brand_name', 'Studio Pagi')
            ->where('brief.sections', ['hero', 'services', 'about', 'contact'])
            ->has('brief.services', 2));

    $this->patch("/desain/{$brief->token}", validDesignBriefPayload([
        'tagline' => 'Tagline yang sudah diperbarui',
        'services' => [['title' => 'Satu layanan saja', 'description' => '']],
    ]))->assertRedirect("/desain/{$brief->token}");

    $updated = $brief->fresh();

    expect($updated->id)->toBe($brief->id)
        ->and($updated->token)->toBe($brief->token)
        ->and($updated->tagline)->toBe('Tagline yang sudah diperbarui')
        ->and($updated->services)->toHaveCount(1)
        ->and($updated->chosen_template)->toBe('editorial-split');
});

it('blocks editing once the brief has been attached to a consultation lead', function () {
    $brief = DesignBrief::query()->create([
        ...validDesignBriefPayload(),
        'templates' => ['bold-hero', 'editorial-split', 'grid-catalog'],
        'expires_at' => now()->addDays(30),
        'status' => 'claimed',
    ]);

    $this->get("/desain/{$brief->token}/edit")
        ->assertRedirect("/desain/{$brief->token}")
        ->assertSessionHas('error');

    $this->patch("/desain/{$brief->token}", validDesignBriefPayload(['tagline' => 'Tidak boleh tersimpan']))
        ->assertRedirect("/desain/{$brief->token}")
        ->assertSessionHas('error');

    expect($brief->fresh()->tagline)->toBe('Ruang kreatif untuk brand lokal');
});

it('does not allow editing an expired brief', function () {
    $brief = DesignBrief::query()->create([
        ...validDesignBriefPayload(),
        'templates' => ['bold-hero', 'editorial-split', 'grid-catalog'],
        'expires_at' => now()->subMinute(),
        'status' => 'generated',
    ]);

    $this->get("/desain/{$brief->token}/edit")->assertGone();
    $this->patch("/desain/{$brief->token}", validDesignBriefPayload())->assertGone();
});
