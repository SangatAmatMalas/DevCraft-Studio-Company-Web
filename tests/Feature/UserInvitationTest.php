<?php

use App\Enums\UserRole;
use App\Mail\UserInvitationMail;
use App\Models\User;
use App\Models\UserInvitation;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

function issueInvitation(string $email = 'pekerja@example.com', UserRole $role = UserRole::Worker): array
{
    return UserInvitation::issue('Pekerja Produksi', $email, $role, null);
}

it('lets a super admin invite a user by email', function () {
    Mail::fake();

    $admin = adminUser('super_admin');

    $this->actingAs($admin)
        ->post('/admin/users/invitations', [
            'name' => 'Pekerja Produksi',
            'email' => 'Pekerja@Example.com',
            'role' => 'worker',
        ])
        ->assertRedirect('/admin/users')
        ->assertSessionHas('invitation_url');

    $invitation = UserInvitation::query()->firstOrFail();

    expect($invitation->email)->toBe('pekerja@example.com')
        ->and($invitation->role)->toBe(UserRole::Worker)
        ->and($invitation->accepted_at)->toBeNull()
        ->and($invitation->invited_by_id)->toBe($admin->id)
        ->and($invitation->token_hash)->toHaveLength(64)
        ->and(User::query()->where('email', 'pekerja@example.com')->exists())->toBeFalse();

    Mail::assertSent(UserInvitationMail::class, fn (UserInvitationMail $mail) => $mail->hasTo('pekerja@example.com'));
});

it('blocks everyone except the super admin from inviting users', function (string $role) {
    $this->actingAs(adminUser($role))
        ->get('/admin/users/invite')
        ->assertForbidden();

    $this->actingAs(adminUser($role))
        ->post('/admin/users/invitations', [
            'name' => 'Orang Baru',
            'email' => 'baru@example.com',
            'role' => 'worker',
        ])
        ->assertForbidden();

    expect(UserInvitation::query()->count())->toBe(0);
})->with(['admin', 'content_manager', 'sales', 'worker']);

it('rejects an invitation for an existing account or a pending invitation', function () {
    Mail::fake();

    $admin = adminUser('super_admin');
    User::factory()->create(['email' => 'sudah-ada@example.com']);

    $this->actingAs($admin)
        ->post('/admin/users/invitations', [
            'name' => 'Sudah Ada',
            'email' => 'sudah-ada@example.com',
            'role' => 'worker',
        ])
        ->assertSessionHasErrors('email');

    [$invitation, $token] = issueInvitation('pending@example.com');

    $this->actingAs($admin)
        ->post('/admin/users/invitations', [
            'name' => 'Pending',
            'email' => 'pending@example.com',
            'role' => 'worker',
        ])
        ->assertSessionHasErrors('email');

    expect(UserInvitation::query()->count())->toBe(1)
        ->and($invitation->token_hash)->toBe(hash('sha256', $token));
});

it('shows the invitation acceptance page for a usable token', function () {
    [$invitation, $token] = issueInvitation();

    $this->get('/undangan/'.$token)
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('auth/accept-invitation')
            ->where('usable', true)
            ->where('invitation.email', $invitation->email)
            ->where('invitation.role_label', 'Pekerja / Produksi'));
});

it('accepts an invitation, creates the account, and signs the worker in', function () {
    [$invitation, $token] = issueInvitation();

    $this->post('/undangan/'.$token, [
        'password' => 'RahasiaKuat123',
        'password_confirmation' => 'RahasiaKuat123',
    ])->assertRedirect('/admin/design-briefs');

    $user = User::query()->where('email', 'pekerja@example.com')->firstOrFail();

    expect($user->role)->toBe(UserRole::Worker)
        ->and($user->is_active)->toBeTrue()
        ->and($user->email_verified_at)->not->toBeNull()
        ->and(Hash::check('RahasiaKuat123', $user->password))->toBeTrue()
        ->and($invitation->fresh()->accepted_at)->not->toBeNull()
        ->and(auth()->id())->toBe($user->id);
});

it('rejects weak passwords when accepting an invitation', function () {
    [$invitation, $token] = issueInvitation();

    $this->post('/undangan/'.$token, [
        'password' => 'pendek',
        'password_confirmation' => 'pendek',
    ])->assertSessionHasErrors('password');

    expect(User::query()->count())->toBe(0)
        ->and($invitation->fresh()->accepted_at)->toBeNull();
});

it('rejects expired, reused, and unknown invitation tokens', function () {
    [$expired, $expiredToken] = issueInvitation('expired@example.com');
    $expired->forceFill(['expires_at' => now()->subMinute()])->save();

    $this->post('/undangan/'.$expiredToken, [
        'password' => 'RahasiaKuat123',
        'password_confirmation' => 'RahasiaKuat123',
    ])->assertSessionHasErrors('password');

    [$used, $usedToken] = issueInvitation('used@example.com');
    $this->post('/undangan/'.$usedToken, [
        'password' => 'RahasiaKuat123',
        'password_confirmation' => 'RahasiaKuat123',
    ])->assertRedirect('/admin/design-briefs');

    $this->post('/logout');

    $this->post('/undangan/'.$usedToken, [
        'password' => 'RahasiaKuat123',
        'password_confirmation' => 'RahasiaKuat123',
    ])->assertSessionHasErrors('password');

    $this->post('/undangan/'.str_repeat('a', 64), [
        'password' => 'RahasiaKuat123',
        'password_confirmation' => 'RahasiaKuat123',
    ])->assertSessionHasErrors('password');

    expect(User::query()->count())->toBe(1);
});

it('rotates the link when an invitation is resent', function () {
    Mail::fake();

    [$invitation, $oldToken] = issueInvitation();
    $admin = adminUser('super_admin');

    $this->actingAs($admin)
        ->post("/admin/users/invitations/{$invitation->id}/resend")
        ->assertRedirect()
        ->assertSessionHas('invitation_url');

    $newHash = $invitation->fresh()->token_hash;

    expect($newHash)->not->toBe(hash('sha256', $oldToken));

    $newUrl = session('invitation_url');

    $this->post('/logout');

    $this->get('/undangan/'.$oldToken)
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('usable', false));

    $this->get($newUrl)
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('usable', true));
});

it('revokes a pending invitation', function () {
    [$invitation, $token] = issueInvitation();
    $admin = adminUser('super_admin');

    $this->actingAs($admin)
        ->delete("/admin/users/invitations/{$invitation->id}")
        ->assertRedirect();

    expect(UserInvitation::query()->count())->toBe(0);

    $this->post('/logout');

    $this->get('/undangan/'.$token)
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('usable', false));
});

it('refuses to cancel an invitation that was already accepted', function () {
    [$invitation, $token] = issueInvitation();
    $this->post('/undangan/'.$token, [
        'password' => 'RahasiaKuat123',
        'password_confirmation' => 'RahasiaKuat123',
    ])->assertRedirect('/admin/design-briefs');

    $this->actingAs(adminUser('super_admin'))
        ->delete("/admin/users/invitations/{$invitation->id}")
        ->assertSessionHas('error');

    expect(UserInvitation::query()->count())->toBe(1);
});

it('gives the worker role read-only access to design briefs only', function () {
    $worker = adminUser('worker');

    $this->actingAs($worker)
        ->get('/admin')
        ->assertRedirect('/admin/design-briefs');

    $this->actingAs($worker)->get('/admin/design-briefs')->assertOk();

    foreach ([
        '/admin/leads',
        '/admin/leads/export',
        '/admin/lead-templates',
        '/admin/users',
        '/admin/users/invite',
        '/admin/settings',
        '/admin/activity-logs',
        '/admin/media',
        '/admin/portfolio',
        '/admin/services',
        '/admin/packages',
    ] as $path) {
        $this->actingAs($worker)->get($path)->assertForbidden();
    }
});

it('keeps design briefs available to roles that already had access', function (string $role) {
    $this->actingAs(adminUser($role))
        ->get('/admin/design-briefs')
        ->assertOk();
})->with(['super_admin', 'admin', 'content_manager', 'sales']);

it('lists pending invitations on the users page', function () {
    issueInvitation('menunggu@example.com');

    $this->actingAs(adminUser('super_admin'))
        ->get('/admin/users')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/users/index')
            ->has('invitations', 1)
            ->where('invitations.0.email', 'menunggu@example.com')
            ->where('invitations.0.role_label', 'Pekerja / Produksi')
            ->where('invitations.0.expired', false));
});
