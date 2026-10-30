<?php

namespace App\Models;

use App\Enums\ContentStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Page extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'content',
        'status',
        'meta_title',
        'meta_description',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'content' => 'array',
            'status' => ContentStatus::class,
            'published_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Page $page) {
            if (blank($page->slug)) {
                $page->slug = Str::slug($page->title);
            }
        });

        static::updating(function (Page $page) {
            if ($page->isDirty('slug')) {
                SlugRedirect::updateOrCreate(
                    ['old_path' => '/'.$page->getOriginal('slug')],
                    ['new_path' => '/'.$page->slug, 'status_code' => 301],
                );
            }
        });
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /** @param Builder<Page> $query */
    public function scopePublished(Builder $query): void
    {
        $query->where('status', ContentStatus::Published->value);
    }
}
