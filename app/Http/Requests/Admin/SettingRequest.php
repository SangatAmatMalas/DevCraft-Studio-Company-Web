<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class SettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage-settings') ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'brand_name' => ['required', 'string', 'max:120'],
            'brand_tagline' => ['nullable', 'string', 'max:160'],
            'brand_positioning' => ['nullable', 'string', 'max:400'],
            'contact_email' => ['nullable', 'email', 'max:180'],
            'contact_whatsapp' => ['nullable', 'string', 'max:40', 'regex:/^[0-9+()\-\s]{6,40}$/'],
            'contact_address' => ['nullable', 'string', 'max:300'],
            'contact_hours' => ['nullable', 'string', 'max:160'],
            'social_github' => ['nullable', 'url', 'max:300'],
            'social_linkedin' => ['nullable', 'url', 'max:300'],
            'social_instagram' => ['nullable', 'url', 'max:300'],
            'social_x' => ['nullable', 'url', 'max:300'],
            'seo_default_title' => ['required', 'string', 'max:180'],
            'seo_default_description' => ['required', 'string', 'max:300'],
            'analytics_provider' => ['required', 'string', 'max:30'],
            'analytics_measurement_id' => ['nullable', 'string', 'max:60'],
            'search_console_verification' => ['nullable', 'string', 'max:120'],
            'whatsapp_template' => ['required', 'string', 'max:1000'],
            'home_hero_badge' => ['nullable', 'string', 'max:120'],
            'home_hero_title' => ['required', 'string', 'max:200'],
            'home_hero_subtitle' => ['nullable', 'string', 'max:400'],
            'home_show_testimonials' => ['boolean'],
            'lead_notification_email' => ['nullable', 'email', 'max:180'],
            'mail_from_name' => ['nullable', 'string', 'max:120'],
            'mail_from_address' => ['nullable', 'email', 'max:180'],
            'smtp_host' => ['nullable', 'string', 'max:180'],
            'smtp_port' => ['nullable', 'integer', 'min:1', 'max:65535'],
            'smtp_username' => ['nullable', 'string', 'max:180'],
            'smtp_password' => ['nullable', 'string', 'max:300'],
            'smtp_encryption' => ['nullable', 'string', 'max:20'],
        ];
    }
}
