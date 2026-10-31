<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class DesignBrief extends Model
{
    use HasFactory;

    protected $fillable = [
        'token',
        'category',
        'style',
        'brand_name',
        'tagline',
        'description',
        'services',
        'contact',
        'sections',
        'primary_color',
        'templates',
        'chosen_template',
        'chosen_at',
        'lead_id',
        'status',
        'ip_hash',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'services' => 'array',
            'contact' => 'array',
            'sections' => 'array',
            'templates' => 'array',
            'chosen_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (self $brief) {
            $brief->token ??= (string) Str::uuid();
        });
    }

    public function getRouteKeyName(): string
    {
        return 'token';
    }

    /** @return BelongsTo<Lead, $this> */
    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }

    /** @param Builder<DesignBrief> $query */
    public function scopeActive(Builder $query): void
    {
        $query->where(fn (Builder $inner) => $inner
            ->whereNull('expires_at')
            ->orWhere('expires_at', '>', now()));
    }

    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }

    public function categoryLabel(): string
    {
        return (string) config("design-previews.categories.{$this->category}.label", $this->category);
    }

    public function styleLabel(): string
    {
        return (string) config("design-previews.styles.{$this->style}.label", $this->style);
    }

    public function templateLabel(?string $template = null): string
    {
        $key = $template ?: $this->chosen_template;

        return (string) config("design-previews.templates.{$key}.label", $key ?: '—');
    }

    /** @return array<int, array<string, mixed>> */
    public function templateOptions(): array
    {
        return collect($this->templates ?: [])
            ->map(fn (string $key) => [
                'key' => $key,
                'label' => (string) config("design-previews.templates.{$key}.label", $key),
                'description' => (string) config("design-previews.templates.{$key}.description", ''),
                'best_for' => (string) config("design-previews.templates.{$key}.best_for", ''),
            ])
            ->values()
            ->all();
    }

    /** @return array<int, array{title: string, description: string|null}> */
    public function serviceItems(): array
    {
        return collect($this->services ?: [])
            ->filter(fn ($item) => is_array($item) && filled($item['title'] ?? null))
            ->map(fn (array $item) => [
                'title' => (string) $item['title'],
                'description' => filled($item['description'] ?? null) ? (string) $item['description'] : null,
            ])
            ->values()
            ->all();
    }

    public function contactValue(string $key): ?string
    {
        $value = $this->contact[$key] ?? null;

        return filled($value) ? (string) $value : null;
    }

    public function hasSection(string $section): bool
    {
        return in_array($section, $this->sections ?: [], true);
    }

    public function chosenTemplateOption(): ?array
    {
        foreach ($this->templateOptions() as $option) {
            if ($option['key'] === $this->chosen_template) {
                return $option;
            }
        }

        return null;
    }

    public function previewUrl(?string $template = null, bool $embed = false): string
    {
        $url = route('desain.preview', [
            'brief' => $this->token,
            'template' => $template ?: ($this->chosen_template ?: ($this->templates[0] ?? 'bold-hero')),
        ]);

        return $embed ? $url.'?embed=1' : $url;
    }

    public function resultUrl(): string
    {
        return route('desain.hasil', $this->token);
    }
}
