<?php

namespace App\Enums;

enum ProjectStatus: string
{
    case Planned = 'planned';
    case InProgress = 'in_progress';
    case Completed = 'completed';
    case Maintained = 'maintained';
    case Archived = 'archived';

    public function label(): string
    {
        return match ($this) {
            self::Planned => 'Planned',
            self::InProgress => 'In Progress',
            self::Completed => 'Completed',
            self::Maintained => 'Maintained',
            self::Archived => 'Archived',
        };
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
