<?php

namespace App\Http\Controllers\Admin;

use App\Enums\BillingType;
use App\Enums\ContentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PackageRequest;
use App\Models\Package;
use App\Models\PackageAddon;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PackageController extends Controller
{
    public function index(): Response
    {
        $packages = Package::query()->ordered()->withCount('addons')->get();

        return Inertia::render('admin/packages/index', [
            'packages' => $packages->map(fn (Package $package) => [
                'id' => $package->id,
                'name' => $package->name,
                'slug' => $package->slug,
                'status' => $package->status->value,
                'status_label' => $package->status->label(),
                'price_display' => $package->priceDisplay(),
                'billing_label' => $package->billing_type->label(),
                'is_featured' => $package->is_featured,
                'addons_count' => $package->addons_count,
                'updated_at' => $package->updated_at?->toIso8601String(),
                'public_url' => '/paket/'.$package->slug,
            ])->all(),
            'statuses' => ContentStatus::options(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/packages/form', [
            'package' => null,
            'billingTypes' => BillingType::options(),
        ]);
    }

    public function store(PackageRequest $request): RedirectResponse
    {
        $package = new Package;
        $this->fill($package, $request);
        $package->save();

        $this->syncAddons($package, $request);

        ActivityLogger::log('package.created', $package, ['name' => $package->name]);

        return redirect()->route('admin.packages.edit', $package)->with('success', 'Paket dibuat.');
    }

    public function edit(Package $package): Response
    {
        $package->load('addons');

        return Inertia::render('admin/packages/form', [
            'package' => [
                'id' => $package->id,
                'name' => $package->name,
                'slug' => $package->slug,
                'tagline' => $package->tagline,
                'target_audience' => $package->target_audience,
                'price_amount' => $package->price_amount,
                'price_label' => $package->price_label,
                'currency' => $package->currency,
                'billing_type' => $package->billing_type->value,
                'timeline_label' => $package->timeline_label,
                'revision_policy' => $package->revision_policy,
                'included_items' => $package->included_items ?? [],
                'excluded_items' => $package->excluded_items ?? [],
                'limitations' => $package->limitations ?? [],
                'addons' => $package->addons->map(fn (PackageAddon $addon) => [
                    'id' => $addon->id,
                    'name' => $addon->name,
                    'description' => $addon->description,
                    'price_label' => $addon->price_label,
                    'is_active' => $addon->is_active,
                ])->all(),
                'is_featured' => $package->is_featured,
                'display_order' => $package->display_order,
                'status' => $package->status->value,
                'meta_title' => $package->meta_title,
                'meta_description' => $package->meta_description,
                'public_url' => '/paket/'.$package->slug,
            ],
            'billingTypes' => BillingType::options(),
        ]);
    }

    public function update(PackageRequest $request, Package $package): RedirectResponse
    {
        $this->fill($package, $request);
        $package->save();

        $this->syncAddons($package, $request);

        ActivityLogger::log('package.updated', $package, ['name' => $package->name]);

        return back()->with('success', 'Paket diperbarui.');
    }

    public function destroy(Package $package): RedirectResponse
    {
        $package->delete();

        ActivityLogger::log('package.deleted', $package, ['name' => $package->name]);

        return redirect()->route('admin.packages.index')->with('success', 'Paket dihapus.');
    }

    public function publish(Package $package): RedirectResponse
    {
        if (! $package->hasVisiblePrice()) {
            return back()->with('error', 'Lengkapi harga atau pilih billing type custom sebelum mempublikasikan paket.');
        }

        $package->forceFill([
            'status' => ContentStatus::Published,
            'published_at' => $package->published_at ?? now(),
        ])->save();

        ActivityLogger::log('package.published', $package, ['name' => $package->name]);

        return back()->with('success', 'Paket dipublikasikan.');
    }

    public function unpublish(Package $package): RedirectResponse
    {
        $package->forceFill(['status' => ContentStatus::Draft])->save();

        ActivityLogger::log('package.unpublished', $package, ['name' => $package->name]);

        return back()->with('success', 'Paket dikembalikan ke draft.');
    }

    protected function fill(Package $package, PackageRequest $request): void
    {
        $data = $request->validated();

        $package->fill([
            'name' => $data['name'],
            'slug' => filled($data['slug'] ?? null) ? $data['slug'] : Str::slug($data['name']),
            'tagline' => $data['tagline'] ?? null,
            'target_audience' => $data['target_audience'] ?? null,
            'price_amount' => $data['price_amount'] ?? null,
            'price_label' => $data['price_label'] ?? null,
            'currency' => strtoupper($data['currency']),
            'billing_type' => $data['billing_type'],
            'timeline_label' => $data['timeline_label'] ?? null,
            'revision_policy' => $data['revision_policy'] ?? null,
            'included_items' => array_values(array_filter($data['included_items'] ?? [])),
            'excluded_items' => array_values(array_filter($data['excluded_items'] ?? [])),
            'limitations' => array_values(array_filter($data['limitations'] ?? [])),
            'is_featured' => $request->boolean('is_featured'),
            'display_order' => $data['display_order'] ?? 0,
            'meta_title' => $data['meta_title'] ?? null,
            'meta_description' => $data['meta_description'] ?? null,
        ]);

        if ($request->boolean('publish')) {
            $package->status = ContentStatus::Published;
            $package->published_at = $package->published_at ?? now();
        } elseif ($package->status === null) {
            $package->status = ContentStatus::Draft;
        }
    }

    protected function syncAddons(Package $package, PackageRequest $request): void
    {
        $kept = [];

        foreach ($request->validated()['addons'] ?? [] as $addon) {
            if (blank($addon['name'] ?? null)) {
                continue;
            }

            $model = PackageAddon::query()->firstOrNew([
                'id' => $addon['id'] ?? null,
                'package_id' => $package->id,
            ]);

            $model->fill([
                'package_id' => $package->id,
                'name' => $addon['name'],
                'description' => $addon['description'] ?? null,
                'price_label' => $addon['price_label'] ?? null,
                'is_active' => (bool) ($addon['is_active'] ?? true),
            ])->save();

            $kept[] = $model->id;
        }

        PackageAddon::query()->where('package_id', $package->id)->whereNotIn('id', $kept)->delete();
    }
}
