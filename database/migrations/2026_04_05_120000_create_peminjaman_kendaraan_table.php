<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('peminjaman_kendaraan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kendaraan_id')->constrained('kendaraan')->cascadeOnDelete();
            $table->foreignId('pegawai_id')->constrained('pegawai')->cascadeOnDelete();
            $table->date('tanggal_pinjam');
            $table->date('tanggal_kembali')->nullable();
            $table->string('keperluan');
            $table->enum('status', ['MENUNGGU', 'DISETUJUI', 'DITOLAK', 'DIKEMBALIKAN'])->default('MENUNGGU');
            $table->text('keterangan')->nullable();
            $table->string('bukti_pdf_path')->nullable();
            $table->string('nomor_surat')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('peminjaman_kendaraan');
    }
};
