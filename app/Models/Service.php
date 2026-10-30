<?php

namespace App\Models;

use App\Enums\ContentStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Service extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'summary',
        'description',
        'icon_name',
        'deliverables',
        'process',
        'faqs',
        'technologies',
        'cost_factors',
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
            'deliverables' => 'array',
            'process' => 'array',
            'faqs' => 'array',
            'technologies' => 'array',
            'is_featured' => 'boolean',
            'display_order' => 'integer',
            'status' => ContentStatus::class,
            'published_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Service $service) {
            if (blank($service->slug)) {
                $service->slug = Str::slug($service->title);
            }
        });
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /** @param Builder<Service> $query */
    public function scopePublished(Builder $query): void
    {
        $query->where('status', ContentStatus::Published->value);
    }

    /** @param Builder<Service> $query */
    public function scopeOrdered(Builder $query): void
    {
        $query->orderBy('display_order')->orderBy('title');
    }
}
