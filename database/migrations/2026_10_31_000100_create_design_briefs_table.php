<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('design_briefs', function (Blueprint $table) {
            $table->id();
            $table->uuid('token')->unique();
            $table->string('category', 50)->index();
            $table->string('style', 30)->default('minimal');
            $table->string('brand_name', 120);
            $table->string('tagline', 180)->nullable();
            $table->text('description')->nullable();
            $table->json('services')->nullable();
            $table->json('contact')->nullable();
            $table->json('sections')->nullable();
            $table->string('primary_color', 9)->default('#2563eb');
            $table->json('templates');
            $table->string('chosen_template', 40)->nullable();
            $table->timestamp('chosen_at')->nullable();
            $table->unsignedBigInteger('lead_id')->nullable()->index();
            $table->string('status', 20)->default('generated')->index();
            $table->string('ip_hash', 64)->nullable();
            $table->timestamp('expires_at')->nullable()->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('design_briefs');
    }
};
