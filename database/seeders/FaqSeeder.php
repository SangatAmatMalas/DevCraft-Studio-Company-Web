<?php

namespace Database\Seeders;

use App\Models\Faq;
use Illuminate\Database\Seeder;

class FaqSeeder extends Seeder
{
    public function run(): void
    {
        $faqs = [
            ['Bagaimana cara mengetahui biaya proyek?', 'Biaya bergantung pada ruang lingkup, jumlah modul, kebutuhan integrasi, dan waktu pengerjaan. Kami memulai dengan memahami kebutuhan Anda, lalu memberikan estimasi tertulis. Paket yang tercantum di situs adalah titik awal, bukan harga final untuk semua kebutuhan.', 'Biaya'],
            ['Berapa lama waktu pengerjaan?', 'Setiap penawaran menyertakan estimasi rentang waktu, bukan janji tanggal pasti. Perubahan ruang lingkup di tengah jalan akan memengaruhi durasi dan disepakati ulang.', 'Timeline'],
            ['Berapa kali revisi yang termasuk?', 'Jumlah revisi ditulis pada detail paket dan penawaran. Revisi di luar ruang lingkup awal dihitung sebagai pekerjaan tambahan.', 'Revisi'],
            ['Teknologi apa yang digunakan?', 'Umumnya Laravel untuk backend, React dengan TypeScript untuk antarmuka, dan MySQL sebagai basis data. Pilihan akhir menyesuaikan kebutuhan, bukan preferensi sepihak.', 'Teknologi'],
            ['Apakah tersedia layanan maintenance?', 'Ya. Perawatan bulanan mencakup perbaikan bug, pembaruan dependensi, dan bantuan teknis sesuai kesepakatan. Lingkup serta waktu respons ditulis di perjanjian.', 'Maintenance'],
            ['Siapa pemilik source code?', 'Kepemilikan source code dan hak penggunaan disepakati sebelum proyek dimulai dan dicantumkan dalam penawaran.', 'Kepemilikan'],
            ['Bagaimana sistem pembayarannya?', 'Termin pembayaran disesuaikan dengan tahapan proyek dan ditulis dalam penawaran. Tidak ada pembayaran yang diminta sebelum ruang lingkup disepakati.', 'Pembayaran'],
            ['Apakah bisa memulai dari brief singkat?', 'Bisa. Kirim brief melalui halaman kontak atau WhatsApp. Kami akan menanyakan hal yang masih kurang jelas sebelum menyusun estimasi.', 'Proses'],
        ];

        foreach ($faqs as $index => [$question, $answer, $category]) {
            Faq::query()->updateOrCreate(
                ['question' => $question],
                [
                    'answer' => $answer,
                    'category' => $category,
                    'display_order' => $index,
                    'is_active' => true,
                ],
            );
        }
    }
}
