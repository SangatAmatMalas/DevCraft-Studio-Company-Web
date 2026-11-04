<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <meta name="theme-color" content="#0F172A">
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" href="/favicon-32.png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        @if (($noindex ?? false) === true)
            <meta name="robots" content="noindex,nofollow">
        @endif

        <title inertia>{{ config('app.name', 'DevCraft Studio') }}</title>

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link
            href="https://fonts.bunny.net/css?family=inter:400,500,600|plus-jakarta-sans:500,600,700,800"
            rel="stylesheet"
        />

        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="min-h-screen bg-background font-sans text-foreground antialiased">
        @inertia
    </body>
</html>
