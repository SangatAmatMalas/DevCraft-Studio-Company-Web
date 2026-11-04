<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class CaptureAttribution
{
    /** UTM query keys to capture. */
    protected const UTM_KEYS = [
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_term',
        'utm_content',
    ];

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->hasSession()) {
            $attribution = $request->session()->get('lead_attribution', []);

            $hasNewUtm = false;
            foreach (self::UTM_KEYS as $key) {
                if ($request->filled($key)) {
                    $attribution[$key] = Str::limit((string) $request->query($key), 150, '');
                    $hasNewUtm = true;
                }
            }

            // Capture initial external referrer if not already set.
            if (empty($attribution['referrer'])) {
                $referer = (string) $request->headers->get('referer', '');
                if ($referer !== '') {
                    $refererHost = parse_url($referer, PHP_URL_HOST);
                    $appHost = parse_url((string) config('app.url'), PHP_URL_HOST) ?: $request->getHost();

                    if ($refererHost && ! Str::is($appHost, $refererHost)) {
                        $attribution['referrer'] = Str::limit($referer, 500, '');
                    }
                }
            }

            if ($hasNewUtm || ! empty($attribution['referrer'])) {
                $request->session()->put('lead_attribution', $attribution);
            }
        }

        return $next($request);
    }
}
