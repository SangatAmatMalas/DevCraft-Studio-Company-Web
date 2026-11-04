<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class TeamMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage-content') ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'role' => ['required', 'string', 'max:120'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'skills' => ['nullable', 'array', 'max:30'],
            'skills.*' => ['nullable', 'string', 'max:60'],
            'work_experience' => ['nullable', 'array', 'max:8'],
            'work_experience.*.role' => ['nullable', 'string', 'max:120'],
            'work_experience.*.organization' => ['nullable', 'string', 'max:120'],
            'work_experience.*.period' => ['nullable', 'string', 'max:40'],
            'work_experience.*.summary' => ['nullable', 'string', 'max:300'],
            'github_url' => ['nullable', 'url', 'max:300'],
            'linkedin_url' => ['nullable', 'url', 'max:300'],
            'display_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
            'is_active' => ['boolean'],
            'approved' => ['boolean'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if ($this->boolean('is_active') && ! $this->boolean('approved')) {
                $validator->errors()->add('approved', 'Profil tim hanya dapat ditampilkan setelah persetujuan anggota tercatat.');
            }
        });
    }
}
