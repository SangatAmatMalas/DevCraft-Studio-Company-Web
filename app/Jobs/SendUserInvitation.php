<?php

namespace App\Jobs;

use App\Models\UserInvitation;
use App\Services\InvitationNotifier;

/**
 * Runs in the terminating phase via Bus::dispatchAfterResponse(). It does not
 * implement ShouldQueue, so no queue worker is required.
 */
class SendUserInvitation
{
    public function __construct(
        public int $invitationId,
        public string $token,
    ) {}

    public function handle(): void
    {
        $invitation = UserInvitation::query()->find($this->invitationId);

        if (! $invitation) {
            return;
        }

        InvitationNotifier::send($invitation, $this->token);
    }
}
