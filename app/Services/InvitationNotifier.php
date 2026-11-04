<?php

namespace App\Services;

use App\Mail\UserInvitationMail;
use App\Models\MailDelivery;
use App\Models\UserInvitation;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class InvitationNotifier
{
    /**
     * Send the invitation link. Failures are recorded but never bubble up so
     * the invitation record stays available for a manual copy/resend.
     */
    public static function send(UserInvitation $invitation, string $token): bool
    {
        MailConfigurator::configure();

        $url = route('invitation.accept', ['token' => $token]);

        try {
            Mail::to($invitation->email)->send(new UserInvitationMail($invitation, $url));
            self::record($invitation, MailDelivery::STATUS_SENT);

            return true;
        } catch (Throwable $exception) {
            Log::warning('User invitation email could not be sent.', [
                'invitation_id' => $invitation->id,
                'exception' => $exception->getMessage(),
            ]);

            self::record($invitation, MailDelivery::STATUS_FAILED, $exception->getMessage());

            return false;
        }
    }

    protected static function record(UserInvitation $invitation, string $status, ?string $error = null): void
    {
        try {
            MailDelivery::query()->create([
                'lead_id' => null,
                'type' => MailDelivery::TYPE_USER_INVITATION,
                'recipient' => $invitation->email,
                'status' => $status,
                'error' => $error ? mb_substr($error, 0, 1000) : null,
                'sent_at' => $status === MailDelivery::STATUS_SENT ? now() : null,
            ]);
        } catch (Throwable $exception) {
            Log::warning('Invitation delivery record could not be stored.', [
                'invitation_id' => $invitation->id,
                'exception' => $exception->getMessage(),
            ]);
        }
    }
}
