<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KelompokAkunPembayaran extends Model
{
    use HasFactory;

    protected $table = 'kelompok_akun_pembayaran';

    protected $fillable = [
        'tahun',
        'jenis_kendaraan',
        'kode_akun',
        'nama_akun',
        'keterangan',
    ];

    public function transaksiBbm(): HasMany
    {
        return $this->hasMany(TransaksiBbm::class, 'akun_pembayaran_id');
    }
}
