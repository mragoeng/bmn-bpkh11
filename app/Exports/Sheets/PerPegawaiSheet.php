<?php

namespace App\Exports\Sheets;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithHeadings;

class PerPegawaiSheet implements FromArray, WithTitle, WithHeadings
{
    protected $data;

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public function headings(): array
    {
        return ['No', 'Nama', 'NIP', 'Jabatan', 'Unit', 'Jumlah Transaksi', 'Total Liter', 'Total Biaya', 'Kendaraan Digunakan'];
    }

    public function array(): array
    {
        $transactions = $this->data['transactions'];

        return $transactions->groupBy(fn($t) => $t->pegawai_id)->map(function ($items) {
            $p = $items->first()->pegawai;
            return [
                $p?->nama ?? '-',
                $p?->nip ?? '-',
                $p?->jabatan ?? '-',
                $p?->unit ?? '-',
                $items->count(),
                $items->sum('liter'),
                $items->sum('total'),
                $items->groupBy('kendaraan_id')->count(),
            ];
        })->sortByDesc(fn($i) => $i[4])->values()->map(function ($row, $i) {
            return array_merge([$i + 1], $row);
        })->toArray();
    }

    public function title(): string
    {
        return 'Per Pegawai';
    }
}
