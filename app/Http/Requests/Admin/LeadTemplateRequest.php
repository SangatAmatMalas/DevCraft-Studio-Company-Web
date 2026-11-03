<?php

namespace App\Http\Requests\Admin;

use App\Models\LeadReplyTemplate;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

class LeadTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage-leads') ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:80'],
            'body' => ['required', 'string', 'min:10', 'max:2000'],
            'is_active' => ['boolean'],
            'display_order' => ['nullable', 'integer', 'min:0', 'max:999'],
        ];
    }

    /** @return array<int, callable> */
    public function after(): array
    {
        return [
            function (Validator $validator) {
                $body = (string) $this->input('body');

                preg_match_all('/\{([a-zA-Z0-9_]+)\}/', $body, $matches);

                $unknown = array_values(array_diff(array_unique($matches[1]), LeadReplyTemplate::PLACEHOLDERS));

                if ($unknown !== []) {
                    $validator->errors()->add(
                        'body',
                        'Placeholder tidak dikenal: {'.implode('}, {', $unknown).'}. Gunakan hanya {name}, {service}, atau {package}.',
                    );
                }
            },
        ];
    }
}
