<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('print_settings', function (Blueprint $table) {
            $table->timestamp('google_last_synced_at')->nullable()->after('template_content');
            $table->text('google_last_error')->nullable()->after('google_last_synced_at');
        });
    }

    public function down(): void
    {
        Schema::table('print_settings', function (Blueprint $table) {
            $table->dropColumn([
                'google_last_synced_at',
                'google_last_error',
            ]);
        });
    }
};
