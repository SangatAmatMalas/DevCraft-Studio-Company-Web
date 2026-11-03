<?php

namespace App\Jobs;

use App\Models\Lead;
use App\Services\LeadNotifier;

/**
 * Runs in the terminating phase via Bus::dispatchAfterResponse(). It does not
 * implement ShouldQueue, so no queue worker is required.
 */
class SendLeadEmails
{
    public function __construct(public int $leadId) {}

    public function handle(): void
    {
        $lead = Lead::query()->find($this->leadId);

        if (! $lead) {
            return;
        }

        LeadNotifier::notify($lead);
        LeadNotifier::sendConfirmation($lead);
    }
}
