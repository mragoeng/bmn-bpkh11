<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('print_settings', function (Blueprint $table) {
            $table->text('google_drive_folder_url')->nullable()->after('google_docs_url');
        });
    }

    public function down(): void
    {
        Schema::table('print_settings', function (Blueprint $table) {
            $table->dropColumn('google_drive_folder_url');
        });
    }
};
