<?php

namespace App\Http\Controllers;

use App\Models\Kendaraan;
use App\Models\TransaksiBbm;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LaporanController extends Controller
{
    public function index(Request $request)
    {
        $periode = $request->input('periode', 'tahun');
        $tahun = (int) $request->input('tahun', date('Y'));
        $triwulan = (int) $request->input('triwulan', now()->quarter);
        $bulan = (int) $request->input('bulan', date('m'));

        $query = TransaksiBbm::query()->with([
            'pegawai:id,nama,nip,jabatan,unit',
            'kendaraan:id,kode_kendaraan,nomor_polisi,merk_tipe,jenis_kendaraan,jenis_bbm_default',
            'akunPembayaran:id,kode_akun,nama_akun',
        ]);

        switch ($periode) {
            case 'triwulan':
                $startMonth = ($triwulan - 1) * 3 + 1;
                $startDate = "{$tahun}-{$startMonth}-01";
                $endDate = date('Y-m-t', strtotime("{$tahun}-" . ($startMonth + 2) . "-01"));
                $query->whereBetween('tanggal', [$startDate, $endDate]);
                $periodeLabel = "Triwulan {$triwulan} Tahun {$tahun}";
                break;
            case 'bulan':
                $startDate = "{$tahun}-" . str_pad($bulan, 2, '0', STR_PAD_LEFT) . "-01";
                $endDate = date('Y-m-t', strtotime($startDate));
                $query->whereBetween('tanggal', [$startDate, $endDate]);
                $bulanNama = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
                $periodeLabel = "{$bulanNama[$bulan-1]} {$tahun}";
                break;
            case 'tahun':
            default:
                $query->whereYear('tanggal', $tahun);
                $periodeLabel = "Tahun {$tahun}";
                break;
        }

        $transactions = $query->get();

        $summary = [
            'periode' => $periodeLabel,
            'total_transaksi' => $transactions->count(),
            'total_liter' => $this->formatNumber($transactions->sum('liter')),
            'total_nominal' => $this->formatRupiah($transactions->sum('total')),
            'rata_rata_per_transaksi' => $this->formatRupiah($transactions->count() > 0 ? $transactions->sum('total') / $transactions->count() : 0),
        ];

        // Per Kendaraan
        $perKendaraan = $transactions->groupBy(fn($t) => $t->kendaraan_id)
            ->map(function ($items) {
                $k = $items->first()->kendaraan;
                $totalLiter = $items->sum('liter');
                $totalBiaya = $items->sum('total');
                $firstOdo = $items->whereNotNull('odometer')->where('odometer', '>', 0)->sortBy('odometer')->first()?->odometer;
                $lastOdo = $items->whereNotNull('odometer')->where('odometer', '>', 0)->sortByDesc('odometer')->first()?->odometer;
                $jarak = ($firstOdo && $lastOdo && $lastOdo > $firstOdo) ? $lastOdo - $firstOdo : null;

                return [
                    'kendaraan_id' => $items->first()->kendaraan_id,
                    'kode_kendaraan' => $k?->kode_kendaraan ?? '-',
                    'nomor_polisi' => $k?->nomor_polisi ?? '-',
                    'merk_tipe' => $k?->merk_tipe ?? '-',
                    'jenis_kendaraan' => $k?->jenis_kendaraan ?? '-',
                    'jumlah_transaksi' => $items->count(),
                    'total_liter' => $this->formatNumber($totalLiter),
                    'total_biaya' => $this->formatRupiah($totalBiaya),
                    'raw_total_biaya' => $totalBiaya,
                    'raw_total_liter' => $totalLiter,
                    'rata_rata_liter' => $items->count() > 0 ? $this->formatNumber($totalLiter / $items->count()) : '0',
                    'rata_rata_biaya' => $items->count() > 0 ? $this->formatRupiah($totalBiaya / $items->count()) : 'Rp 0',
                    'jarak_tempuh' => $jarak !== null ? number_format($jarak, 0, ',', '.') . ' km' : '-',
                    'km_per_liter' => ($jarak !== null && $totalLiter > 0) ? $this->formatNumber($jarak / $totalLiter) . ' km/l' : '-',
                    'jenis_bbm_terbanyak' => $items->groupBy('jenis_bbm')->map->count()->sortDesc()->keys()->first() ?? '-',
                ];
            })
            ->sortByDesc('raw_total_biaya')
            ->values();

        // Per Pegawai
        $perPegawai = $transactions->groupBy(fn($t) => $t->pegawai_id)
            ->map(function ($items) {
                $p = $items->first()->pegawai;
                return [
                    'nama' => $p?->nama ?? '-',
                    'nip' => $p?->nip ?? '-',
                    'jabatan' => $p?->jabatan ?? '-',
                    'unit' => $p?->unit ?? '-',
                    'jumlah_transaksi' => $items->count(),
                    'total_liter' => $this->formatNumber($items->sum('liter')),
                    'total_biaya' => $this->formatRupiah($items->sum('total')),
                    'kendaraan_digunakan' => $items->groupBy('kendaraan_id')->count(),
                ];
            })
            ->sortByDesc('jumlah_transaksi')
            ->values();

        // Per Jenis BBM
        $perBbm = $transactions->groupBy('jenis_bbm')
            ->map(function ($items, $jenis) {
                return [
                    'jenis_bbm' => $jenis ?: '-',
                    'jumlah_transaksi' => $items->count(),
                    'total_liter' => $this->formatNumber($items->sum('liter')),
                    'total_nominal' => $this->formatRupiah($items->sum('total')),
                ];
            })
            ->sortByDesc(fn($i) => (float) str_replace(['Rp ', '.', ','], '', $i['total_nominal']))
            ->values();

        // Monthly trend
        $bulanNama = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
        $trendBulanan = collect(range(1, 12))->map(function ($m) use ($tahun, $bulanNama) {
            $monthTx = TransaksiBbm::whereYear('tanggal', $tahun)->whereMonth('tanggal', $m)->get();
            return [
                'bulan' => $bulanNama[$m - 1],
                'bulan_num' => $m,
                'transaksi' => $monthTx->count(),
                'liter' => (float) $monthTx->sum('liter'),
                'nominal' => (float) $monthTx->sum('total'),
            ];
        });

        $tahunTersedia = TransaksiBbm::selectRaw('YEAR(tanggal) as tahun')
            ->distinct()->orderByDesc('tahun')->pluck('tahun')->toArray();
        if (empty($tahunTersedia)) $tahunTersedia = [(int) date('Y')];

        return Inertia::render('Bbm/Laporan', [
            'summary' => $summary,
            'perKendaraan' => $perKendaraan,
            'perPegawai' => $perPegawai,
            'perBbm' => $perBbm,
            'trendBulanan' => $trendBulanan,
            'filters' => [
                'periode' => $periode,
                'tahun' => $tahun,
                'triwulan' => $triwulan,
                'bulan' => $bulan,
            ],
            'tahunTersedia' => $tahunTersedia,
        ]);
    }

    public function cetakPdf(Request $request)
    {
        $periode = $request->input('periode', 'tahun');
        $tahun = (int) $request->input('tahun', date('Y'));
        $triwulan = (int) $request->input('triwulan', now()->quarter);
        $bulan = (int) $request->input('bulan', date('m'));

        $query = TransaksiBbm::query()->with(['pegawai', 'kendaraan', 'akunPembayaran']);

        switch ($periode) {
            case 'triwulan':
                $startMonth = ($triwulan - 1) * 3 + 1;
                $startDate = "{$tahun}-{$startMonth}-01";
                $endDate = date('Y-m-t', strtotime("{$tahun}-" . ($startMonth + 2) . "-01"));
                $query->whereBetween('tanggal', [$startDate, $endDate]);
                $periodeLabel = "Triwulan {$triwulan} Tahun {$tahun}";
                break;
            case 'bulan':
                $startDate = "{$tahun}-" . str_pad($bulan, 2, '0', STR_PAD_LEFT) . "-01";
                $endDate = date('Y-m-t', strtotime($startDate));
                $query->whereBetween('tanggal', [$startDate, $endDate]);
                $bulanNama = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
                $periodeLabel = "{$bulanNama[$bulan-1]} {$tahun}";
                break;
            default:
                $query->whereYear('tanggal', $tahun);
                $periodeLabel = "Tahun {$tahun}";
                break;
        }

        $transactions = $query->get();

        $perKendaraan = $transactions->groupBy(fn($t) => $t->kendaraan_id)
            ->map(function ($items) {
                $k = $items->first()->kendaraan;
                $totalLiter = $items->sum('liter');
                $totalBiaya = $items->sum('total');
                $firstOdo = $items->whereNotNull('odometer')->where('odometer', '>', 0)->sortBy('odometer')->first()?->odometer;
                $lastOdo = $items->whereNotNull('odometer')->where('odometer', '>', 0)->sortByDesc('odometer')->first()?->odometer;
                $jarak = ($firstOdo && $lastOdo && $lastOdo > $firstOdo) ? $lastOdo - $firstOdo : null;

                return [
                    'kode_kendaraan' => $k?->kode_kendaraan ?? '-',
                    'nomor_polisi' => $k?->nomor_polisi ?? '-',
                    'merk_tipe' => $k?->merk_tipe ?? '-',
                    'jenis_kendaraan' => $k?->jenis_kendaraan ?? '-',
                    'jumlah_transaksi' => $items->count(),
                    'total_liter' => $this->formatNumber($totalLiter),
                    'total_biaya' => $this->formatRupiah($totalBiaya),
                    'rata_rata_liter' => $items->count() > 0 ? $this->formatNumber($totalLiter / $items->count()) : '0',
                    'jarak_tempuh' => $jarak !== null ? number_format($jarak, 0, ',', '.') . ' km' : '-',
                    'km_per_liter' => ($jarak !== null && $totalLiter > 0) ? $this->formatNumber($jarak / $totalLiter) . ' km/l' : '-',
                    'raw_total_biaya' => $totalBiaya,
                ];
            })->sortByDesc('raw_total_biaya')->values();

        $perPegawai = $transactions->groupBy(fn($t) => $t->pegawai_id)
            ->map(function ($items) {
                $p = $items->first()->pegawai;
                return [
                    'nama' => $p?->nama ?? '-',
                    'nip' => $p?->nip ?? '-',
                    'unit' => $p?->unit ?? '-',
                    'jumlah_transaksi' => $items->count(),
                    'total_liter' => $this->formatNumber($items->sum('liter')),
                    'total_biaya' => $this->formatRupiah($items->sum('total')),
                ];
            })->sortByDesc(fn($i) => $i['jumlah_transaksi'])->values();

        $perBbm = $transactions->groupBy('jenis_bbm')
            ->map(function ($items, $jenis) {
                return [
                    'jenis_bbm' => $jenis ?: '-',
                    'jumlah_transaksi' => $items->count(),
                    'total_liter' => $this->formatNumber($items->sum('liter')),
                    'total_nominal' => $this->formatRupiah($items->sum('total')),
                ];
            })->values();

        $data = [
            'periode_label' => $periodeLabel,
            'tanggal_cetak' => now()->format('d F Y'),
            'summary' => [
                'total_transaksi' => $transactions->count(),
                'total_liter' => $this->formatNumber($transactions->sum('liter')),
                'total_nominal' => $this->formatRupiah($transactions->sum('total')),
            ],
            'perKendaraan' => $perKendaraan,
            'perPegawai' => $perPegawai,
            'perBbm' => $perBbm,
        ];

        $pdf = Pdf::loadView('print.laporan-bbm', $data)->setPaper('a4');
        $filename = "Laporan BBM - {$periodeLabel}.pdf";

        return $pdf->stream($filename);
    }

    private function formatRupiah(float $value): string
    {
        return 'Rp ' . number_format($value, 0, ',', '.');
    }

    private function formatNumber(float $value): string
    {
        return rtrim(rtrim(number_format($value, 2, '.', ''), '0'), '.');
    }
}
