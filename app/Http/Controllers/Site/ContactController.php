<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLeadRequest;
use App\Models\DesignBrief;
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
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
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

        $brief = $this->designBrief($request);

        if ($brief) {
            AnalyticsRecorder::record(
                $request,
                'design_cta_lead',
                '/kontak',
                'design_brief',
                $brief->id,
                ['template' => $brief->chosen_template, 'design_category' => $brief->category, 'source' => 'preview'],
            );
        }

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
                'source_type' => $brief ? 'design_preview' : ($package ? 'package' : ($project ? 'portfolio' : ($service ? 'service' : 'contact_page'))),
            ],
            'designBrief' => $brief ? [
                'token' => $brief->token,
                'brand_name' => $brief->brand_name,
                'category_label' => $brief->categoryLabel(),
                'template_label' => $brief->chosen_template ? $brief->templateLabel() : null,
                'message_seed' => 'Saya sudah mencoba preview desain '.$brief->brand_name
                    .($brief->chosen_template ? ' dengan gaya '.$brief->templateLabel() : '')
                    .'. Saya ingin mendiskusikan penerapannya untuk website saya.',
            ] : null,
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
        $brief = $this->designBrief($request);

        $email = $request->input('email');
        $phone = $request->input('phone');
        $preferredContact = $request->input('preferred_contact');

        // Keep the preferred channel consistent with the details the lead shared.
        if (blank($preferredContact) || ($preferredContact === 'email' && blank($email))) {
            $preferredContact = filled($email) ? 'email' : (filled($phone) ? 'whatsapp' : null);
        }

        $lead = Lead::query()->create([
            'name' => $request->string('name')->toString(),
            'email' => $email,
            'phone' => $phone,
            'organization' => $request->input('organization'),
            'service_type' => $request->input('service_type'),
            'package_id' => $package?->id,
            'portfolio_project_id' => $project?->id,
            'design_brief_id' => $brief?->id,
            'budget_range' => $request->input('budget_range'),
            'target_timeline' => $request->input('target_timeline'),
            'preferred_contact' => $preferredContact,
            'message' => $request->string('message')->toString(),
            'source_url' => $request->input('source_url') ?: url()->previous(),
            'reference_url' => $request->input('reference_url'),
            'source_type' => $brief ? 'design_preview' : ($request->input('source_type') ?: 'contact_page'),
            'status' => 'new',
            'privacy_consent_at' => now(),
            'ip_hash' => hash('sha256', ($request->ip() ?? 'unknown').config('app.key')),
        ]);

        $attachments = $request->file('attachments', []);
        $this->storeAttachments($lead, is_array($attachments) ? $attachments : [$attachments]);

        if ($brief) {
            $brief->forceFill([
                'lead_id' => $lead->id,
                'status' => 'claimed',
            ])->save();
        }

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
                'template' => $brief?->chosen_template,
                'design_category' => $brief?->category,
            ]),
        );

        LeadNotifier::queue($lead);

        return redirect()
            ->route('kontak')
            ->with('success', 'Terima kasih. Brief Anda sudah kami terima dan akan ditinjau oleh tim DevCraft Studio.')
            ->with('lead_submitted', true);
    }

    /** @param array<int, UploadedFile> $files */
    private function storeAttachments(Lead $lead, array $files): void
    {
        foreach ($files as $file) {
            if (! $file instanceof UploadedFile) {
                continue;
            }

            $path = $file->store('lead-attachments/'.$lead->id, 'local');

            $lead->attachments()->create([
                'disk' => 'local',
                'path' => $path,
                'original_name' => Str::limit(basename($file->getClientOriginalName()), 180, ''),
                'mime_type' => $file->getClientMimeType(),
                'size' => $file->getSize() ?: 0,
            ]);
        }
    }

    private function designBrief(Request $request): ?DesignBrief
    {
        $token = $request->input('design_brief') ?: $request->query('desain');

        if (! is_string($token) || $token === '') {
            return null;
        }

        return DesignBrief::query()
            ->active()
            ->where('token', $token)
            ->first();
    }
}
