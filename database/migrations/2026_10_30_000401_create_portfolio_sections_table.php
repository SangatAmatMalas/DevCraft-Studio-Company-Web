<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('portfolio_sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('portfolio_project_id')->constrained()->cascadeOnDelete();
            $table->string('heading');
            $table->longText('body')->nullable();
            $table->string('section_type')->default('text');
            $table->unsignedInteger('display_order')->default(0);
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['portfolio_project_id', 'display_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('portfolio_sections');
    }
};
