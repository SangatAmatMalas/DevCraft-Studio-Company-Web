<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * Stores uploaded images on the public disk, converting large raster
 * images to WebP so pages stay within the performance budget (PRD §13.2).
 */
class ImageUploader
{
    public const MAX_BYTES = 4 * 1024 * 1024;

    public const MAX_WIDTH = 1920;

    /** @var list<string> */
    public const ALLOWED_MIMES = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/avif',
        'application/pdf',
        'image/svg+xml',
    ];

    /**
     * @return array{path: string, width: int|null, height: int|null, mime: string, size: int}
     */
    public static function store(UploadedFile $file, string $directory = 'media'): array
    {
        if ($file->getSize() > self::MAX_BYTES) {
            throw new RuntimeException('Ukuran file melebihi 4 MB.');
        }

        $mime = (string) $file->getMimeType();

        if (! in_array($mime, self::ALLOWED_MIMES, true)) {
            throw new RuntimeException('Tipe file tidak diizinkan.');
        }

        $directory = trim($directory, '/').'/'.now()->format('Y/m');
        $base = Str::random(24);

        if (str_starts_with($mime, 'image/') && $mime !== 'image/svg+xml' && function_exists('imagecreatefromstring')) {
            $converted = self::convertToWebp($file->getRealPath(), $base);

            if ($converted !== null) {
                return $converted;
            }
        }

        $extension = match ($mime) {
            'application/pdf' => 'pdf',
            'image/svg+xml' => 'svg',
            'image/png' => 'png',
            'image/webp' => 'webp',
            default => 'jpg',
        };

        $path = $file->storeAs($directory, $base.'.'.$extension, 'public');

        [$width, $height] = self::dimensions(Storage::disk('public')->path($path));

        return [
            'path' => $path,
            'width' => $width,
            'height' => $height,
            'mime' => $mime,
            'size' => (int) $file->getSize(),
        ];
    }

    /**
     * @return array{path: string, width: int, height: int, mime: string, size: int}|null
     */
    protected static function convertToWebp(string $sourcePath, string $base): ?array
    {
        $contents = @file_get_contents($sourcePath);
        $image = $contents !== false ? @imagecreatefromstring($contents) : false;

        if ($image === false) {
            return null;
        }

        $width = imagesx($image);
        $height = imagesy($image);

        if ($width > self::MAX_WIDTH) {
            $height = (int) round($height * (self::MAX_WIDTH / $width));
            $width = self::MAX_WIDTH;

            $resized = imagecreatetruecolor($width, $height);
            imagealphablending($resized, false);
            imagesavealpha($resized, true);
            imagecopyresampled($resized, $image, 0, 0, 0, 0, $width, $height, imagesx($image), imagesy($image));
            imagedestroy($image);
            $image = $resized;
        }

        $relative = trim('media/'.now()->format('Y/m'), '/').'/'.$base.'.webp';
        $absolute = Storage::disk('public')->path($relative);

        if (! is_dir(dirname($absolute))) {
            mkdir(dirname($absolute), 0755, true);
        }

        imagewebp($image, $absolute, 82);
        imagedestroy($image);

        return [
            'path' => $relative,
            'width' => $width,
            'height' => $height,
            'mime' => 'image/webp',
            'size' => (int) @filesize($absolute),
        ];
    }

    /** @return array{0: int|null, 1: int|null} */
    protected static function dimensions(?string $absolutePath): array
    {
        if (! $absolutePath || ! is_file($absolutePath)) {
            return [null, null];
        }

        $size = @getimagesize($absolutePath);

        return $size ? [(int) $size[0], (int) $size[1]] : [null, null];
    }

    public static function delete(?string $path): void
    {
        if (filled($path)) {
            Storage::disk('public')->delete($path);
        }
    }
}
