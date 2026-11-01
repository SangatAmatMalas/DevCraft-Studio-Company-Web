<?php

namespace App\Services;

use App\Support\Settings;

class WhatsAppLink
{
    public static function normalizeNumber(?string $number): ?string
    {
        if (blank($number)) {
            return null;
        }

        $digits = preg_replace('/\D+/', '', $number);

        if ($digits === null || $digits === '') {
            return null;
        }

        if (str_starts_with($digits, '0')) {
            $digits = '62'.substr($digits, 1);
        }

        if (str_starts_with($digits, '620')) {
            $digits = '62'.substr($digits, 3);
        }

        return $digits;
    }

    public static function url(?string $name = null, ?string $need = null, ?string $url = null): ?string
    {
        $number = self::normalizeNumber(Settings::get('contact_whatsapp'));

        if (! $number) {
            return null;
        }

        $template = (string) Settings::get('whatsapp_template');

        $message = str_replace(
            ['{name}', '{need}', '{url}'],
            [
                $name ?: 'seseorang',
                $need ?: 'kebutuhan proyek saya',
                $url ?: url('/kontak'),
            ],
            $template,
        );

        $message = mb_substr($message, 0, 1500);

        return 'https://wa.me/'.$number.'?text='.rawurlencode($message);
    }

    /**
     * Build a public WhatsApp URL with page-specific context. Context is
     * authored by the application, never copied from visitor-entered fields.
     */
    public static function forContext(string $need, ?string $url = null): ?string
    {
        return self::url(null, $need, $url);
    }

    public static function isConfigured(): bool
    {
        return filled(self::normalizeNumber(Settings::get('contact_whatsapp')));
    }
}
