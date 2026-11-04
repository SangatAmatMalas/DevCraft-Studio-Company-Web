<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Services\Seo;
use App\Services\WhatsAppLink;
use Inertia\Inertia;
use Inertia\Response;

class CostEstimatorController extends Controller
{
    /** Project types with baseline benchmarked pricing and timelines. */
    public const PROJECT_TYPES = [
        [
            'id' => 'landing_page',
            'title' => 'Landing Page Konversi',
            'category' => 'Web Marketing',
            'summary' => 'Satu halaman fokus konversi iklan/promosi dengan copy tajam, load cepat, dan integrasi WhatsApp/kontak.',
            'base_price' => 1500000,
            'base_days' => 5,
            'page_included' => '1 halaman panjang (5-7 section)',
        ],
        [
            'id' => 'company_profile',
            'title' => 'Company Profile Bisnis',
            'category' => 'Branding & Kredibilitas',
            'summary' => 'Website profil perusahaan profesional untuk tender, kredibilitas klien, dan pengenalan layanan bisnis.',
            'base_price' => 3500000,
            'base_days' => 10,
            'page_included' => 'Hingga 5 halaman (Beranda, Tentang, Layanan, Portfolio, Kontak)',
        ],
        [
            'id' => 'product_catalog',
            'title' => 'Katalog / Showcase Produk',
            'category' => 'Penjualan & Display',
            'summary' => 'Website etalase katalog produk/jasa terstruktur dengan filter kategori dan direct order WhatsApp/checkout.',
            'base_price' => 5500000,
            'base_days' => 15,
            'page_included' => 'Hingga 10 halaman & modul katalog produk dinamis',
        ],
        [
            'id' => 'web_application',
            'title' => 'Aplikasi Web Kustom / SaaS MVP',
            'category' => 'Sistem & Operasional',
            'summary' => 'Aplikasi internal, portal membership, sistem pesanan, atau MVP SaaS berbasis Laravel & React.',
            'base_price' => 12000000,
            'base_days' => 25,
            'page_included' => 'Arsitektur kustom, database relational, role user, dan panel operasional',
        ],
        [
            'id' => 'workflow_automation',
            'title' => 'Otomasi & Integrasi API',
            'category' => 'Efisiensi Kerja',
            'summary' => 'Integrasi API WhatsApp Gateway, payment, sync spreadsheet, atau webhook otomatis untuk memangkas kerja manual.',
            'base_price' => 2500000,
            'base_days' => 7,
            'page_included' => 'Skrip otomasi, error handler, dan dashboard monitoring',
        ],
    ];

    /** Scale / page volume adjustments. */
    public const SCALE_OPTIONS = [
        [
            'id' => 'standard',
            'label' => 'Sesuai cakupan standar',
            'description' => 'Cakupan halaman bawaan paket tanpa penambahan struktur.',
            'price' => 0,
            'extra_days' => 0,
        ],
        [
            'id' => 'extra_small',
            'label' => '+2 s.d. 3 Halaman Tambahan',
            'description' => 'Cocok untuk penambahan halaman tim, galeri, atau FAQ mendalam.',
            'price' => 600000,
            'extra_days' => 2,
        ],
        [
            'id' => 'extra_medium',
            'label' => '+4 s.d. 6 Halaman Tambahan',
            'description' => 'Cocok untuk cabang layanan terpisah atau halaman studi kasus rinci.',
            'price' => 1200000,
            'extra_days' => 4,
        ],
        [
            'id' => 'extra_large',
            'label' => '+7 s.d. 10 Halaman Tambahan',
            'description' => 'Arsitektur informasi luas untuk korporasi atau dokumentasi lengkap.',
            'price' => 2200000,
            'extra_days' => 7,
        ],
    ];

    /** Add-on features benchmarked to standard industry additions. */
    public const ADDONS = [
        [
            'id' => 'cms_admin',
            'title' => 'Panel CMS Admin Mandiri',
            'description' => 'Kelola artikel, konten halaman, dan banner sendiri tanpa perlu menyentuh kode.',
            'price' => 1000000,
            'extra_days' => 3,
        ],
        [
            'id' => 'payment_gateway',
            'title' => 'Integrasi Payment Gateway',
            'description' => 'Terima pembayaran otomatis QRIS, Virtual Account, & e-Wallet via Midtrans/Xendit.',
            'price' => 1500000,
            'extra_days' => 4,
        ],
        [
            'id' => 'whatsapp_bot',
            'title' => 'Notifikasi WhatsApp Otomatis',
            'description' => 'Kirim pesan instan otomatis ke admin/pembeli setiap ada pesanan atau inquiry baru.',
            'price' => 750000,
            'extra_days' => 2,
        ],
        [
            'id' => 'multilingual',
            'title' => 'Multi-Bahasa (ID & EN)',
            'description' => 'Dukungan dwibahasa penuh untuk target pasar lokal Indonesia dan internasional.',
            'price' => 850000,
            'extra_days' => 3,
        ],
        [
            'id' => 'seo_advanced',
            'title' => 'SEO Teknis & Schema.org Lanjutan',
            'description' => 'Audit performa Core Web Vitals, JSON-LD Schema kaya, dan submission Google Search Console.',
            'price' => 600000,
            'extra_days' => 2,
        ],
        [
            'id' => 'copywriting',
            'title' => 'Penulisan Copywriting Bisnis',
            'description' => 'Riset target audiens dan penulisan teks penawaran persuasif siap pakai oleh tim kami.',
            'price' => 750000,
            'extra_days' => 3,
        ],
        [
            'id' => 'care_3mo',
            'title' => 'Maintenance & Garansi Server 3 Bulan',
            'description' => 'Backup rutin berkala, update keamanan lib, dan monitoring uptime 99.9%.',
            'price' => 1350000,
            'extra_days' => 0,
        ],
    ];

    public function index(): Response
    {
        return Inertia::render('site/calculator', [
            'projectTypes' => self::PROJECT_TYPES,
            'scaleOptions' => self::SCALE_OPTIONS,
            'addons' => self::ADDONS,
            'whatsappUrl' => WhatsAppLink::forContext('kalkulator biaya proyek', url('/kalkulator')),
            'seo' => Seo::make(
                'Kalkulator Estimasi Biaya Pembuatan Website',
                'Hitung estimasi biaya dan durasi pembuatan website atau aplikasi web secara transparan. Rincian realistis berbasis fitur dan cakupan.',
                url('/kalkulator'),
                'website',
                [
                    Seo::breadcrumbs([
                        'Beranda' => url('/'),
                        'Kalkulator Biaya' => url('/kalkulator'),
                    ]),
                ],
            ),
        ]);
    }
}
