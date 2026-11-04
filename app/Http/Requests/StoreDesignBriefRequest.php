<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StoreDesignBriefRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $services = $this->input('services');

        if (is_array($services)) {
            $this->merge([
                'services' => collect($services)
                    ->map(function ($item) {
                        if (! is_array($item)) {
                            return ['title' => '', 'description' => ''];
                        }

                        return [
                            'title' => is_string($item['title'] ?? null) ? trim(strip_tags($item['title'])) : '',
                            'description' => is_string($item['description'] ?? null) ? trim(strip_tags($item['description'])) : '',
                        ];
                    })
                    // The wizard starts with two rows and most visitors only fill
                    // the first one. Drop untouched rows instead of rejecting the
                    // whole brief for a field the visitor never saw.
                    ->reject(fn (array $item) => $item['title'] === '' && $item['description'] === '')
                    ->values()
                    ->all(),
            ]);
        }

        $contact = $this->input('contact');

        if (is_array($contact)) {
            $whatsapp = is_string($contact['whatsapp'] ?? null) ? trim($contact['whatsapp']) : null;

            if ($whatsapp !== null && $whatsapp !== '') {
                // Accept the way people actually type numbers ("0812-3456 7890",
                // "+62 (812) 3456-7890") instead of failing the regex silently.
                $prefix = str_starts_with($whatsapp, '+') ? '+' : '';
                $contact['whatsapp'] = $prefix.preg_replace('/\D+/', '', $whatsapp);
            }

            if (is_string($contact['email'] ?? null)) {
                $contact['email'] = Str::lower(trim($contact['email']));
            }

            $this->merge(['contact' => $contact]);
        }

        if (is_string($this->input('primary_color'))) {
            $this->merge(['primary_color' => Str::lower(trim($this->input('primary_color')))]);
        }
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'category' => ['required', 'string', Rule::in(array_keys((array) config('design-previews.categories')))],
            'style' => ['required', 'string', Rule::in(array_keys((array) config('design-previews.styles')))],
            'brand_name' => ['required', 'string', 'min:2', 'max:80'],
            'tagline' => ['nullable', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:700'],
            'services' => ['required', 'array', 'min:1', 'max:'.config('design-previews.max_services', 6)],
            'services.*.title' => ['required', 'string', 'max:80'],
            'services.*.description' => ['nullable', 'string', 'max:220'],
            'contact.whatsapp' => ['nullable', 'string', 'max:40', 'regex:/^\+?[0-9]{6,40}$/'],
            'contact.email' => ['nullable', 'string', 'lowercase', 'email:rfc', 'max:180'],
            'contact.city' => ['nullable', 'string', 'max:80'],
            'primary_color' => ['required', 'string', 'regex:/^#[0-9a-f]{6}$/'],
            'sections' => ['required', 'array', 'min:1'],
            'sections.*' => ['string', Rule::in(array_keys((array) config('design-previews.sections')))],
            'privacy_consent' => ['accepted'],
            // Honeypot: must stay empty.
            'website' => ['nullable', 'string', 'max:0'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'category.required' => 'Pilih kategori website terlebih dahulu.',
            'style.required' => 'Pilih karakter visual terlebih dahulu.',
            'brand_name.required' => 'Nama brand atau usaha wajib diisi.',
            'brand_name.min' => 'Nama brand minimal 2 karakter.',
            'services.required' => 'Isi minimal satu layanan atau produk.',
            'services.min' => 'Isi minimal satu layanan atau produk.',
            'services.max' => 'Maksimal '.config('design-previews.max_services', 6).' layanan atau produk.',
            'services.*.title.required' => 'Setiap layanan yang diisi perlu nama singkat.',
            'services.*.title.max' => 'Nama layanan maksimal 80 karakter.',
            'services.*.description.max' => 'Deskripsi layanan maksimal 220 karakter.',
            'contact.whatsapp.regex' => 'Nomor WhatsApp hanya boleh berisi angka, spasi, tanda hubung, atau awalan +.',
            'contact.email.email' => 'Format email belum benar, misalnya nama@brand.com.',
            'primary_color.regex' => 'Warna utama harus berupa kode hex, misalnya #2563eb.',
            'sections.required' => 'Pilih minimal satu bagian yang ingin ditampilkan.',
            'privacy_consent.accepted' => 'Anda perlu menyetujui penggunaan brief untuk membuat preview.',
            'website.max' => 'Permintaan tidak dapat diproses.',
        ];
    }

    /** @return array<string, string> */
    public function attributes(): array
    {
        return [
            'category' => 'kategori website',
            'style' => 'karakter visual',
            'brand_name' => 'nama brand',
            'tagline' => 'tagline',
            'description' => 'deskripsi',
            'services' => 'layanan',
            'contact.whatsapp' => 'nomor WhatsApp',
            'contact.email' => 'email',
            'contact.city' => 'kota',
            'primary_color' => 'warna utama',
            'sections' => 'bagian website',
            'privacy_consent' => 'persetujuan',
        ];
    }
}
