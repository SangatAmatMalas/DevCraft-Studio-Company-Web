<?php

namespace App\Console\Commands;

use App\Models\DesignBrief;
use Illuminate\Console\Command;

class PruneDesignBriefs extends Command
{
    protected $signature = 'app:prune-design-briefs {--days= : Override the retention period}';

    protected $description = 'Delete expired and unclaimed design previews';

    public function handle(): int
    {
        $days = (int) ($this->option('days') ?: config('design-previews.expires_days', 30));

        // A brief connected to a lead is retained with that lead's context;
        // only anonymous / unclaimed previews are safe to remove.
        $deleted = DesignBrief::query()
            ->whereNull('lead_id')
            ->where(fn ($query) => $query
                ->where('expires_at', '<', now())
                ->orWhere(fn ($inner) => $inner
                    ->where('status', 'generated')
                    ->where('created_at', '<', now()->subDays($days))))
            ->delete();

        $this->info("{$deleted} design brief(s) deleted.");

        return self::SUCCESS;
    }
}
