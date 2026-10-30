<?php

namespace Database\Seeders;

use App\Enums\BillingType;
use App\Enums\ContentStatus;
use App\Models\Package;
use Illuminate\Database\Seeder;

class PackageSeeder extends Seeder
{
    public function run(): void
    {
        $packages = [
            [
                'name' => 'Starter Website',
                'slug' => 'starter-website',
                'tagline' => 'Landing page ringkas untuk memperkenalkan bisnis atau karya Anda.',
                'target_audience' => 'Personal, freelancer, dan usaha kecil',
                'billing_type' => BillingType::OneTime,
                'timeline_label' => 'Sekitar 1–2 minggu setelah konten siap',
                'included_items' => [
                    'Satu landing page hingga beberapa section',
                    'Layout responsif untuk mobile dan desktop',
                    'Tombol kontak dan WhatsApp',
                    'SEO dasar (title, description, sitemap)',
                ],
                'excluded_items' => [
                    'Copywriting dan pembuatan konten',
                    'Foto atau aset berlisensi',
                    'Domain dan hosting',
                    'Integrasi pembayaran',
                ],
                'limitations' => [
                    'Satu halaman utama',
                    'Tanpa CMS khusus kecuali disepakati',
                    'Satu putaran revisi desain',
                ],
                'revision_policy' => 'Satu putaran revisi mencakup penyesuaian teks, warna, dan tata letak yang masih dalam ruang lingkup awal.',
                'display_order' => 0,
                'status' => ContentStatus::Draft,
            ],
            [
                'name' => 'Business Presence',
                'slug' => 'business-presence',
                'tagline' => 'Company profile dengan halaman layanan dan jalur kontak yang jelas.',
                'target_audience' => 'UMKM dan bisnis lokal',
                'billing_type' => BillingType::OneTime,
                'timeline_label' => 'Sekitar 2–4 minggu setelah konten siap',
                'included_items' => [
                    'Company profile dan halaman layanan',
                    'Profil bisnis dan informasi kontak',
                    'Formulir kontak',
                    'SEO dasar dan metadata per halaman',
                ],
                'excluded_items' => [
                    'Katalog produk',
                    'Sistem akun pengguna',
                    'Integrasi pihak ketiga di luar formulir dan WhatsApp',
                ],
                'limitations' => [
                    'Hingga 6 halaman',
                    'Satu bahasa',
                    'Dua putaran revisi',
                ],
                'revision_policy' => 'Dua putaran revisi pada tahap desain dan satu putaran penyempurnaan setelah implementasi.',
                'display_order' => 1,
                'status' => ContentStatus::Draft,
            ],
            [
                'name' => 'Product Catalog',
                'slug' => 'product-catalog',
                'tagline' => 'Katalog produk yang rapi dan mudah dicari calon pembeli.',
                'target_audience' => 'Bisnis dengan banyak produk',
                'billing_type' => BillingType::OneTime,
                'timeline_label' => 'Sekitar 3–5 minggu setelah data produk siap',
                'included_items' => [
                    'Katalog dengan kategori',
                    'Pencarian atau filter dasar',
                    'Halaman detail produk',
                    'Inquiry via WhatsApp atau formulir',
                    'Admin pengelolaan produk',
                ],
                'excluded_items' => [
                    'Checkout dan pembayaran online',
                    'Manajemen stok lanjutan',
                    'Sinkronisasi marketplace',
                ],
                'limitations' => [
                    'Hingga 200 produk pada peluncuran awal',
                    'Satu jenis atribut produk',
                    'Import data disepakati terpisah',
                ],
                'revision_policy' => 'Dua putaran revisi desain dan satu putaran penyesuaian alur katalog.',
                'display_order' => 2,
                'status' => ContentStatus::Draft,
            ],
            [
                'name' => 'Custom Application',
                'slug' => 'custom-application',
                'tagline' => 'Aplikasi web yang mengikuti alur kerja organisasi Anda.',
                'target_audience' => 'Startup dan organisasi',
                'billing_type' => BillingType::Custom,
                'timeline_label' => 'Ditentukan setelah discovery',
                'included_items' => [
                    'Discovery dan definisi requirement',
                    'Rancangan UI dan alur pengguna',
                    'Implementasi frontend dan backend',
                    'Hak akses sesuai peran',
                    'Pengujian alur utama',
                ],
                'excluded_items' => [
                    'Infrastruktur produksi di luar kesepakatan',
                    'Lisensi layanan pihak ketiga',
                    'Pengembangan fitur di luar ruang lingkup',
                ],
                'limitations' => [
                    'Ruang lingkup ditulis di penawaran',
                    'Perubahan ruang lingkup dihitung terpisah',
                ],
                'revision_policy' => 'Revisi mengikuti tahapan yang disepakati: desain, implementasi, dan UAT.',
                'is_featured' => true,
                'display_order' => 3,
                'status' => ContentStatus::Published,
                'published_at' => now(),
            ],
            [
                'name' => 'Automation & Integration',
                'slug' => 'automation-integration',
                'tagline' => 'Kurangi pekerjaan manual dengan alur dan integrasi yang tepat.',
                'target_audience' => 'Tim operasional',
                'billing_type' => BillingType::Custom,
                'timeline_label' => 'Ditentukan setelah analisis proses',
                'included_items' => [
                    'Analisis proses dan titik otomasi',
                    'Implementasi workflow atau skrip',
                    'Integrasi API yang disepakati',
                    'Log dan notifikasi kegagalan',
                    'Dokumentasi operasional',
                ],
                'excluded_items' => [
                    'Biaya langganan layanan pihak ketiga',
                    'Perawatan bulanan setelah masa garansi',
                ],
                'limitations' => [
                    'Jumlah proses ditulis di penawaran',
                    'Ketergantungan pada API pihak ketiga',
                ],
                'revision_policy' => 'Satu putaran penyesuaian setelah uji coba pada data nyata.',
                'display_order' => 4,
                'status' => ContentStatus::Published,
                'published_at' => now(),
            ],
            [
                'name' => 'Care & Maintenance',
                'slug' => 'care-maintenance',
                'tagline' => 'Dukungan berkala agar aplikasi tetap sehat setelah diluncurkan.',
                'target_audience' => 'Klien existing',
                'billing_type' => BillingType::Monthly,
                'timeline_label' => 'Bulanan',
                'included_items' => [
                    'Perbaikan bug',
                    'Pembaruan dependensi',
                    'Pengecekan rutin',
                    'Bantuan teknis sesuai SLA',
                ],
                'excluded_items' => [
                    'Pengembangan fitur baru',
                    'Perubahan desain besar',
                ],
                'limitations' => [
                    'Jam dukungan dan waktu respons ditulis di perjanjian',
                ],
                'revision_policy' => 'Tidak berlaku; lingkup diatur melalui perjanjian layanan.',
                'display_order' => 5,
                'status' => ContentStatus::Draft,
            ],
        ];

        foreach ($packages as $package) {
            Package::query()->updateOrCreate(
                ['slug' => $package['slug']],
                array_merge([
                    'currency' => 'IDR',
                    'price_amount' => null,
                    'price_label' => null,
                    'is_featured' => false,
                    'meta_title' => null,
                    'meta_description' => null,
                    'published_at' => null,
                ], $package),
            );
        }
    }
}
