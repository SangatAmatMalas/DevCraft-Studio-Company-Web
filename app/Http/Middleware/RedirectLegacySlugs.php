<?php

namespace App\Http\Middleware;

use App\Models\SlugRedirect;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RedirectLegacySlugs
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->isMethod('GET') && ! $request->is('admin/*')) {
            $path = '/'.ltrim($request->path(), '/');
            $redirect = SlugRedirect::query()->where('old_path', $path)->first();

            if ($redirect) {
                return redirect()->to($redirect->new_path, $redirect->status_code);
            }
        }

        return $next($request);
    }
}
