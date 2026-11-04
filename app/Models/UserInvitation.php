<?php

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class UserInvitation extends Model
{
    public const EXPIRES_IN_DAYS = 7;

    protected $fillable = [
        'name',
        'email',
        'role',
        'token_hash',
        'invited_by_id',
        'expires_at',
        'accepted_at',
    ];

    protected function casts(): array
    {
        return [
            'role' => UserRole::class,
            'expires_at' => 'datetime',
            'accepted_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function invitedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'invited_by_id');
    }

    /**
     * Create a pending invitation. The raw token is returned once so it can be
     * emailed or copied; only its hash is persisted.
     *
     * @return array{0: self, 1: string}
     */
    public static function issue(string $name, string $email, UserRole $role, ?int $invitedBy): array
    {
        $token = Str::random(64);

        $invitation = self::query()->create([
            'name' => $name,
            'email' => Str::lower(trim($email)),
            'role' => $role,
            'token_hash' => hash('sha256', $token),
            'invited_by_id' => $invitedBy,
            'expires_at' => now()->addDays(self::EXPIRES_IN_DAYS),
        ]);

        return [$invitation, $token];
    }

    /**
     * Rotate the token so the previous link stops working.
     */
    public function reissue(): string
    {
        $token = Str::random(64);

        $this->forceFill([
            'token_hash' => hash('sha256', $token),
            'expires_at' => now()->addDays(self::EXPIRES_IN_DAYS),
            'accepted_at' => null,
        ])->save();

        return $token;
    }

    public static function findByToken(string $token): ?self
    {
        if (strlen($token) < 32) {
            return null;
        }

        return self::query()->where('token_hash', hash('sha256', $token))->first();
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function isAccepted(): bool
    {
        return $this->accepted_at !== null;
    }

    public function isUsable(): bool
    {
        return ! $this->isAccepted() && ! $this->isExpired();
    }

    /** @param Builder<self> $query */
    public function scopeOpen(Builder $query): void
    {
        $query->whereNull('accepted_at');
    }
}
