<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\GoogleDocsSpjService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Mockery;
use Tests\TestCase;

class PrintSettingGoogleDocsTest extends TestCase
{
    use RefreshDatabase;

    public function test_google_docs_connection_test_endpoint_returns_connection_data(): void
    {
        $mock = Mockery::mock(GoogleDocsSpjService::class);
        $mock->shouldReceive('testConnection')
            ->once()
            ->andReturn([
                'message' => 'Akses Google Docs berhasil.',
                'auth_mode' => [
                    'label' => 'OAuth Refresh Token',
                ],
                'template' => [
                    'title' => 'Template SPJ BBM',
                    'owner' => 'service-account@example.com',
                ],
                'template_preview' => 'Contoh isi template',
            ]);

        $this->app->instance(GoogleDocsSpjService::class, $mock);

        $response = $this
            ->actingAs(User::factory()->create())
            ->postJson(route('settings.pengaturan-print.test-google-docs'));

        $response->assertOk();
        $response->assertJsonPath('auth_mode.label', 'OAuth Refresh Token');
        $response->assertJsonPath('template.title', 'Template SPJ BBM');
        $response->assertJsonPath('template_preview', 'Contoh isi template');
    }

    public function test_print_settings_page_exposes_google_sync_status(): void
    {
        \App\Models\PrintSetting::query()->create([
            'nama_template' => 'Template SPJ',
            'google_docs_url' => 'https://docs.google.com/document/d/contoh/edit',
            'template_content' => 'Isi snapshot',
            'google_last_synced_at' => Carbon::parse('2026-04-04 13:00:00'),
            'google_last_error' => 'OAuth Google gagal: invalid_grant.',
            'keterangan' => 'Catatan',
        ]);

        $response = $this
            ->actingAs(User::factory()->create())
            ->get(route('settings.pengaturan-print'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Settings/PengaturanPrint')
            ->where('template.google_last_synced_at', '2026-04-04 13:00:00')
            ->where('template.google_last_error', 'OAuth Google gagal: invalid_grant.')
        );
    }
}
