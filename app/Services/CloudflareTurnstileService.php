<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Throwable;

class CloudflareTurnstileService
{
    public function enabled(): bool
    {
        return (bool) config('services.turnstile.enabled')
            && filled(config('services.turnstile.site_key'))
            && filled(config('services.turnstile.secret_key'));
    }

    public function siteKey(): ?string
    {
        return $this->enabled() ? config('services.turnstile.site_key') : null;
    }

    public function verify(
        ?string $token,
        ?string $remoteIp = null,
        ?string $expectedAction = null,
        ?string $expectedHostname = null,
    ): array {
        if (! $this->enabled()) {
            return [
                'success' => true,
                'error_codes' => [],
                'message' => null,
            ];
        }

        if (blank($token)) {
            return [
                'success' => false,
                'error_codes' => ['missing-input-response'],
                'message' => 'Captcha wajib diisi sebelum login.',
            ];
        }

        try {
            $response = Http::asForm()
                ->timeout(10)
                ->acceptJson()
                ->post('https://challenges.cloudflare.com/turnstile/v0/siteverify', [
                    'secret' => config('services.turnstile.secret_key'),
                    'response' => $token,
                    'remoteip' => $remoteIp,
                ]);

            $data = $response->json();
        } catch (Throwable) {
            return [
                'success' => false,
                'error_codes' => ['network-error'],
                'message' => 'Captcha tidak dapat diverifikasi saat ini. Silakan coba beberapa saat lagi.',
            ];
        }

        if (! is_array($data)) {
            return [
                'success' => false,
                'error_codes' => ['invalid-json'],
                'message' => 'Respons verifikasi captcha tidak valid.',
            ];
        }

        $errorCodes = $data['error-codes'] ?? [];

        if (! ($data['success'] ?? false)) {
            return [
                'success' => false,
                'error_codes' => $errorCodes,
                'message' => $this->messageFromErrorCodes($errorCodes),
            ];
        }

        if ($expectedAction && ($data['action'] ?? null) !== $expectedAction) {
            return [
                'success' => false,
                'error_codes' => ['invalid-action'],
                'message' => 'Captcha tidak cocok dengan aksi login.',
            ];
        }

        if ($expectedHostname && ($data['hostname'] ?? null) !== $expectedHostname) {
            return [
                'success' => false,
                'error_codes' => ['invalid-hostname'],
                'message' => 'Captcha berasal dari hostname yang tidak diizinkan.',
            ];
        }

        return [
            'success' => true,
            'error_codes' => [],
            'message' => null,
            'hostname' => $data['hostname'] ?? null,
            'action' => $data['action'] ?? null,
        ];
    }

    private function messageFromErrorCodes(array $errorCodes): string
    {
        return match (true) {
            in_array('missing-input-response', $errorCodes, true) => 'Captcha wajib diisi sebelum login.',
            in_array('invalid-input-response', $errorCodes, true) => 'Token captcha tidak valid. Silakan coba lagi.',
            in_array('timeout-or-duplicate', $errorCodes, true) => 'Captcha sudah kedaluwarsa atau sudah dipakai. Silakan verifikasi ulang.',
            in_array('invalid-input-secret', $errorCodes, true) => 'Konfigurasi captcha server tidak valid.',
            in_array('missing-input-secret', $errorCodes, true) => 'Secret key captcha belum diatur di server.',
            default => 'Verifikasi captcha gagal. Silakan coba lagi.',
        };
    }
}
