<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class TestimonialRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage-content') ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'person_name' => ['required', 'string', 'max:120'],
            'role' => ['nullable', 'string', 'max:120'],
            'organization' => ['nullable', 'string', 'max:160'],
            'quote' => ['required', 'string', 'max:2000'],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'permission_confirmed' => ['boolean'],
            'display_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
            'is_active' => ['boolean'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if ($this->boolean('is_active') && ! $this->boolean('permission_confirmed')) {
                $validator->errors()->add('permission_confirmed', 'Testimoni tidak dapat ditampilkan tanpa izin publikasi yang tercatat.');
            }
        });
    }
}
