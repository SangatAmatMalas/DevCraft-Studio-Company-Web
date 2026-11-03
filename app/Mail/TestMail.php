<?php

namespace App\Mail;

use App\Support\Settings;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TestMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public string $recipientName) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Email uji — '.Settings::get('brand_name'),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.test',
            with: ['recipientName' => $this->recipientName],
        );
    }
}
