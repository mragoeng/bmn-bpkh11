<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServisKendaraan extends Model
{
    use HasFactory;

    protected $table = 'servis_kendaraan';

    protected $fillable = [
        'kendaraan_id', 'pegawai_id', 'tanggal_servis', 'jenis_servis',
        'keterangan', 'km_saat_servis', 'biaya', 'tempat_servis',
        'status', 'bukti_files', 'catatan',
    ];

    protected $casts = [
        'tanggal_servis' => 'date',
        'bukti_files' => 'array',
        'biaya' => 'decimal:2',
    ];

    public function kendaraan() { return $this->belongsTo(Kendaraan::class); }
    public function pegawai() { return $this->belongsTo(Pegawai::class); }
    public function scopeByKendaraan($q, $id) { return $q->where('kendaraan_id', $id); }
    public function scopeByJenis($q, $j) { return $q->where('jenis_servis', $j); }
    public function scopeByBulan($q, $b) { return $q->whereMonth('tanggal_servis', $b); }
    public function scopeByTahun($q, $t) { return $q->whereYear('tanggal_servis', $t); }
}
