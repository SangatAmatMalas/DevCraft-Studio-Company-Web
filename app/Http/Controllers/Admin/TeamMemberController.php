<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\TeamMemberRequest;
use App\Models\TeamMember;
use App\Services\ActivityLogger;
use App\Services\ImageUploader;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TeamMemberController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/team/index', [
            'members' => TeamMember::query()->orderBy('display_order')->get()->map(fn (TeamMember $member) => [
                'id' => $member->id,
                'name' => $member->name,
                'role' => $member->role,
                'bio' => $member->bio,
                'photo_url' => $member->photo_url,
                'skills' => $member->skills ?? [],
                'github_url' => $member->github_url,
                'linkedin_url' => $member->linkedin_url,
                'display_order' => $member->display_order,
                'is_active' => $member->is_active,
                'approved' => $member->approved_at !== null,
                'published' => $member->is_active && $member->approved_at !== null,
            ])->all(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/team/form', ['member' => null]);
    }

    public function store(TeamMemberRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $member = TeamMember::query()->create([
            'name' => $data['name'],
            'role' => $data['role'],
            'bio' => $data['bio'] ?? null,
            'photo_path' => $request->hasFile('photo') ? ImageUploader::store($request->file('photo'), 'team')['path'] : null,
            'skills' => array_values(array_filter($data['skills'] ?? [])),
            'work_experience' => $this->normalizeExperience($data['work_experience'] ?? []),
            'github_url' => $data['github_url'] ?? null,
            'linkedin_url' => $data['linkedin_url'] ?? null,
            'display_order' => $data['display_order'] ?? 0,
            'is_active' => $request->boolean('is_active'),
            'approved_at' => $request->boolean('approved') ? now() : null,
        ]);

        ActivityLogger::log('team.created', $member, ['name' => $member->name]);

        return redirect()->route('admin.team.index')->with(
            $member->is_active && $member->approved_at !== null ? 'success' : 'warning',
            $member->is_active && $member->approved_at !== null
                ? 'Anggota tim dibuat dan sudah tampil di /tim.'
                : 'Anggota tim disimpan sebagai draft — belum tampil di /tim.',
        );
    }

    public function edit(TeamMember $member): Response
    {
        return Inertia::render('admin/team/form', [
            'member' => [
                'id' => $member->id,
                'name' => $member->name,
                'role' => $member->role,
                'bio' => $member->bio,
                'photo_url' => $member->photo_url,
                'skills' => $member->skills ?? [],
                'work_experience' => $member->work_experience ?? [],
                'github_url' => $member->github_url,
                'linkedin_url' => $member->linkedin_url,
                'display_order' => $member->display_order,
                'is_active' => $member->is_active,
                'approved' => $member->approved_at !== null,
            ],
        ]);
    }

    public function update(TeamMemberRequest $request, TeamMember $member): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('photo')) {
            ImageUploader::delete($member->photo_path);
            $member->photo_path = ImageUploader::store($request->file('photo'), 'team')['path'];
        }

        $member->fill([
            'name' => $data['name'],
            'role' => $data['role'],
            'bio' => $data['bio'] ?? null,
            'skills' => array_values(array_filter($data['skills'] ?? [])),
            'work_experience' => $this->normalizeExperience($data['work_experience'] ?? []),
            'github_url' => $data['github_url'] ?? null,
            'linkedin_url' => $data['linkedin_url'] ?? null,
            'display_order' => $data['display_order'] ?? 0,
            'is_active' => $request->boolean('is_active'),
            'approved_at' => $request->boolean('approved') ? ($member->approved_at ?? now()) : null,
        ])->save();

        ActivityLogger::log('team.updated', $member, ['name' => $member->name]);

        $published = $member->is_active && $member->approved_at !== null;

        return back()->with(
            $published ? 'success' : 'warning',
            $published
                ? 'Anggota tim diperbarui dan sudah tampil di /tim.'
                : 'Perubahan disimpan sebagai draft — profil belum tampil di /tim.',
        );
    }

    public function destroy(TeamMember $member): RedirectResponse
    {
        ImageUploader::delete($member->photo_path);
        $member->delete();

        ActivityLogger::log('team.deleted', $member, ['name' => $member->name]);

        return redirect()->route('admin.team.index')->with('success', 'Anggota tim dihapus.');
    }

    /**
     * Drop incomplete rows and trim the rest.
     *
     * @param  array<int, array<string, mixed>>  $entries
     * @return array<int, array{role: string, organization: string, period: string, summary: string}>
     */
    private function normalizeExperience(array $entries): array
    {
        $normalized = [];

        foreach ($entries as $entry) {
            $role = trim((string) ($entry['role'] ?? ''));
            $organization = trim((string) ($entry['organization'] ?? ''));

            if ($role === '' || $organization === '') {
                continue;
            }

            $normalized[] = [
                'role' => $role,
                'organization' => $organization,
                'period' => trim((string) ($entry['period'] ?? '')),
                'summary' => trim((string) ($entry['summary'] ?? '')),
            ];
        }

        return $normalized;
    }
}
