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
            ],
            'leadsByStatus' => collect(LeadStatus::cases())->map(fn (LeadStatus $status) => [
                'status' => $status->value,
                'label' => $status->label(),
                'tone' => $status->tone(),
                'total' => (int) ($leadsByStatus[$status->value] ?? 0),
            ])->all(),
            'leadTrend' => $leadTrend,
            'recentLeads' => $recentLeads,
            'analytics' => [
                'tracking_since' => AnalyticsEvent::query()->min('created_at'),
                'events' => collect($events30)->map(fn ($total, $event) => ['event' => $event, 'total' => (int) $total])->values()->all(),
            ],
            'today' => Carbon::now()->toIso8601String(),
        ]);
    }
}
