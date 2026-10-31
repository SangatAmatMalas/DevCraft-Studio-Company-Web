<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ContentStatus;
use App\Enums\LeadStatus;
use App\Http\Controllers\Controller;
use App\Models\AnalyticsEvent;
use App\Models\Lead;
use App\Models\Package;
use App\Models\PortfolioProject;
use App\Models\Service;
use App\Support\Settings;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $since30 = now()->subDays(30);

        $leadsByStatus = Lead::query()
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $leadTrend = collect(range(5, 0))->map(function (int $monthsAgo) {
            $start = now()->startOfMonth()->subMonths($monthsAgo);

            return [
                'label' => $start->translatedFormat('M Y'),
                'total' => Lead::query()
                    ->whereBetween('created_at', [$start, $start->copy()->endOfMonth()])
                    ->count(),
            ];
        })->all();

        $events30 = AnalyticsEvent::query()
            ->where('created_at', '>=', $since30)
            ->selectRaw('event_name, count(*) as total')
            ->groupBy('event_name')
            ->pluck('total', 'event_name');

        $funnelSessions = AnalyticsEvent::query()
            ->where('created_at', '>=', $since30)
            ->whereIn('event_name', ['page_view', 'project_brief_start', 'project_brief_submit'])
            ->whereNotNull('anonymous_session_id')
            ->selectRaw('event_name, count(distinct anonymous_session_id) as total')
            ->groupBy('event_name')
            ->pluck('total', 'event_name');

        $viewSessions = (int) ($funnelSessions['page_view'] ?? 0);
        $startSessions = (int) ($funnelSessions['project_brief_start'] ?? 0);
        $submitSessions = (int) ($funnelSessions['project_brief_submit'] ?? 0);

        $conversion = [
            'window_days' => 30,
            'page_view_sessions' => $viewSessions,
            'brief_start_sessions' => $startSessions,
            'brief_submit_sessions' => $submitSessions,
            'view_to_start' => $viewSessions > 0 ? round($startSessions / $viewSessions * 100, 1) : null,
            'start_to_submit' => $startSessions > 0 ? round($submitSessions / $startSessions * 100, 1) : null,
            'view_to_submit' => $viewSessions > 0 ? round($submitSessions / $viewSessions * 100, 1) : null,
        ];

        $followUpLeads = Lead::query()
            ->needsFollowUp()
            ->orderBy('next_follow_up_at')
            ->orderBy('created_at')
            ->limit(5)
            ->get()
            ->map(fn (Lead $lead) => [
                'id' => $lead->id,
                'name' => $lead->name,
                'context' => $lead->contextLabel(),
                'status_label' => $lead->status->label(),
                'next_follow_up_at' => $lead->next_follow_up_at?->toIso8601String(),
                'created_at' => $lead->created_at?->toIso8601String(),
            ])
            ->all();

        $recentLeads = Lead::query()
            ->with(['package:id,name', 'portfolioProject:id,title'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn (Lead $lead) => [
                'id' => $lead->id,
                'name' => $lead->name,
                'email' => $lead->email,
                'status' => $lead->status->value,
                'status_label' => $lead->status->label(),
                'tone' => $lead->status->tone(),
                'context' => $lead->contextLabel(),
                'created_at' => $lead->created_at?->toIso8601String(),
            ])
            ->all();

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'leads_total' => Lead::query()->count(),
                'leads_new' => Lead::query()->where('status', LeadStatus::New->value)->count(),
                'leads_30_days' => Lead::query()->where('created_at', '>=', $since30)->count(),
                'portfolio_published' => PortfolioProject::query()->where('status', ContentStatus::Published->value)->count(),
                'services_published' => Service::query()->where('status', ContentStatus::Published->value)->count(),
                'packages_published' => Package::query()->where('status', ContentStatus::Published->value)->count(),
                'brief_submissions_30_days' => (int) ($events30['project_brief_submit'] ?? 0),
                'contact_clicks_30_days' => (int) ($events30['whatsapp_click'] ?? 0) + (int) ($events30['email_click'] ?? 0),
                'follow_up_due' => Lead::query()->needsFollowUp()->count(),
            ],
            'leadsByStatus' => collect(LeadStatus::cases())->map(fn (LeadStatus $status) => [
                'status' => $status->value,
                'label' => $status->label(),
                'tone' => $status->tone(),
                'total' => (int) ($leadsByStatus[$status->value] ?? 0),
            ])->all(),
            'leadTrend' => $leadTrend,
            'recentLeads' => $recentLeads,
            'followUpLeads' => $followUpLeads,
            'conversion' => $conversion,
            'notifications' => [
                'mail_configured' => filled(Settings::get('smtp_host')) || config('mail.default') !== 'log',
            ],
            'analytics' => [
                'tracking_since' => AnalyticsEvent::query()->min('created_at'),
                'events' => collect($events30)->map(fn ($total, $event) => ['event' => $event, 'total' => (int) $total])->values()->all(),
            ],
            'today' => Carbon::now()->toIso8601String(),
        ]);
    }
}
