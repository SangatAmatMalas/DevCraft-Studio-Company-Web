<?php

use App\Models\Lead;
use App\Models\LeadNote;

function validLeadPayload(array $overrides = []): array
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

it('shows the contact form', function () {
    $this->get('/kontak')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('site/contact'));
});

it('stores a valid project brief', function () {
    $this->post('/kontak', validLeadPayload())
        ->assertRedirect('/kontak')
        ->assertSessionHas('lead_submitted', true);

    $lead = Lead::query()->firstOrFail();

    expect($lead->email)->toBe('rina@example.com')
        ->and($lead->status->value)->toBe('new')
        ->and($lead->privacy_consent_at)->not->toBeNull()
        ->and($lead->ip_hash)->toHaveLength(64);
});

it('rejects a brief that does not meet content rules', function () {
    $this->post('/kontak', validLeadPayload([
        'email' => 'not-an-email',
        'message' => 'Terlalu singkat.',
        'privacy_consent' => false,
    ]))->assertSessionHasErrors(['email', 'message', 'privacy_consent']);

    expect(Lead::query()->count())->toBe(0);
});

it('silently rejects honeypot submissions', function () {
    $this->post('/kontak', validLeadPayload(['website' => 'https://spam.example']))
        ->assertSessionHasErrors('website');

    expect(Lead::query()->count())->toBe(0);
});

it('rate limits repeated submissions from the same IP', function () {
    foreach (range(1, 5) as $attempt) {
        $this->post('/kontak', validLeadPayload(['email' => "lead{$attempt}@example.com"]))->assertRedirect('/kontak');
    }

    $this->post('/kontak', validLeadPayload(['email' => 'lead6@example.com']))
        ->assertStatus(429);
});

it('lets sales update the lead status and add an internal note', function () {
    $user = adminUser('sales');
    $lead = Lead::query()->create(validLeadPayload());

    $this->actingAs($user)
        ->patch("/admin/leads/{$lead->id}", ['status' => 'contacted'])
        ->assertRedirect();

    expect($lead->fresh()->status->value)->toBe('contacted');

    $this->actingAs($user)
        ->post("/admin/leads/{$lead->id}/notes", ['note' => 'Sudah dihubungi melalui email.'])
        ->assertRedirect();

    $note = LeadNote::query()->firstOrFail();

    expect($note->lead_id)->toBe($lead->id)
        ->and($note->user_id)->toBe($user->id);
});

it('exports leads as CSV', function () {
    Lead::query()->create(validLeadPayload());

    $response = $this->actingAs(adminUser('sales'))->get('/admin/leads/export');

    $response->assertOk();
    expect($response->headers->get('content-type'))->toContain('text/csv');
});
