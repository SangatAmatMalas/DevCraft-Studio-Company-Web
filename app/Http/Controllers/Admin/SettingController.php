<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SettingRequest;
use App\Mail\TestMail;
use App\Models\MailDelivery;
use App\Services\ActivityLogger;
use App\Services\LeadNotifier;
use App\Support\Settings;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class SettingController extends Controller
{
    /** Keys persisted from the settings form. */
    protected const TEXT_KEYS = [
        'brand_name', 'brand_tagline', 'brand_positioning',
        'contact_email', 'contact_whatsapp', 'contact_address', 'contact_hours',
        'booking_url', 'booking_label',
        'social_github', 'social_linkedin', 'social_instagram', 'social_x',
        'seo_default_title', 'seo_default_description',
        'analytics_provider', 'analytics_measurement_id', 'search_console_verification',
        'whatsapp_template', 'home_hero_badge', 'home_hero_title', 'home_hero_subtitle',
        'lead_magnet_url', 'lead_magnet_title', 'lead_magnet_description',
        'lead_notification_email', 'mail_from_name', 'mail_from_address',
        'smtp_host', 'smtp_port', 'smtp_username', 'smtp_encryption',
    ];

    public function edit(): Response
    {
        $values = [];

        foreach (array_merge(self::TEXT_KEYS, ['home_show_testimonials']) as $key) {
            $values[$key] = Settings::get($key);
        }

        return Inertia::render('admin/settings/edit', [
            'settings' => $values,
            'hasSmtpPassword' => filled(Settings::get('smtp_password')),
            'meta' => [
                'sitemap_url' => url('/sitemap.xml'),
                'robots_url' => url('/robots.txt'),
                'search_console_verified' => filled(Settings::get('search_console_verification')),
            ],
        ]);
    }

    public function update(SettingRequest $request)
    {
        $data = $request->validated();

        foreach (self::TEXT_KEYS as $key) {
            Settings::set($key, $data[$key] ?? null, $this->group($key));
        }

        Settings::set('home_show_testimonials', $request->boolean('home_show_testimonials') ? '1' : '0', 'home');

        if ($request->filled('smtp_password')) {
            Settings::set('smtp_password', $request->validated('smtp_password'), 'mail', true);
        }

        ActivityLogger::log('settings.updated', null, ['keys' => array_keys($data)]);

        return back()->with('success', 'Pengaturan disimpan.');
    }

    public function sendTestEmail(Request $request): RedirectResponse
    {
        $user = $request->user();

        if (! $user || blank($user->email)) {
            return back()->with('error', 'Akun Anda belum memiliki alamat email.');
        }

        LeadNotifier::configureMailer();

        try {
            Mail::to($user->email)->send(new TestMail($user->name));
            LeadNotifier::recordTest($user->email, MailDelivery::STATUS_SENT);
        } catch (Throwable $exception) {
            LeadNotifier::recordTest($user->email, MailDelivery::STATUS_FAILED, $exception->getMessage());

            ActivityLogger::log('settings.test_email_failed', null, [
                'error' => mb_substr($exception->getMessage(), 0, 300),
            ]);

            return back()->with('error', 'Email uji gagal dikirim: '.mb_substr($exception->getMessage(), 0, 300));
        }

        ActivityLogger::log('settings.test_email_sent', null, ['recipient' => $user->email]);

        return back()->with('success', 'Email uji dikirim ke '.$user->email.'.');
    }

    protected function group(string $key): string
    {
        return match (true) {
            str_starts_with($key, 'brand_') => 'brand',
            str_starts_with($key, 'contact_'), str_starts_with($key, 'social_'), str_starts_with($key, 'booking_') => 'contact',
            str_starts_with($key, 'seo_'), str_starts_with($key, 'analytics_'), str_starts_with($key, 'search_console') => 'seo',
            str_starts_with($key, 'home_') => 'home',
            str_starts_with($key, 'smtp_'), str_starts_with($key, 'mail_'), str_starts_with($key, 'lead_notification') => 'mail',
            default => 'general',
        };
    }
}
