<?php

namespace App\Http\Controllers;

use App\Models\ServisKendaraan;
use App\Models\Kendaraan;
use App\Models\Pegawai;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class ServisKendaraanController extends Controller
{
    public function index(): Response
    {
        $search = request('search');
        $kendaraanId = request('kendaraan_id');
        $jenis = request('jenis');
        $bulan = request('bulan');
        $tahun = request('tahun');

        $servis = ServisKendaraan::query()
            ->with(['kendaraan:id,merk_tipe,nomor_polisi,nama_barang', 'pegawai:id,nama,nip,jabatan'])
            ->when($search, function ($q, $s) {
                $q->where(function ($query) use ($s) {
                    $query->whereHas('kendaraan', fn($k) => $k->where('merk_tipe', 'like', "%{$s}%")->orWhere('nomor_polisi', 'like', "%{$s}%"))
                        ->orWhereHas('pegawai', fn($p) => $p->where('nama', 'like', "%{$s}%"))
                        ->orWhere('keterangan', 'like', "%{$s}%");
                });
            })
            ->when($kendaraanId, fn($q) => $q->where('kendaraan_id', $kendaraanId))
            ->when($jenis, fn($q) => $q->where('jenis_servis', $jenis))
            ->when($bulan, fn($q) => $q->whereMonth('tanggal_servis', $bulan))
            ->when($tahun, fn($q) => $q->whereYear('tanggal_servis', $tahun))
            ->latest('tanggal_servis')->latest()->get();

        $now = now();
        $bulanIni = ServisKendaraan::whereYear('tanggal_servis', $now->year)->whereMonth('tanggal_servis', $now->month);
        $fmtRp = fn($v) => 'Rp ' . number_format((float) $v, 0, ',', '.');

        return Inertia::render('ServisKendaraan/Index', [
            'servis' => $servis,
            'kendaraanOptions' => Kendaraan::orderBy('nama_barang')->get(['id', 'nama_barang', 'merk_tipe', 'nomor_polisi']),
            'pegawaiOptions' => Pegawai::orderBy('nama')->get(['id', 'nip', 'nama', 'jabatan']),
            'filters' => compact('search', 'kendaraanId', 'jenis', 'bulan', 'tahun'),
            'stats' => [
                'total_bulan_ini' => $bulanIni->count(),
                'total_biaya_bulan_ini' => $fmtRp((float) $bulanIni->sum('biaya')),
                'servis_besar' => (clone $bulanIni)->where('jenis_servis', 'SERVIS_BESAR')->count(),
                'maintenance_rutin' => (clone $bulanIni)->whereIn('jenis_servis', ['ISI_ANGIN', 'CUCI_KENDARAAN', 'CEK_OLI', 'CEK_REM', 'CEK_AKI', 'CEK_LAMPU'])->count(),
            ],
            'jenisOptions' => [
                'SERVIS_BESAR' => 'Servis Besar', 'GANTI_OLI' => 'Ganti Oli', 'GANTI_BAN' => 'Ganti Ban',
                'GANTI_AKI' => 'Ganti Aki', 'PERBAIKAN_REM' => 'Perbaikan Rem', 'PERBAIKAN_AC' => 'Perbaikan AC',
                'PERBAIKAN_BODI' => 'Perbaikan Bodi', 'PERBAIKAN_MESIN' => 'Perbaikan Mesin',
                'ISI_ANGIN' => 'Isi Angin', 'CUCI_KENDARAAN' => 'Cuci Kendaraan',
                'CEK_OLI' => 'Cek Oli', 'CEK_REM' => 'Cek Rem', 'CEK_AKI' => 'Cek Aki', 'CEK_LAMPU' => 'Cek Lampu',
                'LAINNYA' => 'Lainnya',
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'kendaraan_id' => 'required|exists:kendaraan,id',
            'pegawai_id' => 'required|exists:pegawai,id',
            'tanggal_servis' => 'required|date',
            'jenis_servis' => 'required|string',
            'keterangan' => 'nullable|string|max:255',
            'km_saat_servis' => 'nullable|integer',
            'biaya' => 'required|numeric|min:0',
            'tempat_servis' => 'nullable|string|max:255',
            'status' => 'nullable|string',
            'catatan' => 'nullable|string',
            'bukti_files.*' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        $buktiPaths = [];
        if ($request->hasFile('bukti_files')) {
            foreach ($request->file('bukti_files') as $file) {
                $buktiPaths[] = $file->store('bukti-servis-kendaraan', 'public');
            }
        }
        $validated['bukti_files'] = $buktiPaths;
        ServisKendaraan::create($validated);

        return to_route('bbm.servis-kendaraan.index')->with('success', 'Data servis berhasil dicatat.');
    }

    public function update(Request $request, ServisKendaraan $servis_kendaraan): RedirectResponse
    {
        $validated = $request->validate([
            'kendaraan_id' => 'sometimes|required|exists:kendaraan,id',
            'pegawai_id' => 'sometimes|required|exists:pegawai,id',
            'tanggal_servis' => 'sometimes|required|date',
            'jenis_servis' => 'sometimes|required|string',
            'keterangan' => 'nullable|string|max:255',
            'km_saat_servis' => 'nullable|integer',
            'biaya' => 'sometimes|required|numeric|min:0',
            'tempat_servis' => 'nullable|string|max:255',
            'status' => 'nullable|string',
            'catatan' => 'nullable|string',
        ]);
        $servis_kendaraan->update($validated);
        return to_route('bbm.servis-kendaraan.index')->with('success', 'Data servis berhasil diperbarui.');
    }

    public function uploadBukti(Request $request, ServisKendaraan $servis_kendaraan): RedirectResponse
    {
        $request->validate(['bukti' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120']);
        $existing = $servis_kendaraan->bukti_files ?? [];
        if (count($existing) >= 5) return back()->with('error', 'Maksimal 5 bukti file.');
        $path = $request->file('bukti')->store('bukti-servis-kendaraan', 'public');
        $existing[] = $path;
        $servis_kendaraan->update(['bukti_files' => $existing]);
        return to_route('bbm.servis-kendaraan.index')->with('success', 'Bukti berhasil diupload.');
    }

    public function deleteBukti(Request $request, ServisKendaraan $servis_kendaraan): RedirectResponse
    {
        $request->validate(['path' => 'required|string']);
        $existing = array_values(array_filter($servis_kendaraan->bukti_files ?? [], fn($p) => $p !== $request->path));
        if ($request->path && Storage::disk('public')->exists($request->path)) Storage::disk('public')->delete($request->path);
        $servis_kendaraan->update(['bukti_files' => $existing]);
        return to_route('bbm.servis-kendaraan.index')->with('success', 'Bukti berhasil dihapus.');
    }

    public function destroy(ServisKendaraan $servis_kendaraan): RedirectResponse
    {
        foreach ($servis_kendaraan->bukti_files ?? [] as $path) Storage::disk('public')->delete($path);
        $servis_kendaraan->delete();
        return to_route('bbm.servis-kendaraan.index')->with('success', 'Data servis berhasil dihapus.');
    }

    public function laporan(): Response
    {
        $bulan = request('bulan', now()->month);
        $tahun = request('tahun', now()->year);
        $fmtRp = fn($v) => 'Rp ' . number_format((float) $v, 0, ',', '.');

        $perKendaraan = ServisKendaraan::whereYear('tanggal_servis', $tahun)->whereMonth('tanggal_servis', $bulan)
            ->with('kendaraan:id,merk_tipe,nomor_polisi')
            ->select('kendaraan_id', DB::raw('COUNT(*) as jumlah'), DB::raw('SUM(biaya) as total_biaya'))
            ->groupBy('kendaraan_id')->get();

        $perJenis = ServisKendaraan::whereYear('tanggal_servis', $tahun)->whereMonth('tanggal_servis', $bulan)
            ->select('jenis_servis', DB::raw('COUNT(*) as jumlah'), DB::raw('SUM(biaya) as total_biaya'))
            ->groupBy('jenis_servis')->orderByDesc('total_biaya')->get();

        return Inertia::render('ServisKendaraan/Laporan', [
            'perKendaraan' => $perKendaraan->map(fn($p) => [
                'kendaraan' => ($p->kendaraan?->merk_tipe ?? '-').' ('.($p->kendaraan?->nomor_polisi ?? '-').')',
                'jumlah' => $p->jumlah, 'total_biaya' => $fmtRp((float) $p->total_biaya),
            ]),
            'perJenis' => $perJenis->map(fn($p) => [
                'jenis' => $p->jenis_servis, 'jumlah' => $p->jumlah, 'total_biaya' => $fmtRp((float) $p->total_biaya),
            ]),
            'totalBiaya' => $fmtRp((float) $perKendaraan->sum('total_biaya')),
            'bulan' => (int) $bulan, 'tahun' => (int) $tahun,
        ]);
    }

    public function laporanPdf()
    {
        $bulan = request('bulan', now()->month);
        $tahun = request('tahun', now()->year);
        $fmtRp = fn($v) => 'Rp ' . number_format((float) $v, 0, ',', '.');

        $servis = ServisKendaraan::whereYear('tanggal_servis', $tahun)->whereMonth('tanggal_servis', $bulan)
            ->with(['kendaraan', 'pegawai'])->orderBy('tanggal_servis')->get();

        $pdf = Pdf::loadView('pdf.laporan-servis', [
            'servis' => $servis,
            'totalBiaya' => $fmtRp((float) $servis->sum('biaya')),
            'bulan' => $bulan, 'tahun' => $tahun, 'fmtRp' => $fmtRp,
        ]);
        return $pdf->stream("laporan-servis-{$tahun}-{$bulan}.pdf");
    }

    public function exportExcel()
    {
        $servis = ServisKendaraan::with(['kendaraan', 'pegawai'])->orderBy('tanggal_servis', 'desc')->get();
        $headers = [['Tanggal', 'Kendaraan', 'No. Polisi', 'Jenis Servis', 'KM', 'Biaya', 'Tempat', 'Pegawai', 'Status']];
        $rows = $servis->map(fn($s) => [
            $s->tanggal_servis->format('Y-m-d'), $s->kendaraan?->merk_tipe ?? '-', $s->kendaraan?->nomor_polisi ?? '-',
            $s->jenis_servis, $s->km_saat_servis ?? '-', $s->biaya, $s->tempat_servis ?? '-', $s->pegawai?->nama ?? '-', $s->status,
        ]);
        $callback = function() use ($headers, $rows) {
            $f = fopen('php://output', 'w');
            foreach ($headers as $h) fputcsv($f, $h);
            foreach ($rows as $r) fputcsv($f, $r->toArray());
            fclose($f);
        };
        return response()->streamDownload($callback, 'data-servis-kendaraan.csv', ['Content-Type' => 'text/csv']);
    }
}
