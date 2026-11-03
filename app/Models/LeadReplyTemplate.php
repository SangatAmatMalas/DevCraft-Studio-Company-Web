<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class LeadReplyTemplate extends Model
{
    /** Placeholders accepted inside the template body. */
    public const PLACEHOLDERS = ['name', 'service', 'package'];

    protected $fillable = [
        'title',
        'body',
        'is_active',
        'display_order',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    /** @param Builder<LeadReplyTemplate> $query */
    public function scopeActive(Builder $query): void
    {
        $query->where('is_active', true);
    }

    /** @param Builder<LeadReplyTemplate> $query */
    public function scopeOrdered(Builder $query): void
    {
        $query->orderBy('display_order')->orderBy('id');
    }

    /**
     * Fill the allowed placeholders with lead data. Missing values fall back to
     * neutral wording so no raw "{name}" ever reaches the clipboard.
     */
    public function renderFor(Lead $lead): string
    {
        return str_replace(
            ['{name}', '{service}', '{package}'],
            [
                filled($lead->name) ? $lead->name : 'Bapak/Ibu',
                filled($lead->service_type) ? $lead->service_type : 'kebutuhan Anda',
                filled($lead->package?->name) ? $lead->package->name : 'yang sesuai',
            ],
            $this->body,
        );
    }
}
