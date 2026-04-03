<?php

namespace App\Http\Controllers;

use App\Http\Requests\KelompokAkunPembayaranRequest;
use App\Models\KelompokAkunPembayaran;
use Inertia\Inertia;
use Inertia\Response;

class KelompokAkunPembayaranController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Bbm/KelompokAkunPembayaran', [
            'akunList' => KelompokAkunPembayaran::query()
                ->orderByDesc('tahun')
                ->orderBy('jenis_kendaraan')
                ->orderBy('kode_akun')
                ->get(['id', 'tahun', 'jenis_kendaraan', 'kode_akun', 'nama_akun', 'keterangan']),
        ]);
    }

    public function store(KelompokAkunPembayaranRequest $request)
    {
        KelompokAkunPembayaran::create($request->validated());

        return to_route('bbm.kelompok-akun-pembayaran')->with('success', 'Akun pembayaran berhasil ditambahkan.');
    }

    public function update(KelompokAkunPembayaranRequest $request, KelompokAkunPembayaran $akun)
    {
        $akun->update($request->validated());

        return to_route('bbm.kelompok-akun-pembayaran')->with('success', 'Akun pembayaran berhasil diperbarui.');
    }

    public function destroy(KelompokAkunPembayaran $akun)
    {
        $akun->delete();

        return to_route('bbm.kelompok-akun-pembayaran')->with('success', 'Akun pembayaran berhasil dihapus.');
    }
}
