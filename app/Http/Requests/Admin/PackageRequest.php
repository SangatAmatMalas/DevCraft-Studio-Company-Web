<?php

namespace App\Http\Requests\Admin;

use App\Enums\BillingType;
use App\Rules\NoPlaceholder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PackageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage-content') ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $packageId = $this->route('package')?->id;

        return [
            'name' => ['required', 'string', 'max:120'],
            'slug' => ['nullable', 'string', 'max:180', 'alpha_dash', Rule::unique('packages', 'slug')->ignore($packageId)],
            'tagline' => ['nullable', 'string', 'max:200'],
            'target_audience' => ['nullable', 'string', 'max:200'],
            'price_amount' => ['nullable', 'integer', 'min:0', 'max:999999999999'],
            'price_label' => ['nullable', 'string', 'max:80', new NoPlaceholder],
            'currency' => ['required', 'string', 'size:3'],
            'billing_type' => ['required', Rule::enum(BillingType::class)],
            'timeline_label' => ['nullable', 'string', 'max:120'],
            'revision_policy' => ['nullable', 'string', 'max:2000'],
            'included_items' => ['nullable', 'array', 'max:40'],
            'included_items.*' => ['nullable', 'string', 'max:300', new NoPlaceholder],
            'excluded_items' => ['nullable', 'array', 'max:40'],
            'excluded_items.*' => ['nullable', 'string', 'max:300', new NoPlaceholder],
            'limitations' => ['nullable', 'array', 'max:40'],
            'limitations.*' => ['nullable', 'string', 'max:300', new NoPlaceholder],
            'addons' => ['nullable', 'array', 'max:20'],
            'addons.*.id' => ['nullable', 'integer', Rule::exists('package_addons', 'id')],
            'addons.*.name' => ['required_with:addons.*.description', 'nullable', 'string', 'max:160'],
            'addons.*.description' => ['nullable', 'string', 'max:600'],
            'addons.*.price_label' => ['nullable', 'string', 'max:80', new NoPlaceholder],
            'addons.*.is_active' => ['boolean'],
            'is_featured' => ['boolean'],
            'display_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
            'meta_title' => ['nullable', 'string', 'max:180'],
            'meta_description' => ['nullable', 'string', 'max:300'],
            'publish' => ['boolean'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if ($this->boolean('publish') && $this->input('billing_type') !== BillingType::Custom->value) {
                if (blank($this->input('price_amount')) && blank($this->input('price_label'))) {
                    $validator->errors()->add('price_amount', 'Isi harga atau label harga sebelum paket dipublikasikan.');
                }
            }
        });
    }
}
