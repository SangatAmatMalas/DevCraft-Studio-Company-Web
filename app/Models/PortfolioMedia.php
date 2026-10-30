<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class PortfolioMedia extends Model
{
    protected $table = 'portfolio_media';

    protected $fillable = [
        'portfolio_project_id',
        'media_path',
        'alt_text',
        'caption',
        'media_type',
        'display_order',
        'is_cover',
    ];

    protected function casts(): array
    {
        return [
            'display_order' => 'integer',
            'is_cover' => 'boolean',
        ];
    }

    /** @return BelongsTo<PortfolioProject, $this> */
    public function project(): BelongsTo
    {
        return $this->belongsTo(PortfolioProject::class, 'portfolio_project_id');
    }

    public function getUrlAttribute(): string
    {
        return Storage::disk('public')->url($this->media_path);
    }
}
