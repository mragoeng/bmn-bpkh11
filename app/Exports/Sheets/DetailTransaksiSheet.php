<?php

namespace App\Exports\Sheets;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;

class DetailTransaksiSheet implements FromArray, WithTitle, WithHeadings, WithColumnFormatting
{
    protected $data;

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public function headings(): array
    {
        return ['No', 'Tanggal', 'Pegawai', 'NIP', 'Kendaraan', 'Nopol', 'Jenis BBM', 'Liter', 'Harga/Liter', 'Total', 'SPBU', 'No Nota', 'Catatan'];
    }

    public function array(): array
    {
        return $this->data['transactions']->map(function ($t, $i) {
            return [
                $i + 1,
                $t->tanggal ? $t->tanggal->format('d/m/Y') : '-',
                $t->pegawai?->nama ?? '-',
                $t->pegawai?->nip ?? '-',
                $t->kendaraan?->merk_tipe ?? '-',
                $t->kendaraan?->nomor_polisi ?? '-',
                $t->jenis_bbm ?? '-',
                $t->liter,
                $t->harga_per_liter,
                $t->total,
                $t->spbu ?? '-',
                $t->no_nota ?? '-',
                $t->catatan ?? '-',
            ];
        })->toArray();
    }

    public function title(): string
    {
        return 'Detail Transaksi';
    }

    public function columnFormats(): array
    {
        return [
            'H' => '#,##0.00',
            'I' => '#,##0',
            'J' => '#,##0',
        ];
    }
}
