<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PackageAddon extends Model
{
    protected $fillable = [
        'package_id',
        'name',
        'description',
        'price_amount',
        'price_label',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'price_amount' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    /** @return BelongsTo<Package, $this> */
    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class);
    }
}
