<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Properti extends Model
{
    protected $table = 'properti';
    protected $fillable = [
        'kode_barang', 'nup', 'nama_barang', 'jenis_properti', 'tipe',
        'kondisi', 'status_bmn', 'nilai_perolehan', 'nilai_buku',
        'luas_tanah', 'luas_bangunan', 'jumlah_lantai',
        'alamat', 'kelurahan', 'kecamatan', 'kab_kota', 'provinsi', 'kode_pos',
        'pengguna', 'status_penggunaan', 'no_sertifikat', 'status_sertifikasi',
        'kode_register', 'tanggal_perolehan', 'foto_bergeotag', 'foto_url', 'keterangan',
    ];
    protected $casts = [
        'tanggal_perolehan' => 'date',
        'nilai_perolehan' => 'decimal:2',
        'nilai_buku' => 'decimal:2',
        'luas_tanah' => 'decimal:2',
        'luas_bangunan' => 'decimal:2',
    ];
}
