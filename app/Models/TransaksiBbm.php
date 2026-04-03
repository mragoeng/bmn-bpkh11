<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TransaksiBbm extends Model
{
    use HasFactory;

    protected $table = 'transaksi_bbm';

    protected $fillable = [
        'tanggal',
        'pegawai_id',
        'kendaraan_id',
        'akun_pembayaran_id',
        'odometer',
        'jenis_bbm',
        'liter',
        'harga_per_liter',
        'total',
        'spbu',
        'nomor_nota',
        'catatan',
    ];

    public function pegawai(): BelongsTo
    {
        return $this->belongsTo(Pegawai::class);
    }

    public function kendaraan(): BelongsTo
    {
        return $this->belongsTo(Kendaraan::class);
    }

    public function akunPembayaran(): BelongsTo
    {
        return $this->belongsTo(KelompokAkunPembayaran::class, 'akun_pembayaran_id');
    }
}
