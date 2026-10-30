<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Media;
use App\Models\PortfolioMedia;
use App\Models\Setting;
use App\Models\TeamMember;
use App\Models\Testimonial;
use App\Services\ActivityLogger;
use App\Services\ImageUploader;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

class MediaController extends Controller
{
    public function index(Request $request): Response
    {
        $media = Media::query()
            ->when($request->query('q'), fn ($query, $term) => $query->where('original_name', 'like', '%'.$term.'%'))
            ->latest()
            ->paginate(24)
            ->withQueryString();

        return Inertia::render('admin/media/index', [
            'media' => [
                'data' => collect($media->items())->map(fn (Media $item) => [
                    'id' => $item->id,
                    'url' => $item->url,
                    'original_name' => $item->original_name,
                    'mime_type' => $item->mime_type,
                    'size' => $item->size,
                    'width' => $item->width,
                    'height' => $item->height,
                    'alt_text' => $item->alt_text,
                    'is_image' => $item->isImage(),
                    'created_at' => $item->created_at?->toIso8601String(),
                ])->all(),
                'meta' => [
                    'current_page' => $media->currentPage(),
                    'last_page' => $media->lastPage(),
                    'total' => $media->total(),
                ],
            ],
            'filters' => ['q' => (string) $request->query('q', '')],
            'limits' => ['max_bytes' => ImageUploader::MAX_BYTES, 'mimes' => ImageUploader::ALLOWED_MIMES],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validator = Validator::make($request->all(), [
            'file' => ['required', 'file', 'max:4096', 'mimes:jpg,jpeg,png,webp,avif,svg,pdf'],
            'alt_text' => ['nullable', 'string', 'max:200'],
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->with('error', 'File tidak dapat diunggah.');
        }

        $file = $request->file('file');
        $stored = ImageUploader::store($file);

        $media = Media::query()->create([
            'file_path' => $stored['path'],
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $stored['mime'],
            'size' => $stored['size'],
            'width' => $stored['width'],
            'height' => $stored['height'],
            'alt_text' => $request->input('alt_text'),
            'uploaded_by' => $request->user()?->id,
        ]);

        ActivityLogger::log('media.uploaded', $media, ['name' => $media->original_name]);

        return back()->with('success', 'Media diunggah.');
    }

    public function update(Request $request, Media $medium): RedirectResponse
    {
        $validated = $request->validate([
            'alt_text' => ['nullable', 'string', 'max:200'],
        ]);

        $medium->update(['alt_text' => $validated['alt_text'] ?? null]);

        ActivityLogger::log('media.updated', $medium, ['name' => $medium->original_name]);

        return back()->with('success', 'Alt text media diperbarui.');
    }

    public function destroy(Media $medium): RedirectResponse
    {
        if ($this->isInUse($medium)) {
            return back()->with('error', 'Media masih digunakan oleh konten lain. Lepaskan dari konten tersebut sebelum menghapus.');
        }

        ImageUploader::delete($medium->file_path);
        $medium->delete();

        ActivityLogger::log('media.deleted', $medium, ['name' => $medium->original_name]);

        return back()->with('success', 'Media dihapus.');
    }

    protected function isInUse(Media $media): bool
    {
        return PortfolioMedia::query()->where('media_path', $media->file_path)->exists()
            || Testimonial::query()->where('photo_path', $media->file_path)->exists()
            || TeamMember::query()->where('photo_path', $media->file_path)->exists()
            || Setting::query()->where('value', $media->file_path)->exists();
    }
}
