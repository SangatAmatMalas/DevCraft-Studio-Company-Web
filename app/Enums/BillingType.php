<?php

namespace App\Enums;

enum BillingType: string
{
    case OneTime = 'one_time';
    case Monthly = 'monthly';
    case Custom = 'custom';

    public function label(): string
    {
        return match ($this) {
            self::OneTime => 'Sekali bayar',
            self::Monthly => 'Per bulan',
            self::Custom => 'Custom quotation',
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
