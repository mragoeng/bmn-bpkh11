<?php

namespace App\Support;

use App\Models\PrintSetting;
use App\Models\TransaksiBbm;
use Carbon\Carbon;
use NumberFormatter;

class SpjPlaceholderBuilder
{
    public static function build(TransaksiBbm $transaksi): array
    {
        $tanggal = Carbon::parse($transaksi->tanggal)->locale('id');
        $total = (float) $transaksi->total;
        $hargaPerLiter = (float) $transaksi->harga_per_liter;
        $liter = (float) $transaksi->liter;
        $odometer = $transaksi->odometer !== null ? (float) $transaksi->odometer : null;

        return [
            '{{tanggal}}' => $tanggal->translatedFormat('d F Y'),
            '{{nama_pegawai}}' => $transaksi->pegawai?->nama ?? '',
            '{{nip}}' => $transaksi->pegawai?->nip ?? '',
            '{{jabatan}}' => $transaksi->pegawai?->jabatan ?? '',
            '{{unit}}' => $transaksi->pegawai?->unit ?? '',
            '{{kode_kendaraan}}' => $transaksi->kendaraan?->kode_kendaraan ?? '',
            '{{nomor_polisi}}' => $transaksi->kendaraan?->nomor_polisi ?? '',
            '{{merk_tipe}}' => $transaksi->kendaraan?->merk_tipe ?? '',
            '{{jenis_kendaraan}}' => str_replace('_', ' ', $transaksi->kendaraan?->jenis_kendaraan ?? ''),
            '{{jenis_bbm}}' => $transaksi->jenis_bbm,
            '{{liter}}' => self::formatNumber($liter),
            '{{harga_per_liter}}' => self::formatRupiah($hargaPerLiter),
            '{{total}}' => self::formatRupiah($total),
            '{{terbilang}}' => self::spellOutRupiah($total),
            '{{spbu}}' => $transaksi->spbu ?? '',
            '{{nomor_nota}}' => $transaksi->nomor_nota ?? '',
            '{{odometer}}' => $odometer !== null ? self::formatNumber($odometer) : '',
            '{{catatan}}' => $transaksi->catatan ?? '',
            '{{tahun_anggaran}}' => (string) $tanggal->year,
            '{{kode_akun_pembayaran}}' => $transaksi->akunPembayaran?->kode_akun ?? '',
            '{{nama_akun_pembayaran}}' => $transaksi->akunPembayaran?->nama_akun ?? '',
        ];
    }

    public static function mergeTemplate(?string $template, array $placeholders): string
    {
        $defaultTemplate = <<<TEXT
Nama Template belum diisi.

Data SPJ:
- Tanggal: {{tanggal}}
- Pegawai: {{nama_pegawai}}
- NIP: {{nip}}
- Jabatan: {{jabatan}}
- Unit: {{unit}}
- Kendaraan: {{merk_tipe}} / {{nomor_polisi}}
- Jenis Kendaraan: {{jenis_kendaraan}}
- Jenis BBM: {{jenis_bbm}}
- Liter: {{liter}}
- Harga per Liter: {{harga_per_liter}}
- Total: {{total}}
- Terbilang: {{terbilang}}
- SPBU: {{spbu}}
- Nomor Nota: {{nomor_nota}}
- Odometer: {{odometer}}
- Kode Akun: {{kode_akun_pembayaran}}
- Nama Akun: {{nama_akun_pembayaran}}
- Catatan: {{catatan}}
TEXT;

        $content = filled($template) ? $template : $defaultTemplate;
        $isHtmlTemplate = self::looksLikeHtml($content);
        $normalizedPlaceholders = collect($placeholders)
            ->mapWithKeys(fn (string $value, string $key) => [
                mb_strtolower(trim($key, '{} ')) => $isHtmlTemplate
                    ? nl2br(e($value), false)
                    : $value,
            ])
            ->all();

        return preg_replace_callback('/{{\s*([^}]+?)\s*}}/u', function (array $matches) use ($normalizedPlaceholders) {
            $lookupKey = mb_strtolower(trim($matches[1]));

            return $normalizedPlaceholders[$lookupKey] ?? $matches[0];
        }, $content) ?? $content;
    }

    public static function templateMetadata(?PrintSetting $setting): array
    {
        return [
            'nama_template' => $setting?->nama_template ?? 'SPJ BBM Kendaraan Dinas',
            'google_docs_url' => $setting?->google_docs_url ?? '',
            'template_content' => $setting?->template_content ?? '',
            'keterangan' => $setting?->keterangan ?? '',
        ];
    }

    private static function formatRupiah(float $value): string
    {
        return 'Rp '.number_format($value, 0, ',', '.');
    }

    private static function formatNumber(float $value): string
    {
        return rtrim(rtrim(number_format($value, 2, '.', ''), '0'), '.');
    }

    private static function spellOutRupiah(float $value): string
    {
        if (class_exists(NumberFormatter::class)) {
            $formatter = new NumberFormatter('id', NumberFormatter::SPELLOUT);

            return ucfirst($formatter->format((int) round($value))).' rupiah';
        }

        return self::formatRupiah($value);
    }

    private static function looksLikeHtml(string $content): bool
    {
        return preg_match('/<\s*(html|body|table|tr|td|p|div|span)\b/i', $content) === 1;
    }
}
