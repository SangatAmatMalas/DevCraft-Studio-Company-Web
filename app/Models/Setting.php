<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Crypt;

class Setting extends Model
{
    protected $fillable = ['key', 'value', 'group', 'is_secret', 'updated_by'];

    protected function casts(): array
    {
        return [
            'is_secret' => 'boolean',
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Secrets are encrypted at rest and only decrypted on explicit read.
     */
    public function decryptedValue(): ?string
    {
        if ($this->value === null) {
            return null;
        }

        if (! $this->is_secret) {
            return $this->value;
        }

        try {
            return Crypt::decryptString($this->value);
        } catch (\Throwable) {
            return null;
        }
    }
}
