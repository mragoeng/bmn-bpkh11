<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PeminjamanKendaraan extends Model
{
    use HasFactory;

    protected $table = 'peminjaman_kendaraan';

    protected $fillable = [
        'kendaraan_id',
        'pegawai_id',
        'tanggal_pinjam',
        'tanggal_kembali',
        'keperluan',
        'status',
        'keterangan',
        'bukti_pdf_path',
        'nomor_surat',
    ];

    protected $casts = [
        'tanggal_pinjam' => 'date',
        'tanggal_kembali' => 'date',
    ];

    public function kendaraan()
    {
        return $this->belongsTo(Kendaraan::class);
    }

    public function pegawai()
    {
        return $this->belongsTo(Pegawai::class);
    }

    public function isMenunggu(): bool
    {
        return $this->status === 'MENUNGGU';
    }

    public function isDisetujui(): bool
    {
        return $this->status === 'DISETUJUI';
    }

    public function generateNomorSurat(): string
    {
        $year = now()->year;
        $count = static::whereYear('created_at', $year)->count() + 1;
        return sprintf('%03d/PIN-KEND/BPKH-XI/%d', $count, $year);
    }
}
