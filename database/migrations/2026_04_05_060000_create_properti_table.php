<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('properti', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('kode_barang')->nullable();
            $table->unsignedInteger('nup')->nullable();
            $table->string('nama_barang');
            $table->string('jenis_properti')->comment('Tanah/Bangunan/Rumah Negara');
            $table->string('tipe')->nullable();
            $table->string('kondisi')->default('Baik');
            $table->string('status_bmn')->default('Aktif');
            $table->decimal('nilai_perolehan', 20, 2)->nullable();
            $table->decimal('nilai_buku', 20, 2)->nullable();
            $table->decimal('luas_tanah', 12, 2)->nullable();
            $table->decimal('luas_bangunan', 12, 2)->nullable();
            $table->unsignedSmallInteger('jumlah_lantai')->nullable();
            $table->text('alamat')->nullable();
            $table->string('kelurahan')->nullable();
            $table->string('kecamatan')->nullable();
            $table->string('kab_kota')->nullable();
            $table->string('provinsi')->nullable();
            $table->string('kode_pos')->nullable();
            $table->string('pengguna')->nullable();
            $table->string('status_penggunaan')->nullable();
            $table->string('no_sertifikat')->nullable();
            $table->string('status_sertifikasi')->nullable();
            $table->string('kode_register')->nullable();
            $table->date('tanggal_perolehan')->nullable();
            $table->string('foto_bergeotag')->nullable();
            $table->string('foto_url')->nullable();
            $table->text('keterangan')->nullable();
            $table->timestamps();
        });

        // Import 9 records from sheet data
        $data = [
            // 3 TANAH
            [
                'kode_barang' => '2010101002', 'nup' => 1,
                'nama_barang' => 'Tanah Bangunan Rumah Negara Golongan II',
                'jenis_properti' => 'Tanah', 'kondisi' => 'Baik', 'status_bmn' => 'Aktif',
                'nilai_perolehan' => 2051193000, 'nilai_buku' => 2051193000,
                'luas_tanah' => 704,
                'alamat' => 'JL. WONOSARI KM. 6 GANG BIMO PERUMAHAN BANGUNTAPAN PERMAI BLOK D',
                'kelurahan' => 'Baturetno', 'kecamatan' => 'Banguntapan', 'kab_kota' => 'KAB. BANTUL',
                'provinsi' => 'DAERAH ISTIMEWA YOGYAKARTA', 'kode_pos' => '55197',
                'status_penggunaan' => 'Digunakan sendiri untuk operasional',
                'no_sertifikat' => '13.01.16.05.2.00010', 'status_sertifikasi' => 'Bersertipikat Seluruh Bidang',
                'kode_register' => 'E1342F78AF2AED13E0531661F20ABB42',
                'tanggal_perolehan' => '2005-11-17',
                'foto_bergeotag' => 'Tanah Bangunan RN Gol II 1.jpg',
            ],
            [
                'kode_barang' => '2010101002', 'nup' => 2,
                'nama_barang' => 'Tanah Bangunan Rumah Negara Golongan II',
                'jenis_properti' => 'Tanah', 'kondisi' => 'Baik', 'status_bmn' => 'Aktif',
                'nilai_perolehan' => 3236298000, 'nilai_buku' => 3236298000,
                'luas_tanah' => 773,
                'alamat' => 'JL. BABARAN NO. 60A',
                'kelurahan' => 'KELURAHAN WARUNGBOTO', 'kecamatan' => 'UMBULHARJO', 'kab_kota' => 'KOTA YOGYAKARTA',
                'provinsi' => 'DI YOGYAKARTA', 'kode_pos' => '55164',
                'status_penggunaan' => 'Digunakan sendiri untuk operasional',
                'no_sertifikat' => '13.05.13.04.4.00040', 'status_sertifikasi' => 'Bersertipikat Seluruh Bidang',
                'kode_register' => 'E1342F78AF28ED13E0531661F20ABB42',
                'tanggal_perolehan' => '2005-11-17',
                'foto_bergeotag' => 'Tanah Bangunan RN Gol II 2.jpg',
            ],
            [
                'kode_barang' => '2010104001', 'nup' => 1,
                'nama_barang' => 'Tanah Bangunan Kantor Pemerintah',
                'jenis_properti' => 'Tanah', 'kondisi' => 'Baik', 'status_bmn' => 'Aktif',
                'nilai_perolehan' => 16220914000, 'nilai_buku' => 16220914000,
                'luas_tanah' => 2370,
                'alamat' => 'JL. NGEKSIGONDO NO. 58',
                'kelurahan' => 'Prenggan', 'kecamatan' => 'Kotagede', 'kab_kota' => 'KOTA YOGYAKARTA',
                'provinsi' => 'DAERAH ISTIMEWA YOGYAKARTA', 'kode_pos' => '55172',
                'status_penggunaan' => 'Digunakan sendiri untuk operasional',
                'no_sertifikat' => '13051402400069', 'status_sertifikasi' => 'Bersertipikat Seluruh Bidang',
                'kode_register' => 'E1342F78AF29ED13E0531661F20ABB42',
                'tanggal_perolehan' => '2005-09-22',
                'foto_bergeotag' => 'Tanah Bangunan RN Gol II 1.jpg',
            ],
            // 2 BANGUNAN DAN GEDUNG
            [
                'kode_barang' => '4010101001', 'nup' => 1,
                'nama_barang' => 'Bangunan Gedung Kantor Permanen',
                'jenis_properti' => 'Bangunan', 'kondisi' => 'Baik', 'status_bmn' => 'Aktif',
                'nilai_perolehan' => 5205273520, 'nilai_buku' => 4127487282,
                'luas_tanah' => 1320, 'luas_bangunan' => 788, 'jumlah_lantai' => 2,
                'alamat' => 'JL. NGEKSIGONDO NO. 58',
                'kelurahan' => 'KELURAHAN PRENGGAN', 'kecamatan' => 'KOTAGEDE', 'kab_kota' => 'KOTA YOGYAKARTA',
                'provinsi' => 'DI YOGYAKARTA', 'kode_pos' => '55172',
                'status_penggunaan' => 'Digunakan sendiri untuk operasional',
                'status_sertifikasi' => 'Belum Bersertipikat',
                'kode_register' => 'E1342F7E9A77EDA3E0531661F20AD1BF',
                'tanggal_perolehan' => '2006-12-31',
                'foto_bergeotag' => 'Bangunan Gedung Kantor Permanen 1.jpg',
            ],
            [
                'kode_barang' => '4010204001', 'nup' => 1,
                'nama_barang' => 'Mess/Wisma/Bungalow/Tempat Peristirahatan Permanen',
                'jenis_properti' => 'Bangunan', 'tipe' => 'Type 450 m2',
                'kondisi' => 'Baik', 'status_bmn' => 'Aktif',
                'nilai_perolehan' => 4233597939, 'nilai_buku' => 4026357884,
                'luas_tanah' => 457, 'luas_bangunan' => 218, 'jumlah_lantai' => 2,
                'alamat' => 'JALAN BABARAN NO. 60A',
                'kelurahan' => 'WARUNGBOTO', 'kecamatan' => 'UMBULHARJO', 'kab_kota' => 'KOTA YOGYAKARTA',
                'provinsi' => 'DI YOGYAKARTA', 'kode_pos' => '55164',
                'status_penggunaan' => 'Digunakan sendiri untuk operasional',
                'no_sertifikat' => 'SK-PBG-347113-04062025-001', 'status_sertifikasi' => 'Belum Bersertipikat',
                'kode_register' => '0DF3B2B1B83C62E6E063BBAAD80A1EFE',
                'tanggal_perolehan' => '2023-12-08',
                'foto_bergeotag' => 'Mess Permanen 1.jpg',
            ],
            // 4 RUMAH NEGARA
            [
                'kode_barang' => '4010202004', 'nup' => 1,
                'nama_barang' => 'Rumah Negara Golongan II Tipe B Permanen',
                'jenis_properti' => 'Rumah Negara', 'tipe' => '120',
                'kondisi' => 'Baik', 'status_bmn' => 'Aktif',
                'nilai_perolehan' => 447169350, 'nilai_buku' => 347865794,
                'luas_tanah' => 142, 'luas_bangunan' => 142, 'jumlah_lantai' => 1,
                'alamat' => 'JL. BABARAN NO. 60A',
                'kelurahan' => 'KELURAHAN WARUNGBOTO', 'kecamatan' => 'UMBULHARJO', 'kab_kota' => 'KOTA YOGYAKARTA',
                'provinsi' => 'DI YOGYAKARTA', 'kode_pos' => '55164',
                'pengguna' => 'Ir. Moech Firman Fahada, M.P.',
                'status_penggunaan' => 'Digunakan sendiri untuk operasional',
                'status_sertifikasi' => 'Belum Bersertipikat',
                'kode_register' => 'E1342F7E9A76EDA3E0531661F20AD1BF',
                'tanggal_perolehan' => '2006-12-30',
                'foto_bergeotag' => 'RN Gol II Tipe C Permanen 1.jpg',
            ],
            [
                'kode_barang' => '4010202007', 'nup' => 1,
                'nama_barang' => 'Rumah Negara Golongan II Tipe C Permanen',
                'jenis_properti' => 'Rumah Negara', 'tipe' => '70',
                'kondisi' => 'Baik', 'status_bmn' => 'Aktif',
                'nilai_perolehan' => 301524623, 'nilai_buku' => 240248797,
                'luas_tanah' => 82, 'luas_bangunan' => 82, 'jumlah_lantai' => 1,
                'alamat' => 'JL. WONOSARI KM. 6 GANG BIMO NO. 33',
                'kelurahan' => 'KELULRAHAN BATURETNO', 'kecamatan' => 'BANGUNTAPAN', 'kab_kota' => 'KAB. BANTUL',
                'provinsi' => 'DI YOGYAKARTA', 'kode_pos' => '55197',
                'pengguna' => 'Suhardi, S.Hut., M.I.L',
                'status_penggunaan' => 'Digunakan sendiri untuk operasional',
                'status_sertifikasi' => 'Belum Bersertipikat',
                'kode_register' => 'E1342F7E9A75EDA3E0531661F20AD1BF',
                'tanggal_perolehan' => '2006-11-15',
                'foto_bergeotag' => 'RN Gol II Tipe C Permanen 1.jpg',
            ],
            [
                'kode_barang' => '4010202007', 'nup' => 2,
                'nama_barang' => 'Rumah Negara Golongan II Tipe C Permanen',
                'jenis_properti' => 'Rumah Negara', 'tipe' => '70',
                'kondisi' => 'Baik', 'status_bmn' => 'Aktif',
                'nilai_perolehan' => 307003623, 'nilai_buku' => 244533652,
                'luas_tanah' => 82, 'luas_bangunan' => 82, 'jumlah_lantai' => 1,
                'alamat' => 'JL. WONOSARI KM. 6 GANG BIMO NO. 33',
                'kelurahan' => 'KELULRAHAN BATURETNO', 'kecamatan' => 'BANGUNTAPAN', 'kab_kota' => 'KAB. BANTUL',
                'provinsi' => 'DI YOGYAKARTA', 'kode_pos' => '55197',
                'pengguna' => 'Mohamad Dwijo Saputro, S.P., M.Sc.',
                'status_penggunaan' => 'Digunakan sendiri untuk operasional',
                'status_sertifikasi' => 'Belum Bersertipikat',
                'kode_register' => 'E1342F7E9A73EDA3E0531661F20AD1BF',
                'tanggal_perolehan' => '2006-11-15',
                'foto_bergeotag' => 'RN Gol II Tipe C Permanen 2.jpg',
            ],
            [
                'kode_barang' => '4010202007', 'nup' => 3,
                'nama_barang' => 'Rumah Negara Golongan II Tipe C Permanen',
                'jenis_properti' => 'Rumah Negara', 'tipe' => '70',
                'kondisi' => 'Baik', 'status_bmn' => 'Aktif',
                'nilai_perolehan' => 303436623, 'nilai_buku' => 241744076,
                'luas_tanah' => 82, 'luas_bangunan' => 82, 'jumlah_lantai' => 1,
                'alamat' => 'JL. WONOSARI KM. 6 GANG BIMO NO. 33',
                'kelurahan' => 'KELULRAHAN BATURETNO', 'kecamatan' => 'BANGUNTAPAN', 'kab_kota' => 'KAB. BANTUL',
                'provinsi' => 'DI YOGYAKARTA', 'kode_pos' => '55197',
                'pengguna' => 'Dony Setiawan Septiono, S.T., M.T.',
                'status_penggunaan' => 'Digunakan sendiri untuk operasional',
                'status_sertifikasi' => 'Belum Bersertipikat',
                'kode_register' => 'E1342F7E9A78EDA3E0531661F20AD1BF',
                'tanggal_perolehan' => '2006-11-15',
                'foto_bergeotag' => 'RN Gol II Tipe C Permanen 3.jpg',
            ],
        ];

        foreach ($data as $row) {
            $row['created_at'] = now();
            $row['updated_at'] = now();
            DB::table('properti')->insert($row);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('properti');
    }
};
