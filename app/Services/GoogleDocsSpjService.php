<?php

namespace App\Services;

use App\Models\PrintSetting;
use Google\Client;
use Google\Service\Docs;
use Google\Service\Drive;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;
use RuntimeException;

class GoogleDocsSpjService
{
    public function resolveTemplateDocument(?PrintSetting $setting = null): array
    {
        $setting ??= PrintSetting::query()->first();

        if (! $setting) {
            return [
                'content' => null,
                'format' => 'text',
                'source' => 'empty',
            ];
        }

        if (filled($setting->google_docs_url)) {
            try {
                $templateId = $this->extractGoogleId($setting->google_docs_url, '/document/d/');

                if (! $templateId) {
                    throw new RuntimeException('URL template Google Docs tidak valid.');
                }

                [$driveService] = $this->makeServices();
                $documentHtml = $this->exportDocumentHtml($driveService, $templateId);

                if (filled($documentHtml)) {
                    $this->syncTemplateCache($setting, $documentHtml);

                    return [
                        'content' => $documentHtml,
                        'format' => 'html',
                        'source' => 'google_docs',
                    ];
                }
            } catch (Throwable $throwable) {
                $this->markSyncFailure($setting, $throwable);

                if (filled($setting->template_content)) {
                    Log::warning('Gagal membaca template Google Docs, memakai salinan template internal terakhir.', [
                        'message' => $throwable->getMessage(),
                    ]);

                    return [
                        'content' => $setting->template_content,
                        'format' => $this->detectTemplateFormat($setting->template_content),
                        'source' => 'cache',
                    ];
                }

                throw $throwable;
            }
        }

        return [
            'content' => $setting->template_content,
            'format' => $this->detectTemplateFormat($setting->template_content),
            'source' => 'manual',
        ];
    }

    public function resolveTemplateContent(?PrintSetting $setting = null): ?string
    {
        return $this->resolveTemplateDocument($setting)['content'];
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

        [$driveService, $docsService] = $this->makeServices();
        $document = $docsService->documents->get($templateId);
        $templateFile = $driveService->files->get(
            $templateId,
            [
                'fields' => 'id,name,webViewLink,mimeType,owners(displayName,emailAddress)',
                'supportsAllDrives' => true,
            ],
        );
        $documentHtml = $this->exportDocumentHtml($driveService, $templateId);
        $previewText = trim(preg_replace('/\s+/u', ' ', strip_tags($documentHtml))) ?: $this->extractDocumentText($document);

        $this->syncTemplateCache($setting, filled($documentHtml) ? $documentHtml : $this->extractDocumentText($document));

        return [
            'message' => 'Akses Google Docs berhasil.',
            'auth_mode' => $this->authMode(),
            'template' => [
                'id' => $templateFile->id,
                'title' => $document->getTitle(),
                'name' => $templateFile->name,
                'url' => $templateFile->webViewLink,
                'mime_type' => $templateFile->mimeType,
                'owner' => Arr::first($templateFile->owners)?->emailAddress,
            ],
            'template_preview' => Str::limit($previewText, 160),
            'cache_updated' => true,
        ];
    }

    public function authMode(): array
    {
        if ($this->hasOauthRefreshTokenConfig()) {
            return [
                'key' => 'oauth_refresh_token',
                'label' => 'OAuth Refresh Token',
                'description' => 'Paling simpel jika token dibuat dari OAuth Playground Google.',
            ];
        }

        if ($this->hasServiceAccountConfig()) {
            return [
                'key' => 'service_account',
                'label' => 'Service Account',
                'description' => 'Cocok untuk akses internal atau Google Workspace dengan impersonasi.',
            ];
        }

        return [
            'key' => 'not_configured',
            'label' => 'Belum dikonfigurasi',
            'description' => 'Atur OAuth refresh token atau service account di environment.',
        ];
    }

    private function makeServices(): array
    {
        $client = $this->makeClient();

        return [
            new Drive($client),
            new Docs($client),
        ];
    }

    private function makeClient(): Client
    {
        $client = new Client();
        $client->setApplicationName('BMN-BPKH11 SPJ Generator');
        $client->setScopes([
            Docs::DOCUMENTS,
            Drive::DRIVE_READONLY,
        ]);

        if ($this->hasOauthRefreshTokenConfig()) {
            $client->setClientId((string) config('services.google_docs.client_id'));
            $client->setClientSecret((string) config('services.google_docs.client_secret'));
            $token = $client->fetchAccessTokenWithRefreshToken(
                (string) config('services.google_docs.refresh_token'),
            );

            if (($token['error'] ?? null) !== null) {
                $message = 'OAuth Google gagal';

                if (filled($token['error'])) {
                    $message .= ': '.$token['error'];
                }

                if (filled($token['error_description'])) {
                    $message .= ' ('.$token['error_description'].')';
                }

                if (($token['error'] ?? null) === 'invalid_grant') {
                    $message .= '. Biasanya refresh token tidak cocok dengan client id/client secret, token dibuat dari OAuth Playground tanpa opsi "Use your own OAuth credentials", atau refresh token sudah tidak berlaku karena consent screen masih mode Testing.';
                }

                throw new RuntimeException($message.'.');
            }

            $client->setAccessToken($token);

            return $client;
        }

        if (! $this->hasServiceAccountConfig()) {
            throw new RuntimeException('Konfigurasi Google belum lengkap. Gunakan OAuth refresh token atau service account.');
        }

        $client->setAuthConfig($this->serviceAccountJsonPath());
        $client->setAccessType('offline');

        if (filled(config('services.google_docs.impersonated_user'))) {
            $client->setSubject(config('services.google_docs.impersonated_user'));
        }

        return $client;
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

    private function hasOauthRefreshTokenConfig(): bool
    {
        return filled(config('services.google_docs.client_id'))
            && filled(config('services.google_docs.client_secret'))
            && filled(config('services.google_docs.refresh_token'));
    }

    private function hasServiceAccountConfig(): bool
    {
        return filled(config('services.google_docs.service_account_json_path'));
    }

    private function exportDocumentHtml(Drive $driveService, string $templateId): string
    {
        $stream = $driveService->files->export(
            $templateId,
            'text/html',
            ['alt' => 'media'],
        );

        $html = (string) $stream->getBody();

        if (! filled($html)) {
            throw new RuntimeException('Template Google Docs berhasil diakses, tetapi export HTML kosong.');
        }

        return $html;
    }

    private function detectTemplateFormat(?string $content): string
    {
        if (! filled($content)) {
            return 'text';
        }

        return preg_match('/<\s*(html|body|table|p|div|span)\b/i', $content) ? 'html' : 'text';
    }

    private function syncTemplateCache(PrintSetting $setting, ?string $documentContent): void
    {
        if (! filled($documentContent)) {
            return;
        }

        $setting->forceFill([
            'template_content' => $documentContent,
            'google_last_synced_at' => now(),
            'google_last_error' => null,
        ])->save();
    }

    private function markSyncFailure(PrintSetting $setting, Throwable $throwable): void
    {
        $setting->forceFill([
            'google_last_error' => $throwable->getMessage(),
        ])->save();
    }

    private function extractDocumentText(object $document): string
    {
        $body = method_exists($document, 'getBody') ? $document->getBody() : null;
        $content = $body && method_exists($body, 'getContent')
            ? $body->getContent()
            : [];

        return trim($this->extractStructuralElements($content));
    }

    private function extractStructuralElements(array $elements): string
    {
        $blocks = [];

        foreach ($elements as $element) {
            if (method_exists($element, 'getParagraph') && $element->getParagraph()) {
                $text = $this->extractParagraphText($element->getParagraph());

                if ($text !== '') {
                    $blocks[] = $text;
                }

                continue;
            }

            if (method_exists($element, 'getTable') && $element->getTable()) {
                $text = $this->extractTableText($element->getTable());

                if ($text !== '') {
                    $blocks[] = $text;
                }

                continue;
            }

            if (method_exists($element, 'getTableOfContents') && $element->getTableOfContents()) {
                $text = $this->extractStructuralElements(
                    $element->getTableOfContents()->getContent() ?? [],
                );

                if ($text !== '') {
                    $blocks[] = $text;
                }
            }
        }

        return preg_replace("/\n{3,}/", "\n\n", implode("\n\n", $blocks)) ?? '';
    }

    private function extractParagraphText(object $paragraph): string
    {
        $text = '';

        foreach ($paragraph->getElements() ?? [] as $element) {
            $textRun = method_exists($element, 'getTextRun')
                ? $element->getTextRun()
                : null;

            if ($textRun && method_exists($textRun, 'getContent')) {
                $text .= $textRun->getContent();
            }
        }

        return trim(preg_replace("/\n+$/", '', $text) ?? '');
    }

    private function extractTableText(object $table): string
    {
        $rows = [];

        foreach ($table->getTableRows() ?? [] as $row) {
            $cells = [];

            foreach ($row->getTableCells() ?? [] as $cell) {
                $cells[] = $this->extractStructuralElements($cell->getContent() ?? []);
            }

            $rowText = trim(implode(' | ', array_filter($cells, fn (?string $cell) => filled($cell))));

            if ($rowText !== '') {
                $rows[] = $rowText;
            }
        }

        return implode("\n", $rows);
    }
}
