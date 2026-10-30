<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage-content') ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $pageId = $this->route('page')?->id;

        return [
            'title' => ['required', 'string', 'max:160'],
            'slug' => ['nullable', 'string', 'max:180', 'alpha_dash', Rule::unique('pages', 'slug')->ignore($pageId)],
            'intro' => ['nullable', 'string', 'max:4000'],
            'blocks' => ['nullable', 'array', 'max:30'],
            'blocks.*.heading' => ['required_with:blocks.*.body', 'nullable', 'string', 'max:180'],
            'blocks.*.body' => ['nullable', 'string', 'max:12000'],
            'meta_title' => ['nullable', 'string', 'max:180'],
            'meta_description' => ['nullable', 'string', 'max:300'],
            'publish' => ['boolean'],
        ];
    }
}
