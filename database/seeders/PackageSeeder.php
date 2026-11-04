<?php

namespace Database\Seeders;

use App\Enums\BillingType;
use App\Enums\ContentStatus;
use App\Models\Package;
use Illuminate\Database\Seeder;

/**
 * Harga di bawah adalah titik awal ("mulai dari") yang diposisikan terhadap
 * rentang pasar Fastwork 2026: landing page Rp 1–3 jt, company profile
 * Rp 3–7 jt, katalog/toko online Rp 5–15 jt, aplikasi custom Rp 6–20 jt+,
 * otomasi Rp 0,35–7,5 jt, dan maintenance Rp 0,25–1,5 jt per bulan.
 *
 * Angka ini bukan klaim harga pasar dan bukan harga final. Setiap paket
 * menjelaskan batas ruang lingkup agar calon klien bisa membandingkan.
 */
class PackageSeeder extends Seeder
{
    public function run(): void
    {
        $packages = [
            [
                'name' => 'Landing Page Starter',
                'slug' => 'starter-website',
                'tagline' => 'Satu halaman fokus untuk memperkenalkan penawaran dan mengarahkan pengunjung ke kontak.',
                'target_audience' => 'UMKM, personal brand, dan peluncuran produk',
                'billing_type' => BillingType::OneTime,
                'price_amount' => 1_500_000,
                'timeline_label' => '7–10 hari kerja setelah konten siap',
                'included_items' => [
                    'Satu landing page dengan hingga 6 section',
                    'Desain responsif untuk mobile dan desktop',
                    'Formulir kontak atau tombol WhatsApp',
                    'SEO dasar: title, meta description, sitemap, dan Open Graph',
                    'Analytics dan pelacakan klik tombol utama',
                    'Panduan penggunaan dan serah terima akses',
                ],
                'excluded_items' => [
                    'Domain, hosting, dan langganan layanan pihak ketiga',
                    'Copywriting, foto produk, dan aset berlisensi',
                    'Integrasi pembayaran atau sistem akun pengguna',
                ],
                'limitations' => [
                    'Satu halaman, bukan microsite multi-halaman',
                    'Maksimal 6 section dan satu bahasa',
                    'Satu putaran revisi desain',
                ],
                'revision_policy' => 'Satu putaran revisi desain dan satu putaran penyempurnaan setelah implementasi. Perubahan struktur setelah desain disetujui dihitung sebagai lingkup tambahan.',
                'meta_title' => 'Jasa Landing Page untuk UMKM & Personal Brand',
                'meta_description' => 'Jasa pembuatan landing page responsif untuk UMKM dan personal brand. Mulai Rp 1.500.000, termasuk SEO dasar, formulir kontak, dan panduan penggunaan.',
            ],
            [
                'name' => 'Company Profile Bisnis',
                'slug' => 'business-presence',
                'tagline' => 'Company profile yang menjelaskan bisnis, layanan, dan alasan calon pelanggan menghubungi Anda.',
                'target_audience' => 'UMKM, perusahaan jasa, dan bisnis lokal',
                'billing_type' => BillingType::OneTime,
                'price_amount' => 3_500_000,
                'timeline_label' => '2–4 minggu setelah materi dan konten siap',
                'included_items' => [
                    'Hingga 6 halaman: beranda, tentang, layanan, portofolio, kontak, dan satu halaman tambahan',
                    'Struktur konten dan navigasi',
                    'Formulir kontak dengan notifikasi email',
                    'SEO teknis dasar dan metadata per halaman',
                    'Admin untuk memperbarui halaman dan konten',
                    'Panduan pengelolaan konten',
                ],
                'excluded_items' => [
                    'Katalog produk dengan keranjang atau checkout',
                    'Sistem akun pengguna dan dashboard internal',
                    'Copywriting mendalam dan sesi foto',
                    'Domain, hosting, dan email bisnis',
                ],
                'limitations' => [
                    'Hingga 6 halaman dan satu bahasa',
                    'Maksimal 12 gambar unggulan',
                    'Dua putaran revisi desain',
                ],
                'revision_policy' => 'Dua putaran revisi pada tahap desain dan satu putaran penyempurnaan setelah implementasi. Revisi di luar ruang lingkup awal dihitung terpisah.',
                'is_featured' => true,
                'meta_title' => 'Jasa Company Profile Website untuk Bisnis',
                'meta_description' => 'Jasa company profile website untuk UMKM dan perusahaan jasa. Mulai Rp 3.500.000: hingga 6 halaman, formulir kontak, admin konten, dan SEO dasar.',
            ],
            [
                'name' => 'Katalog Produk',
                'slug' => 'product-catalog',
                'tagline' => 'Katalog produk yang rapi, mudah difilter, dan mengarahkan calon pembeli ke jalur inquiry.',
                'target_audience' => 'Toko online, distributor, dan bisnis dengan banyak produk',
                'billing_type' => BillingType::OneTime,
                'price_amount' => 5_500_000,
                'timeline_label' => '3–5 minggu setelah data produk siap',
                'included_items' => [
                    'Halaman katalog dengan kategori dan pencarian',
                    'Halaman detail produk dengan galeri gambar',
                    'Filter dasar berdasarkan kategori atau atribut',
                    'Tombol inquiry WhatsApp dan formulir produk',
                    'Admin pengelolaan produk, kategori, dan gambar',
                    'SEO produk dan sitemap',
                    'Import data produk awal hingga 100 item',
                ],
                'excluded_items' => [
                    'Checkout, keranjang, dan pembayaran online',
                    'Manajemen stok, ongkir, dan sinkronisasi marketplace',
                    'Akun pembeli dan riwayat pesanan',
                ],
                'limitations' => [
                    'Hingga 200 produk pada peluncuran awal',
                    'Satu jenis atribut produk',
                    'Satu bahasa dan satu mata uang',
                ],
                'revision_policy' => 'Dua putaran revisi desain dan satu putaran penyesuaian alur katalog. Perubahan model data setelah implementasi dihitung terpisah.',
                'meta_title' => 'Jasa Katalog Produk Online dengan Admin',
                'meta_description' => 'Jasa katalog produk online dengan kategori, filter, dan admin. Mulai Rp 5.500.000, tanpa checkout; cocok untuk distributor dan toko.',
            ],
            [
                'name' => 'Aplikasi Web Custom',
                'slug' => 'custom-application',
                'tagline' => 'Aplikasi web yang mengikuti alur kerja tim Anda, bukan memaksa proses menyesuaikan template.',
                'target_audience' => 'Startup, organisasi, dan tim operasional',
                'billing_type' => BillingType::Custom,
                'price_amount' => null,
                'price_label' => 'Mulai dari Rp 12.000.000',
                'timeline_label' => 'Ditentukan setelah discovery dan ruang lingkup disepakati',
                'included_items' => [
                    'Discovery, pemetaan alur, dan definisi ruang lingkup',
                    'Rancangan data, arsitektur, dan UI',
                    'Implementasi frontend dan backend',
                    'Autentikasi dan hak akses berbasis peran',
                    'Pengujian alur utama dan dokumentasi serah terima',
                    'Satu kali pendampingan setelah peluncuran',
                ],
                'excluded_items' => [
                    'Infrastruktur produksi dan biaya layanan pihak ketiga',
                    'Pengembangan fitur di luar ruang lingkup',
                    'Migrasi data lama tanpa kesepakatan terpisah',
                ],
                'limitations' => [
                    'Ruang lingkup, jumlah modul, dan jumlah peran ditulis di penawaran',
                    'Perubahan ruang lingkup dihitung terpisah',
                    'Harga awal bukan harga final untuk semua kebutuhan',
                ],
                'revision_policy' => 'Revisi mengikuti tahap yang disepakati: desain, implementasi, dan UAT. Perubahan setelah UAT masuk sebagai pekerjaan tambahan.',
                'is_featured' => true,
                'meta_title' => 'Jasa Aplikasi Web Custom Laravel & React',
                'meta_description' => 'Jasa aplikasi web custom untuk dashboard, portal, dan sistem internal. Mulai Rp 12.000.000 setelah discovery, dengan ruang lingkup dan hak akses yang jelas.',
            ],
            [
                'name' => 'Otomasi & Integrasi',
                'slug' => 'automation-integration',
                'tagline' => 'Hubungkan aplikasi dan hilangkan input ulang agar tim fokus pada pekerjaan yang bernilai.',
                'target_audience' => 'Tim operasional, keuangan, dan customer service',
                'billing_type' => BillingType::OneTime,
                'price_amount' => 2_500_000,
                'timeline_label' => '1–3 minggu setelah alur dan akses API tersedia',
                'included_items' => [
                    'Analisis satu alur kerja dan titik otomasi',
                    'Implementasi hingga 2 workflow',
                    'Integrasi hingga 3 layanan melalui API atau webhook',
                    'Penanganan error dasar dan notifikasi kegagalan',
                    'Dokumentasi alur dan panduan operasional',
                ],
                'excluded_items' => [
                    'Biaya langganan API, kredit AI, dan layanan pihak ketiga',
                    'Perawatan bulanan setelah masa garansi',
                    'Otomasi proses di luar alur yang disepakati',
                ],
                'limitations' => [
                    'Maksimal 2 workflow dan 3 integrasi',
                    'Ketersediaan API pihak ketiga memengaruhi lingkup',
                    'Tidak termasuk pembuatan aplikasi baru',
                ],
                'revision_policy' => 'Satu putaran penyesuaian setelah uji coba pada data nyata. Perubahan alur setelah uji coba dihitung terpisah.',
                'meta_title' => 'Jasa Otomasi Bisnis & Integrasi API',
                'meta_description' => 'Jasa otomasi alur kerja dan integrasi API. Mulai Rp 2.500.000 untuk 2 workflow dan 3 integrasi, termasuk dokumentasi dan penanganan error.',
            ],
            [
                'name' => 'Maintenance Bulanan',
                'slug' => 'care-maintenance',
                'tagline' => 'Perawatan rutin agar website tetap aman, cepat, dan bisa diandalkan setelah diluncurkan.',
                'target_audience' => 'Pemilik website dan aplikasi yang sudah berjalan',
                'billing_type' => BillingType::Monthly,
                'price_amount' => 450_000,
                'timeline_label' => 'Minimum 3 bulan',
                'included_items' => [
                    'Pemantauan uptime dan pengecekan berkala',
                    'Pembaruan dependensi dan patch keamanan',
                    'Perbaikan bug ringan hingga 3 jam per bulan',
                    'Backup terpantau dan uji restore dasar',
                    'Laporan bulanan kondisi website',
                    'Bantuan teknis melalui WhatsApp pada jam kerja',
                ],
                'excluded_items' => [
                    'Pengembangan fitur baru dan perubahan desain besar',
                    'Biaya hosting, domain, dan layanan pihak ketiga',
                    'Pemulihan darurat akibat kelalaian pihak lain',
                ],
                'limitations' => [
                    'Minimum 3 bulan berlangganan',
                    'Maksimal 3 jam pekerjaan per bulan; kelebihan dihitung terpisah',
                    'Waktu respons mengikuti jam kerja, bukan 24/7',
                ],
                'revision_policy' => 'Tidak berlaku. Lingkup pekerjaan dan waktu respons diatur dalam perjanjian layanan bulanan.',
                'meta_title' => 'Jasa Maintenance Website Bulanan',
                'meta_description' => 'Jasa perawatan website bulanan mulai Rp 450.000: pembaruan, backup, pemantauan uptime, perbaikan bug ringan, dan laporan bulanan. Minimum 3 bulan.',
            ],
        ];

        $addons = [
            'starter-website' => [
                [
                    'name' => 'Copywriting landing page',
                    'description' => 'Riset singkat dan penulisan copy untuk hingga 6 section, termasuk headline dan call-to-action.',
                    'price_amount' => 750_000,
                    'price_label' => 'Rp 750.000',
                ],
                [
                    'name' => 'Setup domain & hosting',
                    'description' => 'Konfigurasi domain, SSL, dan deployment awal. Biaya domain dan hosting dibayar terpisah.',
                    'price_amount' => 300_000,
                    'price_label' => 'Rp 300.000',
                ],
                [
                    'name' => 'Integrasi WhatsApp Business',
                    'description' => 'Pemasangan tombol dan pesan pembuka WhatsApp yang membawa konteks halaman.',
                    'price_amount' => 500_000,
                    'price_label' => 'Rp 500.000',
                ],
            ],
            'business-presence' => [
                [
                    'name' => 'Halaman tambahan',
                    'description' => 'Satu halaman statis tambahan dengan desain mengikuti sistem yang sudah dibuat.',
                    'price_amount' => 500_000,
                    'price_label' => 'Rp 500.000 / halaman',
                ],
                [
                    'name' => 'Copywriting halaman',
                    'description' => 'Penulisan konten untuk satu halaman, berdasarkan informasi dan wawancara singkat.',
                    'price_amount' => 300_000,
                    'price_label' => 'Rp 300.000 / halaman',
                ],
                [
                    'name' => 'Setup email bisnis',
                    'description' => 'Konfigurasi DNS dan kotak email di penyedia pilihan klien. Biaya langganan terpisah.',
                    'price_amount' => 400_000,
                    'price_label' => 'Rp 400.000',
                ],
                [
                    'name' => 'Pelatihan admin',
                    'description' => 'Sesi daring 60 menit untuk mengelola halaman, gambar, dan konten website.',
                    'price_amount' => 350_000,
                    'price_label' => 'Rp 350.000 / sesi',
                ],
            ],
            'product-catalog' => [
                [
                    'name' => 'Import data produk',
                    'description' => 'Pembersihan dan import hingga 200 produk dari spreadsheet ke katalog.',
                    'price_amount' => 750_000,
                    'price_label' => 'Rp 750.000',
                ],
                [
                    'name' => 'Integrasi payment gateway',
                    'description' => 'Penambahan checkout dan pembayaran online. Biaya transaksi pihak ketiga terpisah.',
                    'price_amount' => 2_500_000,
                    'price_label' => 'Mulai dari Rp 2.500.000',
                ],
                [
                    'name' => 'Halaman tambahan',
                    'description' => 'Satu halaman statis tambahan di luar struktur katalog.',
                    'price_amount' => 500_000,
                    'price_label' => 'Rp 500.000 / halaman',
                ],
            ],
            'custom-application' => [
                [
                    'name' => 'Discovery tambahan',
                    'description' => 'Workshop tambahan untuk modul, pemangku kepentingan, atau aturan bisnis baru.',
                    'price_amount' => 1_500_000,
                    'price_label' => 'Rp 1.500.000 / sesi',
                ],
                [
                    'name' => 'Integrasi payment gateway',
                    'description' => 'Integrasi pembayaran online ke dalam aplikasi. Biaya transaksi pihak ketiga terpisah.',
                    'price_amount' => 2_500_000,
                    'price_label' => 'Mulai dari Rp 2.500.000',
                ],
                [
                    'name' => 'Pelatihan tim',
                    'description' => 'Sesi daring 90 menit untuk admin dan pengguna utama aplikasi.',
                    'price_amount' => 500_000,
                    'price_label' => 'Rp 500.000 / sesi',
                ],
            ],
            'automation-integration' => [
                [
                    'name' => 'Workflow tambahan',
                    'description' => 'Satu alur otomasi tambahan dengan trigger dan aksi yang disepakati.',
                    'price_amount' => 750_000,
                    'price_label' => 'Rp 750.000 / workflow',
                ],
                [
                    'name' => 'Integrasi API tambahan',
                    'description' => 'Satu integrasi tambahan ke layanan yang memiliki API atau webhook.',
                    'price_amount' => 600_000,
                    'price_label' => 'Rp 600.000 / integrasi',
                ],
                [
                    'name' => 'Monitoring & alert',
                    'description' => 'Pemantauan eksekusi workflow dan notifikasi otomatis saat terjadi kegagalan.',
                    'price_amount' => 500_000,
                    'price_label' => 'Rp 500.000',
                ],
            ],
            'care-maintenance' => [
                [
                    'name' => 'Jam dukungan tambahan',
                    'description' => 'Tambahan waktu pengerjaan di luar kuota bulanan, dihitung per jam.',
                    'price_amount' => 150_000,
                    'price_label' => 'Rp 150.000 / jam',
                ],
                [
                    'name' => 'Update konten bulanan',
                    'description' => 'Bantuan memperbarui konten ringan hingga 5 item per bulan.',
                    'price_amount' => 250_000,
                    'price_label' => 'Rp 250.000 / bulan',
                ],
                [
                    'name' => 'Audit keamanan',
                    'description' => 'Pemeriksaan konfigurasi, dependensi, dan celah umum dengan laporan temuan.',
                    'price_amount' => 1_000_000,
                    'price_label' => 'Rp 1.000.000 / audit',
                ],
            ],
        ];

        foreach ($packages as $index => $data) {
            $package = Package::query()->firstOrNew(['slug' => $data['slug']]);

            $package->fill(array_merge([
                'currency' => 'IDR',
                'price_amount' => null,
                'price_label' => null,
                'is_featured' => false,
                'display_order' => $index,
                'status' => ContentStatus::Published,
                'meta_title' => null,
                'meta_description' => null,
            ], $data));

            if ($package->status === ContentStatus::Published && blank($package->published_at)) {
                $package->published_at = now();
            }

            $package->save();

            foreach ($addons[$package->slug] ?? [] as $addon) {
                $package->addons()->updateOrCreate(
                    ['name' => $addon['name']],
                    array_merge($addon, ['is_active' => true]),
                );
            }
        }
    }
}
