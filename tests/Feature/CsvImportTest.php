<?php

namespace Tests\Feature;

use App\Models\KelompokAkunPembayaran;
use App\Models\Kendaraan;
use App\Models\Pegawai;
use App\Models\TransaksiBbm;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class CsvImportTest extends TestCase
{
    use RefreshDatabase;

    public function test_pegawai_can_be_imported_from_csv(): void
    {
        $file = UploadedFile::fake()->createWithContent(
            'pegawai.csv',
            "nip,nama,jabatan,unit,keterangan\n198703102010011001,Ahmad Fauzi,Analis BMN,Sekretariat,Import awal\n",
        );

        $response = $this
            ->actingAs(User::factory()->create())
            ->post(route('database.pegawai.import'), [
                'file' => $file,
            ]);

        $response->assertRedirect(route('database.pegawai'));

        $this->assertDatabaseHas('pegawai', [
            'nip' => '198703102010011001',
            'nama' => 'Ahmad Fauzi',
        ]);
    }

    public function test_kendaraan_can_be_imported_from_csv_and_linked_to_pegawai(): void
    {
        $pegawai = Pegawai::query()->create([
            'nip' => '198703102010011001',
            'nama' => 'Ahmad Fauzi',
        ]);

        $file = UploadedFile::fake()->createWithContent(
            'kendaraan.csv',
            "kode_kendaraan,nomor_polisi,merk_tipe,jenis_kendaraan,tahun,jenis_bbm_default,pegawai_nip,keterangan\nKD-01,B 1234 KQ,Toyota Avanza,roda_4,2023,Pertalite,198703102010011001,Kendaraan dinas\n",
        );

        $response = $this
            ->actingAs(User::factory()->create())
            ->post(route('database.kendaraan.import'), [
                'file' => $file,
            ]);

        $response->assertRedirect(route('database.kendaraan'));

        $this->assertDatabaseHas('kendaraan', [
            'nomor_polisi' => 'B 1234 KQ',
            'pegawai_id' => $pegawai->id,
        ]);
    }

    public function test_transaksi_bbm_can_be_imported_from_csv(): void
    {
        $pegawai = Pegawai::query()->create([
            'nip' => '198703102010011001',
            'nama' => 'Ahmad Fauzi',
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

        $file = UploadedFile::fake()->createWithContent(
            'transaksi.csv',
            "tanggal,pegawai_nip,nomor_polisi,odometer,jenis_bbm,liter,harga_per_liter,spbu,nomor_nota,catatan,kode_akun\n2026-04-03,198703102010011001,B 1234 KQ,15420,Pertalite,24,10000,SPBU Lenteng Agung,NOTA-01,Import awal,521212\n",
        );

        $response = $this
            ->actingAs(User::factory()->create())
            ->post(route('bbm.riwayat.import'), [
                'file' => $file,
            ]);

        $response->assertRedirect(route('bbm.riwayat'));

        $this->assertDatabaseHas('transaksi_bbm', [
            'pegawai_id' => $pegawai->id,
            'kendaraan_id' => $kendaraan->id,
            'akun_pembayaran_id' => $akun->id,
            'nomor_nota' => 'NOTA-01',
        ]);

        $transaksi = TransaksiBbm::query()->first();

        $this->assertSame(240000.0, (float) $transaksi->total);
    }
}
