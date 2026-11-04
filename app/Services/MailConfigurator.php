<?php

namespace App\Services;

use App\Support\Settings;

class MailConfigurator
{
    /**
     * SMTP credentials live in the admin settings, not only in .env.
     * Called before any transactional mail so the admin can change the mailer
     * without redeploying.
     */
    public static function configure(): void
    {
        $host = Settings::get('smtp_host');

        if (blank($host)) {
            return;
        }

        config([
            'mail.default' => 'smtp',
            'mail.mailers.smtp.host' => $host,
            'mail.mailers.smtp.port' => Settings::get('smtp_port') ?: 587,
            'mail.mailers.smtp.username' => Settings::get('smtp_username'),
            'mail.mailers.smtp.password' => Settings::get('smtp_password'),
            'mail.mailers.smtp.encryption' => Settings::get('smtp_encryption') ?: null,
        ]);

        if ($from = Settings::get('mail_from_address')) {
            config(['mail.from.address' => $from]);
        }

        if ($name = Settings::get('mail_from_name')) {
            config(['mail.from.name' => $name]);
        }
    }
}
