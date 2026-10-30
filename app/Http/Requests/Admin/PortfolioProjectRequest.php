<?php

namespace App\Http\Requests\Admin;

use App\Enums\ProjectStatus;
use App\Enums\ProjectType;
use App\Rules\NoPlaceholder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PortfolioProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage-content') ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $projectId = $this->route('project')?->id;

        return [
            'title' => ['required', 'string', 'max:160'],
            'slug' => ['nullable', 'string', 'max:180', 'alpha_dash', Rule::unique('portfolio_projects', 'slug')->ignore($projectId)],
            'excerpt' => ['required', 'string', 'max:400'],
            'description' => ['nullable', 'string', 'max:10000'],
            'project_type' => ['required', Rule::enum(ProjectType::class)],
            'project_status' => ['required', Rule::enum(ProjectStatus::class)],
            'client_name' => ['nullable', 'string', 'max:160'],
            'role_summary' => ['nullable', 'string', 'max:2000'],
            'problem' => ['nullable', 'string', 'max:4000'],
            'goals' => ['nullable', 'array', 'max:20'],
            'goals.*' => ['nullable', 'string', 'max:300'],
            'solution' => ['nullable', 'string', 'max:6000'],
            'outcome' => ['nullable', 'string', 'max:4000', new NoPlaceholder],
            'started_at' => ['nullable', 'date'],
            'completed_at' => ['nullable', 'date', 'after_or_equal:started_at'],
            'repository_url' => ['nullable', 'url', 'max:500'],
            'demo_url' => ['nullable', 'url', 'max:500'],
            'is_featured' => ['boolean'],
            'display_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
            'categories' => ['nullable', 'array'],
            'categories.*' => ['integer', 'exists:categories,id'],
            'technologies' => ['nullable', 'array'],
            'technologies.*' => ['integer', 'exists:technologies,id'],
            'sections' => ['nullable', 'array', 'max:20'],
            'sections.*.id' => ['nullable', 'integer', Rule::exists('portfolio_sections', 'id')],
            'sections.*.heading' => ['required_with:sections.*.body', 'nullable', 'string', 'max:160'],
            'sections.*.body' => ['nullable', 'string', 'max:8000'],
            'sections.*.section_type' => ['nullable', Rule::in(['text', 'list', 'gallery'])],
            'sections.*.display_order' => ['nullable', 'integer', 'min:0'],
            'cover' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'gallery' => ['nullable', 'array', 'max:12'],
            'gallery.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'remove_media' => ['nullable', 'array'],
            'remove_media.*' => ['integer', 'exists:portfolio_media,id'],
            'meta_title' => ['nullable', 'string', 'max:180'],
            'meta_description' => ['nullable', 'string', 'max:300'],
            'publish' => ['boolean'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'title.required' => 'Judul proyek wajib diisi.',
            'excerpt.required' => 'Ringkasan singkat wajib diisi.',
            'excerpt.max' => 'Ringkasan maksimal 400 karakter.',
            'project_type.required' => 'Klasifikasi proyek wajib dipilih agar statusnya tidak menyesatkan.',
            'cover.image' => 'Cover harus berupa gambar.',
            'gallery.*.image' => 'Setiap file galeri harus berupa gambar.',
        ];
    }
}
