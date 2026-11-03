<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\LeadTemplateRequest;
use App\Models\LeadReplyTemplate;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class LeadTemplateController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/lead-templates/index', [
            'templates' => LeadReplyTemplate::query()->ordered()->get()->map(fn (LeadReplyTemplate $template) => [
                'id' => $template->id,
                'title' => $template->title,
                'body' => $template->body,
                'is_active' => $template->is_active,
                'display_order' => $template->display_order,
            ])->all(),
            'placeholders' => LeadReplyTemplate::PLACEHOLDERS,
        ]);
    }

    public function store(LeadTemplateRequest $request): RedirectResponse
    {
        $template = LeadReplyTemplate::query()->create([
            'title' => $request->validated('title'),
            'body' => $request->validated('body'),
            'is_active' => $request->boolean('is_active'),
            'display_order' => $request->validated('display_order') ?? 0,
        ]);

        ActivityLogger::log('lead_template.created', $template, ['title' => $template->title]);

        return back()->with('success', 'Template balasan dibuat.');
    }

    public function update(LeadTemplateRequest $request, LeadReplyTemplate $template): RedirectResponse
    {
        $template->update([
            'title' => $request->validated('title'),
            'body' => $request->validated('body'),
            'is_active' => $request->boolean('is_active'),
            'display_order' => $request->validated('display_order') ?? 0,
        ]);

        ActivityLogger::log('lead_template.updated', $template, ['title' => $template->title]);

        return back()->with('success', 'Template balasan diperbarui.');
    }

    public function destroy(LeadReplyTemplate $template): RedirectResponse
    {
        ActivityLogger::log('lead_template.deleted', null, [
            'template_id' => $template->id,
            'title' => $template->title,
        ]);

        $template->delete();

        return back()->with('success', 'Template balasan dihapus.');
    }
}
