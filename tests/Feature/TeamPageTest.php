<?php

use App\Models\TeamMember;

function publishedTeamMember(array $attributes = []): TeamMember
{
    return TeamMember::query()->create(array_merge([
        'name' => 'Anggota Tim',
        'role' => 'Developer',
        'is_active' => true,
        'approved_at' => now(),
    ], $attributes));
}

it('shows only published team members on the team page', function () {
    publishedTeamMember(['name' => 'Kedua', 'display_order' => 2]);
    publishedTeamMember(['name' => 'Pertama', 'display_order' => 1]);
    publishedTeamMember(['name' => 'Tanpa Persetujuan', 'approved_at' => null, 'display_order' => 0]);
    publishedTeamMember(['name' => 'Tidak Aktif', 'is_active' => false, 'display_order' => 0]);

    $this->get('/tim')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('site/team')
            ->has('members', 2)
            ->where('members.0.name', 'Pertama')
            ->where('members.1.name', 'Kedua'));
});

it('renders an indexable empty state only when no profile is published', function () {
    $this->get('/tim')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('members', 0)
            ->where('seo.robots', 'noindex,follow'));

    publishedTeamMember();

    $this->get('/tim')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('members', 1)
            ->where('seo.robots', 'index,follow')
            ->has('seo.jsonLd', 1)
            ->where('seo.jsonLd.0.@type', 'ProfilePage'));
});

it('adds the team page to the sitemap only when a profile is published', function () {
    $this->get('/sitemap.xml')
        ->assertOk()
        ->assertDontSee(url('/tim'), false);

    publishedTeamMember();

    $this->get('/sitemap.xml')
        ->assertOk()
        ->assertSee(url('/tim'), false);
});

it('limits the about page team preview to three members', function () {
    foreach (range(1, 4) as $order) {
        publishedTeamMember(['name' => "Anggota {$order}", 'display_order' => $order]);
    }

    $this->get('/tentang-kami')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('team', 3)
            ->where('team.0.name', 'Anggota 1')
            ->where('team.2.name', 'Anggota 3'));
});

it('stores work experience and shows it on the team page', function () {
    $this->actingAs(adminUser('admin'))
        ->post('/admin/team', [
            'name' => 'Anggota Berpengalaman',
            'role' => 'Engineer',
            'is_active' => true,
            'approved' => true,
            'work_experience' => [
                [
                    'role' => 'Backend Developer',
                    'organization' => 'PT Contoh',
                    'period' => '2022 — 2024',
                    'summary' => 'Membangun API internal.',
                ],
                ['role' => '', 'organization' => '', 'period' => '', 'summary' => ''],
            ],
        ])
        ->assertRedirect();

    $member = TeamMember::query()->where('name', 'Anggota Berpengalaman')->firstOrFail();

    expect($member->work_experience)->toHaveCount(1);

    $this->get('/tim')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('members', 1)
            ->where('members.0.experience.0.role', 'Backend Developer')
            ->where('members.0.experience.0.organization', 'PT Contoh')
            ->where('members.0.experience.0.period', '2022 — 2024'));

    $this->actingAs(adminUser('admin'))
        ->get("/admin/team/{$member->id}/edit")
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('member.work_experience', 1));
});

it('warns the admin when a team member is saved as a draft', function () {
    $this->actingAs(adminUser('admin'))
        ->post('/admin/team', [
            'name' => 'Anggota Baru',
            'role' => 'Developer',
            'is_active' => false,
            'approved' => false,
        ])
        ->assertSessionHas('warning', 'Anggota tim disimpan sebagai draft — belum tampil di /tim.');

    expect(TeamMember::query()->where('name', 'Anggota Baru')->value('approved_at'))->toBeNull();
});

it('confirms publication when an approved team member is saved', function () {
    $this->actingAs(adminUser('admin'))
        ->post('/admin/team', [
            'name' => 'Anggota Tampil',
            'role' => 'Developer',
            'is_active' => true,
            'approved' => true,
        ])
        ->assertSessionHas('success', 'Anggota tim dibuat dan sudah tampil di /tim.');

    expect(TeamMember::query()->where('name', 'Anggota Tampil')->value('approved_at'))->not->toBeNull();
});
