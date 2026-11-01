<?php

namespace App\Services;

use App\Models\AnalyticsEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AnalyticsRecorder
{
    /** Events allowed by PRD §13.4. */
    public const EVENTS = [
        'page_view',
        'service_view',
        'package_view',
        'portfolio_view',
        'portfolio_filter',
        'project_brief_start',
        'project_brief_submit',
        'whatsapp_click',
        'email_click',
        'package_cta_click',
        'portfolio_cta_click',
        'design_generated',
        'design_selected',
        'design_cta_lead',
        'design_cta_packages',
        'design_shared',
        'booking_click',
        'lead_magnet_click',
    ];

    /** Metadata keys that are safe to persist (never personal data). */
    protected const SAFE_METADATA = [
        'category',
        'technology',
        'sort',
        'search',
        'package_slug',
        'service_slug',
        'project_slug',
        'source',
        'destination',
        'result_count',
        'template',
        'design_category',
        'step',
    ];

    public static function record(Request $request, string $event, ?string $pagePath = null, ?string $entityType = null, ?int $entityId = null, array $metadata = []): void
    {
        if (! in_array($event, self::EVENTS, true)) {
            return;
        }

        $safe = [];

        foreach (self::SAFE_METADATA as $key) {
            if (array_key_exists($key, $metadata) && is_scalar($metadata[$key])) {
                $safe[$key] = Str::limit((string) $metadata[$key], 120, '');
            }
        }

        AnalyticsEvent::query()->create([
            'event_name' => $event,
            'page_path' => Str::limit($pagePath ?: '/'.$request->path(), 500, ''),
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'anonymous_session_id' => $request->hasSession() ? substr(hash('sha256', $request->session()->getId()), 0, 32) : null,
            'referrer' => Str::limit((string) $request->headers->get('referer', ''), 500, ''),
            'metadata' => $safe ?: null,
            'created_at' => now(),
        ]);
    }
}
