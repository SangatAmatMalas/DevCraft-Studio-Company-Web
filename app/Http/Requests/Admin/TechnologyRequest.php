<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TechnologyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage-content') ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $technologyId = $this->route('teknologi')?->id;

        return [
            'name' => ['required', 'string', 'max:80'],
            'slug' => ['nullable', 'string', 'max:100', 'alpha_dash', Rule::unique('technologies', 'slug')->ignore($technologyId)],
            'icon_name' => ['nullable', 'string', 'max:40'],
        ];
    }
}
