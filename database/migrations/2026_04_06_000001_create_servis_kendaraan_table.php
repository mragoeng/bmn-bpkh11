<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('servis_kendaraan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kendaraan_id')->constrained('kendaraan')->cascadeOnDelete();
            $table->foreignId('pegawai_id')->constrained('pegawai')->cascadeOnDelete();
            $table->date('tanggal_servis');
            $table->enum('jenis_servis', [
                'SERVIS_BESAR',        // Tune-up, overhaul
                'GANTI_OLI',           // Ganti oli mesin
                'GANTI_BAN',           // Ganti ban
                'GANTI_AKI',           // Ganti aki
                'PERBAIKAN_REM',       // Perbaikan rem
                'PERBAIKAN_AC',        // Perbaikan AC
                'PERBAIKAN_BODI',      // Perbaikan bodi/cat
                'PERBAIKAN_MESIN',     // Perbaikan mesin
                'ISI_ANGIN',           // Isi angin ban
                'CUCI_KENDARAAN',      // Cuci kendaraan
                'CEK_OLI',             // Cek level oli
                'CEK_REM',             // Cek kondisi rem
                'CEK_AKI',             // Cek kondisi aki
                'CEK_LAMPU',           // Cek lampu
                'LAINNYA'              // Lainnya
            ]);
            $table->string('keterangan')->nullable();
            $table->integer('km_saat_servis')->nullable();
            $table->decimal('biaya', 15, 2)->default(0);
            $table->string('tempat_servis')->nullable();
            $table->string('status')->default('SELESAI'); // SELESAI, PROSES, DIBATALKAN
            $table->json('bukti_files')->nullable(); // Array of file paths
            $table->text('catatan')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('servis_kendaraan');
    }
};
