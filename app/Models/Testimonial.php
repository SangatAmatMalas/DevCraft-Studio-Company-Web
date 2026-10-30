<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Testimonial extends Model
{
    use HasFactory;

    protected $fillable = [
        'person_name',
        'role',
        'organization',
        'quote',
        'photo_path',
        'permission_confirmed_at',
        'display_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'permission_confirmed_at' => 'datetime',
            'is_active' => 'boolean',
            'display_order' => 'integer',
        ];
    }

    /** Only testimonials with recorded permission may be shown publicly. */
    /** @param Builder<Testimonial> $query */
    public function scopeApproved(Builder $query): void
    {
        $query->where('is_active', true)
            ->whereNotNull('permission_confirmed_at')
            ->orderBy('display_order');
    }

    public function getPhotoUrlAttribute(): ?string
    {
        return $this->photo_path ? Storage::disk('public')->url($this->photo_path) : null;
    }
}
