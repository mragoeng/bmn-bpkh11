<?php

namespace App\Http\Controllers;

use App\Http\Requests\AlatRequest;
use App\Models\Alat;
use App\Models\Pegawai;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AlatController extends Controller
{
    public function index(): Response
    {
        $search = request('search');
        $kondisi = request('kondisi');
        $status = request('status');

        $alat = Alat::query()
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('nama_barang', 'like', "%{$search}%")
                        ->orWhere('kode_barang', 'like', "%{$search}%")
                        ->orWhere('merk', 'like', "%{$search}%")
                        ->orWhere('tipe', 'like', "%{$search}%")
                        ->orWhere('lokasi', 'like', "%{$search}%");
                });
            })
            ->when($kondisi, function ($query, $kondisi) {
                $query->where('kondisi', $kondisi);
            })
            ->when($status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->latest()
            ->paginate(24)
            ->withQueryString();

        return Inertia::render('Database/Alat', [
            'alat' => $alat,
            'pegawaiOptions' => Pegawai::query()
                ->orderBy('nama')
                ->get(['id', 'nip', 'nama', 'jabatan', 'unit']),
        ]);
    }

    public function store(AlatRequest $request): RedirectResponse
    {
        Alat::create($request->validated());

        return to_route('database.alat.index')->with('success', 'Data alat berhasil ditambahkan.');
    }

    public function update(AlatRequest $request, Alat $alat): RedirectResponse
    {
        $alat->update($request->validated());

        return to_route('database.alat.index')->with('success', 'Data alat berhasil diperbarui.');
    }

    public function destroy(Alat $alat): RedirectResponse
    {
        $alat->delete();

        return to_route('database.alat.index')->with('success', 'Data alat berhasil dihapus.');
    }
}
