<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pegawai', function (Blueprint $table) {
            $table->id();
            $table->string('nip')->nullable();
            $table->string('nama');
            $table->string('jabatan')->nullable();
            $table->string('unit')->nullable();
            $table->text('keterangan')->nullable();
            $table->timestamps();
        });

        Schema::create('kendaraan', function (Blueprint $table) {
            $table->id();
            $table->string('kode_kendaraan')->nullable();
            $table->string('nomor_polisi');
            $table->string('merk_tipe');
            $table->string('jenis_kendaraan');
            $table->unsignedSmallInteger('tahun')->nullable();
            $table->string('jenis_bbm_default')->nullable();
            $table->foreignId('pegawai_id')->nullable()->constrained('pegawai')->nullOnDelete();
            $table->text('keterangan')->nullable();
            $table->timestamps();
        });

        Schema::create('kelompok_akun_pembayaran', function (Blueprint $table) {
            $table->id();
            $table->unsignedSmallInteger('tahun');
            $table->string('jenis_kendaraan');
            $table->string('kode_akun');
            $table->string('nama_akun');
            $table->text('keterangan')->nullable();
            $table->timestamps();

            $table->unique(['tahun', 'jenis_kendaraan']);
        });

        Schema::create('print_settings', function (Blueprint $table) {
            $table->id();
            $table->string('nama_template');
            $table->text('google_docs_url')->nullable();
            $table->longText('template_content')->nullable();
            $table->text('keterangan')->nullable();
            $table->timestamps();
        });

        Schema::create('transaksi_bbm', function (Blueprint $table) {
            $table->id();
            $table->date('tanggal');
            $table->foreignId('pegawai_id')->constrained('pegawai')->restrictOnDelete();
            $table->foreignId('kendaraan_id')->constrained('kendaraan')->restrictOnDelete();
            $table->foreignId('akun_pembayaran_id')->nullable()->constrained('kelompok_akun_pembayaran')->nullOnDelete();
            $table->decimal('odometer', 12, 2)->nullable();
            $table->string('jenis_bbm');
            $table->decimal('liter', 12, 2);
            $table->decimal('harga_per_liter', 15, 2);
            $table->decimal('total', 15, 2);
            $table->string('spbu')->nullable();
            $table->string('nomor_nota')->nullable();
            $table->text('catatan')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transaksi_bbm');
        Schema::dropIfExists('print_settings');
        Schema::dropIfExists('kelompok_akun_pembayaran');
        Schema::dropIfExists('kendaraan');
        Schema::dropIfExists('pegawai');
    }
};
