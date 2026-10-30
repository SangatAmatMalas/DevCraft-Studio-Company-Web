<?php

namespace App\Enums;

enum UserRole: string
{
    case SuperAdmin = 'super_admin';
    case Admin = 'admin';
    case ContentManager = 'content_manager';
    case Sales = 'sales';

    public function label(): string
    {
        return match ($this) {
            self::SuperAdmin => 'Super Admin',
            self::Admin => 'Admin',
            self::ContentManager => 'Content Manager',
            self::Sales => 'Sales',
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
