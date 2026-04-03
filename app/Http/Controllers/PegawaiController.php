<?php

namespace App\Http\Controllers;

use App\Http\Requests\ImportCsvRequest;
use App\Http\Requests\PegawaiRequest;
use App\Models\Pegawai;
use App\Services\CsvImportService;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Inertia\Inertia;
use Inertia\Response;

class PegawaiController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Database/Pegawai', [
            'pegawai' => Pegawai::query()
                ->latest()
                ->get(['id', 'nip', 'nama', 'jabatan', 'unit', 'keterangan']),
        ]);
    }

    public function store(PegawaiRequest $request)
    {
        Pegawai::create($request->validated());

        return to_route('database.pegawai')->with('success', 'Data pegawai berhasil ditambahkan.');
    }

    public function update(PegawaiRequest $request, Pegawai $pegawai)
    {
        $pegawai->update($request->validated());

        return to_route('database.pegawai')->with('success', 'Data pegawai berhasil diperbarui.');
    }

    public function destroy(Pegawai $pegawai)
    {
        $pegawai->delete();

        return to_route('database.pegawai')->with('success', 'Data pegawai berhasil dihapus.');
    }

    public function import(ImportCsvRequest $request, CsvImportService $csvImportService)
    {
        $result = $csvImportService->importPegawai($request->file('file'));

        return to_route('database.pegawai')->with(
            'success',
            "Import pegawai selesai. {$result['total']} baris diproses, {$result['created']} ditambahkan, {$result['updated']} diperbarui.",
        );
    }

    public function downloadTemplate(): StreamedResponse
    {
        return response()->streamDownload(function () {
            echo "nip,nama,jabatan,unit,keterangan\n";
            echo "198703102010011001,Ahmad Fauzi,Analis BMN,Sekretariat,Data awal\n";
        }, 'template-import-pegawai.csv', [
            'Content-Type' => 'text/csv',
        ]);
    }
}
