<?php

namespace App\Mail;

use App\Models\Lead;
use App\Support\Settings;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class LeadReceivedConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Lead $lead) {}

    public function envelope(): Envelope
    {
        $brand = Settings::get('brand_name') ?: config('app.name');
        $contactEmail = Settings::get('contact_email');

        return new Envelope(
            subject: 'Brief Anda sudah kami terima — '.$brand,
            replyTo: $contactEmail ? [$contactEmail] : [],
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.lead-received',
            with: [
                'lead' => $this->lead,
                'brand' => Settings::get('brand_name') ?: config('app.name'),
                'contactEmail' => Settings::get('contact_email'),
                'attachmentCount' => $this->lead->attachments()->count(),
            ],
        );
    }
}
