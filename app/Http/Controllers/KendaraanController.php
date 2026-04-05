<?php

namespace App\Http\Controllers;

use App\Http\Requests\ImportCsvRequest;
use App\Http\Requests\KendaraanRequest;
use App\Models\Kendaraan;
use App\Models\Pegawai;
use App\Services\CsvImportService;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Inertia\Inertia;
use Inertia\Response;

class KendaraanController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Database/Kendaraan', [
            'kendaraan' => Kendaraan::query()
                ->with('pegawai:id,nama')
                ->latest()
                ->get()
                ->map(fn (Kendaraan $kendaraan) => [
                    'id' => $kendaraan->id,
                    'kode_kendaraan' => $kendaraan->kode_kendaraan,
                    'kode_barang' => $kendaraan->kode_barang,
                    'nup' => $kendaraan->nup,
                    'nama_barang' => $kendaraan->nama_barang,
                    'nomor_polisi' => $kendaraan->nomor_polisi,
                    'merk_tipe' => $kendaraan->merk_tipe,
                    'jenis_kendaraan' => $kendaraan->jenis_kendaraan,
                    'tahun' => $kendaraan->tahun,
                    'jenis_bbm_default' => $kendaraan->jenis_bbm_default,
                    'pegawai_id' => $kendaraan->pegawai_id,
                    'kondisi' => $kendaraan->kondisi,
                    'status_bmn' => $kendaraan->status_bmn,
                    'nilai_perolehan' => $kendaraan->nilai_perolehan,
                    'kode_register' => $kendaraan->kode_register,
                    'pengguna' => $kendaraan->pengguna ?: $kendaraan->pegawai?->nama,
                    'foto_url' => $kendaraan->foto_url,
                    'keterangan' => $kendaraan->keterangan,
                ]),
            'pegawaiOptions' => Pegawai::query()
                ->orderBy('nama')
                ->get(['id', 'nama']),
        ]);
    }

    public function store(KendaraanRequest $request)
    {
        Kendaraan::create($request->validated());

        return to_route('database.kendaraan')->with('success', 'Data kendaraan berhasil ditambahkan.');
    }

    public function update(KendaraanRequest $request, Kendaraan $kendaraan)
    {
        $kendaraan->update($request->validated());

        return to_route('database.kendaraan')->with('success', 'Data kendaraan berhasil diperbarui.');
    }

    public function destroy(Kendaraan $kendaraan)
    {
        $kendaraan->delete();

        return to_route('database.kendaraan')->with('success', 'Data kendaraan berhasil dihapus.');
    }

    public function import(ImportCsvRequest $request, CsvImportService $csvImportService)
    {
        $result = $csvImportService->importKendaraan($request->file('file'));

        return to_route('database.kendaraan')->with(
            'success',
            "Import kendaraan selesai. {$result['total']} baris diproses, {$result['created']} ditambahkan, {$result['updated']} diperbarui.",
        );
    }

    public function downloadTemplate(): StreamedResponse
    {
        return response()->streamDownload(function () {
            echo "kode_kendaraan,nomor_polisi,merk_tipe,jenis_kendaraan,tahun,jenis_bbm_default,pegawai_nip,keterangan\n";
            echo "KD-01,B 1234 KQ,Toyota Avanza,roda_4,2023,Pertalite,198703102010011001,Kendaraan dinas\n";
        }, 'template-import-kendaraan.csv', [
            'Content-Type' => 'text/csv',
        ]);
    }
}
