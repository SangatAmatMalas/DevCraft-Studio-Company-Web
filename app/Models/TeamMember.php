<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class TeamMember extends Model
{
    protected $fillable = [
        'name',
        'role',
        'bio',
        'photo_path',
        'skills',
        'work_experience',
        'github_url',
        'linkedin_url',
        'display_order',
        'is_active',
        'approved_at',
    ];

    protected function casts(): array
    {
        return [
            'skills' => 'array',
            'work_experience' => 'array',
            'is_active' => 'boolean',
            'display_order' => 'integer',
            'approved_at' => 'datetime',
        ];
    }

    /** @param Builder<TeamMember> $query */
    public function scopeApproved(Builder $query): void
    {
        $query->where('is_active', true)
            ->whereNotNull('approved_at')
            ->orderBy('display_order');
    }

    public function getPhotoUrlAttribute(): ?string
    {
        return $this->photo_path ? Storage::disk('public')->url($this->photo_path) : null;
    }
}
