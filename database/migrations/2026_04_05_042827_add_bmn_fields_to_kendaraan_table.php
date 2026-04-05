<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('kendaraan', function (Blueprint $table) {
            $table->string('kode_barang')->nullable()->after('kode_kendaraan');
            $table->unsignedInteger('nup')->nullable()->after('kode_barang');
            $table->string('nama_barang')->nullable()->after('nup');
            $table->string('kondisi')->default('Baik')->after('jenis_bbm_default');
            $table->string('status_bmn')->default('Aktif')->after('kondisi');
            $table->decimal('nilai_perolehan', 20, 2)->nullable()->after('status_bmn');
            $table->string('kode_register')->nullable()->after('nilai_perolehan');
            $table->string('pengguna')->nullable()->after('kode_register');
            $table->string('foto_url')->nullable()->after('pengguna');
        });
    }

    public function down(): void
    {
        Schema::table('kendaraan', function (Blueprint $table) {
            $table->dropColumn([
                'kode_barang', 'nup', 'nama_barang',
                'kondisi', 'status_bmn', 'nilai_perolehan',
                'kode_register', 'pengguna', 'foto_url',
            ]);
        });
    }
};
