<?php

namespace Tests\Feature;

use App\Models\KelompokAkunPembayaran;
use App\Models\Kendaraan;
use App\Models\Pegawai;
use App\Models\PrintSetting;
use App\Models\TransaksiBbm;
use App\Models\User;
use App\Services\GoogleDocsSpjService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class SpjPreviewTest extends TestCase
{
    use RefreshDatabase;

    public function test_spj_preview_can_be_rendered_from_transaction_and_template(): void
    {
        $pegawai = Pegawai::query()->create([
            'nip' => '198703102010011001',
            'nama' => 'Ahmad Fauzi',
            'jabatan' => 'Analis BMN',
            'unit' => 'Sekretariat',
        ]);

        $kendaraan = Kendaraan::query()->create([
            'kode_kendaraan' => 'KD-01',
            'nomor_polisi' => 'B 1234 KQ',
            'merk_tipe' => 'Toyota Avanza',
            'jenis_kendaraan' => 'roda_4',
            'jenis_bbm_default' => 'Pertalite',
            'pegawai_id' => $pegawai->id,
        ]);

        $akun = KelompokAkunPembayaran::query()->create([
            'tahun' => 2026,
            'jenis_kendaraan' => 'roda_4',
            'kode_akun' => '521212',
            'nama_akun' => 'Belanja Bahan Kendaraan Bermotor Roda 4',
        ]);

        PrintSetting::query()->create([
            'nama_template' => 'Template SPJ Uji',
            'template_content' => "Pegawai: {{nama_pegawai}}\nNomor Polisi: {{nomor_polisi}}\nAkun: {{kode_akun_pembayaran}}\nTotal: {{total}}",
        ]);

        $transaksi = TransaksiBbm::query()->create([
            'tanggal' => '2026-04-03',
            'pegawai_id' => $pegawai->id,
            'kendaraan_id' => $kendaraan->id,
            'akun_pembayaran_id' => $akun->id,
            'jenis_bbm' => 'Pertalite',
            'liter' => 24,
            'harga_per_liter' => 10000,
            'total' => 240000,
            'spbu' => 'SPBU Lenteng Agung',
        ]);

        $response = $this
            ->actingAs(User::factory()->create())
            ->get(route('bbm.riwayat.spj-preview', $transaksi));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Bbm/SpjPreview')
            ->where('transaction.pegawai', 'Ahmad Fauzi')
            ->where('transaction.nomor_polisi', 'B 1234 KQ')
            ->where('template.nama_template', 'Template SPJ Uji')
            ->where('mergedContent', "Pegawai: Ahmad Fauzi\nNomor Polisi: B 1234 KQ\nAkun: 521212\nTotal: Rp 240.000")
        );
    }

    public function test_spj_print_page_can_be_rendered(): void
    {
        $pegawai = Pegawai::query()->create([
            'nip' => '198703102010011001',
            'nama' => 'Ahmad Fauzi',
            'jabatan' => 'Analis BMN',
            'unit' => 'Sekretariat',
        ]);

        $kendaraan = Kendaraan::query()->create([
            'kode_kendaraan' => 'KD-01',
            'nomor_polisi' => 'B 1234 KQ',
            'merk_tipe' => 'Toyota Avanza',
            'jenis_kendaraan' => 'roda_4',
            'jenis_bbm_default' => 'Pertalite',
            'pegawai_id' => $pegawai->id,
        ]);

        $akun = KelompokAkunPembayaran::query()->create([
            'tahun' => 2026,
            'jenis_kendaraan' => 'roda_4',
            'kode_akun' => '521212',
            'nama_akun' => 'Belanja Bahan Kendaraan Bermotor Roda 4',
        ]);

        PrintSetting::query()->create([
            'nama_template' => 'Template SPJ Uji',
            'template_content' => "Pegawai: {{nama_pegawai}}\nNomor Polisi: {{nomor_polisi}}\nTotal: {{total}}",
        ]);

        $transaksi = TransaksiBbm::query()->create([
            'tanggal' => '2026-04-03',
            'pegawai_id' => $pegawai->id,
            'kendaraan_id' => $kendaraan->id,
            'akun_pembayaran_id' => $akun->id,
            'jenis_bbm' => 'Pertalite',
            'liter' => 24,
            'harga_per_liter' => 10000,
            'total' => 240000,
        ]);

        $response = $this
            ->actingAs(User::factory()->create())
            ->get(route('bbm.riwayat.spj-print', $transaksi));

        $response->assertOk();
        $response->assertSee('Template SPJ Uji');
        $response->assertSee('Pegawai: Ahmad Fauzi', false);
        $response->assertSee('Nomor Polisi: B 1234 KQ', false);
        $response->assertSee('Cetak / Simpan PDF');
    }

    public function test_google_docs_generate_endpoint_returns_generated_document_url(): void
    {
        $pegawai = Pegawai::query()->create([
            'nama' => 'Ahmad Fauzi',
        ]);

        $kendaraan = Kendaraan::query()->create([
            'nomor_polisi' => 'B 1234 KQ',
            'merk_tipe' => 'Toyota Avanza',
            'jenis_kendaraan' => 'roda_4',
        ]);

        $transaksi = TransaksiBbm::query()->create([
            'tanggal' => '2026-04-03',
            'pegawai_id' => $pegawai->id,
            'kendaraan_id' => $kendaraan->id,
            'jenis_bbm' => 'Pertalite',
            'liter' => 24,
            'harga_per_liter' => 10000,
            'total' => 240000,
        ]);

        $mock = Mockery::mock(GoogleDocsSpjService::class);
        $mock->shouldReceive('generateFromTransaction')
            ->once()
            ->withArgs(fn (TransaksiBbm $model) => $model->is($transaksi))
            ->andReturn([
                'id' => 'abc123',
                'name' => 'SPJ BBM',
                'url' => 'https://docs.google.com/document/d/abc123/edit',
            ]);

        $this->app->instance(GoogleDocsSpjService::class, $mock);

        $response = $this
            ->actingAs(User::factory()->create())
            ->postJson(route('bbm.riwayat.spj-generate-google-doc', $transaksi));

        $response->assertOk();
        $response->assertJsonPath('document.url', 'https://docs.google.com/document/d/abc123/edit');
    }
}
