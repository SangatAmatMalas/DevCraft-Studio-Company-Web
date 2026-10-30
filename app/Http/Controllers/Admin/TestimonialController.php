<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\TestimonialRequest;
use App\Models\Testimonial;
use App\Services\ActivityLogger;
use App\Services\ImageUploader;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TestimonialController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/testimonials/index', [
            'testimonials' => Testimonial::query()->orderBy('display_order')->get()->map(fn (Testimonial $testimonial) => [
                'id' => $testimonial->id,
                'person_name' => $testimonial->person_name,
                'role' => $testimonial->role,
                'organization' => $testimonial->organization,
                'quote' => $testimonial->quote,
                'photo_url' => $testimonial->photo_url,
                'permission_confirmed' => $testimonial->permission_confirmed_at !== null,
                'permission_confirmed_at' => $testimonial->permission_confirmed_at?->toIso8601String(),
                'display_order' => $testimonial->display_order,
                'is_active' => $testimonial->is_active,
                'published' => $testimonial->is_active && $testimonial->permission_confirmed_at !== null,
            ])->all(),
        ]);
    }

    public function store(TestimonialRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $photo = $request->hasFile('photo') ? ImageUploader::store($request->file('photo'), 'testimonials') : null;

        $testimonial = Testimonial::query()->create([
            'person_name' => $data['person_name'],
            'role' => $data['role'] ?? null,
            'organization' => $data['organization'] ?? null,
            'quote' => $data['quote'],
            'photo_path' => $photo['path'] ?? null,
            'permission_confirmed_at' => $request->boolean('permission_confirmed') ? now() : null,
            'display_order' => $data['display_order'] ?? 0,
            'is_active' => $request->boolean('is_active'),
        ]);

        ActivityLogger::log('testimonial.created', $testimonial, ['person' => $testimonial->person_name]);

        return back()->with('success', 'Testimoni dibuat.');
    }

    public function update(TestimonialRequest $request, Testimonial $testimonial): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('photo')) {
            ImageUploader::delete($testimonial->photo_path);
            $testimonial->photo_path = ImageUploader::store($request->file('photo'), 'testimonials')['path'];
        }

        $testimonial->fill([
            'person_name' => $data['person_name'],
            'role' => $data['role'] ?? null,
            'organization' => $data['organization'] ?? null,
            'quote' => $data['quote'],
            'permission_confirmed_at' => $request->boolean('permission_confirmed')
                ? ($testimonial->permission_confirmed_at ?? now())
                : null,
            'display_order' => $data['display_order'] ?? 0,
            'is_active' => $request->boolean('is_active'),
        ])->save();

        ActivityLogger::log('testimonial.updated', $testimonial, ['person' => $testimonial->person_name]);

        return back()->with('success', 'Testimoni diperbarui.');
    }

    public function destroy(Testimonial $testimonial): RedirectResponse
    {
        ImageUploader::delete($testimonial->photo_path);
        $testimonial->delete();

        ActivityLogger::log('testimonial.deleted', $testimonial, ['person' => $testimonial->person_name]);

        return back()->with('success', 'Testimoni dihapus.');
    }
}
