<?php

namespace App\Http\Requests\Admin;

use App\Enums\UserRole;
use App\Models\UserInvitation;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserInvitationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage-users') ?? false;
    }

    protected function prepareForValidation(): void
    {
        $email = $this->input('email');

        $this->merge([
            'name' => is_string($this->input('name')) ? trim(strip_tags($this->input('name'))) : $this->input('name'),
            'email' => is_string($email) && trim($email) !== '' ? mb_strtolower(trim($email)) : $email,
        ]);
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:2', 'max:120'],
            'email' => [
                'required',
                'string',
                'email:rfc',
                'max:180',
                Rule::unique('users', 'email'),
            ],
            'role' => ['required', Rule::enum(UserRole::class)],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $email = (string) $this->input('email');

            if ($email === '') {
                return;
            }

            $pending = UserInvitation::query()
                ->open()
                ->where('email', $email)
                ->exists();

            if ($pending) {
                $validator->errors()->add('email', 'Masih ada undangan terbuka (belum diterima) untuk email ini. Gunakan kirim ulang atau batalkan undangan tersebut.');
            }
        });
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama penerima wajib diisi.',
            'email.required' => 'Email penerima wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email ini sudah memiliki akun. Ubah perannya melalui daftar pengguna.',
            'role.required' => 'Pilih peran untuk penerima undangan.',
        ];
    }

    public function role(): UserRole
    {
        return UserRole::from((string) $this->validated('role'));
    }
}
