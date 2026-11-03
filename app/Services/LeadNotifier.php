<?php

namespace App\Services;

use App\Jobs\SendLeadEmails;
use App\Mail\LeadReceivedConfirmation;
use App\Mail\NewLeadNotification;
use App\Models\Lead;
use App\Models\MailDelivery;
use App\Support\Settings;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class LeadNotifier
{
    /**
     * Queue both emails for the terminating phase of the request. The job is
     * intentionally not queueable so it still runs without a queue worker,
     * while the visitor no longer waits for SMTP.
     */
    public static function queue(Lead $lead): void
    {
        Bus::dispatchAfterResponse(new SendLeadEmails($lead->id));
    }

    public static function notify(Lead $lead): void
    {
        $recipient = Settings::get('lead_notification_email') ?: Settings::get('contact_email');

        if (blank($recipient)) {
            self::record($lead, MailDelivery::TYPE_TEAM_NOTIFICATION, '-', MailDelivery::STATUS_SKIPPED, 'Email notifikasi tim belum diatur.');

            return;
        }

        self::configureMailer();

        try {
            Mail::to($recipient)->send(new NewLeadNotification($lead));
            self::record($lead, MailDelivery::TYPE_TEAM_NOTIFICATION, $recipient, MailDelivery::STATUS_SENT);
        } catch (Throwable $exception) {
            Log::warning('Lead notification could not be sent.', [
                'lead_id' => $lead->id,
                'exception' => $exception->getMessage(),
            ]);

            self::record($lead, MailDelivery::TYPE_TEAM_NOTIFICATION, $recipient, MailDelivery::STATUS_FAILED, $exception->getMessage());
        }
    }

    /**
     * Send the lead a short confirmation so they know the brief arrived.
     * Skips leads that only shared a phone number.
     */
    public static function sendConfirmation(Lead $lead): void
    {
        if (blank($lead->email)) {
            self::record($lead, MailDelivery::TYPE_LEAD_CONFIRMATION, '-', MailDelivery::STATUS_SKIPPED, 'Lead hanya memberikan nomor WhatsApp.');

            return;
        }

        self::configureMailer();

        try {
            Mail::to($lead->email)->send(new LeadReceivedConfirmation($lead));
            self::record($lead, MailDelivery::TYPE_LEAD_CONFIRMATION, $lead->email, MailDelivery::STATUS_SENT);
        } catch (Throwable $exception) {
            Log::warning('Lead confirmation could not be sent.', [
                'lead_id' => $lead->id,
                'exception' => $exception->getMessage(),
            ]);

            self::record($lead, MailDelivery::TYPE_LEAD_CONFIRMATION, $lead->email, MailDelivery::STATUS_FAILED, $exception->getMessage());
        }
    }

    /**
     * SMTP credentials live in the admin settings, not only in .env.
     */
    public static function configureMailer(): void
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

    /**
     * Record a manually triggered test email so the result is visible in the
     * delivery history even when the send fails.
     */
    public static function recordTest(string $recipient, string $status, ?string $error = null): void
    {
        self::record(null, MailDelivery::TYPE_TEST, $recipient, $status, $error);
    }

    /**
     * Persist the delivery result without letting a logging failure break the
     * lead flow.
     */
    protected static function record(
        ?Lead $lead,
        string $type,
        string $recipient,
        string $status,
        ?string $error = null,
    ): void {
        try {
            MailDelivery::query()->create([
                'lead_id' => $lead?->id,
                'type' => $type,
                'recipient' => mb_substr($recipient, 0, 180),
                'status' => $status,
                'error' => $error ? mb_substr($error, 0, 500) : null,
                'sent_at' => $status === MailDelivery::STATUS_SENT ? now() : null,
            ]);
        } catch (Throwable $exception) {
            Log::warning('Mail delivery could not be recorded.', [
                'lead_id' => $lead?->id,
                'type' => $type,
                'exception' => $exception->getMessage(),
            ]);
        }
    }
}
