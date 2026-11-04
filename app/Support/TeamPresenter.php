<?php

namespace App\Support;

use App\Models\TeamMember;

/**
 * Single source of truth for the team payload sent to Inertia pages.
 *
 * Only fields that exist in the database are exposed; nothing here adds
 * inferred experience, credentials, or other claims.
 */
class TeamPresenter
{
    /**
     * @return array{
     *     id: int,
     *     name: string,
     *     role: string,
     *     bio: string|null,
     *     photo_url: string|null,
     *     skills: array<int, string>,
     *     experience: array<int, array{role: string, organization: string, period: string, summary: string}>,
     *     github_url: string|null,
     *     linkedin_url: string|null
     * }
     */
    public static function item(TeamMember $member): array
    {
        return [
            'id' => $member->id,
            'name' => $member->name,
            'role' => $member->role,
            'bio' => $member->bio,
            'photo_url' => $member->photo_url,
            'skills' => array_values($member->skills ?? []),
            'experience' => $member->work_experience ?? [],
            'github_url' => $member->github_url,
            'linkedin_url' => $member->linkedin_url,
        ];
    }

    /**
     * @param  iterable<int, TeamMember>  $members
     * @return array<int, array<string, mixed>>
     */
    public static function collection(iterable $members): array
    {
        $items = [];

        foreach ($members as $member) {
            $items[] = self::item($member);
        }

        return $items;
    }
}
