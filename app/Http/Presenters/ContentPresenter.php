<?php

namespace App\Http\Presenters;

use App\Models\Faq;
use App\Models\Package;
use App\Models\PortfolioProject;
use App\Models\Service;
use App\Models\Testimonial;

/**
 * Normalises Eloquent models into the explicit payloads consumed by the
 * React pages. Keeping this in one place prevents leaking draft data or
 * internal columns to the browser.
 */
class ContentPresenter
{
    /** @return array<string, mixed> */
    public static function projectCard(PortfolioProject $project): array
    {
        return [
            'id' => $project->id,
            'title' => $project->title,
            'slug' => $project->slug,
            'excerpt' => $project->excerpt,
            'type' => $project->project_type->value,
            'type_label' => $project->project_type->label(),
            'type_description' => $project->project_type->description(),
            'status_label' => $project->project_status->label(),
            'cover_url' => $project->cover_url,
            'is_featured' => $project->is_featured,
            'categories' => $project->categories->map(fn ($category) => [
                'name' => $category->name,
                'slug' => $category->slug,
            ])->values()->all(),
            'technologies' => $project->technologies->map(fn ($technology) => [
                'name' => $technology->name,
                'slug' => $technology->slug,
            ])->values()->all(),
            'url' => '/portfolio/'.$project->slug,
            'published_at' => $project->published_at?->toIso8601String(),
        ];
    }

    /** @return array<string, mixed> */
    public static function projectDetail(PortfolioProject $project): array
    {
        return array_merge(self::projectCard($project), [
            'description' => $project->description,
            'client_name' => $project->client_name,
            'role_summary' => $project->role_summary,
            'problem' => $project->problem,
            'goals' => $project->goals ?? [],
            'solution' => $project->solution,
            'outcome' => $project->outcome,
            'started_at' => $project->started_at?->toDateString(),
            'completed_at' => $project->completed_at?->toDateString(),
            'repository_url' => $project->repository_url,
            'demo_url' => $project->demo_url,
            'sections' => $project->sections->map(fn ($section) => [
                'id' => $section->id,
                'heading' => $section->heading,
                'body' => $section->body,
                'type' => $section->section_type,
                'metadata' => $section->metadata,
            ])->values()->all(),
            'gallery' => $project->media->map(fn ($media) => [
                'id' => $media->id,
                'url' => $media->url,
                'alt' => $media->alt_text,
                'caption' => $media->caption,
                'is_cover' => $media->is_cover,
            ])->values()->all(),
        ]);
    }

    /** @return array<string, mixed> */
    public static function serviceCard(Service $service): array
    {
        return [
            'id' => $service->id,
            'title' => $service->title,
            'slug' => $service->slug,
            'summary' => $service->summary,
            'icon_name' => $service->icon_name,
            'is_featured' => $service->is_featured,
            'url' => '/layanan/'.$service->slug,
        ];
    }

    /** @return array<string, mixed> */
    public static function serviceDetail(Service $service): array
    {
        return array_merge(self::serviceCard($service), [
            'description' => $service->description,
            'deliverables' => $service->deliverables ?? [],
            'process' => $service->process ?? [],
            'faqs' => $service->faqs ?? [],
            'technologies' => $service->technologies ?? [],
            'cost_factors' => $service->cost_factors,
        ]);
    }

    /** @return array<string, mixed> */
    public static function packageCard(Package $package): array
    {
        return [
            'id' => $package->id,
            'name' => $package->name,
            'slug' => $package->slug,
            'tagline' => $package->tagline,
            'target_audience' => $package->target_audience,
            'price_display' => $package->priceDisplay(),
            'price_amount' => $package->price_amount,
            'price_label' => $package->price_label,
            'currency' => $package->currency,
            'billing_type' => $package->billing_type->value,
            'billing_label' => $package->billing_type->label(),
            'timeline_label' => $package->timeline_label,
            'is_featured' => $package->is_featured,
            'has_visible_price' => $package->hasVisiblePrice(),
            'url' => '/paket/'.$package->slug,
        ];
    }

    /** @return array<string, mixed> */
    public static function packageDetail(Package $package): array
    {
        return array_merge(self::packageCard($package), [
            'revision_policy' => $package->revision_policy,
            'included_items' => $package->included_items ?? [],
            'excluded_items' => $package->excluded_items ?? [],
            'limitations' => $package->limitations ?? [],
            'addons' => $package->addons->where('is_active', true)->map(fn ($addon) => [
                'id' => $addon->id,
                'name' => $addon->name,
                'description' => $addon->description,
                'price_label' => $addon->price_label,
            ])->values()->all(),
        ]);
    }

    /** @return array<string, mixed> */
    public static function faq(Faq $faq): array
    {
        return [
            'id' => $faq->id,
            'question' => $faq->question,
            'answer' => $faq->answer,
            'category' => $faq->category,
        ];
    }

    /** @return array<string, mixed> */
    public static function testimonial(Testimonial $testimonial): array
    {
        return [
            'id' => $testimonial->id,
            'person_name' => $testimonial->person_name,
            'role' => $testimonial->role,
            'organization' => $testimonial->organization,
            'quote' => $testimonial->quote,
            'photo_url' => $testimonial->photo_url,
        ];
    }
}
