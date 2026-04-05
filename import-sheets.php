#!/usr/bin/env php
<?php
// Import data from Google Sheets JSON dumps into BMN-BPKH11 database

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

$apiKey = 'zEDYq-plC9_Zupx6PQC5pMZ_HEM6dwA72ZN_3a7uFQtHXv47DGPz6GfQpJuZLyzA8WG2a9kSv3mF2o3CEgo5Ebrt6N_pym3GIFc';
$spreadsheetId = '15UxzFE6E_n_CuuHOj9v86okX1JZ9XKfOosMvXWF5WiU';

function fetchSheet($apiKey, $spreadsheetId, $range) {
    $url = "https://gateway.maton.ai/google-sheets/v4/spreadsheets/{$spreadsheetId}/values/" . urlencode($range);
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer {$apiKey}"]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $resp = curl_exec($ch);
    curl_close($ch);
    $data = json_decode($resp, true);
    return $data['values'] ?? [];
}

function parseRupiah($str) {
    $str = str_replace(['Rp', '.', ','], '', $str);
    return (float) $str;
}

function parseDate($str) {
    if (empty($str) || $str === '-') return null;
    // Handle M/D/YYYY format
    if (preg_match('#^(\d{1,2})/(\d{1,2})/(\d{4})#', $str, $m)) {
        return sprintf('%04d-%02d-%02d', $m[3], $m[1], $m[2]);
    }
    // Handle YYYY-MM-DD
    if (preg_match('#^(\d{4})-(\d{2})-(\d{2})#', $str, $m)) {
        return $m[0];
    }
    return null;
}

echo "=== Importing DataPegawai ===\n";
$rows = fetchSheet($apiKey, $spreadsheetId, 'DataPegawai!A1:C200');
$headers = array_shift($rows);
$pegawaiMap = []; // nama => id
$pegawaiCount = 0;

foreach ($rows as $row) {
    $nama = trim($row[0] ?? '');
    $nip = trim($row[1] ?? '');
    $status = trim($row[2] ?? '');
    if (empty($nama)) continue;

    $exists = DB::table('pegawai')->where('nama', $nama)->first();
    if ($exists) {
        $pegawaiMap[$nama] = $exists->id;
        continue;
    }

    $id = DB::table('pegawai')->insertGetId([
        'nip' => ($nip && $nip !== '-') ? $nip : null,
        'nama' => $nama,
        'keterangan' => $status ?: null,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    $pegawaiMap[$nama] = $id;
    $pegawaiCount++;
}
echo "Imported {$pegawaiCount} new pegawai. Total mapped: " . count($pegawaiMap) . "\n";

echo "\n=== Importing DataKendaraan ===\n";
$rows = fetchSheet($apiKey, $spreadsheetId, 'DataKendaraan!A1:F100');
$headers = array_shift($rows);
$kendaraanMap = []; // nopol => id
$kendaraanCount = 0;

foreach ($rows as $row) {
    $nopol = trim($row[0] ?? '');
    $jenis = trim($row[1] ?? '');
    $merek = trim($row[2] ?? '');
    $noBmn = trim($row[3] ?? '');
    $kategori = trim($row[4] ?? '');
    $kelAkun = trim($row[5] ?? '');
    if (empty($nopol)) continue;

    $exists = DB::table('kendaraan')->where('nomor_polisi', $nopol)->first();
    if ($exists) {
        $kendaraanMap[$nopol] = $exists->id;
        continue;
    }

    $id = DB::table('kendaraan')->insertGetId([
        'nomor_polisi' => $nopol,
        'merk_tipe' => $merek ?: $jenis,
        'jenis_kendaraan' => $kategori ?: null,
        'kode_kendaraan' => $noBmn ?: null,
        'keterangan' => trim("$jenis $merek"),
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    $kendaraanMap[$nopol] = $id;
    $kendaraanCount++;
}
echo "Imported {$kendaraanCount} new kendaraan. Total mapped: " . count($kendaraanMap) . "\n";

echo "\n=== Importing LogBBM ===\n";
$rows = fetchSheet($apiKey, $spreadsheetId, 'LogBBM!A1:Q200');
$headers = array_shift($rows);
$bbmCount = 0;
$bbmSkip = 0;

foreach ($rows as $row) {
    // Column indices: 0=Tanggal,1=Nama,2=NIP,3=Status,4=Nopol,5=Detail,6=Kategori,
    //   7=NoBMN,8=KelAkun,9=TanggalIsi,10=JenisBBM,11=Liter,12=Harga/L,13=Total,14=Terbilang,15=SPBU
    $tanggal = parseDate(trim($row[9] ?? '')); // Tanggal Isi
    $namaPegawai = trim($row[1] ?? ''); // Nama Pegawai
    $nopol = trim($row[4] ?? ''); // Nopol
    $jenisBbm = trim($row[10] ?? ''); // Jenis BBM
    $liter = (float) str_replace(',', '.', trim($row[11] ?? '0')); // Liter
    $hargaPerLiter = parseRupiah(trim($row[12] ?? '')); // Harga Per Liter
    $total = parseRupiah(trim($row[13] ?? '')); // Total Harga
    $spbu = trim($row[15] ?? ''); // Lokasi SPBU
    $noBmn = trim($row[7] ?? ''); // No BMN
    $kelAkun = trim($row[8] ?? ''); // Kelompok Akun

    if (empty($tanggal) || empty($namaPegawai) || empty($nopol)) {
        $bbmSkip++;
        continue;
    }

    // Find pegawai_id
    $pegawaiId = $pegawaiMap[$namaPegawai] ?? null;
    if (!$pegawaiId) {
        $found = DB::table('pegawai')->where('nama', $namaPegawai)->first();
        if ($found) {
            $pegawaiId = $found->id;
            $pegawaiMap[$namaPegawai] = $pegawaiId;
        }
    }
    if (!$pegawaiId) {
        // Auto-create missing pegawai (likely kontrak)
        $pegawaiId = DB::table('pegawai')->insertGetId([
            'nama' => $namaPegawai,
            'nip' => ($nip ?? null) && ($nip ?? '-') !== '-' ? $nip : null,
            'keterangan' => 'KONTRAK (auto-import)',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $pegawaiMap[$namaPegawai] = $pegawaiId;
        echo "  AUTO-CREATED pegawai: {$namaPegawai}\n";
    }

    // Find kendaraan_id
    $kendaraanId = $kendaraanMap[$nopol] ?? null;
    if (!$kendaraanId) {
        $found = DB::table('kendaraan')->where('nomor_polisi', $nopol)->first();
        if ($found) {
            $kendaraanId = $found->id;
            $kendaraanMap[$nopol] = $kendaraanId;
        }
    }
    if (!$kendaraanId) {
        // Auto-create missing kendaraan
        $kendaraanId = DB::table('kendaraan')->insertGetId([
            'nomor_polisi' => $nopol,
            'merk_tipe' => trim($row[5] ?? ''),
            'jenis_kendaraan' => trim($row[6] ?? ''),
            'kode_kendaraan' => $noBmn ?: null,
            'keterangan' => 'Auto-import from Sheets',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $kendaraanMap[$nopol] = $kendaraanId;
        echo "  AUTO-CREATED kendaraan: {$nopol}\n";
    }

    // Check duplicate
    $exists = DB::table('transaksi_bbm')
        ->where('tanggal', $tanggal)
        ->where('pegawai_id', $pegawaiId)
        ->where('kendaraan_id', $kendaraanId)
        ->where('liter', $liter)
        ->first();
    if ($exists) {
        $bbmSkip++;
        continue;
    }

    // Find or create akun_pembayaran
    $akunId = null;
    if ($kelAkun) {
        $akun = DB::table('kelompok_akun_pembayaran')->where('kode_akun', $kelAkun)->first();
        if ($akun) {
            $akunId = $akun->id;
        }
    }

    DB::table('transaksi_bbm')->insert([
        'tanggal' => $tanggal,
        'pegawai_id' => $pegawaiId,
        'kendaraan_id' => $kendaraanId,
        'akun_pembayaran_id' => $akunId,
        'jenis_bbm' => $jenisBbm ?: null,
        'liter' => $liter,
        'harga_per_liter' => $hargaPerLiter,
        'total' => $total ?: ($liter * $hargaPerLiter),
        'spbu' => $spbu ?: null,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    $bbmCount++;
}
echo "Imported {$bbmCount} transaksi BBM. Skipped: {$bbmSkip}\n";

echo "\n=== DONE ===\n";
echo "Pegawai: " . DB::table('pegawai')->count() . " total\n";
echo "Kendaraan: " . DB::table('kendaraan')->count() . " total\n";
echo "Transaksi BBM: " . DB::table('transaksi_bbm')->count() . " total\n";
