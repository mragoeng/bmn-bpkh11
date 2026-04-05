<?php

namespace App\Exports;

use App\Models\TransaksiBbm;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class LaporanBbmExport implements WithMultipleSheets
{
    protected $periode;
    protected $tahun;
    protected $triwulan;
    protected $bulan;

    public function __construct(string $periode, int $tahun, int $triwulan, int $bulan)
    {
        $this->periode = $periode;
        $this->tahun = $tahun;
        $this->triwulan = $triwulan;
        $this->bulan = $bulan;
    }

    public function sheets(): array
    {
        $data = $this->getFilteredData();

        return [
            'Summary' => new Sheets\SummarySheet($data),
            'Per Kendaraan' => new Sheets\PerKendaraanSheet($data),
            'Per Pegawai' => new Sheets\PerPegawaiSheet($data),
            'Per BBM' => new Sheets\PerBbmSheet($data),
            'Detail Transaksi' => new Sheets\DetailTransaksiSheet($data),
        ];
    }

    public function getFilteredData(): array
    {
        $query = TransaksiBbm::query()->with(['pegawai', 'kendaraan', 'akunPembayaran']);

        switch ($this->periode) {
            case 'triwulan':
                $startMonth = ($this->triwulan - 1) * 3 + 1;
                $startDate = "{$this->tahun}-{$startMonth}-01";
                $endDate = date('Y-m-t', strtotime("{$this->tahun}-" . ($startMonth + 2) . "-01"));
                $query->whereBetween('tanggal', [$startDate, $endDate]);
                $periodeLabel = "Triwulan {$this->triwulan} Tahun {$this->tahun}";
                break;
            case 'bulan':
                $startDate = "{$this->tahun}-" . str_pad($this->bulan, 2, '0', STR_PAD_LEFT) . "-01";
                $endDate = date('Y-m-t', strtotime($startDate));
                $query->whereBetween('tanggal', [$startDate, $endDate]);
                $bulanNama = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
                $periodeLabel = "{$bulanNama[$this->bulan-1]} {$this->tahun}";
                break;
            default:
                $query->whereYear('tanggal', $this->tahun);
                $periodeLabel = "Tahun {$this->tahun}";
                break;
        }

        $transactions = $query->get();

        return [
            'periodeLabel' => $periodeLabel,
            'transactions' => $transactions,
        ];
    }
}
