<?php

namespace App\Http\Controllers;

use App\Models\Alat;
use App\Models\Kendaraan;
use App\Models\Pegawai;
use App\Models\Properti;
use App\Models\TransaksiBbm;
use App\Models\PeminjamanKendaraan;
use App\Models\PeminjamanAlat;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke()
    {
        $fmtRp = fn($v) => 'Rp ' . number_format((float) $v, 0, ',', '.'); 

        // 1-4. Total counts
        $totalKendaraan = Kendaraan::count();
        $kondisiBreakdown = Kendaraan::select('kondisi', DB::raw('count(*) as cnt'))
            ->groupBy('kondisi')->pluck('cnt', 'kondisi')->toArray();
        $totalPegawai = Pegawai::count();
        $totalAlat = Alat::count();
        $totalProperti = Properti::count();

        // 5. BBM bulan ini
        $now = now();
        $bbmThisMonth = TransaksiBbm::whereYear('tanggal', $now->year)
            ->whereMonth('tanggal', $now->month)
            ->selectRaw('COALESCE(SUM(liter),0) as total_liter, COALESCE(SUM(liter * harga_per_liter),0) as total_biaya, COUNT(*) as jumlah')
            ->first();

        // 6. BBM bulan lalu
        $lastMonth = $now->copy()->subMonth();
        $bbmLastMonth = TransaksiBbm::whereYear('tanggal', $lastMonth->year)
            ->whereMonth('tanggal', $lastMonth->month)
            ->selectRaw('COALESCE(SUM(liter),0) as total_liter, COALESCE(SUM(liter * harga_per_liter),0) as total_biaya')
            ->first();

        $lastBiaya = (float) ($bbmLastMonth->total_biaya ?? 0);
        $thisBiaya = (float) ($bbmThisMonth->total_biaya ?? 0);
        $bbmChangePercent = $lastBiaya > 0 ? round((($thisBiaya - $lastBiaya) / $lastBiaya) * 100, 1) : ($thisBiaya > 0 ? 100 : 0);

        // 7. Peminjaman kendaraan
        $pinjamKendaraanAktif = PeminjamanKendaraan::where('status', 'DISETUJUI')->count();
        $pinjamKendaraanPending = PeminjamanKendaraan::where('status', 'MENUNGGU')->count();

        // 8. Peminjaman alat
        $pinjamAlatAktif = PeminjamanAlat::where('status', 'dipinjam')->count();
        $pinjamAlatDikembalikan = PeminjamanAlat::where('status', 'dikembalikan')->count();

        // 9. Top 5 BBM kendaraan bulan ini
        $topBbm = TransaksiBbm::whereYear('tanggal', $now->year)
            ->whereMonth('tanggal', $now->month)
            ->select('kendaraan_id', DB::raw('SUM(liter) as total_liter'), DB::raw('SUM(liter * harga_per_liter) as total_biaya'))
            ->groupBy('kendaraan_id')
            ->orderByDesc('total_liter')
            ->with('kendaraan:id,merk_tipe,nomor_polisi')
            ->limit(5)
            ->get()
            ->map(fn($r) => [
                'kendaraan' => $r->kendaraan?->merk_tipe ?? '-',
                'nopol' => $r->kendaraan?->nomor_polisi ?? '-',
                'liter' => round((float) $r->total_liter, 1),
                'biaya' => $fmtRp($r->total_biaya),
            ]);

        // 10. Trend BBM 6 bulan terakhir
        $trendBbm = [];
        for ($i = 5; $i >= 0; $i--) {
            $m = $now->copy()->subMonths($i);
            $row = TransaksiBbm::whereYear('tanggal', $m->year)
                ->whereMonth('tanggal', $m->month)
                ->selectRaw('COALESCE(SUM(liter),0) as total_liter, COALESCE(SUM(liter * harga_per_liter),0) as total_biaya')
                ->first();
            $trendBbm[] = [
                'bulan' => $m->translatedFormat('M Y'),
                'liter' => round((float) ($row->total_liter ?? 0), 1),
                'biaya' => round((float) ($row->total_biaya ?? 0)),
            ];
        }

        // 11. Aktivitas terbaru
        $latestBbm = TransaksiBbm::with(['pegawai:id,nama', 'kendaraan:id,merk_tipe,nomor_polisi'])
            ->latest('tanggal')->latest('id')->limit(5)->get()
            ->map(fn($t) => [
                'type' => 'bbm',
                'tanggal' => $t->tanggal?->format('d M Y'),
                'pegawai' => $t->pegawai?->nama ?? '-',
                'keterangan' => ($t->kendaraan?->merk_tipe ?? '-'). ' - ' . round((float)$t->liter, 1) . 'L (' . $fmtRp($t->liter * $t->harga_per_liter) . ')',
            ]);

        $latestPinjam = PeminjamanKendaraan::with(['pegawai:id,nama', 'kendaraan:id,merk_tipe,nomor_polisi'])
            ->latest('created_at')->limit(5)->get()
            ->map(fn($p) => [
                'type' => 'pinjam_kendaraan',
                'tanggal' => $p->tanggal_pinjam ? \Carbon\Carbon::parse($p->tanggal_pinjam)->format('d M Y') : '-',
                'pegawai' => $p->pegawai?->nama ?? '-',
                'keterangan' => ($p->kendaraan?->merk_tipe ?? '-') . ' - ' . $p->keperluan . ' [' . $p->status . ']',
            ]);

        $latestAlatPinjam = PeminjamanAlat::with(['pegawai:id,nama', 'alat:id,nama_barang'])
            ->latest('created_at')->limit(5)->get()
            ->map(fn($p) => [
                'type' => 'pinjam_alat',
                'tanggal' => $p->tanggal_pinjam ? \Carbon\Carbon::parse($p->tanggal_pinjam)->format('d M Y') : '-',
                'pegawai' => $p->pegawai?->nama ?? '-',
                'keterangan' => ($p->alat?->nama_barang ?? '-') . ' - ' . $p->keperluan . ' [' . $p->status . ']',
            ]);

        $aktivitas = $latestBbm->concat($latestPinjam)->concat($latestAlatPinjam)
            ->sortByDesc('tanggal')->take(10)->values();

        // 12. Kendaraan perlu perhatian
        $kendaraanPerhatian = Kendaraan::where('kondisi', '!=', 'Baik')
            ->orWhere('kondisi', 'Rusak Ringan')
            ->orWhere('kondisi', 'Rusak Berat')
            ->select('id', 'merk_tipe', 'nomor_polisi', 'kondisi', 'jenis_kendaraan')
            ->get()
            ->map(fn($k) => [
                'id' => $k->id,
                'merk' => $k->merk_tipe,
                'nopol' => $k->nomor_polisi,
                'kondisi' => $k->kondisi,
                'jenis' => $k->jenis_kendaraan,
            ]);

        return Inertia::render('Dashboard', [
            'stats' => [
                'kendaraan' => [
                    'total' => $totalKendaraan,
                    'baik' => $kondisiBreakdown['Baik'] ?? 0,
                    'rusakRingan' => $kondisiBreakdown['Rusak Ringan'] ?? 0,
                    'rusakBerat' => $kondisiBreakdown['Rusak Berat'] ?? 0,
                ],
                'pegawai' => $totalPegawai,
                'alat' => $totalAlat,
                'properti' => $totalProperti,
            ],
            'bbm' => [
                'bulanIni' => [
                    'liter' => round((float) ($bbmThisMonth->total_liter ?? 0), 1),
                    'biaya' => $fmtRp($thisBiaya),
                    'biayaRaw' => $thisBiaya,
                    'transaksi' => (int) ($bbmThisMonth->jumlah ?? 0),
                ],
                'bulanLalu' => [
                    'biayaRaw' => $lastBiaya,
                ],
                'changePercent' => $bbmChangePercent,
                'trend' => $trendBbm,
                'topKendaraan' => $topBbm,
            ],
            'peminjaman' => [
                'kendaraanAktif' => $pinjamKendaraanAktif,
                'kendaraanPending' => $pinjamKendaraanPending,
                'alatAktif' => $pinjamAlatAktif,
                'alatDikembalikan' => $pinjamAlatDikembalikan,
            ],
            'aktivitas' => $aktivitas,
            'perhatian' => $kendaraanPerhatian,
        ]);
    }
}
