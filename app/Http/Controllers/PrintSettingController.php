<?php

namespace App\Http\Controllers;

use App\Http\Requests\PrintSettingRequest;
use App\Models\PrintSetting;
use App\Services\GoogleDocsSpjService;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class PrintSettingController extends Controller
{
    public function edit(): Response
    {
        $template = PrintSetting::query()->first();

        return Inertia::render('Settings/PengaturanPrint', [
            'template' => [
                'id' => $template?->id,
                'nama_template' => $template?->nama_template ?? 'SPJ BBM Kendaraan Dinas',
                'google_docs_url' => $template?->google_docs_url ?? '',
                'template_content' => $template?->template_content ?? '',
                'google_last_synced_at' => $template?->google_last_synced_at?->toDateTimeString(),
                'google_last_error' => $template?->google_last_error ?? '',
                'keterangan' => $template?->keterangan ?? 'Gunakan placeholder dengan format {{data}} agar isi SPJ otomatis terisi.',
                'placeholders' => [
                    '{{tanggal}}',
                    '{{nama_pegawai}}',
                    '{{nip}}',
                    '{{jabatan}}',
                    '{{unit}}',
                    '{{kode_kendaraan}}',
                    '{{nomor_polisi}}',
                    '{{merk_tipe}}',
                    '{{jenis_kendaraan}}',
                    '{{jenis_bbm}}',
                    '{{liter}}',
                    '{{harga_per_liter}}',
                    '{{total}}',
                    '{{terbilang}}',
                    '{{spbu}}',
                    '{{nomor_nota}}',
                    '{{odometer}}',
                    '{{catatan}}',
                    '{{tahun_anggaran}}',
                    '{{kode_akun_pembayaran}}',
                    '{{nama_akun_pembayaran}}',
                ],
            ],
            'googleDocsSetup' => [
                'auth_mode' => app(GoogleDocsSpjService::class)->authMode(),
                'oauth_configured' => filled(config('services.google_docs.client_id'))
                    && filled(config('services.google_docs.client_secret'))
                    && filled(config('services.google_docs.refresh_token')),
            ],
        ]);
    }

    public function update(PrintSettingRequest $request)
    {
        $template = PrintSetting::query()->first();

        if ($template) {
            $template->update($request->validated());
        } else {
            PrintSetting::query()->create($request->validated());
        }

        return to_route('settings.pengaturan-print')->with('success', 'Pengaturan print berhasil disimpan.');
    }

    public function testConnection(GoogleDocsSpjService $googleDocsSpjService): JsonResponse
    {
        try {
            return response()->json(
                $googleDocsSpjService->testConnection(PrintSetting::query()->first()),
            );
        } catch (Throwable $throwable) {
            return response()->json([
                'message' => $throwable->getMessage(),
            ], 422);
        }
    }
}
