<?php

namespace App\Services;

use App\Mail\LeadReceivedConfirmation;
use App\Mail\NewLeadNotification;
use App\Models\Lead;
use App\Support\Settings;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class LeadNotifier
{
    public static function notify(Lead $lead): void
    {
        $recipient = Settings::get('lead_notification_email') ?: Settings::get('contact_email');

        if (blank($recipient)) {
            return;
        }

        self::applyMailSettings();

        try {
            Mail::to($recipient)->send(new NewLeadNotification($lead));
        } catch (Throwable $exception) {
            Log::warning('Lead notification could not be sent.', [
                'lead_id' => $lead->id,
                'exception' => $exception->getMessage(),
            ]);
        }
    }

    /**
     * Send the lead a short confirmation so they know the brief arrived.
     * Skips leads that only shared a phone number.
     */
    public static function sendConfirmation(Lead $lead): void
    {
        if (blank($lead->email)) {
            return;
        }

        self::applyMailSettings();

        try {
            Mail::to($lead->email)->send(new LeadReceivedConfirmation($lead));
        } catch (Throwable $exception) {
            Log::warning('Lead confirmation could not be sent.', [
                'lead_id' => $lead->id,
                'exception' => $exception->getMessage(),
            ]);
        }
    }

    /**
     * SMTP credentials live in the admin settings, not only in .env.
     */
    protected static function applyMailSettings(): void
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

        if ($fromName = Settings::get('mail_from_name')) {
            config(['mail.from.name' => $fromName]);
        }
    }
}
