<?php

namespace App\Services;

use App\Models\Page;
use App\Support\Settings;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Seo
{
    /**
     * Build a consistent SEO payload for an Inertia page.
     *
     * @param  array<int, array<string, mixed>>  $jsonLd
     * @return array<string, mixed>
     */
    public static function make(
        string $title,
        ?string $description = null,
        ?string $canonical = null,
        string $type = 'website',
        array $jsonLd = [],
        ?string $image = null,
        bool $noindex = false,
    ): array {
        $siteTitle = Settings::get('seo_default_title');
        $fullTitle = $title === '' ? $siteTitle : $title.' — '.Settings::get('brand_name');

        $ogImage = $image ?? Settings::get('seo_og_image');

        return [
            'title' => $fullTitle,
            'description' => $description ? Str::limit(strip_tags($description), 158) : Settings::get('seo_default_description'),
            'canonical' => $canonical ?? url()->current(),
            'type' => $type,
            'image' => $ogImage ? (Str::startsWith($ogImage, ['http://', 'https://']) ? $ogImage : Storage::disk('public')->url($ogImage)) : null,
            'siteName' => Settings::get('brand_name'),
            'robots' => $noindex ? 'noindex,follow' : 'index,follow',
            'jsonLd' => array_values(array_filter($jsonLd)),
        ];
    }

    /** @return array<string, mixed> */
    public static function organization(): array
    {
        $sameAs = array_values(array_filter([
            Settings::get('social_github'),
            Settings::get('social_linkedin'),
            Settings::get('social_instagram'),
            Settings::get('social_x'),
        ]));

        return [
            '@context' => 'https://schema.org',
            '@type' => 'Organization',
            'name' => Settings::get('brand_name'),
            'url' => url('/'),
            'description' => Settings::get('brand_positioning'),
            'sameAs' => $sameAs,
        ];
    }

    /** @return array<string, mixed> */
    public static function breadcrumbs(array $items): array
    {
        $elements = [];
        $position = 1;

        foreach ($items as $label => $url) {
            $elements[] = [
                '@type' => 'ListItem',
                'position' => $position++,
                'name' => $label,
                'item' => $url,
            ];
        }

        return [
            '@context' => 'https://schema.org',
            '@type' => 'BreadcrumbList',
            'itemListElement' => $elements,
        ];
    }

    /** @return array<string, mixed> */
    public static function service(string $name, string $description, string $url): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'Service',
            'name' => $name,
            'description' => $description,
            'url' => $url,
            'provider' => [
                '@type' => 'Organization',
                'name' => Settings::get('brand_name'),
                'url' => url('/'),
            ],
        ];
    }

    /**
     * Build an FAQPage Schema.org structured data array.
     *
     * @param  array<int, array{question?: string, answer?: string}|mixed>  $faqs
     * @return array<string, mixed>|null
     */
    public static function faqPage(array $faqs): ?array
    {
        $entities = [];

        foreach ($faqs as $faq) {
            $question = is_array($faq) ? trim((string) ($faq['question'] ?? '')) : '';
            $answer = is_array($faq) ? trim((string) ($faq['answer'] ?? '')) : '';

            if ($question === '' || $answer === '') {
                continue;
            }

            $entities[] = [
                '@type' => 'Question',
                'name' => $question,
                'acceptedAnswer' => [
                    '@type' => 'Answer',
                    'text' => strip_tags($answer),
                ],
            ];
        }

        if ($entities === []) {
            return null;
        }

        return [
            '@context' => 'https://schema.org',
            '@type' => 'FAQPage',
            'mainEntity' => $entities,
        ];
    }

    /**
     * Build a Service offer Schema.org structured data array for a package.
     *
     * @return array<string, mixed>
     */
    public static function packageOffer(\App\Models\Package $package): array
    {
        $offer = [
            '@type' => 'Offer',
            'url' => url('/paket/'.$package->slug),
            'priceCurrency' => $package->currency ?: 'IDR',
            'availability' => 'https://schema.org/InStock',
        ];

        if ($package->price_amount !== null && $package->price_amount > 0) {
            $offer['price'] = (int) $package->price_amount;
        }

        return array_filter([
            '@context' => 'https://schema.org',
            '@type' => 'Service',
            'name' => $package->name,
            'description' => $package->tagline ?: $package->name,
            'url' => url('/paket/'.$package->slug),
            'provider' => [
                '@type' => 'Organization',
                'name' => Settings::get('brand_name'),
                'url' => url('/'),
            ],
            'offers' => $offer,
        ]);
    }

    /** @return array<string, mixed> */
    public static function creativeWork(string $name, string $description, string $url, ?string $image = null): array
    {
        return array_filter([
            '@context' => 'https://schema.org',
            '@type' => 'CreativeWork',
            'name' => $name,
            'description' => $description,
            'url' => $url,
            'image' => $image,
            'creator' => [
                '@type' => 'Organization',
                'name' => Settings::get('brand_name'),
            ],
        ]);
    }

    public static function page(Page $page): array
    {
        return self::make(
            $page->meta_title ?: $page->title,
            $page->meta_description,
            url('/'.$page->slug),
        );
    }
}
