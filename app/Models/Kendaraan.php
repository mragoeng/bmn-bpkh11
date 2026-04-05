<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Kendaraan extends Model
{
    use HasFactory;

    protected $table = 'kendaraan';

    protected $fillable = [
        'kode_kendaraan',
        'kode_barang',
        'nup',
        'nama_barang',
        'nomor_polisi',
        'merk_tipe',
        'jenis_kendaraan',
        'tahun',
        'jenis_bbm_default',
        'pegawai_id',
        'kondisi',
        'status_bmn',
        'nilai_perolehan',
        'kode_register',
        'pengguna',
        'foto_url',
        'keterangan',
    ];

    public function pegawai(): BelongsTo
    {
        return $this->belongsTo(Pegawai::class);
    }

    public function transaksiBbm(): HasMany
    {
        return $this->hasMany(TransaksiBbm::class);
    }
}
