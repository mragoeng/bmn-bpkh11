<?php

namespace App\Exports\Sheets;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithHeadings;

class PerKendaraanSheet implements FromArray, WithTitle, WithHeadings
{
    protected $data;

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public function headings(): array
    {
        return ['No', 'Kode Kendaraan', 'Nopol', 'Merk/Tipe', 'Jenis Kendaraan', 'Jumlah Transaksi', 'Total Liter', 'Total Biaya', 'Rata-rata Liter', 'Rata-rata Biaya'];
    }

    public function array(): array
    {
        $transactions = $this->data['transactions'];

        return $transactions->groupBy(fn($t) => $t->kendaraan_id)->map(function ($items) {
            $k = $items->first()->kendaraan;
            $totalLiter = $items->sum('liter');
            $totalBiaya = $items->sum('total');
            return [
                $k?->kode_kendaraan ?? '-',
                $k?->nomor_polisi ?? '-',
                $k?->merk_tipe ?? '-',
                $k?->jenis_kendaraan ?? '-',
                $items->count(),
                $totalLiter,
                $totalBiaya,
                $items->count() > 0 ? $totalLiter / $items->count() : 0,
                $items->count() > 0 ? $totalBiaya / $items->count() : 0,
            ];
        })->sortByDesc(fn($i) => $i[6])->values()->map(function ($row, $i) {
            return array_merge([$i + 1], $row);
        })->toArray();
    }

    public function title(): string
    {
        return 'Per Kendaraan';
    }
}
