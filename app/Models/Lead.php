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
        'reference_url',
        'source_type',
        'status',
        'next_follow_up_at',
        'last_contacted_at',
        'privacy_consent_at',
        'ip_hash',
    ];

    protected function casts(): array
    {
        return [
            'status' => LeadStatus::class,
            'next_follow_up_at' => 'datetime',
            'last_contacted_at' => 'datetime',
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

    /** @return HasMany<LeadAttachment, $this> */
    public function attachments(): HasMany
    {
        return $this->hasMany(LeadAttachment::class)->latest();
    }

    /** @param Builder<Lead> $query */
    public function scopeStatus(Builder $query, string $status): void
    {
        $query->where('status', $status);
    }

    /**
     * Leads that still need attention: an explicit follow-up date has passed,
     * or no date was set and the lead has been waiting for more than three days.
     *
     * @param  Builder<Lead>  $query
     */
    public function scopeNeedsFollowUp(Builder $query): void
    {
        $query->whereNotIn('status', [
            LeadStatus::Won->value,
            LeadStatus::Lost->value,
            LeadStatus::Archived->value,
        ])->where(function (Builder $builder) {
            $builder->where('next_follow_up_at', '<=', now()->endOfDay())
                ->orWhere(function (Builder $nested) {
                    $nested->whereNull('next_follow_up_at')
                        ->where('created_at', '<=', now()->subDays(3));
                });
        });
    }

    public function followUpDue(): bool
    {
        if (in_array($this->status, [LeadStatus::Won, LeadStatus::Lost, LeadStatus::Archived], true)) {
            return false;
        }

        if ($this->next_follow_up_at !== null) {
            return $this->next_follow_up_at->lte(now()->endOfDay());
        }

        return $this->created_at !== null && $this->created_at->lte(now()->subDays(3));
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
