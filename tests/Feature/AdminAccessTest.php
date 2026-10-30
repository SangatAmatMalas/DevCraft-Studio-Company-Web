<?php

it('redirects guests away from the admin area', function () {
    $this->get('/admin')->assertRedirect('/login');
});

it('allows every active role to open the dashboard', function (string $role) {
    $this->actingAs(adminUser($role))
        ->get('/admin')
        ->assertOk();
})->with(['super_admin', 'admin', 'content_manager', 'sales']);

it('blocks content managers from leads and settings', function () {
    $user = adminUser('content_manager');

    $this->actingAs($user)->get('/admin/leads')->assertForbidden();
    $this->actingAs($user)->get('/admin/settings')->assertForbidden();
    $this->actingAs($user)->get('/admin/users')->assertForbidden();
    $this->actingAs($user)->get('/admin/portfolio')->assertOk();
});

it('blocks sales from content management but allows leads', function () {
    $user = adminUser('sales');

    $this->actingAs($user)->get('/admin/portfolio')->assertForbidden();
    $this->actingAs($user)->get('/admin/leads')->assertOk();
});

it('reserves user management for super admins', function () {
    $this->actingAs(adminUser('admin'))->get('/admin/users')->assertForbidden();
    $this->actingAs(adminUser('super_admin'))->get('/admin/users')->assertOk();
});
