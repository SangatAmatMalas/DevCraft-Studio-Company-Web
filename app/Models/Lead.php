<?php

namespace App\Models;

use App\Enums\LeadStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Lead extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'organization',
        'service_type',
        'package_id',
        'portfolio_project_id',
        'design_brief_id',
        'budget_range',
        'target_timeline',
        'preferred_contact',
        'message',
        'source_url',
        'source_type',
        'status',
        'privacy_consent_at',
        'ip_hash',
    ];

    protected function casts(): array
    {
        return [
            'status' => LeadStatus::class,
            'privacy_consent_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<Package, $this> */
    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class);
    }

    /** @return BelongsTo<PortfolioProject, $this> */
    public function portfolioProject(): BelongsTo
    {
        return $this->belongsTo(PortfolioProject::class);
    }

    /** @return BelongsTo<DesignBrief, $this> */
    public function designBrief(): BelongsTo
    {
        return $this->belongsTo(DesignBrief::class);
    }

    /** @return HasMany<LeadNote, $this> */
    public function notes(): HasMany
    {
        return $this->hasMany(LeadNote::class)->latest();
    }

    /** @param Builder<Lead> $query */
    public function scopeStatus(Builder $query, string $status): void
    {
        $query->where('status', $status);
    }

    public function statusLabel(): string
    {
        return $this->status->label();
    }

    public function contextLabel(): ?string
    {
        return $this->package?->name ?? $this->portfolioProject?->title;
    }
}
