<?php

namespace App\Http\Requests;

use App\Models\Package;
use App\Models\PortfolioProject;
use App\Models\Service;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StoreLeadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $email = $this->input('email');
        $phone = $this->input('phone');
        $referenceUrl = $this->input('reference_url');

        $this->merge([
            'name' => is_string($this->input('name')) ? trim(strip_tags($this->input('name'))) : $this->input('name'),
            'organization' => is_string($this->input('organization')) ? trim(strip_tags($this->input('organization'))) : $this->input('organization'),
            'message' => is_string($this->input('message')) ? trim(strip_tags($this->input('message'))) : $this->input('message'),
            'email' => is_string($email) && trim($email) !== '' ? Str::lower(trim($email)) : null,
            'phone' => is_string($phone) && trim($phone) !== '' ? trim($phone) : null,
            'reference_url' => is_string($referenceUrl) && trim($referenceUrl) !== '' ? trim($referenceUrl) : null,
        ]);
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:2', 'max:120'],
            // A lead may only share a WhatsApp number, which is common for small businesses.
            'email' => ['nullable', 'string', 'lowercase', 'email:rfc', 'max:180', 'required_without:phone'],
            'phone' => ['nullable', 'string', 'max:40', 'regex:/^[0-9+()\-\s]{6,40}$/', 'required_without:email'],
            'organization' => ['nullable', 'string', 'max:150'],
            'service_type' => ['nullable', 'string', Rule::in(Service::query()->published()->pluck('title')->all())],
            'package_id' => ['nullable', 'integer', Rule::exists('packages', 'id')->where('status', 'published')],
            'portfolio_project_id' => ['nullable', 'integer', Rule::exists('portfolio_projects', 'id')->where('status', 'published')],
            'budget_range' => ['nullable', 'string', 'max:80'],
            'target_timeline' => ['nullable', 'string', 'max:80'],
            'preferred_contact' => ['nullable', Rule::in(['email', 'whatsapp', 'phone'])],
            'message' => ['required', 'string', 'min:20', 'max:5000'],
            'reference_url' => ['nullable', 'url', 'max:500'],
            'attachments' => ['nullable', 'array', 'max:3'],
            'attachments.*' => ['file', 'max:5120', 'mimes:pdf,jpg,jpeg,png,docx'],
            'privacy_consent' => ['accepted'],
            'source_url' => ['nullable', 'string', 'max:500'],
            'source_type' => ['nullable', 'string', 'max:40'],
            'design_brief' => ['nullable', 'string', 'max:64'],
            // Honeypot: must stay empty.
            'website' => ['nullable', 'string', 'max:0'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama wajib diisi.',
            'email.required_without' => 'Isi email atau nomor WhatsApp agar kami dapat membalas.',
            'email.email' => 'Format email tidak valid.',
            'phone.required_without' => 'Isi nomor WhatsApp atau email agar kami dapat membalas.',
            'phone.regex' => 'Format nomor WhatsApp tidak valid.',
            'message.required' => 'Ceritakan kebutuhan atau masalah yang ingin diselesaikan.',
            'message.min' => 'Tuliskan minimal 20 karakter agar kami memahami konteksnya.',
            'reference_url.url' => 'Tautan referensi harus berupa URL yang valid.',
            'attachments.max' => 'Maksimal 3 lampiran.',
            'attachments.*.max' => 'Ukuran setiap lampiran maksimal 5 MB.',
            'attachments.*.mimes' => 'Lampiran harus berupa PDF, JPG, PNG, atau DOCX.',
            'privacy_consent.accepted' => 'Anda perlu menyetujui kebijakan privasi.',
            'website.max' => 'Permintaan tidak dapat diproses.',
        ];
    }

    /** @return array<string, string> */
    public function attributes(): array
    {
        return [
            'name' => 'nama',
            'email' => 'email',
            'phone' => 'nomor WhatsApp',
            'organization' => 'organisasi',
            'service_type' => 'jenis kebutuhan',
            'budget_range' => 'estimasi budget',
            'target_timeline' => 'target waktu',
            'message' => 'deskripsi kebutuhan',
            'reference_url' => 'tautan referensi',
            'attachments' => 'lampiran',
            'privacy_consent' => 'persetujuan privasi',
        ];
    }

    public function package(): ?Package
    {
        return $this->filled('package_id') ? Package::query()->published()->find($this->integer('package_id')) : null;
    }

    public function project(): ?PortfolioProject
    {
        return $this->filled('portfolio_project_id')
            ? PortfolioProject::query()->published()->find($this->integer('portfolio_project_id'))
            : null;
    }
}
