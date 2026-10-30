<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsRecorder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AnalyticsController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'event' => ['required', 'string', Rule::in(AnalyticsRecorder::EVENTS)],
            'page_path' => ['nullable', 'string', 'max:500'],
            'entity_type' => ['nullable', 'string', 'max:64'],
            'entity_id' => ['nullable', 'integer', 'min:1'],
            'metadata' => ['nullable', 'array'],
        ]);

        AnalyticsRecorder::record(
            $request,
            $validated['event'],
            $validated['page_path'] ?? null,
            $validated['entity_type'] ?? null,
            isset($validated['entity_id']) ? (int) $validated['entity_id'] : null,
            $validated['metadata'] ?? [],
        );

        return response()->json(['ok' => true]);
    }
}
