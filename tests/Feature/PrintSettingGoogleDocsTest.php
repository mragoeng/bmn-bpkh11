<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\GoogleDocsSpjService;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
                'message' => 'Koneksi Google Docs berhasil.',
                'template' => [
                    'title' => 'Template SPJ BBM',
                    'owner' => 'service-account@example.com',
                ],
                'folder' => [
                    'name' => 'Output SPJ',
                ],
            ]);

        $this->app->instance(GoogleDocsSpjService::class, $mock);

        $response = $this
            ->actingAs(User::factory()->create())
            ->postJson(route('settings.pengaturan-print.test-google-docs'));

        $response->assertOk();
        $response->assertJsonPath('template.title', 'Template SPJ BBM');
        $response->assertJsonPath('folder.name', 'Output SPJ');
    }
}
