<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLeadRequest;
use App\Models\Lead;
use App\Models\Package;
use App\Models\PortfolioProject;
use App\Models\Service;
use App\Services\AnalyticsRecorder;
use App\Services\LeadNotifier;
use App\Services\Seo;
use App\Services\WhatsAppLink;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    public function show(Request $request): Response
    {
        $package = null;
        $project = null;
        $service = null;

        if ($request->filled('paket')) {
            $package = Package::query()->published()->where('slug', $request->string('paket'))->first();
        }

        if ($request->filled('proyek')) {
            $project = PortfolioProject::query()->published()->where('slug', $request->string('proyek'))->first();
        }

        if ($request->filled('layanan')) {
            $service = Service::query()->published()->where('slug', $request->string('layanan'))->first();
        }

        $services = Service::query()->published()->ordered()->get(['id', 'title', 'slug']);

        return Inertia::render('site/contact', [
            'services' => $services->map(fn (Service $item) => ['title' => $item->title, 'slug' => $item->slug])->all(),
            'packages' => Package::query()->published()->ordered()->get(['id', 'name', 'slug'])
                ->map(fn (Package $item) => ['id' => $item->id, 'name' => $item->name, 'slug' => $item->slug])
                ->all(),
            'projects' => PortfolioProject::query()->published()->orderByDesc('published_at')->limit(30)->get(['id', 'title', 'slug'])
                ->map(fn (PortfolioProject $item) => ['id' => $item->id, 'title' => $item->title, 'slug' => $item->slug])
                ->all(),
            'prefill' => [
                'package' => $package ? ['id' => $package->id, 'name' => $package->name] : null,
                'project' => $project ? ['id' => $project->id, 'title' => $project->title] : null,
                'service' => $service ? ['title' => $service->title] : null,
                'source_type' => $package ? 'package' : ($project ? 'portfolio' : ($service ? 'service' : 'contact_page')),
            ],
            'whatsappUrl' => WhatsAppLink::url(),
            'seo' => Seo::make(
                'Kontak',
                'Ceritakan kebutuhan Anda. Kirim project brief atau hubungi DevCraft Studio melalui WhatsApp dan email.',
                url('/kontak'),
            ),
        ]);
    }

    public function store(StoreLeadRequest $request): RedirectResponse
    {
        $package = $request->package();
        $project = $request->project();

        $lead = Lead::query()->create([
            'name' => $request->string('name')->toString(),
            'email' => $request->string('email')->toString(),
            'phone' => $request->input('phone'),
            'organization' => $request->input('organization'),
            'service_type' => $request->input('service_type'),
            'package_id' => $package?->id,
            'portfolio_project_id' => $project?->id,
            'budget_range' => $request->input('budget_range'),
            'target_timeline' => $request->input('target_timeline'),
            'preferred_contact' => $request->input('preferred_contact', 'email'),
            'message' => $request->string('message')->toString(),
            'source_url' => $request->input('source_url') ?: url()->previous(),
            'source_type' => $request->input('source_type') ?: $request->input('preferred_contact', 'contact_page'),
            'status' => 'new',
            'privacy_consent_at' => now(),
            'ip_hash' => hash('sha256', ($request->ip() ?? 'unknown').config('app.key')),
        ]);

        AnalyticsRecorder::record(
            $request,
            'project_brief_submit',
            '/kontak',
            'lead',
            $lead->id,
            array_filter([
                'package_slug' => $package?->slug,
                'project_slug' => $project?->slug,
                'source' => $request->input('source_type'),
            ]),
        );

        LeadNotifier::notify($lead);

        return redirect()
            ->route('kontak')
            ->with('success', 'Terima kasih. Brief Anda sudah kami terima dan akan ditinjau oleh tim DevCraft Studio.')
            ->with('lead_submitted', true);
    }
}
