<?php

namespace Database\Seeders;

use App\Models\LeadReplyTemplate;
use Illuminate\Database\Seeder;

class LeadReplyTemplateSeeder extends Seeder
{
    public function run(): void
    {
        if (LeadReplyTemplate::query()->exists()) {
            return;
        }

        $templates = [
            [
                'title' => 'Balasan awal',
                'body' => "Halo {name},\n\nTerima kasih sudah mengirim brief untuk {service}. Kami sudah membaca ringkasannya dan ingin memastikan pemahaman kami benar sebelum mengusulkan langkah berikutnya.\n\nBoleh kami tahu hasil yang paling Anda harapkan, dan apakah ada batas waktu yang perlu kami pertimbangkan?\n\nSalam,\nDevCraft Studio",
                'display_order' => 1,
            ],
            [
                'title' => 'Minta detail tambahan',
                'body' => "Halo {name},\n\nTerima kasih atas waktunya. Untuk {service}, ada beberapa hal yang membantu kami menyusun estimasi yang masuk akal:\n\n1. Fitur atau alur utama yang wajib ada\n2. Referensi situs yang Anda sukai\n3. Siapa yang akan mengelola konten setelah rilis\n\nJika sudah ada dokumen atau tautan, silakan balas email ini. Kami tidak akan menebak kebutuhan tanpa konfirmasi Anda.\n\nSalam,\nDevCraft Studio",
                'display_order' => 2,
            ],
            [
                'title' => 'Ajakan diskusi',
                'body' => "Halo {name},\n\nMenindaklanjuti rencana {service}, kami ingin mengajak diskusi singkat untuk menyamakan ruang lingkup dan batasannya. Tidak ada biaya untuk sesi ini dan tidak ada kewajiban untuk melanjutkan.\n\nSilakan pilih waktu yang nyaman, atau balas email ini dengan preferensi Anda.\n\nSalam,\nDevCraft Studio",
                'display_order' => 3,
            ],
        ];

        foreach ($templates as $template) {
            LeadReplyTemplate::query()->create([
                'title' => $template['title'],
                'body' => $template['body'],
                'is_active' => true,
                'display_order' => $template['display_order'],
            ]);
        }
    }
}
