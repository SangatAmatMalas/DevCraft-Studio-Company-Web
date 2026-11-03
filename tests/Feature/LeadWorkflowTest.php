<?php

use App\Mail\LeadReceivedConfirmation;
use App\Mail\NewLeadNotification;
use App\Mail\TestMail;
use App\Models\ActivityLog;
use App\Models\Lead;
use App\Models\LeadReplyTemplate;
use App\Models\MailDelivery;
use App\Support\Settings;
use Illuminate\Support\Facades\Mail;

function workflowLeadPayload(array $overrides = []): array
{
    return array_merge([
        'name' => 'Sari Wulandari',
        'email' => 'sari@example.com',
        'phone' => '081298765432',
        'preferred_contact' => 'email',
        'message' => 'Kami butuh situs company profile dengan halaman layanan dan kontak.',
        'privacy_consent' => true,
        'source_type' => 'contact_page',
    ], $overrides);
}

beforeEach(function () {
    Settings::set('contact_email', 'team@example.com');
    Settings::forget();
});

afterEach(function () {
    Settings::forget();
});

it('sends lead emails after the response and records both deliveries', function () {
    Mail::fake();

    $this->post('/kontak', workflowLeadPayload())->assertRedirect('/kontak');

    Mail::assertSent(NewLeadNotification::class);
    Mail::assertSent(LeadReceivedConfirmation::class, fn (LeadReceivedConfirmation $mail) => $mail->hasTo('sari@example.com'));

    expect(MailDelivery::query()->where('status', MailDelivery::STATUS_SENT)->count())->toBe(2);
});

it('keeps the lead and records a failure when smtp rejects the message', function () {
    Mail::shouldReceive('to')->andThrow(new RuntimeException('SMTP connection refused'));

    $this->post('/kontak', workflowLeadPayload())->assertRedirect('/kontak');

    expect(Lead::query()->count())->toBe(1);

    $failed = MailDelivery::query()->where('status', MailDelivery::STATUS_FAILED)->get();

    expect($failed)->toHaveCount(2)
        ->and($failed->first()->error)->toContain('SMTP connection refused');
});

it('marks a lead as contacted without changing its status', function () {
    $lead = Lead::query()->create(workflowLeadPayload());

    $this->actingAs(adminUser('sales'))
        ->post("/admin/leads/{$lead->id}/contacted")
        ->assertRedirect();

    $lead->refresh();

    expect($lead->last_contacted_at)->not->toBeNull()
        ->and($lead->status->value)->toBe('new')
        ->and(ActivityLog::query()->where('action', 'lead.marked_contacted')->exists())->toBeTrue();
});

it('updates the follow-up schedule without touching the pipeline status', function () {
    $lead = Lead::query()->create(workflowLeadPayload());

    $this->actingAs(adminUser('sales'))
        ->patch("/admin/leads/{$lead->id}/follow-up", ['next_follow_up_at' => '2026-12-01'])
        ->assertRedirect();

    $lead->refresh();

    expect($lead->next_follow_up_at?->toDateString())->toBe('2026-12-01')
        ->and($lead->status->value)->toBe('new');

    // A plain status change must not wipe the scheduled follow-up.
    $this->actingAs(adminUser('sales'))
        ->patch("/admin/leads/{$lead->id}", ['status' => 'contacted'])
        ->assertRedirect();

    expect($lead->fresh()->next_follow_up_at?->toDateString())->toBe('2026-12-01');
});

it('archives and marks leads in bulk with audit entries', function () {
    $first = Lead::query()->create(workflowLeadPayload(['email' => 'first@example.com']));
    $second = Lead::query()->create(workflowLeadPayload(['email' => 'second@example.com']));

    $this->actingAs(adminUser('sales'))
        ->patch('/admin/leads/bulk', ['action' => 'archive', 'ids' => [$first->id, $second->id]])
        ->assertRedirect();

    expect($first->fresh()->status->value)->toBe('archived')
        ->and($second->fresh()->status->value)->toBe('archived')
        ->and(ActivityLog::query()->where('action', 'lead.bulk_archive')->exists())->toBeTrue();

    $third = Lead::query()->create(workflowLeadPayload(['email' => 'third@example.com']));

    $this->actingAs(adminUser('sales'))
        ->patch('/admin/leads/bulk', ['action' => 'contacted', 'ids' => [$third->id]])
        ->assertRedirect();

    expect($third->fresh()->last_contacted_at)->not->toBeNull()
        ->and($third->fresh()->status->value)->toBe('new');
});

it('rejects bulk requests over the id limit', function () {
    $ids = collect(range(1, 101))->all();

    $this->actingAs(adminUser('sales'))
        ->patch('/admin/leads/bulk', ['action' => 'archive', 'ids' => $ids])
        ->assertSessionHasErrors('ids');
});

it('lets sales manage reply templates but blocks content managers', function () {
    $payload = [
        'title' => 'Balasan singkat',
        'body' => 'Halo {name}, terima kasih sudah menghubungi kami soal {service}.',
        'is_active' => true,
        'display_order' => 1,
    ];

    $this->actingAs(adminUser('sales'))
        ->post('/admin/lead-templates', $payload)
        ->assertRedirect();

    $template = LeadReplyTemplate::query()->firstOrFail();

    expect($template->title)->toBe('Balasan singkat')
        ->and(ActivityLog::query()->where('action', 'lead_template.created')->exists())->toBeTrue();

    $this->actingAs(adminUser('content_manager'))
        ->post('/admin/lead-templates', $payload)
        ->assertForbidden();
});

it('rejects unknown placeholders in reply templates', function () {
    $this->actingAs(adminUser('sales'))
        ->post('/admin/lead-templates', [
            'title' => 'Template salah',
            'body' => 'Halo {name}, harga mulai {harga} dan SLA {sla}.',
            'is_active' => true,
            'display_order' => 0,
        ])
        ->assertSessionHasErrors('body');

    expect(LeadReplyTemplate::query()->count())->toBe(0);
});

it('renders only active templates with lead data on the detail page', function () {
    $lead = Lead::query()->create(workflowLeadPayload([
        'name' => 'Budi',
        'service_type' => 'Website portfolio',
    ]));

    LeadReplyTemplate::query()->create([
        'title' => 'Aktif',
        'body' => 'Halo {name}, soal {service} dan paket {package}.',
        'is_active' => true,
        'display_order' => 0,
    ]);

    LeadReplyTemplate::query()->create([
        'title' => 'Nonaktif',
        'body' => 'Tidak boleh muncul.',
        'is_active' => false,
        'display_order' => 1,
    ]);

    $this->actingAs(adminUser('sales'))
        ->get("/admin/leads/{$lead->id}")
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/leads/show')
            ->has('templates', 1)
            ->where('templates.0.title', 'Aktif')
            ->where('templates.0.body', 'Halo Budi, soal Website portfolio dan paket yang sesuai.'));
});

it('sends a test email only for users allowed to manage settings', function () {
    Mail::fake();

    $admin = adminUser('admin');

    $this->actingAs($admin)
        ->post('/admin/settings/test-email')
        ->assertRedirect()
        ->assertSessionHas('success');

    Mail::assertSent(TestMail::class, fn (TestMail $mail) => $mail->hasTo($admin->email));

    expect(MailDelivery::query()->where('type', MailDelivery::TYPE_TEST)->where('status', MailDelivery::STATUS_SENT)->exists())->toBeTrue();

    $this->actingAs(adminUser('sales'))
        ->post('/admin/settings/test-email')
        ->assertForbidden();
});

it('reports a failed test email without throwing', function () {
    Mail::shouldReceive('to')->andThrow(new RuntimeException('Connection timed out'));

    $this->actingAs(adminUser('admin'))
        ->post('/admin/settings/test-email')
        ->assertRedirect()
        ->assertSessionHas('error');

    expect(MailDelivery::query()->where('type', MailDelivery::TYPE_TEST)->where('status', MailDelivery::STATUS_FAILED)->exists())->toBeTrue();
});
