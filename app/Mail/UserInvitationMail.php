<?php

namespace App\Mail;

use App\Models\UserInvitation;
use App\Support\Settings;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class UserInvitationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public UserInvitation $invitation,
        public string $acceptUrl,
    ) {}

    public function envelope(): Envelope
    {
        $brand = Settings::get('brand_name') ?: config('app.name');
        $contactEmail = Settings::get('contact_email');

        return new Envelope(
            subject: 'Undangan akses admin — '.$brand,
            replyTo: $contactEmail ? [$contactEmail] : [],
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.user-invitation',
            with: [
                'invitation' => $this->invitation,
                'acceptUrl' => $this->acceptUrl,
                'brand' => Settings::get('brand_name') ?: config('app.name'),
                'contactEmail' => Settings::get('contact_email'),
            ],
        );
    }
}
