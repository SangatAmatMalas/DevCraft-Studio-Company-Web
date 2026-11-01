<?php

namespace App\Support;

use App\Models\Setting;
use Illuminate\Support\Facades\Crypt;

/**
 * Central access point for editable site settings.
 *
 * Values marked as secret are encrypted at rest and never returned by
 * public() so they cannot leak into Inertia shared props.
 */
class Settings
{
    /** @var array<string, Setting>|null */
    protected static ?array $rows = null;

    /** @return array<string, Setting> */
    protected static function rows(): array
    {
        if (static::$rows === null) {
            static::$rows = Setting::query()->get()->keyBy('key')->all();
        }

        return static::$rows;
    }

    public static function forget(): void
    {
        static::$rows = null;
    }

    public static function get(string $key, ?string $default = null): ?string
    {
        $row = static::rows()[$key] ?? null;

        if (! $row) {
            return $default ?? config("site.defaults.{$key}");
        }

        $value = $row->decryptedValue();

        return filled($value) ? $value : ($default ?? config("site.defaults.{$key}"));
    }

    public static function bool(string $key, bool $default = false): bool
    {
        $value = static::get($key);

        if ($value === null) {
            return $default;
        }

        return filter_var($value, FILTER_VALIDATE_BOOLEAN);
    }

    /** @return array<string, array<string, string|null>> */
    public static function public(): array
    {
        return [
            'brand' => [
                'name' => static::get('brand_name'),
                'tagline' => static::get('brand_tagline'),
                'positioning' => static::get('brand_positioning'),
                'logo' => static::get('brand_logo'),
            ],
            'contact' => [
                'email' => static::get('contact_email'),
                'whatsapp' => static::get('contact_whatsapp'),
                'address' => static::get('contact_address'),
                'hours' => static::get('contact_hours'),
            ],
            'social' => [
                'github' => static::get('social_github'),
                'linkedin' => static::get('social_linkedin'),
                'instagram' => static::get('social_instagram'),
                'x' => static::get('social_x'),
            ],
            'conversion' => [
                'booking_url' => static::get('booking_url'),
                'booking_label' => static::get('booking_label'),
                'lead_magnet_url' => static::get('lead_magnet_url'),
                'lead_magnet_title' => static::get('lead_magnet_title'),
                'lead_magnet_description' => static::get('lead_magnet_description'),
            ],
        ];
    }

    public static function set(string $key, ?string $value, string $group = 'general', bool $secret = false): void
    {
        $stored = $secret && filled($value) ? Crypt::encryptString($value) : $value;

        Setting::query()->updateOrCreate(
            ['key' => $key],
            [
                'value' => $stored,
                'group' => $group,
                'is_secret' => $secret,
                'updated_by' => auth()->id(),
            ],
        );

        static::forget();
    }
}
