<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('alat', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('kode_barang')->nullable()->comment('Kode Barang BMN');
            $table->unsignedInteger('nup')->nullable()->comment('Nomor Urut Pendaftaran');
            $table->string('nama_barang')->comment('Nama alat');
            $table->string('merk')->nullable()->comment('Merk/brand');
            $table->string('tipe')->nullable()->comment('Tipe/model');
            $table->string('kode_register')->nullable()->comment('Kode Register BMN');
            $table->string('kondisi')->default('Baik')->comment('Baik/Rusak Ringan/Rusak Berat');
            $table->string('status_bmn')->default('Aktif')->comment('Aktif/Tidak Aktif');
            $table->decimal('nilai_perolehan', 20, 2)->nullable()->comment('Nilai perolehan');
            $table->string('lokasi')->default('GK 07 - Ruang Penyimpanan Alat Ukur');
            $table->string('foto_url')->nullable()->comment('URL foto preview');
            $table->string('foto_bergeotag')->nullable()->comment('Nama file foto bergeotag');
            $table->string('status')->default('tersedia')->comment('tersedia/dipinjam/maintenance');
            $table->text('keterangan')->nullable();
            $table->timestamps();
        });

        Schema::create('peminjaman_alat', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('alat_id')->constrained('alat')->restrictOnDelete();
            $table->foreignId('pegawai_id')->constrained('pegawai')->restrictOnDelete();
            $table->date('tanggal_pinjam');
            $table->date('tanggal_kembali')->nullable();
            $table->date('kembali_aktual')->nullable()->comment('Actual return date');
            $table->string('status')->default('dipinjam')->comment('dipinjam/dikembalikan/terlambat');
            $table->text('keperluan')->nullable()->comment('Purpose of borrowing');
            $table->text('catatan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('peminjaman_alat');
        Schema::dropIfExists('alat');
    }
};