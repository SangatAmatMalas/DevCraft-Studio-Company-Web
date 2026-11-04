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

        $commonFaqs = [
            [
                'question' => 'Berapa kisaran biayanya?',
                'answer' => 'Harga awal setiap paket tercantum di halaman Paket, mulai dari landing page hingga aplikasi custom. Angka tersebut adalah titik awal berdasarkan ruang lingkup standar, bukan harga final. Penawaran disusun setelah kebutuhan dan batasan dipahami. Domain, hosting, dan layanan pihak ketiga dihitung terpisah.',
            ],
            [
                'question' => 'Berapa lama pengerjaannya?',
                'answer' => 'Landing page umumnya 7–10 hari kerja, company profile 2–4 minggu, dan katalog 3–5 minggu setelah data siap. Aplikasi custom dan otomasi mengikuti hasil discovery. Estimasi diberikan sebagai rentang, bukan tanggal pasti, karena perubahan ruang lingkup memengaruhi durasi.',
            ],
            [
                'question' => 'Apakah source code menjadi milik klien?',
                'answer' => 'Kepemilikan source code dan hak penggunaan disepakati di awal proyek dan ditulis dalam penawaran. Tidak ada klaim kepemilikan yang tidak tercantum di perjanjian.',
            ],
            [
                'question' => 'Apakah harga sudah termasuk domain dan hosting?',
                'answer' => 'Belum, kecuali disebutkan lain di penawaran. Domain, hosting, email bisnis, API berbayar, dan langganan pihak ketiga dibayar terpisah oleh klien atau ditagihkan sesuai kesepakatan.',
            ],
        ];

        $services = [
            [
                'title' => 'Pembuatan Website & Landing Page',
                'slug' => 'web-development',
                'summary' => 'Pembuatan website dan landing page responsif untuk UMKM, personal brand, dan peluncuran produk. Fokus pada struktur konten yang jelas, kecepatan, dan jalur konversi.',
                'description' => "Landing page yang baik bukan sekadar halaman yang terlihat modern. Strukturnya harus menjelaskan penawaran, membangun kepercayaan, dan mengarahkan pengunjung ke satu tindakan yang jelas.\n\nKami menyusun halaman berdasarkan tujuan konversi: memperkenalkan layanan, mengumpulkan leads, atau membuka jalur WhatsApp. Implementasi mencakup desain responsif, SEO dasar, dan pengukuran sederhana agar Anda tahu halaman mana yang bekerja.\n\nCocok untuk UMKM, freelancer, personal brand, dan tim yang baru meluncurkan produk atau layanan.",
                'icon_name' => 'layout-template',
                'deliverables' => [
                    'Landing page hingga 6 section',
                    'Desain responsif mobile dan desktop',
                    'Formulir kontak atau tombol WhatsApp',
                    'SEO dasar dan Open Graph',
                    'Analytics dan pelacakan klik utama',
                    'Panduan penggunaan',
                ],
                'technologies' => ['Laravel', 'React', 'TypeScript', 'Tailwind CSS', 'MySQL'],
                'cost_factors' => 'Jumlah section, kebutuhan copywriting, integrasi formulir atau WhatsApp, kebutuhan multibahasa, dan kesiapan aset. Harga awal mengikuti paket Landing Page Starter; penawaran final menyesuaikan ruang lingkup.',
                'faqs' => array_merge($commonFaqs, [
                    [
                        'question' => 'Apakah bisa menggunakan desain yang sudah ada?',
                        'answer' => 'Bisa. Kami dapat mengimplementasikan desain yang sudah disiapkan, dengan penyesuaian agar tetap responsif dan mudah diakses. Jika belum ada desain, kami menyusunnya berdasarkan struktur konten dan tujuan halaman.',
                    ],
                ]),
                'meta_title' => 'Jasa Pembuatan Website & Landing Page',
                'meta_description' => 'Jasa pembuatan landing page dan website responsif untuk UMKM dan personal brand. Termasuk struktur konten, SEO dasar, formulir kontak, dan panduan penggunaan.',
            ],
            [
                'title' => 'Pembuatan Company Profile & Katalog Produk',
                'slug' => 'company-profile-catalog',
                'summary' => 'Website company profile dan katalog produk yang dapat dikelola sendiri, dengan struktur navigasi jelas dan jalur inquiry yang terukur.',
                'description' => "Company profile berfungsi menjawab pertanyaan calon pelanggan: siapa Anda, apa yang ditawarkan, dan mengapa layak dipilih. Kami menyusun halaman profil, layanan, portofolio, dan kontak agar informasi penting mudah ditemukan.\n\nUntuk bisnis dengan banyak produk, kami menambahkan katalog dengan kategori, pencarian, dan halaman detail. Admin memungkinkan tim memperbarui produk tanpa menyentuh kode.\n\nJika Anda membutuhkan checkout dan pembayaran online, kebutuhan tersebut dibahas sebagai ruang lingkup terpisah agar estimasi tetap akurat.",
                'icon_name' => 'building-2',
                'deliverables' => [
                    'Hingga 6 halaman company profile',
                    'Katalog dengan kategori dan pencarian',
                    'Halaman detail produk',
                    'Admin produk dan konten',
                    'Formulir inquiry dan WhatsApp',
                    'SEO per halaman dan sitemap',
                ],
                'technologies' => ['Laravel', 'React', 'TypeScript', 'MySQL', 'Tailwind CSS'],
                'cost_factors' => 'Jumlah halaman, jumlah produk, variasi atribut, kebutuhan import data, alur inquiry, dan apakah checkout pembayaran termasuk. Harga awal mengikuti paket Company Profile Bisnis atau Katalog Produk.',
                'faqs' => array_merge($commonFaqs, [
                    [
                        'question' => 'Apakah katalog bisa terhubung ke marketplace?',
                        'answer' => 'Sinkronisasi marketplace bukan bagian dari paket awal. Jika dibutuhkan, kami menilai ketersediaan API marketplace tersebut dan menyusun ruang lingkup terpisah sebelum memberi estimasi.',
                    ],
                ]),
                'meta_title' => 'Jasa Company Profile & Katalog Produk Online',
                'meta_description' => 'Jasa pembuatan website company profile dan katalog produk dengan admin, kategori, pencarian, dan jalur inquiry WhatsApp. Cocok untuk UMKM dan distributor.',
            ],
            [
                'title' => 'Pengembangan Aplikasi Web Custom',
                'slug' => 'custom-web-application',
                'summary' => 'Pengembangan aplikasi web custom untuk dashboard, portal, dan sistem internal yang mengikuti alur kerja organisasi.',
                'description' => "Tools generik sering memaksa tim menyesuaikan proses dengan fitur yang tersedia. Aplikasi custom dibangun dari alur kerja yang benar-benar Anda jalankan, dengan data dan hak akses yang sesuai.\n\nPengerjaan dimulai dari discovery: memetakan aktor, alur, aturan bisnis, dan kriteria keberhasilan. Dari situ kami menyusun ruang lingkup, rancangan data, dan prioritas rilis.\n\nContoh kebutuhan yang umum: dashboard operasional, portal pelanggan, sistem persetujuan, manajemen inventaris, dan alat internal yang terhubung ke layanan lain.",
                'icon_name' => 'app-window',
                'deliverables' => [
                    'Discovery dan peta alur',
                    'Rancangan data dan arsitektur',
                    'UI dan implementasi frontend',
                    'Backend, autentikasi, dan hak akses',
                    'Pengujian alur utama',
                    'Dokumentasi dan serah terima',
                ],
                'technologies' => ['Laravel', 'React', 'TypeScript', 'MySQL', 'REST API', 'Docker'],
                'cost_factors' => 'Jumlah modul, kompleksitas aturan bisnis, jumlah peran pengguna, kebutuhan integrasi, migrasi data lama, dan tingkat keamanan. Harga awal aplikasi custom tercantum pada paket Aplikasi Web Custom; angka final ditentukan setelah discovery.',
                'faqs' => array_merge($commonFaqs, [
                    [
                        'question' => 'Bagaimana jika kebutuhan berubah di tengah proyek?',
                        'answer' => 'Perubahan ruang lingkup dibahas sebagai pekerjaan tambahan dengan estimasi terpisah. Kami tidak menaikkan harga secara sepihak tanpa persetujuan tertulis.',
                    ],
                ]),
                'meta_title' => 'Jasa Pengembangan Aplikasi Web Custom',
                'meta_description' => 'Jasa pengembangan aplikasi web custom untuk dashboard, portal, dan sistem internal. Discovery, ruang lingkup, hak akses, dan estimasi yang jelas.',
            ],
            [
                'title' => 'Pengembangan API & Integrasi Sistem',
                'slug' => 'api-integration',
                'summary' => 'Pengembangan API dan integrasi sistem untuk menghubungkan aplikasi, pembayaran, dan layanan pihak ketiga tanpa input manual berulang.',
                'description' => "Data yang berpindah manual antar aplikasi menciptakan keterlambatan dan kesalahan. API dan integrasi yang dirancang baik membuat data mengalir dengan aturan yang jelas.\n\nKami mendokumentasikan kontrak API, menangani autentikasi dan validasi, serta menyiapkan log agar kegagalan mudah ditelusuri. Integrasi dapat menghubungkan aplikasi internal, payment gateway, layanan pengiriman, CRM, atau sistem lain yang memiliki API.\n\nSetiap endpoint diuji dan diserahkan bersama dokumentasi agar tim lain dapat menggunakannya.",
                'icon_name' => 'plug',
                'deliverables' => [
                    'Desain kontrak API',
                    'Implementasi endpoint dan autentikasi',
                    'Validasi dan penanganan error',
                    'Integrasi layanan pihak ketiga',
                    'Log dan pemantauan dasar',
                    'Dokumentasi API',
                ],
                'technologies' => ['Laravel', 'REST API', 'MySQL', 'Docker', 'Webhook'],
                'cost_factors' => 'Kualitas dokumentasi API pihak ketiga, kompleksitas autentikasi, volume data, kebutuhan sinkronisasi dua arah, dan lingkungan uji yang tersedia. Integrasi sederhana dimulai dari paket Otomasi & Integrasi.',
                'faqs' => array_merge($commonFaqs, [
                    [
                        'question' => 'Bagaimana jika API pihak ketiga tidak memiliki dokumentasi?',
                        'answer' => 'Kami melakukan penelusuran awal untuk menilai kelayakan. Jika API tidak dapat diakses atau berubah tanpa pemberitahuan, risiko tersebut disampaikan sebelum pekerjaan dimulai.',
                    ],
                ]),
                'meta_title' => 'Jasa Pengembangan API & Integrasi Sistem',
                'meta_description' => 'Jasa pembuatan API dan integrasi sistem untuk payment gateway, CRM, dan aplikasi internal. Termasuk kontrak API, autentikasi, validasi, log, dan dokumentasi.',
            ],
            [
                'title' => 'Otomasi Proses Bisnis',
                'slug' => 'automation',
                'summary' => 'Otomasi proses bisnis untuk mengurangi pekerjaan berulang, mempercepat respons, dan menekan kesalahan input.',
                'description' => "Otomasi yang berguna dimulai dari proses yang jelas, bukan dari tools yang sedang populer. Kami memetakan alur kerja, mengukur titik yang paling menyita waktu, lalu memilih bagian yang layak diotomasi.\n\nHasilnya bisa berupa workflow terjadwal, integrasi antar aplikasi, notifikasi otomatis, atau dashboard pemantauan. Setiap alur dilengkapi penanganan error agar kegagalan tidak berlalu tanpa diketahui.\n\nContoh: data formulir masuk otomatis ke spreadsheet dan CRM, invoice terkirim sesuai jadwal, atau tim menerima notifikasi saat stok menipis.",
                'icon_name' => 'workflow',
                'deliverables' => [
                    'Analisis proses dan titik otomasi',
                    'Hingga 2 workflow awal',
                    'Integrasi hingga 3 layanan',
                    'Penanganan error dan notifikasi',
                    'Dokumentasi alur',
                    'Panduan operasional',
                ],
                'technologies' => ['Laravel', 'Python', 'Node.js', 'n8n', 'Webhook', 'Docker'],
                'cost_factors' => 'Jumlah workflow, jumlah integrasi, kompleksitas logika dan pengecualian, frekuensi eksekusi, serta biaya API atau langganan pihak ketiga. Harga awal mengikuti paket Otomasi & Integrasi.',
                'faqs' => array_merge($commonFaqs, [
                    [
                        'question' => 'Apakah otomasi tetap berjalan jika API berubah?',
                        'answer' => 'Perubahan API dapat menghentikan alur. Karena itu kami menyertakan penanganan error dan notifikasi kegagalan. Pemantauan serta penyesuaian berkelanjutan tersedia melalui layanan maintenance.',
                    ],
                ]),
                'meta_title' => 'Jasa Otomasi Proses Bisnis & Workflow',
                'meta_description' => 'Jasa otomasi proses bisnis untuk mengurangi input manual. Workflow, integrasi API, notifikasi, penanganan error, dan dokumentasi yang jelas.',
            ],
            [
                'title' => 'Quality Assurance & Otomasi Pengujian',
                'slug' => 'quality-assurance',
                'summary' => 'Quality assurance dan otomasi pengujian untuk menjaga kualitas rilis tanpa menambah risiko regresi.',
                'description' => "Semakin sering tim merilis, semakin besar risiko fitur lama rusak tanpa disadari. QA yang terstruktur memberi tahu apa yang sudah diuji, apa yang belum, dan di mana risiko terbesar.\n\nKami menyusun test plan berdasarkan alur kritis, melakukan pengujian manual terarah, lalu mengotomasi skenario yang paling sering dijalankan. Hasil pengujian dilaporkan dengan bukti dan prioritas perbaikan.\n\nPengujian dapat dilakukan pada aplikasi yang kami bangun maupun pada produk yang sudah berjalan.",
                'icon_name' => 'shield-check',
                'deliverables' => [
                    'Test plan dan skenario',
                    'Pengujian manual alur kritis',
                    'Otomasi end-to-end',
                    'Laporan temuan dan bukti',
                    'Rekomendasi prioritas perbaikan',
                    'Integrasi ke CI bila diperlukan',
                ],
                'technologies' => ['Pest', 'Playwright', 'GitHub Actions', 'TypeScript'],
                'cost_factors' => 'Jumlah alur kritis, jumlah browser atau perangkat, kondisi kode yang ada, frekuensi rilis, dan apakah tim membutuhkan otomasi regresi berkelanjutan.',
                'faqs' => array_merge($commonFaqs, [
                    [
                        'question' => 'Apakah bisa menguji aplikasi yang tidak Anda bangun?',
                        'answer' => 'Bisa. Kami memulai dengan audit singkat untuk memahami alur, akses lingkungan uji, dan risiko utama sebelum menyusun test plan.',
                    ],
                ]),
                'meta_title' => 'Jasa Quality Assurance & Otomasi Pengujian',
                'meta_description' => 'Jasa QA dan otomasi pengujian untuk aplikasi web. Test plan, pengujian manual alur kritis, otomasi Playwright, laporan temuan, dan rekomendasi perbaikan.',
            ],
            [
                'title' => 'Maintenance Website & Dukungan Teknis',
                'slug' => 'maintenance',
                'summary' => 'Maintenance website dan dukungan teknis berkala agar aplikasi tetap aman, cepat, dan stabil setelah diluncurkan.',
                'description' => "Website yang sudah live tetap membutuhkan perawatan: pembaruan dependensi, backup, pemantauan uptime, dan perbaikan bug. Tanpa perawatan, masalah kecil menumpuk menjadi gangguan yang lebih mahal.\n\nKami menyediakan paket bulanan dengan lingkup dan waktu respons yang ditulis jelas. Laporan bulanan membantu Anda melihat pekerjaan yang dilakukan dan risiko yang perlu ditangani.\n\nLayanan ini cocok untuk website company profile, katalog, dan aplikasi yang sudah berjalan, baik dibangun oleh kami maupun tim lain.",
                'icon_name' => 'life-buoy',
                'deliverables' => [
                    'Pemantauan uptime',
                    'Pembaruan dependensi dan patch keamanan',
                    'Perbaikan bug ringan',
                    'Backup terpantau',
                    'Laporan bulanan',
                    'Bantuan teknis pada jam kerja',
                ],
                'technologies' => ['Laravel', 'MySQL', 'Docker', 'Cloudflare'],
                'cost_factors' => 'Ukuran aplikasi, frekuensi rilis, SLA respons, jumlah jam dukungan, dan apakah termasuk pengembangan fitur baru. Harga awal maintenance tercantum pada paket Maintenance Bulanan.',
                'faqs' => array_merge($commonFaqs, [
                    [
                        'question' => 'Apakah maintenance bisa untuk website yang dibangun pihak lain?',
                        'answer' => 'Bisa, setelah audit awal untuk memeriksa kondisi kode, dependensi, akses, dan risiko keamanan. Jika ada pekerjaan perbaikan besar, kami sampaikan estimasi terpisah sebelum menerima perawatan rutin.',
                    ],
                ]),
                'meta_title' => 'Jasa Maintenance Website & Dukungan Teknis',
                'meta_description' => 'Jasa maintenance website bulanan: pembaruan, backup, pemantauan uptime, perbaikan bug ringan, dan laporan. Lingkup serta waktu respons ditulis jelas.',
            ],
        ];

        foreach ($services as $index => $data) {
            $service = Service::query()->firstOrNew(['slug' => $data['slug']]);

            $service->fill(array_merge([
                'process' => $process,
                'is_featured' => $index < 4,
                'display_order' => $index,
                'status' => ContentStatus::Published,
                'meta_title' => null,
                'meta_description' => null,
            ], $data));

            if ($service->status === ContentStatus::Published && blank($service->published_at)) {
                $service->published_at = now();
            }

            $service->save();
        }
    }
}
