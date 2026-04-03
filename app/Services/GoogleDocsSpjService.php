<?php

namespace App\Services;

use App\Models\PrintSetting;
use App\Models\TransaksiBbm;
use App\Support\SpjPlaceholderBuilder;
use Google\Client;
use Google\Service\Docs;
use Google\Service\Docs\BatchUpdateDocumentRequest;
use Google\Service\Drive;
use Google\Service\Drive\DriveFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use RuntimeException;

class GoogleDocsSpjService
{
    public function generateFromTransaction(TransaksiBbm $transaksi, ?PrintSetting $setting = null): array
    {
        $setting ??= PrintSetting::query()->first();

        if (! $setting || blank($setting->google_docs_url)) {
            throw new RuntimeException('Template Google Docs belum diatur di menu Pengaturan Print.');
        }

        $templateId = $this->extractGoogleId($setting->google_docs_url, '/document/d/');

        if (! $templateId) {
            throw new RuntimeException('URL template Google Docs tidak valid.');
        }

        $folderId = $setting->google_drive_folder_url
            ? $this->extractGoogleId($setting->google_drive_folder_url, '/folders/')
            : null;

        if ($setting->google_drive_folder_url && ! $folderId) {
            throw new RuntimeException('URL folder Google Drive output tidak valid.');
        }

        [$driveService, $docsService] = $this->makeServices();

        $transaksi->loadMissing([
            'pegawai:id,nip,nama,jabatan,unit',
            'kendaraan:id,kode_kendaraan,nomor_polisi,merk_tipe,jenis_kendaraan',
            'akunPembayaran:id,kode_akun,nama_akun',
        ]);

        $placeholders = SpjPlaceholderBuilder::build($transaksi);
        $copyMetadata = new DriveFile([
            'name' => $this->buildGeneratedName($transaksi),
            'parents' => $folderId ? [$folderId] : null,
        ]);

        $copiedFile = $driveService->files->copy(
            $templateId,
            $copyMetadata,
            [
                'fields' => 'id,name,webViewLink',
                'supportsAllDrives' => true,
            ],
        );

        $requests = collect($placeholders)
            ->map(fn (string $value, string $key) => [
                'replaceAllText' => [
                    'containsText' => [
                        'text' => $key,
                        'matchCase' => true,
                    ],
                    'replaceText' => $value,
                ],
            ])
            ->values()
            ->all();

        $docsService->documents->batchUpdate(
            $copiedFile->id,
            new BatchUpdateDocumentRequest([
                'requests' => $requests,
            ]),
        );

        $file = $driveService->files->get(
            $copiedFile->id,
            [
                'fields' => 'id,name,webViewLink',
                'supportsAllDrives' => true,
            ],
        );

        return [
            'id' => $file->id,
            'name' => $file->name,
            'url' => $file->webViewLink,
        ];
    }

    public function testConnection(?PrintSetting $setting = null): array
    {
        $setting ??= PrintSetting::query()->first();

        if (! $setting || blank($setting->google_docs_url)) {
            throw new RuntimeException('Template Google Docs belum diatur di menu Pengaturan Print.');
        }

        $templateId = $this->extractGoogleId($setting->google_docs_url, '/document/d/');

        if (! $templateId) {
            throw new RuntimeException('URL template Google Docs tidak valid.');
        }

        $folderId = $setting->google_drive_folder_url
            ? $this->extractGoogleId($setting->google_drive_folder_url, '/folders/')
            : null;

        if ($setting->google_drive_folder_url && ! $folderId) {
            throw new RuntimeException('URL folder Google Drive output tidak valid.');
        }

        [$driveService, $docsService] = $this->makeServices();
        $document = $docsService->documents->get($templateId);
        $templateFile = $driveService->files->get(
            $templateId,
            [
                'fields' => 'id,name,webViewLink,mimeType,owners(displayName,emailAddress)',
                'supportsAllDrives' => true,
            ],
        );

        $folder = null;

        if ($folderId) {
            $folderFile = $driveService->files->get(
                $folderId,
                [
                    'fields' => 'id,name,webViewLink,mimeType',
                    'supportsAllDrives' => true,
                ],
            );

            $folder = [
                'id' => $folderFile->id,
                'name' => $folderFile->name,
                'url' => $folderFile->webViewLink,
                'mime_type' => $folderFile->mimeType,
            ];
        }

        return [
            'message' => 'Koneksi Google Docs berhasil.',
            'service_account_configured' => true,
            'impersonated_user' => config('services.google_docs.impersonated_user'),
            'template' => [
                'id' => $templateFile->id,
                'title' => $document->getTitle(),
                'name' => $templateFile->name,
                'url' => $templateFile->webViewLink,
                'mime_type' => $templateFile->mimeType,
                'owner' => Arr::first($templateFile->owners)?->emailAddress,
            ],
            'folder' => $folder,
        ];
    }

    private function makeServices(): array
    {
        $client = new Client();
        $client->setApplicationName('BMN-BPKH11 SPJ Generator');
        $client->setScopes([
            Docs::DOCUMENTS,
            Drive::DRIVE,
        ]);
        $client->setAuthConfig($this->serviceAccountJsonPath());
        $client->setAccessType('offline');

        if (filled(config('services.google_docs.impersonated_user'))) {
            $client->setSubject(config('services.google_docs.impersonated_user'));
        }

        return [
            new Drive($client),
            new Docs($client),
        ];
    }

    private function serviceAccountJsonPath(): string
    {
        $path = config('services.google_docs.service_account_json_path');

        if (blank($path)) {
            throw new RuntimeException('GOOGLE_SERVICE_ACCOUNT_JSON_PATH belum diatur di environment.');
        }

        if (! str_starts_with($path, DIRECTORY_SEPARATOR) && ! preg_match('/^[A-Za-z]:\\\\/', $path)) {
            $path = base_path($path);
        }

        if (! file_exists($path)) {
            throw new RuntimeException('File service account Google tidak ditemukan pada path yang diberikan.');
        }

        return $path;
    }

    private function extractGoogleId(string $url, string $segment): ?string
    {
        $pattern = sprintf('#%s([^/?]+)#', preg_quote($segment, '#'));

        if (preg_match($pattern, $url, $matches)) {
            return $matches[1];
        }

        return null;
    }

    private function buildGeneratedName(TransaksiBbm $transaksi): string
    {
        $nomorPolisi = Str::of($transaksi->kendaraan?->nomor_polisi ?? 'tanpa nopol')
            ->squish()
            ->upper();
        $namaPegawai = Str::of($transaksi->pegawai?->nama ?? 'tanpa pegawai')
            ->squish()
            ->title();

        return sprintf(
            'SPJ BBM - %s - %s - %s',
            $transaksi->tanggal,
            $nomorPolisi,
            $namaPegawai,
        );
    }
}
