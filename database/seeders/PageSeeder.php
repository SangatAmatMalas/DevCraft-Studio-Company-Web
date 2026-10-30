<?php

namespace Database\Seeders;

use App\Enums\ContentStatus;
use App\Models\Page;
use Illuminate\Database\Seeder;

class PageSeeder extends Seeder
{
    public function run(): void
    {
        Page::query()->updateOrCreate(
            ['slug' => 'tentang-kami'],
            [
                'title' => 'Tentang DevCraft Studio',
                'content' => [
                    'intro' => 'DevCraft Studio adalah tim software engineering yang membantu bisnis, organisasi, dan individu mengubah ide menjadi produk digital yang dapat digunakan.',
                    'blocks' => [
                        [
                            'heading' => 'Cara kami bekerja',
                            'body' => 'Kami memulai dengan memahami masalah sebelum menulis kode. Ruang lingkup, estimasi, dan batasan ditulis sejak awal agar tidak ada kejutan di tengah proyek. Progres disampaikan secara berkala dan setiap keputusan teknis penting dijelaskan dalam bahasa yang bisa dipahami.',
                        ],
                        [
                            'heading' => 'Prinsip',
                            'body' => 'Transparan soal biaya dan batasan. Tidak mengklaim hasil yang belum diukur. Memilih solusi paling sederhana yang menyelesaikan masalah. Menyerahkan dokumentasi agar tim Anda tidak bergantung pada kami untuk hal mendasar.',
                        ],
                        [
                            'heading' => 'Fokus teknis',
                            'body' => 'Pengembangan web dengan Laravel dan React, integrasi API, otomasi proses bisnis, serta pengujian otomatis. Kami juga terbuka pada eksperimen teknologi baru seperti Web3 dan data engineering, dengan label yang jujur: prototipe tetap disebut prototipe.',
                        ],
                    ],
                ],
                'status' => ContentStatus::Published,
                'meta_title' => 'Tentang DevCraft Studio',
                'meta_description' => 'Cara kerja, prinsip, dan fokus teknis DevCraft Studio dalam membangun produk digital.',
                'published_at' => now(),
            ],
        );

        Page::query()->updateOrCreate(
            ['slug' => 'kebijakan-privasi'],
            [
                'title' => 'Kebijakan Privasi',
                'content' => [
                    'intro' => 'Halaman ini menjelaskan data apa yang dikumpulkan melalui website DevCraft Studio, mengapa data tersebut digunakan, dan bagaimana Anda dapat menghubungi kami.',
                    'blocks' => [
                        [
                            'heading' => 'Data yang dikumpulkan',
                            'body' => 'Saat Anda mengirim project brief, kami menyimpan nama, alamat email, nomor WhatsApp (jika diisi), nama organisasi (jika diisi), jenis kebutuhan, deskripsi kebutuhan, rentang anggaran (jika diisi), target waktu (jika diisi), cara dihubungi, serta halaman asal pengiriman. Kami juga menyimpan waktu persetujuan privasi.',
                        ],
                        [
                            'heading' => 'Penggunaan data',
                            'body' => 'Data digunakan untuk memahami kebutuhan Anda, menyiapkan penawaran, dan menindaklanjuti komunikasi. Kami tidak menjual data Anda. Data tidak digunakan untuk pengiriman promosi tanpa persetujuan terpisah.',
                        ],
                        [
                            'heading' => 'Analitik',
                            'body' => 'Kami mencatat peristiwa penggunaan secara agregat seperti halaman yang dibuka, klik WhatsApp, dan pengiriman brief. Isi brief, alamat email, dan nomor telepon tidak dikirim ke sistem analitik.',
                        ],
                        [
                            'heading' => 'Penyimpanan dan retensi',
                            'body' => 'Data prospek disimpan selama diperlukan untuk proses komunikasi dan kerja sama, lalu dihapus atau dianonimkan sesuai kebijakan internal. Anda dapat meminta penghapusan data dengan menghubungi alamat email yang tercantum di halaman kontak.',
                        ],
                        [
                            'heading' => 'Hak Anda',
                            'body' => 'Anda dapat meminta salinan, koreksi, atau penghapusan data yang kami simpan. Permintaan akan ditindaklanjuti setelah identitas Anda terverifikasi.',
                        ],
                    ],
                ],
                'status' => ContentStatus::Published,
                'meta_title' => 'Kebijakan Privasi',
                'meta_description' => 'Data yang dikumpulkan melalui website DevCraft Studio, tujuan penggunaannya, dan hak Anda.',
                'published_at' => now(),
            ],
        );
    }
}
