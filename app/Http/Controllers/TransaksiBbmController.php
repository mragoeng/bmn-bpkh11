<?php

namespace App\Http\Controllers;

use App\Http\Requests\ImportCsvRequest;
use App\Http\Requests\TransaksiBbmRequest;
use App\Models\KelompokAkunPembayaran;
use App\Models\Kendaraan;
use App\Models\Pegawai;
use App\Models\PrintSetting;
use App\Models\TransaksiBbm;
use App\Services\GoogleDocsSpjService;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Services\CsvImportService;
use App\Support\SpjPlaceholderBuilder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

class TransaksiBbmController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Bbm/Riwayat', [
            'transactions' => TransaksiBbm::query()
                ->with([
                    'pegawai:id,nama',
                    'kendaraan:id,merk_tipe,nomor_polisi',
                ])
                ->latest('tanggal')
                ->latest('id')
                ->paginate(15)
                ->through(fn (TransaksiBbm $transaction) => [
                    'id' => $transaction->id,
                    'tanggal' => $transaction->tanggal,
                    'pegawai' => $transaction->pegawai?->nama ?? '-',
                    'kendaraan' => $transaction->kendaraan?->merk_tipe ?? '-',
                    'nomor_polisi' => $transaction->kendaraan?->nomor_polisi ?? '-',
                    'jenis_bbm' => $transaction->jenis_bbm,
                    'liter' => rtrim(rtrim(number_format((float) $transaction->liter, 2, '.', ''), '0'), '.'),
                    'total' => $this->formatRupiah((float) $transaction->total),
                    'nomor_nota' => $transaction->nomor_nota,
                    'spj_pdf_url' => route('bbm.riwayat.spj-pdf', $transaction),
                    'edit_url' => route('bbm.pencatatan.edit', $transaction),
                    'delete_url' => route('bbm.pencatatan.destroy', $transaction),
                ]),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Bbm/PencatatanBbm', $this->formPageData());
    }

    public function store(TransaksiBbmRequest $request)
    {
        TransaksiBbm::query()->create($this->validatedTransactionData($request));

        return to_route('bbm.riwayat')->with('success', 'Transaksi BBM berhasil disimpan.');
    }

    public function edit(TransaksiBbm $transaksi): Response
    {
        return Inertia::render('Bbm/PencatatanBbm', $this->formPageData($transaksi));
    }

    public function update(TransaksiBbmRequest $request, TransaksiBbm $transaksi)
    {
        $transaksi->update($this->validatedTransactionData($request));

        return to_route('bbm.riwayat')->with('success', 'Transaksi BBM berhasil diperbarui.');
    }

    public function destroy(TransaksiBbm $transaksi)
    {
        $transaksi->delete();

        return to_route('bbm.riwayat')->with('success', 'Transaksi BBM berhasil dihapus.');
    }

    public function import(ImportCsvRequest $request, CsvImportService $csvImportService)
    {
        $result = $csvImportService->importTransaksiBbm($request->file('file'));

        return to_route('bbm.riwayat')->with(
            'success',
            "Import transaksi BBM selesai. {$result['total']} baris diproses, {$result['created']} ditambahkan, {$result['updated']} diperbarui.",
        );
    }

    public function previewSpj(TransaksiBbm $transaksi): RedirectResponse
    {
        return to_route('bbm.riwayat.spj-pdf', $transaksi);
    }

    public function printSpj(TransaksiBbm $transaksi): RedirectResponse
    {
        return to_route('bbm.riwayat.spj-pdf', $transaksi);
    }

    public function downloadPdf(
        TransaksiBbm $transaksi,
        GoogleDocsSpjService $googleDocsSpjService,
    )
    {
        $spjData = $this->buildSpjData($transaksi, $googleDocsSpjService);
        $pdf = Pdf::setOption([
            'isRemoteEnabled' => true,
            'isHtml5ParserEnabled' => true,
        ]);

        if ($spjData['render_mode'] === 'html') {
            $pdf->loadHTML($this->prepareGoogleTemplatePdfHtml($spjData['mergedContent']));
        } else {
            $pdf->loadView('print.spj-pdf', [
                'transaction' => $spjData['transaction'],
                'template' => $spjData['template'],
                'placeholders' => $spjData['placeholders'],
                'placeholderMap' => $spjData['placeholderMap'],
                'mergedContent' => $spjData['mergedContent'],
            ]);
        }

        $pdf->setPaper('a4');

        $filename = sprintf(
            'SPJ BBM - %s - %s.pdf',
            $transaksi->tanggal,
            $transaksi->kendaraan?->nomor_polisi ?? 'tanpa-nopol',
        );

        return $pdf->stream($filename);
    }

    public function downloadTemplate(): StreamedResponse
    {
        return response()->streamDownload(function () {
            echo "tanggal,pegawai_nip,nomor_polisi,odometer,jenis_bbm,liter,harga_per_liter,spbu,nomor_nota,catatan,kode_akun\n";
            echo "2026-04-03,198703102010011001,B 1234 KQ,15420,Pertalite,24,10000,SPBU Lenteng Agung,NOTA-01,Import awal,521212\n";
        }, 'template-import-transaksi-bbm.csv', [
            'Content-Type' => 'text/csv',
        ]);
    }

    private function buildSpjData(
        TransaksiBbm $transaksi,
        ?GoogleDocsSpjService $googleDocsSpjService = null,
    ): array
    {
        $transaksi->load([
            'pegawai:id,nip,nama,jabatan,unit',
            'kendaraan:id,kode_kendaraan,nomor_polisi,merk_tipe,jenis_kendaraan',
            'akunPembayaran:id,kode_akun,nama_akun',
        ]);

        $setting = PrintSetting::query()->first();
        $placeholders = SpjPlaceholderBuilder::build($transaksi);
        $template = SpjPlaceholderBuilder::templateMetadata($setting);
        $templateContent = $template['template_content'];
        $renderMode = 'text';

        if ($googleDocsSpjService) {
            try {
                $resolvedTemplate = $googleDocsSpjService->resolveTemplateDocument($setting);
                $templateContent = $resolvedTemplate['content'] ?? $templateContent;
                $renderMode = $resolvedTemplate['format'] ?? 'text';
            } catch (Throwable $throwable) {
                Log::warning('Gagal menyiapkan template SPJ dari Google Docs. Template lokal/default akan dipakai.', [
                    'transaction_id' => $transaksi->id,
                    'message' => $throwable->getMessage(),
                ]);
            }
        }

        return [
            'transaction' => [
                'id' => $transaksi->id,
                'tanggal' => $transaksi->tanggal,
                'pegawai' => $transaksi->pegawai?->nama ?? '-',
                'kendaraan' => $transaksi->kendaraan?->merk_tipe ?? '-',
                'nomor_polisi' => $transaksi->kendaraan?->nomor_polisi ?? '-',
                'total' => $placeholders['{{total}}'],
            ],
            'template' => $template,
            'placeholders' => collect($placeholders)
                ->map(fn (string $value, string $key) => [
                    'key' => $key,
                    'value' => $value,
                ])
                ->values()
                ->all(),
            'placeholderMap' => collect($placeholders)
                ->mapWithKeys(fn (string $value, string $key) => [
                    trim($key, '{}') => $value,
                ])
                ->all(),
            'mergedContent' => SpjPlaceholderBuilder::mergeTemplate(
                $templateContent,
                $placeholders,
            ),
            'render_mode' => $renderMode,
        ];
    }

    private function formPageData(?TransaksiBbm $transaksi = null): array
    {
        return [
            'pegawaiOptions' => Pegawai::query()
                ->orderBy('nama')
                ->get(['id', 'nama', 'nip']),
            'kendaraanOptions' => Kendaraan::query()
                ->orderBy('nomor_polisi')
                ->get(['id', 'kode_kendaraan', 'nomor_polisi', 'merk_tipe', 'jenis_kendaraan', 'jenis_bbm_default']),
            'akunOptions' => KelompokAkunPembayaran::query()
                ->orderByDesc('tahun')
                ->orderBy('jenis_kendaraan')
                ->orderBy('kode_akun')
                ->get(['id', 'tahun', 'jenis_kendaraan', 'kode_akun', 'nama_akun']),
            'transaction' => $transaksi ? [
                'id' => $transaksi->id,
                'tanggal' => $transaksi->tanggal,
                'pegawai_id' => $transaksi->pegawai_id,
                'kendaraan_id' => $transaksi->kendaraan_id,
                'akun_pembayaran_id' => $transaksi->akun_pembayaran_id,
                'odometer' => $transaksi->odometer,
                'jenis_bbm' => $transaksi->jenis_bbm,
                'liter' => $transaksi->liter,
                'harga_per_liter' => $transaksi->harga_per_liter,
                'spbu' => $transaksi->spbu,
                'nomor_nota' => $transaksi->nomor_nota,
                'catatan' => $transaksi->catatan,
            ] : null,
        ];
    }

    private function validatedTransactionData(TransaksiBbmRequest $request): array
    {
        $validated = $request->validated();
        $kendaraan = Kendaraan::query()->findOrFail($validated['kendaraan_id']);
        $tahun = (int) date('Y', strtotime($validated['tanggal']));

        if (empty($validated['akun_pembayaran_id'])) {
            $validated['akun_pembayaran_id'] = KelompokAkunPembayaran::query()
                ->where('tahun', $tahun)
                ->where('jenis_kendaraan', $kendaraan->jenis_kendaraan)
                ->value('id');
        }

        $validated['total'] = (float) $validated['liter'] * (float) $validated['harga_per_liter'];

        return $validated;
    }

    private function formatRupiah(float $value): string
    {
        return 'Rp '.number_format($value, 0, ',', '.');
    }

    private function prepareGoogleTemplatePdfHtml(string $html): string
    {
        $pageStyle = <<<'HTML'
<style>
    @page {
        size: A4;
        margin: 0;
    }

    html,
    body {
        margin: 0;
    }

    body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }
</style>
HTML;

        if (! preg_match('/<html\b/i', $html)) {
            return <<<HTML
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    {$pageStyle}
</head>
<body>
{$html}
</body>
</html>
HTML;
        }

        if (preg_match('/<\/head>/i', $html)) {
            return preg_replace('/<\/head>/i', $pageStyle.'</head>', $html, 1) ?? $html;
        }

        return preg_replace('/<html([^>]*)>/i', '<html$1><head><meta charset="utf-8">'.$pageStyle.'</head>', $html, 1) ?? $html;
    }
}
