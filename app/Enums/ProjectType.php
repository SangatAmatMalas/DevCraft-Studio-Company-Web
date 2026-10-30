<?php

namespace App\Enums;

enum ProjectType: string
{
    case ClientProject = 'client_project';
    case InternalProject = 'internal_project';
    case Prototype = 'prototype';
    case OpenSource = 'open_source';
    case LearningProject = 'learning_project';

    public function label(): string
    {
        return match ($this) {
            self::ClientProject => 'Client Project',
            self::InternalProject => 'Internal Project',
            self::Prototype => 'Prototype',
            self::OpenSource => 'Open Source',
            self::LearningProject => 'Learning Project',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::ClientProject => 'Dikerjakan untuk klien dengan lingkup yang disepakati.',
            self::InternalProject => 'Dibangun dan dikelola sendiri oleh DevCraft Studio.',
            self::Prototype => 'Eksperimen atau purwarupa, belum tentu dipakai di produksi.',
            self::OpenSource => 'Kode tersedia publik dan dapat ditinjau siapa saja.',
            self::LearningProject => 'Proyek belajar atau eksperimen teknis.',
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
