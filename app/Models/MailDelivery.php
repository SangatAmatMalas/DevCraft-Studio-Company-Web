<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MailDelivery extends Model
{
    public const TYPE_TEAM_NOTIFICATION = 'team_notification';

    public const TYPE_LEAD_CONFIRMATION = 'lead_confirmation';

    public const TYPE_TEST = 'test';

    public const TYPE_USER_INVITATION = 'user_invitation';

    public const STATUS_SENT = 'sent';

    public const STATUS_FAILED = 'failed';

    public const STATUS_SKIPPED = 'skipped';

    protected $fillable = [
        'lead_id',
        'type',
        'recipient',
        'status',
        'error',
        'sent_at',
    ];

    protected function casts(): array
    {
        return [
            'sent_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<Lead, $this> */
    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }

    public function typeLabel(): string
    {
        return match ($this->type) {
            self::TYPE_TEAM_NOTIFICATION => 'Notifikasi tim',
            self::TYPE_LEAD_CONFIRMATION => 'Konfirmasi ke lead',
            self::TYPE_TEST => 'Email uji',
            self::TYPE_USER_INVITATION => 'Undangan akun',
            default => $this->type,
        };
    }

    public function statusLabel(): string
    {
        return match ($this->status) {
            self::STATUS_SENT => 'Terkirim',
            self::STATUS_FAILED => 'Gagal',
            self::STATUS_SKIPPED => 'Dilewati',
            default => $this->status,
        };
    }

    public function statusTone(): string
    {
        return match ($this->status) {
            self::STATUS_SENT => 'success',
            self::STATUS_FAILED => 'danger',
            default => 'muted',
        };
    }
}
