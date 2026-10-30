<?php

namespace Database\Seeders;

use App\Enums\ContentStatus;
use App\Models\Service;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        $process = [
            ['title' => 'Discover', 'description' => 'Memetakan masalah, pengguna, batasan, dan kriteria keberhasilan.'],
            ['title' => 'Plan', 'description' => 'Menyusun ruang lingkup, prioritas, estimasi, dan pembagian pekerjaan.'],
            ['title' => 'Build', 'description' => 'Implementasi bertahap dengan pembaruan progres yang bisa diikuti.'],
            ['title' => 'Test', 'description' => 'Pengujian fungsi, validasi input, dan pengecekan lintas perangkat.'],
            ['title' => 'Launch', 'description' => 'Deploy, konfigurasi domain, dan serah terima akses serta dokumentasi.'],
            ['title' => 'Improve', 'description' => 'Perbaikan lanjutan dan pengembangan fitur berdasarkan kebutuhan nyata.'],
        ];

        $services = [
            [
                'title' => 'Website & Landing Page',
                'slug' => 'web-development',
                'summary' => 'Website yang cepat, responsif, dan mudah diperbarui untuk memperkenalkan bisnis atau produk.',
                'description' => 'Cocok untuk bisnis yang membutuhkan kehadiran digital pertama: profil singkat, penjelasan produk atau layanan, dan jalur kontak yang jelas. Struktur halaman dirancang agar pengunjung menemukan informasi penting tanpa banyak klik.',
                'icon_name' => 'layout-template',
                'deliverables' => ['Desain halaman responsif', 'Implementasi frontend dan CMS', 'SEO dasar dan metadata', 'Formulir kontak', 'Panduan pengelolaan konten'],
                'technologies' => ['Laravel', 'React', 'Tailwind CSS', 'MySQL'],
                'cost_factors' => 'Jumlah halaman, kebutuhan desain khusus, integrasi formulir atau WhatsApp, kebutuhan multibahasa, dan kesiapan konten.',
            ],
            [
                'title' => 'Company Profile & Product Catalog',
                'slug' => 'company-profile-catalog',
                'summary' => 'Company profile dengan katalog produk yang dapat dikelola sendiri tanpa menyentuh kode.',
                'description' => 'Untuk bisnis yang perlu menjelaskan siapa mereka sekaligus memamerkan produk atau layanan. Katalog dilengkapi kategori, pencarian atau filter, dan jalur inquiry agar calon pembeli dapat langsung menghubungi tim.',
                'icon_name' => 'building-2',
                'deliverables' => ['Halaman profil dan layanan', 'Katalog produk dengan kategori', 'Pencarian atau filter dasar', 'Inquiry via WhatsApp atau form', 'Admin untuk mengelola produk'],
                'technologies' => ['Laravel', 'React', 'MySQL', 'Tailwind CSS'],
                'cost_factors' => 'Jumlah produk, variasi atribut produk, kebutuhan gambar, dan alur inquiry yang diinginkan.',
            ],
            [
                'title' => 'Custom Web Application',
                'slug' => 'custom-web-application',
                'summary' => 'Aplikasi web yang dibangun mengikuti alur kerja organisasi, bukan memaksa proses menyesuaikan template.',
                'description' => 'Untuk kebutuhan operasional yang tidak tercakup tools umum: manajemen data, alur persetujuan, dashboard internal, atau portal khusus. Pengerjaan dimulai dari pemetaan proses dan definisi ruang lingkup yang jelas.',
                'icon_name' => 'app-window',
                'deliverables' => ['Discovery dan pemetaan alur', 'Rancangan data dan arsitektur', 'Implementasi frontend dan backend', 'Hak akses berbasis peran', 'Pengujian dan dokumentasi'],
                'technologies' => ['Laravel', 'React', 'TypeScript', 'MySQL', 'REST API'],
                'cost_factors' => 'Jumlah modul, kompleksitas aturan bisnis, kebutuhan integrasi, jumlah peran pengguna, dan kebutuhan migrasi data lama.',
            ],
            [
                'title' => 'API Development & Integration',
                'slug' => 'api-integration',
                'summary' => 'API dan integrasi yang menghubungkan sistem yang sudah Anda gunakan agar data tidak berpindah manual.',
                'description' => 'Mencakup pembuatan API untuk aplikasi internal maupun pihak ketiga, serta integrasi dengan layanan pembayaran, pesan, atau sistem lain. Setiap endpoint didokumentasikan agar tim lain dapat menggunakannya.',
                'icon_name' => 'plug',
                'deliverables' => ['Desain kontrak API', 'Implementasi endpoint dan autentikasi', 'Validasi dan penanganan error', 'Dokumentasi API', 'Pengujian integrasi'],
                'technologies' => ['Laravel', 'REST API', 'MySQL', 'Docker'],
                'cost_factors' => 'Ketersediaan dokumentasi API pihak ketiga, kompleksitas autentikasi, volume data, dan kebutuhan sinkronisasi dua arah.',
            ],
            [
                'title' => 'Business Process Automation',
                'slug' => 'automation',
                'summary' => 'Otomasi pekerjaan berulang agar tim menghemat waktu dan mengurangi kesalahan input.',
                'description' => 'Dimulai dengan memetakan proses yang menyita waktu, lalu memilih bagian yang layak diotomasi. Hasilnya dapat berupa skrip terjadwal, integrasi antar aplikasi, atau dashboard pemantauan.',
                'icon_name' => 'workflow',
                'deliverables' => ['Analisis proses dan titik otomasi', 'Implementasi workflow atau skrip', 'Integrasi dengan sistem terkait', 'Log dan notifikasi kegagalan', 'Dokumentasi operasional'],
                'technologies' => ['Laravel', 'Python', 'Node.js', 'Docker'],
                'cost_factors' => 'Jumlah proses, frekuensi eksekusi, kebutuhan integrasi, dan tingkat penanganan pengecualian yang diperlukan.',
            ],
            [
                'title' => 'Quality Assurance & Test Automation',
                'slug' => 'quality-assurance',
                'summary' => 'Pengujian terstruktur dan otomasi test untuk menjaga kualitas saat fitur terus bertambah.',
                'description' => 'Mencakup penyusunan skenario pengujian, pengujian manual terarah, dan otomasi test untuk alur penting. Cocok untuk tim yang ingin merilis lebih sering tanpa menambah risiko regresi.',
                'icon_name' => 'shield-check',
                'deliverables' => ['Test plan dan skenario', 'Pengujian manual alur kritis', 'Otomasi end-to-end', 'Laporan temuan', 'Rekomendasi perbaikan'],
                'technologies' => ['Pest', 'Playwright', 'GitHub Actions'],
                'cost_factors' => 'Jumlah alur kritis, jumlah perangkat atau browser yang perlu dicakup, dan kondisi kode yang sudah ada.',
            ],
            [
                'title' => 'Maintenance & Technical Support',
                'slug' => 'maintenance',
                'summary' => 'Perawatan berkala, perbaikan bug, dan dukungan teknis setelah produk diluncurkan.',
                'description' => 'Untuk menjaga aplikasi tetap berjalan: pembaruan dependensi, pengecekan rutin, perbaikan bug, dan bantuan teknis sesuai kesepakatan. Lingkup dan waktu respons ditulis jelas di awal.',
                'icon_name' => 'life-buoy',
                'deliverables' => ['Pengecekan rutin', 'Perbaikan bug', 'Pembaruan dependensi', 'Backup terpantau', 'Laporan berkala'],
                'technologies' => ['Laravel', 'MySQL', 'Docker'],
                'cost_factors' => 'Ukuran aplikasi, frekuensi rilis, SLA respons yang diminta, dan apakah termasuk pengembangan fitur baru.',
            ],
        ];

        foreach ($services as $index => $data) {
            Service::query()->updateOrCreate(
                ['slug' => $data['slug']],
                array_merge($data, [
                    'process' => $process,
                    'faqs' => [
                        [
                            'question' => 'Berapa lama pengerjaannya?',
                            'answer' => 'Durasi bergantung pada ruang lingkup yang disepakati. Estimasi rentang waktu diberikan setelah kebutuhan dipahami, bukan sebelum diskusi.',
                        ],
                        [
                            'question' => 'Apakah source code menjadi milik klien?',
                            'answer' => 'Kepemilikan source code dan hak penggunaan disepakati di awal proyek dan ditulis dalam penawaran.',
                        ],
                    ],
                    'is_featured' => $index < 4,
                    'display_order' => $index,
                    'status' => ContentStatus::Published,
                    'published_at' => now(),
                ]),
            );
        }
    }
}
