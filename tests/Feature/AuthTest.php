<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;

it('renders the admin login screen', function () {
    $this->get('/login')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('auth/login'));
});

it('authenticates an active admin and stamps the last login', function () {
    $user = adminUser();
    $user->forceFill(['last_login_at' => null])->save();

    $response = $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertRedirect('/admin');
    $this->assertAuthenticatedAs($user);
    expect($user->fresh()->last_login_at)->not->toBeNull();
});

it('rejects invalid credentials', function () {
    $user = adminUser();

    $this->from('/login')
        ->post('/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ])
        ->assertRedirect('/login')
        ->assertSessionHasErrors('email');

    $this->assertGuest();
});

it('logs inactive users out of the admin area', function () {
    $user = User::factory()->create(['role' => 'admin', 'is_active' => false]);

    $this->actingAs($user)
        ->get('/admin')
        ->assertRedirect('/login');

    $this->assertGuest();
});

it('logs out and returns to the public site', function () {
    $user = adminUser();

    $this->actingAs($user)
        ->post('/logout')
        ->assertRedirect('/');

    $this->assertGuest();
});

it('updates the account and changes the password with the current password', function () {
    $user = adminUser('super_admin');
    $original = $user->password;

    $this->actingAs($user)
        ->from('/admin/akun')
        ->put('/admin/akun', [
            'name' => 'Owner DevCraft',
            'email' => 'owner@devcraft.test',
            'current_password' => 'password',
            'password' => 'NewSecret#2026',
            'password_confirmation' => 'NewSecret#2026',
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect('/admin/akun');

    $user->refresh();

    expect($user->name)->toBe('Owner DevCraft')
        ->and($user->email)->toBe('owner@devcraft.test')
        ->and($user->password)->not->toBe($original);

    $this->assertTrue(Hash::check('NewSecret#2026', $user->password));
});

it('rejects a password change with the wrong current password', function () {
    $user = adminUser('super_admin');

    $this->actingAs($user)
        ->from('/admin/akun')
        ->put('/admin/akun', [
            'name' => $user->name,
            'email' => $user->email,
            'current_password' => 'wrong-password',
            'password' => 'NewSecret#2026',
            'password_confirmation' => 'NewSecret#2026',
        ])
        ->assertSessionHasErrors('current_password');
});
