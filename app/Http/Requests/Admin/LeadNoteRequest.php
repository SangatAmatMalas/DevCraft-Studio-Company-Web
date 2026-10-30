<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class LeadNoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage-leads') ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'note' => ['required', 'string', 'min:3', 'max:4000'],
        ];
    }
}
