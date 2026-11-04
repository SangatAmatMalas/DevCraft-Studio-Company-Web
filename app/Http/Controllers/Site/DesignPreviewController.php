<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDesignBriefRequest;
use App\Models\DesignBrief;
use App\Services\AnalyticsRecorder;
use App\Services\DesignBriefFactory;
use App\Services\Seo;
use App\Services\WhatsAppLink;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DesignPreviewController extends Controller
{
    public function index(): Response
    {
        abort_unless((bool) config('design-previews.enabled'), 404);

        return Inertia::render('site/design/index', [
            ...$this->formOptions(),
            'brief' => null,
            'seo' => Seo::make(
                'Coba desain website',
                'Isi brief singkat tentang usaha Anda dan lihat tiga opsi desain website lengkap dengan preview yang bisa dibuka langsung.',
                url('/desain'),
            ),
        ]);
    }

    public function store(StoreDesignBriefRequest $request): RedirectResponse
    {
        abort_unless((bool) config('design-previews.enabled'), 404);

        $brief = DesignBriefFactory::create($request->validated(), $request->ip());

        AnalyticsRecorder::record(
            $request,
            'design_generated',
            '/desain',
            'design_brief',
            $brief->id,
            ['design_category' => $brief->category, 'step' => 'generated'],
        );

        return redirect()
            ->route('desain.hasil', $brief->token)
            ->with('success', 'Tiga opsi desain sudah dibuat. Pilih salah satu untuk melihat preview penuh.');
    }

    public function edit(DesignBrief $brief): Response|RedirectResponse
    {
        abort_unless((bool) config('design-previews.enabled'), 404);
        abort_if($brief->isExpired(), 410, 'Preview desain ini sudah kedaluwarsa. Silakan buat brief baru.');

        if ($brief->status === 'claimed') {
            return redirect()
                ->route('desain.hasil', $brief->token)
                ->with('error', 'Brief ini sudah dikirim bersama konsultasi, jadi tidak bisa diubah lagi dari tautan ini.');
        }

        return Inertia::render('site/design/index', [
            ...$this->formOptions(),
            'brief' => $this->editPayload($brief),
            'seo' => Seo::make(
                'Ubah brief desain — '.$brief->brand_name,
                'Perbarui teks, warna, dan bagian yang tampil, lalu buat ulang preview desain Anda.',
                route('desain.edit', $brief->token),
                'website',
                [],
                null,
                true,
            ),
        ])->withViewData(['noindex' => true]);
    }

    public function update(StoreDesignBriefRequest $request, DesignBrief $brief): RedirectResponse
    {
        abort_unless((bool) config('design-previews.enabled'), 404);
        abort_if($brief->isExpired(), 410, 'Preview desain ini sudah kedaluwarsa. Silakan buat brief baru.');

        if ($brief->status === 'claimed') {
            return redirect()
                ->route('desain.hasil', $brief->token)
                ->with('error', 'Brief ini sudah dikirim bersama konsultasi, jadi tidak bisa diubah lagi dari tautan ini.');
        }

        DesignBriefFactory::update($brief, $request->validated());

        AnalyticsRecorder::record(
            $request,
            'design_updated',
            '/desain/'.$brief->token.'/edit',
            'design_brief',
            $brief->id,
            ['design_category' => $brief->category, 'step' => 'updated'],
        );

        return redirect()
            ->route('desain.hasil', $brief->token)
            ->with('success', 'Brief diperbarui. Preview di bawah sudah memakai teks terbaru.');
    }

    public function result(DesignBrief $brief): Response
    {
        abort_if($brief->isExpired(), 410, 'Preview desain ini sudah kedaluwarsa. Silakan buat brief baru.');

        return Inertia::render('site/design/result', [
            'brief' => $this->briefPayload($brief),
            'seo' => Seo::make(
                'Opsi desain untuk '.$brief->brand_name,
                'Tiga opsi desain yang dibuat dari brief Anda. Preview ini bersifat sementara dan tidak diindeks mesin pencari.',
                $brief->resultUrl(),
                'website',
                [],
                null,
                true,
            ),
        ])->withViewData(['noindex' => true]);
    }

    public function preview(Request $request, DesignBrief $brief, string $template): Response
    {
        abort_if($brief->isExpired(), 410, 'Preview desain ini sudah kedaluwarsa. Silakan buat brief baru.');
        abort_unless(in_array($template, $brief->templates ?: [], true), 404);

        return Inertia::render('site/preview/show', [
            'brief' => $this->previewPayload($brief),
            'template' => $template,
            'embed' => $request->boolean('embed'),
            'seo' => Seo::make(
                'Preview '.$brief->templateLabel($template).' — '.$brief->brand_name,
                'Preview desain website yang dibuat dari brief Anda.',
                $brief->previewUrl($template),
                'website',
                [],
                null,
                true,
            ),
        ])->withViewData(['noindex' => true]);
    }

    public function select(Request $request, DesignBrief $brief): RedirectResponse
    {
        abort_if($brief->isExpired(), 410, 'Preview desain ini sudah kedaluwarsa. Silakan buat brief baru.');

        $validated = $request->validate([
            'template' => ['required', 'string'],
        ]);

        abort_unless(in_array($validated['template'], $brief->templates ?: [], true), 404);

        $brief->forceFill([
            'chosen_template' => $validated['template'],
            'chosen_at' => now(),
            'status' => $brief->status === 'claimed' ? 'claimed' : 'selected',
        ])->save();

        AnalyticsRecorder::record(
            $request,
            'design_selected',
            '/desain/'.$brief->token,
            'design_brief',
            $brief->id,
            ['template' => $validated['template'], 'design_category' => $brief->category],
        );

        return redirect()
            ->route('desain.hasil', $brief->token)
            ->with('success', 'Desain '.$brief->templateLabel($validated['template']).' dipilih. Lanjut konsultasi atau lihat paket.');
    }

    /** @return array<string, mixed> */
    private function formOptions(): array
    {
        $categories = collect((array) config('design-previews.categories'))
            ->map(fn (array $category, string $key) => [
                'key' => $key,
                'label' => $category['label'],
                'description' => $category['description'],
            ])
            ->values()
            ->all();

        $styles = collect((array) config('design-previews.styles'))
            ->map(fn (array $style, string $key) => [
                'key' => $key,
                'label' => $style['label'],
                'description' => $style['description'],
            ])
            ->values()
            ->all();

        $sections = collect((array) config('design-previews.sections'))
            ->map(fn (string $label, string $key) => ['key' => $key, 'label' => $label])
            ->values()
            ->all();

        return [
            'categories' => $categories,
            'styles' => $styles,
            'palettes' => array_values((array) config('design-previews.palettes')),
            'sections' => $sections,
            'maxServices' => (int) config('design-previews.max_services', 6),
        ];
    }

    /** @return array<string, mixed> */
    private function editPayload(DesignBrief $brief): array
    {
        return [
            'token' => $brief->token,
            'category' => $brief->category,
            'style' => $brief->style,
            'brand_name' => $brief->brand_name,
            'tagline' => $brief->tagline,
            'description' => $brief->description,
            'services' => collect($brief->serviceItems())
                ->map(fn (array $item) => [
                    'title' => $item['title'],
                    'description' => $item['description'] ?? '',
                ])
                ->all(),
            'contact' => [
                'whatsapp' => (string) ($brief->contact['whatsapp'] ?? ''),
                'email' => (string) ($brief->contact['email'] ?? ''),
                'city' => (string) ($brief->contact['city'] ?? ''),
            ],
            'primary_color' => $brief->primary_color,
            'sections' => $brief->sections ?: [],
            'result_url' => $brief->resultUrl(),
        ];
    }

    /** @return array<string, mixed> */
    private function briefPayload(DesignBrief $brief): array
    {
        return [
            'token' => $brief->token,
            'brand_name' => $brief->brand_name,
            'tagline' => $brief->tagline,
            'category' => $brief->category,
            'category_label' => $brief->categoryLabel(),
            'style' => $brief->style,
            'style_label' => $brief->styleLabel(),
            'primary_color' => $brief->primary_color,
            'sections' => $brief->sections,
            'services' => $brief->serviceItems(),
            'contact' => $brief->contact,
            'variants' => collect($brief->templateOptions())->map(fn (array $variant) => [
                ...$variant,
                'preview_url' => $brief->previewUrl($variant['key']),
                'embed_url' => $brief->previewUrl($variant['key'], true),
            ])->all(),
            'chosen' => $brief->chosen_template,
            'chosen_label' => $brief->chosen_template ? $brief->templateLabel() : null,
            'chosen_at' => $brief->chosen_at?->toIso8601String(),
            'expires_at' => $brief->expires_at?->toIso8601String(),
            'edit_url' => $brief->status === 'claimed' ? null : route('desain.edit', $brief->token),
            'lead_url' => route('kontak', ['desain' => $brief->token]),
            'packages_url' => route('paket.index', ['desain' => $brief->token]),
            'whatsapp_url' => WhatsAppLink::forContext(
                'preview desain '.$brief->brand_name.($brief->chosen_template ? ' ('.$brief->templateLabel().')' : ''),
                $brief->resultUrl(),
            ),
        ];
    }

    /** @return array<string, mixed> */
    private function previewPayload(DesignBrief $brief): array
    {
        return [
            'token' => $brief->token,
            'brand_name' => $brief->brand_name,
            'tagline' => $brief->tagline,
            'description' => $brief->description,
            'category' => $brief->category,
            'category_label' => $brief->categoryLabel(),
            'style' => $brief->style,
            'primary_color' => $brief->primary_color,
            'sections' => $brief->sections,
            'services' => $brief->serviceItems(),
            'contact' => $brief->contact,
            'chosen' => $brief->chosen_template,
        ];
    }
}
