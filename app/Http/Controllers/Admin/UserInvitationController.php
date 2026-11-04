<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UserInvitationRequest;
use App\Jobs\SendUserInvitation;
use App\Models\UserInvitation;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Bus;
use Inertia\Inertia;
use Inertia\Response;

class UserInvitationController extends Controller
{
    public function create(Request $request): Response
    {
        $this->authorize('manage-users');

        return Inertia::render('admin/users/invite', [
            'roles' => UserRole::options(),
            'expiresInDays' => UserInvitation::EXPIRES_IN_DAYS,
        ]);
    }

    public function store(UserInvitationRequest $request): RedirectResponse
    {
        [$invitation, $token] = UserInvitation::issue(
            $request->validated('name'),
            $request->validated('email'),
            $request->role(),
            $request->user()?->id,
        );

        ActivityLogger::log('invitation.created', $invitation, [
            'email' => $invitation->email,
            'role' => $invitation->role->value,
        ]);

        Bus::dispatchAfterResponse(new SendUserInvitation($invitation->id, $token));

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'Undangan dibuat untuk '.$invitation->email.'. Email berisi tautan pembuatan kata sandi sedang dikirim.')
            ->with('invitation_url', route('invitation.accept', ['token' => $token]));
    }

    public function resend(Request $request, UserInvitation $invitation): RedirectResponse
    {
        $this->authorize('manage-users');

        if ($invitation->isAccepted()) {
            return back()->with('error', 'Undangan ini sudah diterima. Gunakan reset kata sandi jika penerima lupa aksesnya.');
        }

        $token = $invitation->reissue();

        ActivityLogger::log('invitation.resent', $invitation, [
            'email' => $invitation->email,
            'role' => $invitation->role->value,
        ]);

        Bus::dispatchAfterResponse(new SendUserInvitation($invitation->id, $token));

        return back()
            ->with('success', 'Undangan untuk '.$invitation->email.' dikirim ulang. Tautan sebelumnya tidak berlaku lagi.')
            ->with('invitation_url', route('invitation.accept', ['token' => $token]));
    }

    public function destroy(UserInvitation $invitation): RedirectResponse
    {
        $this->authorize('manage-users');

        if ($invitation->isAccepted()) {
            return back()->with('error', 'Undangan yang sudah diterima tidak dapat dibatalkan.');
        }

        $email = $invitation->email;

        $invitation->delete();

        ActivityLogger::log('invitation.revoked', null, ['email' => $email]);

        return back()->with('success', 'Undangan untuk '.$email.' dibatalkan.');
    }
}
