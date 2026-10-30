<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('testimonials', function (Blueprint $table) {
            $table->id();
            $table->string('person_name');
            $table->string('role')->nullable();
            $table->string('organization')->nullable();
            $table->text('quote');
            $table->string('photo_path')->nullable();
            $table->timestamp('permission_confirmed_at')->nullable();
            $table->unsignedInteger('display_order')->default(0);
            $table->boolean('is_active')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('testimonials');
    }
};
