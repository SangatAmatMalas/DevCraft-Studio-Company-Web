<?php

namespace App\Models;

use App\Enums\ContentStatus;
use App\Enums\ProjectStatus;
use App\Enums\ProjectType;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class PortfolioProject extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'slug',
        'excerpt',
        'description',
        'project_type',
        'project_status',
        'client_name',
        'role_summary',
        'problem',
        'goals',
        'solution',
        'outcome',
        'started_at',
        'completed_at',
        'repository_url',
        'demo_url',
        'is_featured',
        'display_order',
        'status',
        'meta_title',
        'meta_description',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'goals' => 'array',
            'project_type' => ProjectType::class,
            'project_status' => ProjectStatus::class,
            'started_at' => 'date',
            'completed_at' => 'date',
            'is_featured' => 'boolean',
            'display_order' => 'integer',
            'status' => ContentStatus::class,
            'published_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (PortfolioProject $project) {
            if (blank($project->slug)) {
                $project->slug = Str::slug($project->title);
            }
        });

        static::updating(function (PortfolioProject $project) {
            if ($project->isDirty('slug')) {
                SlugRedirect::updateOrCreate(
                    ['old_path' => '/portfolio/'.$project->getOriginal('slug')],
                    ['new_path' => '/portfolio/'.$project->slug, 'status_code' => 301],
                );
            }
        });
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /** @return BelongsToMany<Category, $this> */
    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'portfolio_project_category');
    }

    /** @return BelongsToMany<Technology, $this> */
    public function technologies(): BelongsToMany
    {
        return $this->belongsToMany(Technology::class, 'portfolio_project_technology');
    }

    /** @return HasMany<PortfolioSection, $this> */
    public function sections(): HasMany
    {
        return $this->hasMany(PortfolioSection::class);
    }

    /** @return HasMany<PortfolioMedia, $this> */
    public function media(): HasMany
    {
        return $this->hasMany(PortfolioMedia::class)->orderBy('display_order');
    }

    /** @return HasOne<PortfolioMedia, $this> */
    public function cover(): HasOne
    {
        return $this->hasOne(PortfolioMedia::class)->where('is_cover', true);
    }

    /** @return HasMany<Lead, $this> */
    public function leads(): HasMany
    {
        return $this->hasMany(Lead::class);
    }

    public function getCoverUrlAttribute(): ?string
    {
        $cover = $this->relationLoaded('media')
            ? ($this->media->firstWhere('is_cover', true) ?? $this->media->first())
            : $this->media()->where('is_cover', true)->first();

        return $cover?->url;
    }

    /** @param Builder<PortfolioProject> $query */
    public function scopePublished(Builder $query): void
    {
        $query->where('status', ContentStatus::Published->value)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }

    /** @param Builder<PortfolioProject> $query */
    public function scopeFeatured(Builder $query): void
    {
        $query->where('is_featured', true)->orderBy('display_order');
    }

    public function typeLabel(): string
    {
        return $this->project_type->label();
    }
}
