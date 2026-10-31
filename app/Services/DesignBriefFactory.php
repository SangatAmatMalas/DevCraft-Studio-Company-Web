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

        return DesignBrief::query()->create([
            'category' => $categoryKey,
            'style' => (string) $data['style'],
            'brand_name' => self::text($data['brand_name'], 80),
            'tagline' => self::text($data['tagline'] ?? null, 120),
            'description' => self::text($data['description'] ?? null, 700),
            'services' => $services,
            'contact' => $contact,
            'sections' => $sections ?: ['hero', 'services', 'contact'],
            'primary_color' => (string) ($data['primary_color'] ?? '#2563eb'),
            'templates' => $templates,
            'status' => 'generated',
            'ip_hash' => $ip ? hash('sha256', $ip.config('app.key')) : null,
            'expires_at' => now()->addDays((int) config('design-previews.expires_days', 30)),
        ]);
    }

    private static function text(mixed $value, int $limit): string
    {
        if (! is_string($value)) {
            return '';
        }

        return (string) Str::of($value)->stripTags()->squish()->limit($limit, '');
    }
}
