<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage-content') ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $serviceId = $this->route('service')?->id;

        return [
            'title' => ['required', 'string', 'max:160'],
            'slug' => ['nullable', 'string', 'max:180', 'alpha_dash', Rule::unique('services', 'slug')->ignore($serviceId)],
            'summary' => ['required', 'string', 'max:400'],
            'description' => ['nullable', 'string', 'max:12000'],
            'icon_name' => ['nullable', 'string', 'max:40'],
            'deliverables' => ['nullable', 'array', 'max:30'],
            'deliverables.*' => ['nullable', 'string', 'max:300'],
            'process' => ['nullable', 'array', 'max:20'],
            'process.*.title' => ['required_with:process.*.description', 'nullable', 'string', 'max:160'],
            'process.*.description' => ['nullable', 'string', 'max:1000'],
            'faqs' => ['nullable', 'array', 'max:20'],
            'faqs.*.question' => ['required_with:faqs.*.answer', 'nullable', 'string', 'max:300'],
            'faqs.*.answer' => ['nullable', 'string', 'max:2000'],
            'technologies' => ['nullable', 'array', 'max:30'],
            'technologies.*' => ['nullable', 'string', 'max:80'],
            'cost_factors' => ['nullable', 'string', 'max:3000'],
            'is_featured' => ['boolean'],
            'display_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
            'meta_title' => ['nullable', 'string', 'max:180'],
            'meta_description' => ['nullable', 'string', 'max:300'],
            'publish' => ['boolean'],
        ];
    }
}
