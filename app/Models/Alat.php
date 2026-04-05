<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Alat extends Model
{
    use HasFactory;

    protected $table = 'alat';

    protected $fillable = [
        'kode_barang',
        'nup',
        'nama_barang',
        'merk',
        'tipe',
        'kode_register',
        'kondisi',
        'status_bmn',
        'nilai_perolehan',
        'lokasi',
        'foto_url',
        'foto_bergeotag',
        'status',
        'keterangan',
    ];

    protected $casts = [
        'nilai_perolehan' => 'decimal:2',
        'nup' => 'integer',
    ];

    /**
     * Get the peminjaman records for this alat.
     */
    public function peminjamanAlat()
    {
        return $this->hasMany(PeminjamanAlat::class, 'alat_id');
    }

    /**
     * Scope for available tools.
     */
    public function scopeTersedia($query)
    {
        return $query->where('status', 'tersedia');
    }

    /**
     * Scope for tools that are currently borrowed.
     */
    public function scopeDipinjam($query)
    {
        return $query->where('status', 'dipinjam');
    }

    /**
     * Scope for tools under maintenance.
     */
    public function scopeMaintenance($query)
    {
        return $query->where('status', 'maintenance');
    }

    /**
     * Check if the tool is available.
     */
    public function isTersedia(): bool
    {
        return $this->status === 'tersedia';
    }

    /**
     * Check if the tool is currently borrowed.
     */
    public function isDipinjam(): bool
    {
        return $this->status === 'dipinjam';
    }

    /**
     * Get the current active borrowing.
     */
    public function peminjamanAktif()
    {
        return $this->hasOne(PeminjamanAlat::class, 'alat_id')
            ->where('status', 'dipinjam')
            ->latest();
    }
}