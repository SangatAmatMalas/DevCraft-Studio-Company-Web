<?php

namespace App\Http\Middleware;

use App\Models\Service;
use App\Services\WhatsAppLink;
use App\Support\Settings;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return array_merge(parent::share($request), [
            'appName' => Settings::get('brand_name'),
            'site' => Settings::public(),
            'whatsapp' => [
                'configured' => WhatsAppLink::isConfigured(),
                'url' => $user ? null : WhatsAppLink::url(),
            ],
            'navigation' => [
                'services' => Service::query()->published()->ordered()->limit(7)->get(['title', 'slug'])
                    ->map(fn (Service $service) => ['title' => $service->title, 'slug' => $service->slug])
                    ->all(),
            ],
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role->value,
                    'role_label' => $user->role->label(),
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'warning' => fn () => $request->session()->get('warning'),
                'error' => fn () => $request->session()->get('error'),
                'lead_submitted' => fn () => (bool) $request->session()->get('lead_submitted', false),
                'invitation_url' => fn () => $request->session()->get('invitation_url'),
            ],
            'analytics' => [
                'provider' => Settings::get('analytics_provider') ?: 'internal',
                'measurement_id' => Settings::get('analytics_measurement_id'),
            ],
        ]);
    }
}
