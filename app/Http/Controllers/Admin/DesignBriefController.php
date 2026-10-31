<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DesignBrief;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DesignBriefController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = [
            'q' => trim((string) $request->query('q', '')),
            'category' => (string) $request->query('category', ''),
        ];

        $briefs = DesignBrief::query()
            ->when($filters['q'] !== '', fn ($query) => $query->where('brand_name', 'like', '%'.$filters['q'].'%'))
            ->when($filters['category'] !== '', fn ($query) => $query->where('category', $filters['category']))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/design-briefs/index', [
            'briefs' => [
                'data' => collect($briefs->items())->map(fn (DesignBrief $brief) => [
                    'id' => $brief->id,
                    'token' => $brief->token,
                    'brand_name' => $brief->brand_name,
                    'category' => $brief->category,
                    'category_label' => $brief->categoryLabel(),
                    'style_label' => $brief->styleLabel(),
                    'chosen_label' => $brief->chosen_template ? $brief->templateLabel() : null,
                    'status' => $brief->status,
                    'services_count' => count($brief->serviceItems()),
                    'lead_id' => $brief->lead_id,
                    'created_at' => $brief->created_at?->toIso8601String(),
                    'expires_at' => $brief->expires_at?->toIso8601String(),
                    'expired' => $brief->isExpired(),
                    'result_url' => $brief->resultUrl(),
                ])->all(),
                'meta' => [
                    'current_page' => $briefs->currentPage(),
                    'last_page' => $briefs->lastPage(),
                    'total' => $briefs->total(),
                ],
            ],
            'filters' => $filters,
            'categories' => collect((array) config('design-previews.categories'))
                ->map(fn (array $category, string $key) => ['key' => $key, 'label' => $category['label']])
                ->values()
                ->all(),
        ]);
    }
}
