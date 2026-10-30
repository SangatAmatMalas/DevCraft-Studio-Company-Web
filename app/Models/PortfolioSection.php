<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PortfolioSection extends Model
{
    protected $fillable = [
        'portfolio_project_id',
        'heading',
        'body',
        'section_type',
        'display_order',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'display_order' => 'integer',
        ];
    }

    /** @return BelongsTo<PortfolioProject, $this> */
    public function project(): BelongsTo
    {
        return $this->belongsTo(PortfolioProject::class, 'portfolio_project_id');
    }
}
