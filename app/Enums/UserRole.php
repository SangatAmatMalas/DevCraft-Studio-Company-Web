<?php

namespace App\Enums;

enum UserRole: string
{
    case SuperAdmin = 'super_admin';
    case Admin = 'admin';
    case ContentManager = 'content_manager';
    case Sales = 'sales';
    case Worker = 'worker';

    public function label(): string
    {
        return match ($this) {
            self::SuperAdmin => 'Super Admin',
            self::Admin => 'Admin',
            self::ContentManager => 'Content Manager',
            self::Sales => 'Sales',
            self::Worker => 'Pekerja / Produksi',
        };
    }

    public function canManageContent(): bool
    {
        return in_array($this, [self::SuperAdmin, self::Admin, self::ContentManager], true);
    }

    public function canManageLeads(): bool
    {
        return in_array($this, [self::SuperAdmin, self::Admin, self::Sales], true);
    }

    public function canManageSettings(): bool
    {
        return in_array($this, [self::SuperAdmin, self::Admin], true);
    }

    /**
     * Roles allowed to open the read-only design brief list. Workers only get
     * this area so they never see lead contact data.
     */
    public function canViewDesignBriefs(): bool
    {
        return in_array($this, [
            self::SuperAdmin,
            self::Admin,
            self::ContentManager,
            self::Sales,
            self::Worker,
        ], true);
    }

    /** Whether the role may only read design briefs and nothing else. */
    public function isReadOnlyWorker(): bool
    {
        return $this === self::Worker;
    }

    /** @return array<string, string> */
    public static function options(): array
    {
        $options = [];
        foreach (self::cases() as $case) {
            $options[$case->value] = $case->label();
        }

        return $options;
    }
}
