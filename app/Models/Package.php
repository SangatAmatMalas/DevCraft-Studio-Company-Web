<?php

namespace App\Models;

use App\Enums\BillingType;
use App\Enums\ContentStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Package extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'tagline',
        'target_audience',
        'price_amount',
        'price_label',
        'currency',
        'billing_type',
        'timeline_label',
        'revision_policy',
        'included_items',
        'excluded_items',
        'limitations',
        'is_featured',
        'display_order',
        'status',
        'meta_title',
        'meta_description',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'price_amount' => 'integer',
            'included_items' => 'array',
            'excluded_items' => 'array',
            'limitations' => 'array',
            'billing_type' => BillingType::class,
            'is_featured' => 'boolean',
            'display_order' => 'integer',
            'status' => ContentStatus::class,
            'published_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Package $package) {
            if (blank($package->slug)) {
                $package->slug = Str::slug($package->name);
            }
        });
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /** @return HasMany<PackageAddon, $this> */
    public function addons(): HasMany
    {
        return $this->hasMany(PackageAddon::class);
    }

    /** @param Builder<Package> $query */
    public function scopePublished(Builder $query): void
    {
        $query->where('status', ContentStatus::Published->value);
    }

    /** @param Builder<Package> $query */
    public function scopeOrdered(Builder $query): void
    {
        $query->orderBy('display_order')->orderBy('name');
    }

    public function hasVisiblePrice(): bool
    {
        return filled($this->price_amount) || $this->billing_type === BillingType::Custom;
    }

    public function priceDisplay(): string
    {
        if (filled($this->price_label)) {
            return $this->price_label;
        }

        if ($this->billing_type === BillingType::Custom) {
            return 'Custom quotation';
        }

        if (filled($this->price_amount)) {
            return 'Mulai dari '.$this->formattedPrice();
        }

        return 'Hubungi kami';
    }

    public function formattedPrice(): string
    {
        if (blank($this->price_amount)) {
            return '';
        }

        return 'Rp '.number_format((int) $this->price_amount, 0, ',', '.');
    }
}
