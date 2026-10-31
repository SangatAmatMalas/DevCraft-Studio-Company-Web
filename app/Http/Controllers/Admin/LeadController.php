<?php

namespace App\Http\Controllers\Admin;

use App\Enums\LeadStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\LeadNoteRequest;
use App\Http\Requests\Admin\LeadUpdateRequest;
use App\Models\Lead;
use App\Models\LeadAttachment;
use App\Models\LeadNote;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response as ResponseFactory;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LeadController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = [
            'q' => trim((string) $request->query('q', '')),
            'status' => (string) $request->query('status', ''),
            'follow_up' => (string) $request->query('follow_up', ''),
            'from' => (string) $request->query('from', ''),
            'to' => (string) $request->query('to', ''),
        ];

        $leads = Lead::query()
            ->with(['package:id,name', 'portfolioProject:id,title'])
            ->when($filters['q'] !== '', function ($query) use ($filters) {
                $term = '%'.$filters['q'].'%';
                $query->where(function ($builder) use ($term) {
                    $builder->where('name', 'like', $term)
                        ->orWhere('email', 'like', $term)
                        ->orWhere('organization', 'like', $term)
                        ->orWhere('phone', 'like', $term);
                });
            })
            ->when($filters['status'] !== '', fn ($query) => $query->where('status', $filters['status']))
            ->when($filters['follow_up'] === 'due', fn ($query) => $query->needsFollowUp())
            ->when($filters['from'] !== '', fn ($query) => $query->whereDate('created_at', '>=', $filters['from']))
            ->when($filters['to'] !== '', fn ($query) => $query->whereDate('created_at', '<=', $filters['to']))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/leads/index', [
            'leads' => [
                'data' => collect($leads->items())->map(fn (Lead $lead) => [
                    'id' => $lead->id,
                    'name' => $lead->name,
                    'email' => $lead->email,
                    'organization' => $lead->organization,
                    'status' => $lead->status->value,
                    'status_label' => $lead->status->label(),
                    'tone' => $lead->status->tone(),
                    'context' => $lead->contextLabel(),
                    'next_follow_up_at' => $lead->next_follow_up_at?->toIso8601String(),
                    'follow_up_due' => $lead->followUpDue(),
                    'created_at' => $lead->created_at?->toIso8601String(),
                ])->all(),
                'meta' => [
                    'current_page' => $leads->currentPage(),
                    'last_page' => $leads->lastPage(),
                    'total' => $leads->total(),
                ],
            ],
            'filters' => $filters,
            'statuses' => LeadStatus::options(),
        ]);
    }

    public function show(Lead $lead): Response
    {
        $lead->load(['package:id,name,slug', 'portfolioProject:id,title,slug', 'designBrief', 'notes.user:id,name', 'attachments']);

        return Inertia::render('admin/leads/show', [
            'lead' => [
                'id' => $lead->id,
                'name' => $lead->name,
                'email' => $lead->email,
                'phone' => $lead->phone,
                'organization' => $lead->organization,
                'service_type' => $lead->service_type,
                'budget_range' => $lead->budget_range,
                'target_timeline' => $lead->target_timeline,
                'preferred_contact' => $lead->preferred_contact,
                'message' => $lead->message,
                'source_url' => $lead->source_url,
                'reference_url' => $lead->reference_url,
                'source_type' => $lead->source_type,
                'status' => $lead->status->value,
                'status_label' => $lead->status->label(),
                'next_follow_up_at' => $lead->next_follow_up_at?->toIso8601String(),
                'last_contacted_at' => $lead->last_contacted_at?->toIso8601String(),
                'follow_up_due' => $lead->followUpDue(),
                'privacy_consent_at' => $lead->privacy_consent_at?->toIso8601String(),
                'created_at' => $lead->created_at?->toIso8601String(),
                'package' => $lead->package ? ['name' => $lead->package->name, 'slug' => $lead->package->slug] : null,
                'project' => $lead->portfolioProject ? ['title' => $lead->portfolioProject->title, 'slug' => $lead->portfolioProject->slug] : null,
                'design_brief' => $lead->designBrief ? [
                    'token' => $lead->designBrief->token,
                    'brand_name' => $lead->designBrief->brand_name,
                    'category_label' => $lead->designBrief->categoryLabel(),
                    'style_label' => $lead->designBrief->styleLabel(),
                    'chosen_label' => $lead->designBrief->chosen_template ? $lead->designBrief->templateLabel() : null,
                    'result_url' => $lead->designBrief->resultUrl(),
                ] : null,
                'attachments' => $lead->attachments->map(fn (LeadAttachment $attachment) => [
                    'id' => $attachment->id,
                    'name' => $attachment->original_name,
                    'size' => $attachment->humanSize(),
                    'mime_type' => $attachment->mime_type,
                    'download_url' => route('admin.leads.attachments.download', [$lead, $attachment]),
                ])->all(),
                'notes' => $lead->notes->map(fn (LeadNote $note) => [
                    'id' => $note->id,
                    'note' => $note->note,
                    'author' => $note->user?->name ?? 'Sistem',
                    'created_at' => $note->created_at?->toIso8601String(),
                ])->all(),
            ],
            'statuses' => LeadStatus::options(),
        ]);
    }

    public function update(LeadUpdateRequest $request, Lead $lead): RedirectResponse
    {
        $previous = $lead->status->value;
        $newStatus = (string) $request->validated('status');

        $updates = [
            'status' => $newStatus,
            'next_follow_up_at' => $request->validated('next_follow_up_at'),
        ];

        // Only mark as contacted when the status actually moves into a contact stage.
        if ($newStatus !== $previous && in_array($newStatus, [
            LeadStatus::Contacted->value,
            LeadStatus::Qualified->value,
            LeadStatus::ProposalSent->value,
            LeadStatus::Won->value,
        ], true)) {
            $updates['last_contacted_at'] = now();
        }

        $lead->update($updates);

        ActivityLogger::log('lead.status_changed', $lead, [
            'from' => $previous,
            'to' => $lead->status->value,
            'next_follow_up_at' => $lead->next_follow_up_at?->toDateTimeString(),
        ]);

        return back()->with('success', 'Status lead diperbarui.');
    }

    public function downloadAttachment(Lead $lead, LeadAttachment $attachment): StreamedResponse
    {
        abort_unless($attachment->lead_id === $lead->id, 404);
        abort_unless(Storage::disk($attachment->disk)->exists($attachment->path), 404);

        ActivityLogger::log('lead.attachment_downloaded', $lead, [
            'attachment_id' => $attachment->id,
        ]);

        return Storage::disk($attachment->disk)->download($attachment->path, $attachment->original_name);
    }

    public function storeNote(LeadNoteRequest $request, Lead $lead): RedirectResponse
    {
        LeadNote::query()->create([
            'lead_id' => $lead->id,
            'user_id' => $request->user()?->id,
            'note' => $request->validated('note'),
        ]);

        ActivityLogger::log('lead.note_added', $lead, []);

        return back()->with('success', 'Catatan ditambahkan.');
    }

    public function export(Request $request): StreamedResponse
    {
        $query = Lead::query()
            ->when($request->query('status'), fn ($builder, $status) => $builder->where('status', $status))
            ->latest();

        ActivityLogger::log('lead.exported', null, ['filters' => $request->only(['status'])]);

        return ResponseFactory::streamDownload(function () use ($query) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['ID', 'Nama', 'Email', 'Telepon', 'Organisasi', 'Jenis kebutuhan', 'Budget', 'Timeline', 'Status', 'Sumber', 'Referensi', 'Follow-up', 'Dibuat']);

            $query->chunk(200, function ($leads) use ($handle) {
                foreach ($leads as $lead) {
                    fputcsv($handle, [
                        $lead->id,
                        $lead->name,
                        $lead->email,
                        $lead->phone,
                        $lead->organization,
                        $lead->service_type,
                        $lead->budget_range,
                        $lead->target_timeline,
                        $lead->status->label(),
                        $lead->source_url,
                        $lead->reference_url,
                        $lead->next_follow_up_at?->toDateTimeString(),
                        $lead->created_at?->toDateTimeString(),
                    ]);
                }
            });

            fclose($handle);
        }, 'leads-'.now()->format('Y-m-d').'.csv', ['Content-Type' => 'text/csv']);
    }
}
