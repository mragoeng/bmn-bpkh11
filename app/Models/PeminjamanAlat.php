<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PeminjamanAlat extends Model
{
    use HasFactory;

    protected $table = 'peminjaman_alat';

    protected $fillable = [
        'alat_id',
        'pegawai_id',
        'tanggal_pinjam',
        'tanggal_kembali',
        'kembali_aktual',
        'status',
        'keperluan',
        'catatan',
    ];

    protected $casts = [
        'tanggal_pinjam' => 'date',
        'tanggal_kembali' => 'date',
        'kembali_aktual' => 'date',
    ];

    /**
     * Get the alat that is borrowed.
     */
    public function alat()
    {
        return $this->belongsTo(Alat::class, 'alat_id');
    }

    /**
     * Get the pegawai who borrowed the alat.
     */
    public function pegawai()
    {
        return $this->belongsTo(Pegawai::class, 'pegawai_id');
    }

    /**
     * Scope for active borrowings.
     */
    public function scopeDipinjam($query)
    {
        return $query->where('status', 'dipinjam');
    }

    /**
     * Scope for returned items.
     */
    public function scopeDikembalikan($query)
    {
        return $query->where('status', 'dikembalikan');
    }

    /**
     * Scope for late returns.
     */
    public function scopeTerlambat($query)
    {
        return $query->where('status', 'terlambat');
    }

    /**
     * Check if the borrowing is overdue.
     */
    public function isTerlambat(): bool
    {
        if (!$this->tanggal_kembali || $this->status === 'dikembalikan') {
            return false;
        }
        return now()->isAfter($this->tanggal_kembali);
    }

    /**
     * Check if the borrowing is active.
     */
    public function isAktif(): bool
    {
        return $this->status === 'dipinjam';
    }

    /**
     * Mark as returned.
     */
    public function kembalikan(): void
    {
        $this->update([
            'status' => 'dikembalikan',
            'kembali_aktual' => now(),
        ]);

        // Update alat status to tersedia
        $this->alat->update(['status' => 'tersedia']);
    }

    /**
     * Get days borrowed.
     */
    public function getLamaPinjam(): int
    {
        $endDate = $this->kembali_aktual ?? now();
        return $this->tanggal_pinjam->diffInDays($endDate);
    }
}