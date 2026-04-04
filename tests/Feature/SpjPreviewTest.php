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
use RuntimeException;
use Tests\TestCase;

class SpjPreviewTest extends TestCase
{
    use RefreshDatabase;

    public function test_spj_preview_route_redirects_directly_to_pdf(): void
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

        $response->assertRedirect(route('bbm.riwayat.spj-pdf', $transaksi));
    }

    public function test_spj_print_route_redirects_directly_to_pdf(): void
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

        $response->assertRedirect(route('bbm.riwayat.spj-pdf', $transaksi));
    }

    public function test_spj_pdf_can_be_streamed(): void
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
            ->get(route('bbm.riwayat.spj-pdf', $transaksi));

        $response->assertOk();
        $response->assertHeader('content-type', 'application/pdf');
    }

    public function test_spj_pdf_still_streams_when_google_docs_is_unavailable(): void
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
            'google_docs_url' => 'https://docs.google.com/document/d/contoh/edit',
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

        $mock = Mockery::mock(GoogleDocsSpjService::class);
        $mock->shouldReceive('resolveTemplateDocument')
            ->once()
            ->andThrow(new RuntimeException('OAuth Google gagal.'));

        $this->app->instance(GoogleDocsSpjService::class, $mock);

        $response = $this
            ->actingAs(User::factory()->create())
            ->get(route('bbm.riwayat.spj-pdf', $transaksi));

        $response->assertOk();
        $response->assertHeader('content-type', 'application/pdf');
    }
}
