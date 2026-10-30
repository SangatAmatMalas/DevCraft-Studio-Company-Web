<?php

namespace App\Support;

/**
 * Detects unpublished placeholder text such as "Rp X" that must never
 * reach a production page (PRD §8.6, §16).
 */
class PlaceholderGuard
{
    /** @var list<string> */
    protected const PATTERNS = [
        '/\bRp\.?\s*X\b/i',
        '/\bRp\.?\s*X[\s\/-]/i',
        '/\bX{2,}\b/',
        '/\bTODO\b/',
        '/\bTBD\b/',
        '/lorem ipsum/i',
        '/\[placeholder\]/i',
    ];

    public static function isPlaceholder(?string $value): bool
    {
        if (blank($value)) {
            return false;
        }

        foreach (self::PATTERNS as $pattern) {
            if (preg_match($pattern, $value) === 1) {
                return true;
            }
        }

        return false;
    }

    /** @param array<int|string, mixed>|null $values */
    public static function anyInArray(?array $values): bool
    {
        foreach ($values ?? [] as $value) {
            if (is_string($value) && self::isPlaceholder($value)) {
                return true;
            }
        }

        return false;
    }
}
