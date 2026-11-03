<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class LeadBulkRequest extends FormRequest
{
    public const ACTIONS = ['archive', 'contacted'];

    public function authorize(): bool
    {
        return $this->user()?->can('manage-leads') ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'action' => ['required', Rule::in(self::ACTIONS)],
            'ids' => ['required', 'array', 'min:1', 'max:100'],
            'ids.*' => ['integer', 'distinct', 'exists:leads,id'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'ids.max' => 'Maksimal 100 lead per aksi. Persempit pilihan dengan filter.',
            'ids.*.exists' => 'Salah satu lead yang dipilih sudah tidak ada.',
        ];
    }
}
