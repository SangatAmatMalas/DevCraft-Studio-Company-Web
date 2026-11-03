<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class LeadFollowUpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage-leads') ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'next_follow_up_at' => ['nullable', 'date'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->input('next_follow_up_at')) && trim($this->input('next_follow_up_at')) === '') {
            $this->merge(['next_follow_up_at' => null]);
        }
    }
}
