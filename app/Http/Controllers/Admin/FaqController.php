<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\FaqRequest;
use App\Models\Faq;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class FaqController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/faqs/index', [
            'faqs' => Faq::query()->orderBy('display_order')->orderBy('id')->get()->map(fn (Faq $faq) => [
                'id' => $faq->id,
                'question' => $faq->question,
                'answer' => $faq->answer,
                'category' => $faq->category,
                'display_order' => $faq->display_order,
                'is_active' => $faq->is_active,
            ])->all(),
        ]);
    }

    public function store(FaqRequest $request): RedirectResponse
    {
        $faq = Faq::query()->create([
            'question' => $request->validated('question'),
            'answer' => $request->validated('answer'),
            'category' => $request->validated('category'),
            'display_order' => $request->validated('display_order') ?? 0,
            'is_active' => $request->boolean('is_active'),
        ]);

        ActivityLogger::log('faq.created', $faq, ['question' => $faq->question]);

        return back()->with('success', 'FAQ dibuat.');
    }

    public function update(FaqRequest $request, Faq $faq): RedirectResponse
    {
        $faq->update([
            'question' => $request->validated('question'),
            'answer' => $request->validated('answer'),
            'category' => $request->validated('category'),
            'display_order' => $request->validated('display_order') ?? 0,
            'is_active' => $request->boolean('is_active'),
        ]);

        ActivityLogger::log('faq.updated', $faq, ['question' => $faq->question]);

        return back()->with('success', 'FAQ diperbarui.');
    }

    public function destroy(Faq $faq): RedirectResponse
    {
        $faq->delete();

        ActivityLogger::log('faq.deleted', $faq, ['question' => $faq->question]);

        return back()->with('success', 'FAQ dihapus.');
    }
}
