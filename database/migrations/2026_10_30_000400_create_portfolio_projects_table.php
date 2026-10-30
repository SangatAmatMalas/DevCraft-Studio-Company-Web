<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('portfolio_projects', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('excerpt');
            $table->longText('description')->nullable();
            $table->string('project_type')->default('prototype');
            $table->string('project_status')->default('in_progress');
            $table->string('client_name')->nullable();
            $table->text('role_summary')->nullable();
            $table->text('problem')->nullable();
            $table->json('goals')->nullable();
            $table->text('solution')->nullable();
            $table->text('outcome')->nullable();
            $table->date('started_at')->nullable();
            $table->date('completed_at')->nullable();
            $table->string('repository_url')->nullable();
            $table->string('demo_url')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->unsignedInteger('display_order')->default(0);
            $table->string('status')->default('draft');
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'is_featured', 'display_order']);
            $table->index('published_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('portfolio_projects');
    }
};
