<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Design preview generator
    |--------------------------------------------------------------------------
    |
    | Public visitors describe their website, then receive three layout
    | variants rendered with their own copy. Everything is composed from the
    | templates below, so no external AI service or image generation is used.
    |
    */

    'enabled' => (bool) env('DESIGN_PREVIEWS_ENABLED', true),

    // Briefs are kept for 30 days so a visitor can compare packages first and
    // still come back to the design they picked.
    'expires_days' => 30,

    'max_services' => 6,

    'categories' => [
        'company-profile' => [
            'label' => 'Company profile',
            'description' => 'Profil perusahaan, jasa profesional, konsultan, atau vendor.',
            'templates' => ['bold-hero', 'editorial-split', 'grid-catalog'],
            'sections' => ['hero', 'services', 'about', 'gallery', 'faq', 'contact'],
        ],
        'katalog-produk' => [
            'label' => 'Katalog produk',
            'description' => 'Toko, UMKM, atau katalog yang menonjolkan banyak produk.',
            'templates' => ['grid-catalog', 'bold-hero', 'editorial-split'],
            'sections' => ['hero', 'services', 'gallery', 'about', 'contact'],
        ],
        'portfolio' => [
            'label' => 'Portfolio',
            'description' => 'Karya kreatif, studio, fotografer, desainer, atau personal brand.',
            'templates' => ['editorial-split', 'grid-catalog', 'bold-hero'],
            'sections' => ['hero', 'gallery', 'about', 'services', 'contact'],
        ],
        'landing-page' => [
            'label' => 'Landing page',
            'description' => 'Satu halaman untuk kampanye, peluncuran produk, atau event.',
            'templates' => ['bold-hero', 'editorial-split', 'grid-catalog'],
            'sections' => ['hero', 'services', 'faq', 'contact'],
        ],
        'klinik' => [
            'label' => 'Klinik & layanan kesehatan',
            'description' => 'Klinik, praktik dokter, terapi, atau layanan kesehatan lain.',
            'templates' => ['editorial-split', 'bold-hero', 'grid-catalog'],
            'sections' => ['hero', 'services', 'about', 'faq', 'contact'],
        ],
    ],

    'styles' => [
        'minimal' => [
            'label' => 'Minimal & bersih',
            'description' => 'Banyak ruang kosong, garis tipis, fokus pada teks.',
        ],
        'bold' => [
            'label' => 'Tegas & kontras',
            'description' => 'Blok warna besar, tipografi tebal, CTA menonjol.',
        ],
        'elegant' => [
            'label' => 'Tenang & premium',
            'description' => 'Warna lembut, ritme lapang, kesan eksklusif.',
        ],
    ],

    'templates' => [
        'bold-hero' => [
            'label' => 'Bold Hero',
            'description' => 'Headline besar dengan blok warna dan CTA yang menonjol.',
            'best_for' => 'Jasa, klinik, landing page',
        ],
        'editorial-split' => [
            'label' => 'Editorial Split',
            'description' => 'Dua kolom dengan tipografi tenang dan ruang lapang.',
            'best_for' => 'Company profile, konsultan, properti',
        ],
        'grid-catalog' => [
            'label' => 'Grid Catalog',
            'description' => 'Kartu rapat dan navigasi cepat untuk banyak item.',
            'best_for' => 'Katalog, portfolio, restoran',
        ],
    ],

    'sections' => [
        'hero' => 'Bagian pembuka',
        'services' => 'Layanan / produk',
        'about' => 'Tentang',
        'gallery' => 'Galeri karya',
        'faq' => 'FAQ',
        'contact' => 'Kontak',
    ],

    'palettes' => [
        ['label' => 'Biru', 'value' => '#2563eb'],
        ['label' => 'Teal', 'value' => '#0d9488'],
        ['label' => 'Oranye', 'value' => '#ea580c'],
        ['label' => 'Ungu', 'value' => '#7c3aed'],
        ['label' => 'Hijau', 'value' => '#16a34a'],
        ['label' => 'Merah', 'value' => '#dc2626'],
        ['label' => 'Netral', 'value' => '#0f172a'],
    ],

];
