<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;

class Technology extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug', 'icon_name'];

    protected static function booted(): void
    {
        static::creating(function (Technology $technology) {
            if (blank($technology->slug)) {
                $technology->slug = Str::slug($technology->name);
            }
        });
    }

    /** @return BelongsToMany<PortfolioProject, $this> */
    public function portfolioProjects(): BelongsToMany
    {
        return $this->belongsToMany(PortfolioProject::class, 'portfolio_project_technology');
    }
}
