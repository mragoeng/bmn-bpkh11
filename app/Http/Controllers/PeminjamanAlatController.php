<?php

namespace App\Http\Controllers;

use App\Http\Requests\PeminjamanAlatRequest;
use App\Models\PeminjamanAlat;
use App\Models\Alat;
use App\Models\Pegawai;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PeminjamanAlatController extends Controller
{
    public function index(): Response
    {
        $search = request('search');
        $status = request('status');

        $peminjaman = PeminjamanAlat::query()
            ->with(['alat:id,nama_barang,merk,tipe,kode_barang', 'pegawai:id,nip,nama,jabatan,unit'])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->whereHas('alat', function ($alatQuery) use ($search) {
                        $alatQuery->where('nama_barang', 'like', "%{$search}%")
                            ->orWhere('kode_barang', 'like', "%{$search}%");
                    })->orWhereHas('pegawai', function ($pegawaiQuery) use ($search) {
                        $pegawaiQuery->where('nama', 'like', "%{$search}%")
                            ->orWhere('nip', 'like', "%{$search}%");
                    });
                });
            })
            ->when($status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->latest('tanggal_pinjam')
            ->latest()
            ->get();

        return Inertia::render('PeminjamanAlat/Index', [
            'peminjaman' => $peminjaman,
            'alatOptions' => Alat::query()
                ->where('status', 'tersedia')
                ->orderBy('nama_barang')
                ->get(['id', 'kode_barang', 'nama_barang', 'merk', 'tipe']),
            'pegawaiOptions' => Pegawai::query()
                ->orderBy('nama')
                ->get(['id', 'nip', 'nama', 'jabatan', 'unit']),
        ]);
    }

    public function store(PeminjamanAlatRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        // Verify alat is available
        $alat = Alat::findOrFail($validated['alat_id']);
        if (!$alat->isTersedia()) {
            return back()->with('error', 'Alat tidak tersedia untuk dipinjam.');
        }

        // Create peminjaman
        $peminjaman = PeminjamanAlat::create([
            'alat_id' => $validated['alat_id'],
            'pegawai_id' => $validated['pegawai_id'],
            'tanggal_pinjam' => $validated['tanggal_pinjam'],
            'tanggal_kembali' => $validated['tanggal_kembali_rencana'],
            'keperluan' => $validated['keperluan'],
            'catatan' => $validated['catatan'] ?? null,
            'status' => 'dipinjam',
        ]);

        // Update alat status
        $alat->update(['status' => 'dipinjam']);

        return to_route('peminjaman-alat.index')->with('success', 'Peminjaman alat berhasil dicatat.');
    }

    public function update(PeminjamanAlatRequest $request, PeminjamanAlat $peminjaman_alat): RedirectResponse
    {
        $validated = $request->validated();

        // Handle return (setting actual return date)
        if (isset($validated['tanggal_kembali_aktual'])) {
            $peminjaman_alat->update([
                'kembali_aktual' => $validated['tanggal_kembali_aktual'],
                'status' => 'dikembalikan',
            ]);

            // Update alat status back to tersedia
            $peminjaman_alat->alat->update(['status' => 'tersedia']);

            return to_route('peminjaman-alat.index')->with('success', 'Pengembalian alat berhasil dicatat.');
        }

        // Regular update for other fields
        $peminjaman_alat->update([
            'alat_id' => $validated['alat_id'] ?? $peminjaman_alat->alat_id,
            'pegawai_id' => $validated['pegawai_id'] ?? $peminjaman_alat->pegawai_id,
            'tanggal_pinjam' => $validated['tanggal_pinjam'] ?? $peminjaman_alat->tanggal_pinjam,
            'tanggal_kembali' => $validated['tanggal_kembali_rencana'] ?? $peminjaman_alat->tanggal_kembali,
            'keperluan' => $validated['keperluan'] ?? $peminjaman_alat->keperluan,
            'catatan' => $validated['catatan'] ?? $peminjaman_alat->catatan,
        ]);

        return to_route('peminjaman-alat.index')->with('success', 'Data peminjaman berhasil diperbarui.');
    }

    public function destroy(PeminjamanAlat $peminjaman_alat): RedirectResponse
    {
        // If peminjaman is still active, restore alat status
        if ($peminjaman_alat->status === 'dipinjam') {
            $peminjaman_alat->alat->update(['status' => 'tersedia']);
        }

        $peminjaman_alat->delete();

        return to_route('peminjaman-alat.index')->with('success', 'Data peminjaman berhasil dihapus.');
    }
}