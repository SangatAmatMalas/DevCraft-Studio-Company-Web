<?php

use App\Mail\LeadReceivedConfirmation;
use App\Models\Lead;
use App\Models\LeadNote;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

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

it('accepts a lead that only shares a WhatsApp number', function () {
    $this->post('/kontak', validLeadPayload([
        'email' => null,
        'phone' => '081234567890',
        'preferred_contact' => 'whatsapp',
    ]))->assertRedirect('/kontak');

    $lead = Lead::query()->firstOrFail();

    expect($lead->email)->toBeNull()
        ->and($lead->phone)->toBe('081234567890')
        ->and($lead->preferred_contact)->toBe('whatsapp');
});

it('requires at least one contact channel', function () {
    $this->post('/kontak', validLeadPayload([
        'email' => null,
        'phone' => null,
    ]))->assertSessionHasErrors(['email', 'phone']);

    expect(Lead::query()->count())->toBe(0);
});

it('stores attachments and a reference link with the lead', function () {
    Storage::fake('local');

    $this->post('/kontak', validLeadPayload([
        'reference_url' => 'https://example.com/referensi',
        'attachments' => [
            UploadedFile::fake()->create('brief.pdf', 120, 'application/pdf'),
            UploadedFile::fake()->image('mockup.png'),
        ],
    ]))->assertRedirect('/kontak');

    $lead = Lead::query()->firstOrFail();

    expect($lead->reference_url)->toBe('https://example.com/referensi')
        ->and($lead->attachments)->toHaveCount(2);

    Storage::disk('local')->assertExists($lead->attachments->first()->path);
});

it('sends a confirmation email when the lead shares an email', function () {
    Mail::fake();

    $this->post('/kontak', validLeadPayload())->assertRedirect('/kontak');

    Mail::assertSent(LeadReceivedConfirmation::class, fn (LeadReceivedConfirmation $mail) => $mail->hasTo('rina@example.com'));
});

it('does not send a confirmation email to a phone-only lead', function () {
    Mail::fake();

    $this->post('/kontak', validLeadPayload([
        'email' => null,
        'phone' => '081234567890',
        'preferred_contact' => 'whatsapp',
    ]))->assertRedirect('/kontak');

    Mail::assertNotSent(LeadReceivedConfirmation::class);
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

it('lets the team schedule a follow-up and records contact time', function () {
    $lead = Lead::query()->create(validLeadPayload());

    $this->actingAs(adminUser('sales'))
        ->patch("/admin/leads/{$lead->id}", [
            'status' => 'contacted',
            'next_follow_up_at' => '2026-11-05',
        ])
        ->assertRedirect();

    $lead->refresh();

    expect($lead->next_follow_up_at?->toDateString())->toBe('2026-11-05')
        ->and($lead->last_contacted_at)->not->toBeNull();
});

it('lets the team download a lead attachment', function () {
    Storage::fake('local');

    $lead = Lead::query()->create(validLeadPayload());
    $path = UploadedFile::fake()->create('brief.pdf', 80, 'application/pdf')->store('lead-attachments/'.$lead->id, 'local');

    $attachment = $lead->attachments()->create([
        'disk' => 'local',
        'path' => $path,
        'original_name' => 'brief.pdf',
        'mime_type' => 'application/pdf',
        'size' => 80,
    ]);

    $this->actingAs(adminUser('sales'))
        ->get("/admin/leads/{$lead->id}/attachments/{$attachment->id}")
        ->assertOk()
        ->assertDownload('brief.pdf');
});

it('filters leads that need follow-up', function () {
    $due = Lead::query()->create(validLeadPayload(['name' => 'Due', 'email' => 'due@example.com']));
    $due->forceFill(['created_at' => now()->subDays(5)])->save();

    Lead::query()->create(validLeadPayload(['name' => 'Fresh', 'email' => 'fresh@example.com']));

    $this->actingAs(adminUser('sales'))
        ->get('/admin/leads?follow_up=due')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/leads/index')
            ->where('leads.meta.total', 1)
            ->where('leads.data.0.name', 'Due'));
});

it('rejects downloading an attachment that belongs to another lead', function () {
    Storage::fake('local');

    $lead = Lead::query()->create(validLeadPayload());
    $other = Lead::query()->create(validLeadPayload(['email' => 'other@example.com']));

    $path = UploadedFile::fake()->create('brief.pdf', 80, 'application/pdf')->store('lead-attachments/'.$lead->id, 'local');

    $attachment = $lead->attachments()->create([
        'disk' => 'local',
        'path' => $path,
        'original_name' => 'brief.pdf',
        'mime_type' => 'application/pdf',
        'size' => 80,
    ]);

    $this->actingAs(adminUser('sales'))
        ->get("/admin/leads/{$other->id}/attachments/{$attachment->id}")
        ->assertNotFound();
});
