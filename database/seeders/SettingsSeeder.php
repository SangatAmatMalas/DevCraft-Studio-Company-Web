<?php

namespace Database\Seeders;

use App\Support\Settings;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        $groups = [
            'brand' => ['brand_name', 'brand_tagline', 'brand_positioning'],
            'contact' => ['contact_email', 'contact_whatsapp', 'contact_address', 'contact_hours', 'social_github', 'social_linkedin', 'social_instagram', 'social_x'],
            'seo' => ['seo_default_title', 'seo_default_description', 'analytics_provider', 'analytics_measurement_id', 'search_console_verification'],
            'home' => ['home_hero_badge', 'home_hero_title', 'home_hero_subtitle', 'home_show_testimonials'],
            'mail' => ['lead_notification_email', 'mail_from_name', 'mail_from_address'],
        ];

        foreach ($groups as $group => $keys) {
            foreach ($keys as $key) {
                $value = config("site.defaults.{$key}");

                if ($value !== null) {
                    Settings::set($key, (string) $value, $group);
                }
            }
        }

        Settings::set('whatsapp_template', (string) config('site.defaults.whatsapp_template'), 'contact');

        Settings::forget();
    }
}
