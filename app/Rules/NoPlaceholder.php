<?php

namespace App\Rules;

use App\Support\PlaceholderGuard;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class NoPlaceholder implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (is_string($value) && PlaceholderGuard::isPlaceholder($value)) {
            $fail('Nilai ini masih berisi placeholder (mis. "Rp X"). Isi nilai final sebelum dipublikasikan.');
        }
    }
}
