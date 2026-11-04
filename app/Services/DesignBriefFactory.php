<?php

namespace App\Services;

use App\Models\DesignBrief;
use Illuminate\Support\Str;

class DesignBriefFactory
{
    /**
     * Normalise a validated brief and persist it together with the three
     * layout variants that should be previewed for the chosen category.
     *
     * @param  array<string, mixed>  $data
     */
    public static function create(array $data, ?string $ip = null): DesignBrief
    {
        return DesignBrief::query()->create([
            ...self::normalise($data),
            'status' => 'generated',
            'ip_hash' => $ip ? hash('sha256', $ip.config('app.key')) : null,
            'expires_at' => now()->addDays((int) config('design-previews.expires_days', 30)),
        ]);
    }

    /**
     * Re-apply an edited brief to the same token. The expiry date is left
     * untouched so editing cannot be used to extend a preview indefinitely.
     *
     * @param  array<string, mixed>  $data
     */
    public static function update(DesignBrief $brief, array $data): DesignBrief
    {
        $attributes = self::normalise($data);
        $chosen = in_array($brief->chosen_template, $attributes['templates'], true)
            ? $brief->chosen_template
            : null;

        $brief->forceFill([
            ...$attributes,
            'chosen_template' => $chosen,
            'chosen_at' => $chosen ? $brief->chosen_at : null,
            'status' => $chosen ? 'selected' : 'generated',
        ])->save();

        return $brief;
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private static function normalise(array $data): array
    {
        $categoryKey = (string) $data['category'];
        $category = (array) config("design-previews.categories.{$categoryKey}", []);

        $templates = collect($category['templates'] ?? array_keys((array) config('design-previews.templates')))
            ->filter(fn ($key) => is_string($key) && config("design-previews.templates.{$key}"))
            ->unique()
            ->take(3)
            ->values()
            ->all();

        $availableSections = array_keys((array) config('design-previews.sections'));
        $sections = collect($data['sections'] ?? $category['sections'] ?? [])
            ->filter(fn ($key) => is_string($key) && in_array($key, $availableSections, true))
            ->unique()
            ->values()
            ->all();

        // The hero is the anchor every layout builds on, so it is always kept
        // even when an older brief was saved without it.
        if (! in_array('hero', $sections, true)) {
            array_unshift($sections, 'hero');
        }

        $services = collect($data['services'] ?? [])
            ->map(fn ($item) => [
                'title' => self::text($item['title'] ?? null, 80),
                'description' => self::text($item['description'] ?? null, 220),
            ])
            ->filter(fn (array $item) => $item['title'] !== '')
            ->take((int) config('design-previews.max_services', 6))
            ->values()
            ->all();

        $contact = collect(['whatsapp', 'email', 'city'])
            ->mapWithKeys(fn (string $key) => [$key => self::text($data['contact'][$key] ?? null, 120)])
            ->filter()
            ->all();

        return [
            'category' => $categoryKey,
            'style' => (string) $data['style'],
            'brand_name' => self::text($data['brand_name'], 80),
            'tagline' => self::text($data['tagline'] ?? null, 120),
            'description' => self::text($data['description'] ?? null, 700),
            'services' => $services,
            'contact' => $contact,
            'sections' => $sections,
            'primary_color' => (string) ($data['primary_color'] ?? '#2563eb'),
            'templates' => $templates,
        ];
    }

    private static function text(mixed $value, int $limit): string
    {
        if (! is_string($value)) {
            return '';
        }

        return (string) Str::of($value)->stripTags()->squish()->limit($limit, '');
    }
}
