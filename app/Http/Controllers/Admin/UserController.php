<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UserRequest;
use App\Models\User;
use App\Models\UserInvitation;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/users/index', [
            'users' => User::query()->orderBy('name')->get()->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role->value,
                'role_label' => $user->role->label(),
                'is_active' => $user->is_active,
                'last_login_at' => $user->last_login_at?->toIso8601String(),
                'created_at' => $user->created_at?->toIso8601String(),
            ])->all(),
            'invitations' => UserInvitation::query()
                ->open()
                ->with('invitedBy:id,name')
                ->orderBy('expires_at')
                ->get()
                ->map(fn (UserInvitation $invitation) => [
                    'id' => $invitation->id,
                    'name' => $invitation->name,
                    'email' => $invitation->email,
                    'role' => $invitation->role->value,
                    'role_label' => $invitation->role->label(),
                    'invited_by' => $invitation->invitedBy?->name,
                    'expires_at' => $invitation->expires_at?->toIso8601String(),
                    'expired' => $invitation->isExpired(),
                ])->all(),
            'roles' => UserRole::options(),
            'invitationExpiresInDays' => UserInvitation::EXPIRES_IN_DAYS,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/users/form', [
            'user' => null,
            'roles' => UserRole::options(),
        ]);
    }

    public function store(UserRequest $request): RedirectResponse
    {
        $user = User::query()->create([
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'password' => $request->validated('password'),
            'role' => $request->validated('role'),
            'is_active' => $request->boolean('is_active'),
        ]);

        ActivityLogger::log('user.created', $user, ['email' => $user->email, 'role' => $user->role->value]);

        return redirect()->route('admin.users.index')->with('success', 'Akun dibuat.');
    }

    public function edit(User $user): Response
    {
        return Inertia::render('admin/users/form', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role->value,
                'is_active' => $user->is_active,
            ],
            'roles' => UserRole::options(),
        ]);
    }

    public function update(UserRequest $request, User $user): RedirectResponse
    {
        if ($user->id === $request->user()?->id && ! $request->boolean('is_active')) {
            throw ValidationException::withMessages(['is_active' => 'Anda tidak dapat menonaktifkan akun sendiri.']);
        }

        $user->fill([
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'role' => $request->validated('role'),
            'is_active' => $request->boolean('is_active'),
        ]);

        if ($request->filled('password')) {
            $user->password = $request->validated('password');
        }

        $user->save();

        ActivityLogger::log('user.updated', $user, ['email' => $user->email, 'role' => $user->role->value]);

        return redirect()->route('admin.users.index')->with('success', 'Akun diperbarui.');
    }

    public function destroy(User $user): RedirectResponse
    {
        if ($user->id === auth()->id()) {
            throw ValidationException::withMessages(['user' => 'Anda tidak dapat menghapus akun sendiri.']);
        }

        if ($user->role === UserRole::SuperAdmin && User::query()->where('role', UserRole::SuperAdmin->value)->where('is_active', true)->count() <= 1) {
            throw ValidationException::withMessages(['user' => 'Minimal satu Super Admin aktif harus tersedia.']);
        }

        $user->delete();

        ActivityLogger::log('user.deleted', $user, ['email' => $user->email]);

        return redirect()->route('admin.users.index')->with('success', 'Akun dihapus.');
    }
}
