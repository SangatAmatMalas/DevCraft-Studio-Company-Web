<?php

namespace App\Http\Controllers\Auth;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserInvitation;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class InvitationAcceptanceController extends Controller
{
    public function show(Request $request, string $token): Response
    {
        $invitation = UserInvitation::findByToken($token);

        return Inertia::render('auth/accept-invitation', [
            'token' => $token,
            'invitation' => $invitation ? [
                'name' => $invitation->name,
                'email' => $invitation->email,
                'role_label' => $invitation->role->label(),
            ] : null,
            'usable' => $invitation?->isUsable() ?? false,
            'accepted' => $invitation?->isAccepted() ?? false,
            'expired' => $invitation?->isExpired() ?? false,
        ]);
    }

    public function store(Request $request, string $token): RedirectResponse
    {
        $invitation = UserInvitation::findByToken($token);

        if (! $invitation || ! $invitation->isUsable()) {
            throw ValidationException::withMessages([
                'password' => 'Tautan undangan tidak valid, sudah dipakai, atau kedaluwarsa. Minta Super Admin mengirim ulang undangan.',
            ]);
        }

        $data = Validator::make($request->all(), [
            'password' => ['required', 'confirmed', Password::min(12)->letters()->numbers()],
        ], [
            'password.required' => 'Buat kata sandi terlebih dahulu.',
            'password.confirmed' => 'Konfirmasi kata sandi tidak cocok.',
        ])->validate();

        $user = DB::transaction(function () use ($invitation, $data) {
            /** @var UserInvitation $locked */
            $locked = UserInvitation::query()->whereKey($invitation->id)->lockForUpdate()->firstOrFail();

            if (! $locked->isUsable()) {
                throw ValidationException::withMessages([
                    'password' => 'Tautan undangan sudah tidak berlaku. Minta Super Admin mengirim ulang undangan.',
                ]);
            }

            if (User::query()->where('email', $locked->email)->exists()) {
                throw ValidationException::withMessages([
                    'password' => 'Email ini sudah memiliki akun. Silakan masuk atau gunakan lupa kata sandi.',
                ]);
            }

            $user = User::query()->create([
                'name' => $locked->name,
                'email' => $locked->email,
                'password' => $data['password'],
                'role' => $locked->role,
                'is_active' => true,
                'email_verified_at' => now(),
                'last_login_at' => now(),
            ]);

            $locked->forceFill(['accepted_at' => now()])->save();

            return $user;
        });

        Auth::login($user);
        $request->session()->regenerate();

        ActivityLogger::log('invitation.accepted', $user, [
            'email' => $user->email,
            'role' => $user->role->value,
        ]);

        $request->session()->put('success', 'Selamat datang, '.$user->name.'. Kata sandi Anda sudah dibuat.');

        return $user->role === UserRole::Worker
            ? redirect()->route('admin.design-briefs.index')
            : redirect()->route('admin.dashboard');
    }
}
