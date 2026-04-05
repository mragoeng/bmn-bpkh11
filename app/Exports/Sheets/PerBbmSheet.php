<?php

namespace App\Exports\Sheets;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithHeadings;

class PerBbmSheet implements FromArray, WithTitle, WithHeadings
{
    protected $data;

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public function headings(): array
    {
        return ['No', 'Jenis BBM', 'Jumlah Transaksi', 'Total Liter', 'Total Nominal'];
    }

    public function array(): array
    {
        $transactions = $this->data['transactions'];

        return $transactions->groupBy('jenis_bbm')->map(function ($items, $jenis) {
            return [
                $jenis ?: '-',
                $items->count(),
                $items->sum('liter'),
                $items->sum('total'),
            ];
        })->sortByDesc(fn($i) => $i[3])->values()->map(function ($row, $i) {
            return array_merge([$i + 1], $row);
        })->toArray();
    }

    public function title(): string
    {
        return 'Per BBM';
    }
}
