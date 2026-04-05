<?php

namespace App\Exports\Sheets;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;

class SummarySheet implements FromArray, WithTitle, WithColumnFormatting
{
    protected $data;

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public function array(): array
    {
        $tx = $this->data['transactions'];
        $totalLiter = $tx->sum('liter');
        $totalNominal = $tx->sum('total');

        return [
            ['LAPORAN BBM'],
            ['Periode: ' . $this->data['periodeLabel']],
            ['Dicetak: ' . now()->format('d F Y')],
            [],
            ['Keterangan', 'Nilai'],
            ['Periode', $this->data['periodeLabel']],
            ['Total Transaksi', $tx->count()],
            ['Total Liter', $totalLiter],
            ['Total Nominal', $totalNominal],
            ['Rata-rata per Transaksi', $tx->count() > 0 ? $totalNominal / $tx->count() : 0],
        ];
    }

    public function title(): string
    {
        return 'Summary';
    }

    public function columnFormats(): array
    {
        return [
            'B8' => '#,##0.00',
            'B9' => '#,##0',
            'B10' => '#,##0',
        ];
    }
}
