<?php

namespace Database\Seeders;

use App\Models\KelompokAkunPembayaran;
use App\Models\Kendaraan;
use App\Models\Pegawai;
use App\Models\PrintSetting;
use App\Models\TransaksiBbm;
use Illuminate\Database\Seeder;

class DevDummyDataSeeder extends Seeder
{
    public function run(): void
    {
        $currentYear = (int) now()->format('Y');
        $accountMap = $this->seedAkunPembayaran($currentYear);
        $pegawaiMap = $this->seedPegawai();
        $kendaraanMap = $this->seedKendaraan($pegawaiMap);

        foreach ($this->buildTransactions($kendaraanMap, $accountMap) as $transaction) {
            TransaksiBbm::query()->updateOrCreate(
                ['nomor_nota' => $transaction['nomor_nota']],
                [
                    ...$transaction,
                    'total' => (float) $transaction['liter'] * (float) $transaction['harga_per_liter'],
                ],
            );
        }

        PrintSetting::query()->updateOrCreate(
            ['nama_template' => 'SPJ BBM Kendaraan Dinas'],
            [
                'google_docs_url' => 'https://docs.google.com/document/d/isi-id-template-dev/edit',
                'template_content' => <<<TEXT
SURAT PERTANGGUNGJAWABAN BBM

Pada tanggal {{tanggal}}, telah dilakukan pengisian BBM untuk kendaraan dinas {{merk_tipe}} dengan nomor polisi {{nomor_polisi}}.

Nama Pegawai: {{nama_pegawai}}
NIP: {{nip}}
Jabatan: {{jabatan}}
Unit: {{unit}}
Jenis BBM: {{jenis_bbm}}
Volume: {{liter}} liter
Harga per Liter: {{harga_per_liter}}
Total: {{total}}
Terbilang: {{terbilang}}
SPBU: {{spbu}}
Nomor Nota: {{nomor_nota}}
Odometer: {{odometer}}
Kode Akun: {{kode_akun_pembayaran}}
Nama Akun: {{nama_akun_pembayaran}}
Catatan: {{catatan}}
TEXT,
                'keterangan' => 'Template dummy untuk development.',
            ],
        );
    }

    private function seedAkunPembayaran(int $currentYear): array
    {
        $definitions = [
            [
                'tahun' => $currentYear - 1,
                'jenis_kendaraan' => 'roda_2',
                'kode_akun' => '521211',
                'nama_akun' => 'Belanja Bahan Kendaraan Bermotor Roda 2',
            ],
            [
                'tahun' => $currentYear - 1,
                'jenis_kendaraan' => 'roda_4',
                'kode_akun' => '521212',
                'nama_akun' => 'Belanja Bahan Kendaraan Bermotor Roda 4',
            ],
            [
                'tahun' => $currentYear,
                'jenis_kendaraan' => 'roda_2',
                'kode_akun' => '521211',
                'nama_akun' => 'Belanja Bahan Kendaraan Bermotor Roda 2',
            ],
            [
                'tahun' => $currentYear,
                'jenis_kendaraan' => 'roda_4',
                'kode_akun' => '521212',
                'nama_akun' => 'Belanja Bahan Kendaraan Bermotor Roda 4',
            ],
        ];

        $accounts = [];

        foreach ($definitions as $definition) {
            $account = KelompokAkunPembayaran::query()->updateOrCreate(
                [
                    'tahun' => $definition['tahun'],
                    'jenis_kendaraan' => $definition['jenis_kendaraan'],
                ],
                [
                    'kode_akun' => $definition['kode_akun'],
                    'nama_akun' => $definition['nama_akun'],
                    'keterangan' => 'Dummy akun dev untuk pengujian lokal.',
                ],
            );

            $accounts[$definition['tahun']][$definition['jenis_kendaraan']] = $account;
        }

        return $accounts;
    }

    private function seedPegawai(): array
    {
        $definitions = [
            ['nip' => '198703102010011001', 'nama' => 'Ahmad Fauzi', 'jabatan' => 'Analis BMN', 'unit' => 'Sekretariat'],
            ['nip' => '198905212011012002', 'nama' => 'Siti Rahmawati', 'jabatan' => 'Pengelola Keuangan', 'unit' => 'Keuangan'],
            ['nip' => '199011152014031003', 'nama' => 'Dimas Prasetyo', 'jabatan' => 'Staf Operasional', 'unit' => 'Umum'],
            ['nip' => '198806082012021004', 'nama' => 'Rina Maharani', 'jabatan' => 'Analis Layanan', 'unit' => 'Layanan Haji'],
            ['nip' => '199202172015041005', 'nama' => 'Yoga Saputra', 'jabatan' => 'Staf Umum', 'unit' => 'Rumah Tangga'],
            ['nip' => '198511192009011006', 'nama' => 'Dewi Kartikasari', 'jabatan' => 'Koordinator Wilayah', 'unit' => 'Sekretariat'],
            ['nip' => '199307052016051007', 'nama' => 'Fajar Nugroho', 'jabatan' => 'Pengadministrasi', 'unit' => 'Keuangan'],
            ['nip' => '198912232013061008', 'nama' => 'Maya Lestari', 'jabatan' => 'Staf Monitoring', 'unit' => 'Pengawasan'],
            ['nip' => '199101102017071009', 'nama' => 'Arif Hidayat', 'jabatan' => 'Analis Program', 'unit' => 'Perencanaan'],
            ['nip' => '198704142010081010', 'nama' => 'Nur Aini', 'jabatan' => 'Staf Layanan', 'unit' => 'Layanan Haji'],
            ['nip' => '199405252018091011', 'nama' => 'Bagus Firmansyah', 'jabatan' => 'Pengolah Data', 'unit' => 'Teknologi Informasi'],
            ['nip' => '198610302008101012', 'nama' => 'Lina Kusuma', 'jabatan' => 'Bendahara Pengeluaran', 'unit' => 'Keuangan'],
        ];

        $pegawaiMap = [];

        foreach ($definitions as $definition) {
            $pegawaiMap[$definition['nip']] = Pegawai::query()->updateOrCreate(
                ['nip' => $definition['nip']],
                [
                    'nama' => $definition['nama'],
                    'jabatan' => $definition['jabatan'],
                    'unit' => $definition['unit'],
                    'keterangan' => 'Dummy pegawai dev untuk pengujian lokal.',
                ],
            );
        }

        return $pegawaiMap;
    }

    private function seedKendaraan(array $pegawaiMap): array
    {
        $definitions = [
            ['kode_kendaraan' => 'KD-01', 'nomor_polisi' => 'B 1234 KQ', 'merk_tipe' => 'Toyota Avanza', 'jenis_kendaraan' => 'roda_4', 'tahun' => 2022, 'jenis_bbm_default' => 'Pertalite', 'pegawai_nip' => '198703102010011001', 'odometer_awal' => 15110],
            ['kode_kendaraan' => 'KD-02', 'nomor_polisi' => 'AB 9876 CD', 'merk_tipe' => 'Toyota Innova', 'jenis_kendaraan' => 'roda_4', 'tahun' => 2023, 'jenis_bbm_default' => 'Pertamax', 'pegawai_nip' => '198905212011012002', 'odometer_awal' => 20410],
            ['kode_kendaraan' => 'KD-03', 'nomor_polisi' => 'AB 4321 EF', 'merk_tipe' => 'Honda Vario 160', 'jenis_kendaraan' => 'roda_2', 'tahun' => 2024, 'jenis_bbm_default' => 'Pertalite', 'pegawai_nip' => '199011152014031003', 'odometer_awal' => 8420],
            ['kode_kendaraan' => 'KD-04', 'nomor_polisi' => 'AB 1122 GH', 'merk_tipe' => 'Suzuki Ertiga', 'jenis_kendaraan' => 'roda_4', 'tahun' => 2021, 'jenis_bbm_default' => 'Pertalite', 'pegawai_nip' => '198806082012021004', 'odometer_awal' => 17890],
            ['kode_kendaraan' => 'KD-05', 'nomor_polisi' => 'AB 2233 IJ', 'merk_tipe' => 'Mitsubishi Xpander', 'jenis_kendaraan' => 'roda_4', 'tahun' => 2024, 'jenis_bbm_default' => 'Pertamax', 'pegawai_nip' => '199202172015041005', 'odometer_awal' => 9340],
            ['kode_kendaraan' => 'KD-06', 'nomor_polisi' => 'AB 3344 KL', 'merk_tipe' => 'Honda Beat', 'jenis_kendaraan' => 'roda_2', 'tahun' => 2023, 'jenis_bbm_default' => 'Pertalite', 'pegawai_nip' => '198511192009011006', 'odometer_awal' => 6120],
            ['kode_kendaraan' => 'KD-07', 'nomor_polisi' => 'AB 4455 MN', 'merk_tipe' => 'Yamaha NMax', 'jenis_kendaraan' => 'roda_2', 'tahun' => 2022, 'jenis_bbm_default' => 'Pertamax', 'pegawai_nip' => '199307052016051007', 'odometer_awal' => 11340],
            ['kode_kendaraan' => 'KD-08', 'nomor_polisi' => 'AB 5566 OP', 'merk_tipe' => 'Daihatsu Terios', 'jenis_kendaraan' => 'roda_4', 'tahun' => 2020, 'jenis_bbm_default' => 'Pertalite', 'pegawai_nip' => '198912232013061008', 'odometer_awal' => 26550],
            ['kode_kendaraan' => 'KD-09', 'nomor_polisi' => 'AB 6677 QR', 'merk_tipe' => 'Toyota Hilux', 'jenis_kendaraan' => 'roda_4', 'tahun' => 2021, 'jenis_bbm_default' => 'Dexlite', 'pegawai_nip' => '198703102010011001', 'odometer_awal' => 31880],
            ['kode_kendaraan' => 'KD-10', 'nomor_polisi' => 'AB 7788 ST', 'merk_tipe' => 'Honda PCX', 'jenis_kendaraan' => 'roda_2', 'tahun' => 2024, 'jenis_bbm_default' => 'Pertalite', 'pegawai_nip' => '198905212011012002', 'odometer_awal' => 4210],
            ['kode_kendaraan' => 'KD-11', 'nomor_polisi' => 'AB 8899 UV', 'merk_tipe' => 'Suzuki XL7', 'jenis_kendaraan' => 'roda_4', 'tahun' => 2023, 'jenis_bbm_default' => 'Pertamax', 'pegawai_nip' => '199101102017071009', 'odometer_awal' => 12660],
            ['kode_kendaraan' => 'KD-12', 'nomor_polisi' => 'AB 9900 WX', 'merk_tipe' => 'Honda Scoopy', 'jenis_kendaraan' => 'roda_2', 'tahun' => 2022, 'jenis_bbm_default' => 'Pertalite', 'pegawai_nip' => '198704142010081010', 'odometer_awal' => 9870],
            ['kode_kendaraan' => 'KD-13', 'nomor_polisi' => 'AB 1011 YZ', 'merk_tipe' => 'Toyota Rush', 'jenis_kendaraan' => 'roda_4', 'tahun' => 2024, 'jenis_bbm_default' => 'Pertamax', 'pegawai_nip' => '199405252018091011', 'odometer_awal' => 7440],
            ['kode_kendaraan' => 'KD-14', 'nomor_polisi' => 'AB 1213 ZA', 'merk_tipe' => 'Yamaha Aerox', 'jenis_kendaraan' => 'roda_2', 'tahun' => 2023, 'jenis_bbm_default' => 'Pertamax', 'pegawai_nip' => '198610302008101012', 'odometer_awal' => 8560],
        ];

        $kendaraanMap = [];

        foreach ($definitions as $definition) {
            $pegawai = $pegawaiMap[$definition['pegawai_nip']];

            $kendaraanMap[$definition['kode_kendaraan']] = Kendaraan::query()->updateOrCreate(
                ['nomor_polisi' => $definition['nomor_polisi']],
                [
                    'kode_kendaraan' => $definition['kode_kendaraan'],
                    'merk_tipe' => $definition['merk_tipe'],
                    'jenis_kendaraan' => $definition['jenis_kendaraan'],
                    'tahun' => $definition['tahun'],
                    'jenis_bbm_default' => $definition['jenis_bbm_default'],
                    'pegawai_id' => $pegawai->id,
                    'keterangan' => 'Dummy kendaraan dev untuk pengujian lokal.',
                ],
            );

            $kendaraanMap[$definition['kode_kendaraan']]->setAttribute('odometer_awal', $definition['odometer_awal']);
        }

        return $kendaraanMap;
    }

    private function buildTransactions(array $kendaraanMap, array $accountMap): array
    {
        $spbus = [
            'SPBU Ringroad Selatan',
            'SPBU Maguwo',
            'SPBU Kaliurang',
            'SPBU Bantul',
            'SPBU Wates',
            'SPBU Jogja Kota',
            'SPBU Sleman',
            'SPBU Gamping',
        ];

        $notes = [
            'Perjalanan dinas rutin.',
            'Pendampingan kegiatan wilayah.',
            'Distribusi dokumen operasional.',
            'Kunjungan koordinasi antar unit.',
            'Operasional layanan lapangan.',
            'Monitoring kegiatan dan laporan.',
            'Kebutuhan kendaraan dinas harian.',
            'Persiapan agenda pimpinan wilayah.',
        ];

        $prices = [
            'Pertalite' => 10000,
            'Pertamax' => 12400,
            'Dexlite' => 14650,
        ];

        $transactions = [];
        $sequence = 1;
        $vehicles = array_values($kendaraanMap);

        foreach ($vehicles as $vehicleIndex => $kendaraan) {
            $jenisKendaraan = $kendaraan->jenis_kendaraan;
            $pegawaiId = $kendaraan->pegawai_id;
            $jenisBbm = $kendaraan->jenis_bbm_default ?: 'Pertalite';
            $harga = $prices[$jenisBbm] ?? 10000;
            $odometerAwal = (float) ($kendaraan->odometer_awal ?? 1000);

            for ($i = 0; $i < 24; $i++) {
                $tanggal = now()->subDays(($vehicleIndex * 5) + ($i * 11));
                $tahun = (int) $tanggal->format('Y');
                $akun = $accountMap[$tahun][$jenisKendaraan] ?? $accountMap[array_key_last($accountMap)][$jenisKendaraan];
                $isRodaEmpat = $jenisKendaraan === 'roda_4';
                $liter = $isRodaEmpat
                    ? 18 + (($vehicleIndex + $i) % 6) * 3.2
                    : 4.5 + (($vehicleIndex + $i) % 5) * 1.15;
                $odometer = $odometerAwal + ($i * ($isRodaEmpat ? 275 : 95)) + ($vehicleIndex * 37);

                $transactions[] = [
                    'tanggal' => $tanggal->toDateString(),
                    'pegawai_id' => $pegawaiId,
                    'kendaraan_id' => $kendaraan->id,
                    'akun_pembayaran_id' => $akun->id,
                    'odometer' => round($odometer, 2),
                    'jenis_bbm' => $jenisBbm,
                    'liter' => round($liter, 2),
                    'harga_per_liter' => $harga,
                    'spbu' => $spbus[($vehicleIndex + $i) % count($spbus)],
                    'nomor_nota' => sprintf('DEV-BBM-%03d', $sequence),
                    'catatan' => $notes[($vehicleIndex + $i) % count($notes)],
                ];

                $sequence++;
            }
        }

        return $transactions;
    }
}
