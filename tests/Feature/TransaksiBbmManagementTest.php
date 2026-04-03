<?php

namespace Tests\Feature;

use App\Models\KelompokAkunPembayaran;
use App\Models\Kendaraan;
use App\Models\Pegawai;
use App\Models\TransaksiBbm;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransaksiBbmManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_edit_transaction_page_can_be_rendered(): void
    {
        [$pegawai, $kendaraan, $akun] = $this->seedTransactionReferences();

        $transaksi = TransaksiBbm::query()->create([
            'tanggal' => '2026-04-03',
            'pegawai_id' => $pegawai->id,
            'kendaraan_id' => $kendaraan->id,
            'akun_pembayaran_id' => $akun->id,
            'odometer' => 12345,
            'jenis_bbm' => 'Pertalite',
            'liter' => 15,
            'harga_per_liter' => 10000,
            'total' => 150000,
            'spbu' => 'SPBU A',
            'nomor_nota' => 'NOTA-01',
            'catatan' => 'Arsip awal',
        ]);

        $response = $this
            ->actingAs(User::factory()->create())
            ->get(route('bbm.pencatatan.edit', $transaksi));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Bbm/PencatatanBbm')
            ->where('transaction.id', $transaksi->id)
            ->where('transaction.nomor_nota', 'NOTA-01')
            ->where('transaction.odometer', 12345)
        );
    }

    public function test_transaction_can_be_updated_and_total_is_recalculated(): void
    {
        [$pegawai, $kendaraan, $akun] = $this->seedTransactionReferences();

        $transaksi = TransaksiBbm::query()->create([
            'tanggal' => '2026-04-03',
            'pegawai_id' => $pegawai->id,
            'kendaraan_id' => $kendaraan->id,
            'akun_pembayaran_id' => $akun->id,
            'jenis_bbm' => 'Pertalite',
            'liter' => 10,
            'harga_per_liter' => 10000,
            'total' => 100000,
        ]);

        $response = $this
            ->actingAs(User::factory()->create())
            ->put(route('bbm.pencatatan.update', $transaksi), [
            'tanggal' => '2026-04-04',
            'pegawai_id' => $pegawai->id,
            'kendaraan_id' => $kendaraan->id,
            'akun_pembayaran_id' => '',
            'odometer' => 15000,
            'jenis_bbm' => 'Pertamax',
            'liter' => 20,
            'harga_per_liter' => 12345,
            'spbu' => 'SPBU B',
            'nomor_nota' => 'NOTA-02',
            'catatan' => 'Perubahan data',
        ]);

        $response->assertRedirect(route('bbm.riwayat'));

        $transaksi->refresh();

        $this->assertSame('2026-04-04', $transaksi->tanggal);
        $this->assertSame('Pertamax', $transaksi->jenis_bbm);
        $this->assertSame('NOTA-02', $transaksi->nomor_nota);
        $this->assertSame(246900.0, (float) $transaksi->total);
        $this->assertSame($akun->id, $transaksi->akun_pembayaran_id);
    }

    public function test_transaction_can_be_deleted(): void
    {
        [$pegawai, $kendaraan, $akun] = $this->seedTransactionReferences();

        $transaksi = TransaksiBbm::query()->create([
            'tanggal' => '2026-04-03',
            'pegawai_id' => $pegawai->id,
            'kendaraan_id' => $kendaraan->id,
            'akun_pembayaran_id' => $akun->id,
            'jenis_bbm' => 'Pertalite',
            'liter' => 10,
            'harga_per_liter' => 10000,
            'total' => 100000,
        ]);

        $response = $this
            ->actingAs(User::factory()->create())
            ->delete(route('bbm.pencatatan.destroy', $transaksi));

        $response->assertRedirect(route('bbm.riwayat'));
        $this->assertDatabaseMissing('transaksi_bbm', [
            'id' => $transaksi->id,
        ]);
    }

    private function seedTransactionReferences(): array
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

        return [$pegawai, $kendaraan, $akun];
    }
}
