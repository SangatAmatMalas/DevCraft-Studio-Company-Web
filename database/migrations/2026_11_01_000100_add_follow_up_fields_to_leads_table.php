<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            // Leads may only provide a WhatsApp number, so email cannot be mandatory.
            $table->string('email')->nullable()->change();
            $table->string('reference_url', 500)->nullable()->after('source_url');
            $table->timestamp('next_follow_up_at')->nullable()->after('status');
            $table->timestamp('last_contacted_at')->nullable()->after('next_follow_up_at');

            $table->index('next_follow_up_at');
        });
    }

    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->dropIndex(['next_follow_up_at']);
            $table->dropColumn(['reference_url', 'next_follow_up_at', 'last_contacted_at']);
            $table->string('email')->nullable(false)->change();
        });
    }
};
