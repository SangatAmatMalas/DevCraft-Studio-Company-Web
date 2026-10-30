<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    public function index(Request $request): Response
    {
        $logs = ActivityLog::query()
            ->with('user:id,name')
            ->when($request->query('q'), fn ($query, $term) => $query->where('action', 'like', '%'.$term.'%'))
            ->latest('created_at')
            ->paginate(30)
            ->withQueryString();

        return Inertia::render('admin/activity-logs/index', [
            'logs' => [
                'data' => collect($logs->items())->map(fn (ActivityLog $log) => [
                    'id' => $log->id,
                    'action' => $log->action,
                    'subject_type' => $log->subject_type ? class_basename($log->subject_type) : null,
                    'subject_id' => $log->subject_id,
                    'properties' => $log->properties,
                    'user' => $log->user?->name ?? 'Sistem',
                    'ip_address' => $log->ip_address,
                    'created_at' => $log->created_at?->toIso8601String(),
                ])->all(),
                'meta' => [
                    'current_page' => $logs->currentPage(),
                    'last_page' => $logs->lastPage(),
                    'total' => $logs->total(),
                ],
            ],
            'filters' => ['q' => (string) $request->query('q', '')],
        ]);
    }
}
