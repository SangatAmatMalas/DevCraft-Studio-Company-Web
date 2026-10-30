<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SlugRedirect extends Model
{
    protected $fillable = ['old_path', 'new_path', 'status_code'];

    protected function casts(): array
    {
        return [
            'status_code' => 'integer',
        ];
    }
}
