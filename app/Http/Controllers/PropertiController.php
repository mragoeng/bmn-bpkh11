<?php

namespace App\Http\Controllers;

use App\Models\Properti;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PropertiController extends Controller
{
    public function index(): Response
    {
        $search = request('search');
        $jenis = request('jenis');
        $kondisi = request('kondisi');

        $properti = Properti::query()
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('nama_barang', 'like', "%{$search}%")
                        ->orWhere('kode_barang', 'like', "%{$search}%")
                        ->orWhere('alamat', 'like', "%{$search}%")
                        ->orWhere('pengguna', 'like', "%{$search}%");
                });
            })
            ->when($jenis, function ($query, $jenis) {
                $query->where('jenis_properti', $jenis);
            })
            ->when($kondisi, function ($query, $kondisi) {
                $query->where('kondisi', $kondisi);
            })
            ->orderBy('jenis_properti')
            ->orderBy('nama_barang')
            ->get();

        return Inertia::render('Database/Properti', [
            'properti' => $properti,
            'filters' => [
                'search' => $search,
                'jenis' => $jenis,
                'kondisi' => $kondisi,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'kode_barang' => 'nullable|string|max:50',
            'nup' => 'nullable|integer',
            'nama_barang' => 'required|string|max:255',
            'jenis_properti' => 'required|in:Tanah,Bangunan,Rumah Negara',
            'tipe' => 'nullable|string|max:100',
            'kondisi' => 'nullable|string|max:50',
            'status_bmn' => 'nullable|string|max:50',
            'nilai_perolehan' => 'nullable|numeric',
            'nilai_buku' => 'nullable|numeric',
            'luas_tanah' => 'nullable|numeric',
            'luas_bangunan' => 'nullable|numeric',
            'jumlah_lantai' => 'nullable|integer',
            'alamat' => 'nullable|string',
            'kelurahan' => 'nullable|string|max:100',
            'kecamatan' => 'nullable|string|max:100',
            'kab_kota' => 'nullable|string|max:100',
            'provinsi' => 'nullable|string|max:100',
            'kode_pos' => 'nullable|string|max:10',
            'pengguna' => 'nullable|string|max:255',
            'status_penggunaan' => 'nullable|string|max:255',
            'no_sertifikat' => 'nullable|string|max:100',
            'status_sertifikasi' => 'nullable|string|max:100',
            'kode_register' => 'nullable|string|max:100',
            'tanggal_perolehan' => 'nullable|date',
            'foto_bergeotag' => 'nullable|string|max:255',
            'foto_url' => 'nullable|string|max:500',
            'keterangan' => 'nullable|string',
        ]);

        Properti::create($validated);

        return back()->with('success', 'Properti berhasil ditambahkan.');
    }

    public function update(Request $request, Properti $properti): RedirectResponse
    {
        $validated = $request->validate([
            'kode_barang' => 'nullable|string|max:50',
            'nup' => 'nullable|integer',
            'nama_barang' => 'required|string|max:255',
            'jenis_properti' => 'required|in:Tanah,Bangunan,Rumah Negara',
            'tipe' => 'nullable|string|max:100',
            'kondisi' => 'nullable|string|max:50',
            'status_bmn' => 'nullable|string|max:50',
            'nilai_perolehan' => 'nullable|numeric',
            'nilai_buku' => 'nullable|numeric',
            'luas_tanah' => 'nullable|numeric',
            'luas_bangunan' => 'nullable|numeric',
            'jumlah_lantai' => 'nullable|integer',
            'alamat' => 'nullable|string',
            'kelurahan' => 'nullable|string|max:100',
            'kecamatan' => 'nullable|string|max:100',
            'kab_kota' => 'nullable|string|max:100',
            'provinsi' => 'nullable|string|max:100',
            'kode_pos' => 'nullable|string|max:10',
            'pengguna' => 'nullable|string|max:255',
            'status_penggunaan' => 'nullable|string|max:255',
            'no_sertifikat' => 'nullable|string|max:100',
            'status_sertifikasi' => 'nullable|string|max:100',
            'kode_register' => 'nullable|string|max:100',
            'tanggal_perolehan' => 'nullable|date',
            'foto_bergeotag' => 'nullable|string|max:255',
            'foto_url' => 'nullable|string|max:500',
            'keterangan' => 'nullable|string',
        ]);

        $properti->update($validated);

        return back()->with('success', 'Properti berhasil diperbarui.');
    }

    public function destroy(Properti $properti): RedirectResponse
    {
        $properti->delete();
        return back()->with('success', 'Properti berhasil dihapus.');
    }
}
