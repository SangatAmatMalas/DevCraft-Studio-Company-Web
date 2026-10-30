<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ContentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ServiceRequest;
use App\Models\Service;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ServiceController extends Controller
{
    public function index(Request $request): Response
    {
        $services = Service::query()
            ->when($request->query('q'), fn ($query, $term) => $query->where('title', 'like', '%'.$term.'%'))
            ->when($request->query('status'), fn ($query, $status) => $query->where('status', $status))
            ->ordered()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/services/index', [
            'services' => [
                'data' => collect($services->items())->map(fn (Service $service) => [
                    'id' => $service->id,
                    'title' => $service->title,
                    'slug' => $service->slug,
                    'status' => $service->status->value,
                    'status_label' => $service->status->label(),
                    'is_featured' => $service->is_featured,
                    'display_order' => $service->display_order,
                    'updated_at' => $service->updated_at?->toIso8601String(),
                ])->all(),
                'meta' => [
                    'current_page' => $services->currentPage(),
                    'last_page' => $services->lastPage(),
                    'total' => $services->total(),
                ],
            ],
            'filters' => ['q' => (string) $request->query('q', ''), 'status' => (string) $request->query('status', '')],
            'statuses' => ContentStatus::options(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/services/form', ['service' => null]);
    }

    public function store(ServiceRequest $request): RedirectResponse
    {
        $service = new Service;
        $this->fill($service, $request);
        $service->save();

        ActivityLogger::log('service.created', $service, ['title' => $service->title]);

        return redirect()->route('admin.services.edit', $service)->with('success', 'Layanan dibuat.');
    }

    public function edit(Service $service): Response
    {
        return Inertia::render('admin/services/form', [
            'service' => [
                'id' => $service->id,
                'title' => $service->title,
                'slug' => $service->slug,
                'summary' => $service->summary,
                'description' => $service->description,
                'icon_name' => $service->icon_name,
                'deliverables' => $service->deliverables ?? [],
                'process' => $service->process ?? [],
                'faqs' => $service->faqs ?? [],
                'technologies' => $service->technologies ?? [],
                'cost_factors' => $service->cost_factors,
                'is_featured' => $service->is_featured,
                'display_order' => $service->display_order,
                'status' => $service->status->value,
                'meta_title' => $service->meta_title,
                'meta_description' => $service->meta_description,
                'public_url' => '/layanan/'.$service->slug,
            ],
        ]);
    }

    public function update(ServiceRequest $request, Service $service): RedirectResponse
    {
        $this->fill($service, $request);
        $service->save();

        ActivityLogger::log('service.updated', $service, ['title' => $service->title]);

        return back()->with('success', 'Layanan diperbarui.');
    }

    public function destroy(Service $service): RedirectResponse
    {
        $service->delete();

        ActivityLogger::log('service.deleted', $service, ['title' => $service->title]);

        return redirect()->route('admin.services.index')->with('success', 'Layanan dihapus.');
    }

    public function publish(Service $service): RedirectResponse
    {
        $service->forceFill([
            'status' => ContentStatus::Published,
            'published_at' => $service->published_at ?? now(),
        ])->save();

        ActivityLogger::log('service.published', $service, ['title' => $service->title]);

        return back()->with('success', 'Layanan dipublikasikan.');
    }

    public function unpublish(Service $service): RedirectResponse
    {
        $service->forceFill(['status' => ContentStatus::Draft])->save();

        ActivityLogger::log('service.unpublished', $service, ['title' => $service->title]);

        return back()->with('success', 'Layanan dikembalikan ke draft.');
    }

    protected function fill(Service $service, ServiceRequest $request): void
    {
        $data = $request->validated();

        $service->fill([
            'title' => $data['title'],
            'slug' => filled($data['slug'] ?? null) ? $data['slug'] : Str::slug($data['title']),
            'summary' => $data['summary'],
            'description' => $data['description'] ?? null,
            'icon_name' => $data['icon_name'] ?? 'layers',
            'deliverables' => array_values(array_filter($data['deliverables'] ?? [])),
            'process' => array_values(array_filter($data['process'] ?? [], fn ($step) => filled($step['title'] ?? null))),
            'faqs' => array_values(array_filter($data['faqs'] ?? [], fn ($faq) => filled($faq['question'] ?? null))),
            'technologies' => array_values(array_filter($data['technologies'] ?? [])),
            'cost_factors' => $data['cost_factors'] ?? null,
            'is_featured' => $request->boolean('is_featured'),
            'display_order' => $data['display_order'] ?? 0,
            'meta_title' => $data['meta_title'] ?? null,
            'meta_description' => $data['meta_description'] ?? null,
        ]);

        if ($request->boolean('publish')) {
            $service->status = ContentStatus::Published;
            $service->published_at = $service->published_at ?? now();
        } elseif ($service->status === null) {
            $service->status = ContentStatus::Draft;
        }
    }
}
