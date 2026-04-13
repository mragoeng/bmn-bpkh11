<!DOCTYPE html>
<html lang="id">
<head><meta charset="UTF-8"><title>Laporan Servis Kendaraan</title>
<style>
body { font-family: 'Times New Roman', serif; font-size: 11pt; margin: 40px; }
.header { text-align: center; border-bottom: 3px double #000; padding-bottom: 10px; margin-bottom: 15px; }
.header h1 { font-size: 13pt; margin: 0; text-transform: uppercase; }
.header h2 { font-size: 11pt; margin: 2px 0; font-weight: normal; }
.title { text-align: center; margin: 15px 0; }
.title h2 { font-size: 12pt; text-decoration: underline; }
table { width: 100%; border-collapse: collapse; margin: 10px 0; }
th, td { border: 1px solid #000; padding: 4px 6px; text-align: left; font-size: 10pt; }
th { background: #eee; }
.right { text-align: right; }
.ttd { margin-top: 40px; display: flex; justify-content: space-between; }
.ttd-box { text-align: center; width: 45%; }
.ttd-box .line { margin-top: 60px; border-top: 1px solid #000; padding-top: 2px; font-weight: bold; }
.footer { margin-top: 20px; font-size: 8pt; color: #666; text-align: center; border-top: 1px solid #ccc; padding-top: 5px; }
</style>
</head>
<body>
<div class="header">
    <h1>KEMENTERIAN KEHUTANAN</h1>
    <h2>BADAN PEMERINTAHAN KEHUTANAN WILAYAH XI</h2>
    <h2 style="font-size:9pt">Jl. Babaran No.60a, Warungboto, Umbulharjo, Yogyakarta 55161</h2>
</div>
<div class="title"><h2>LAPORAN SERVIS DAN MAINTENANCE KENDARAAN DINAS</h2></div>
<p style="text-align:center">Periode: {{ ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][$bulan] ?? $bulan }} {{ $tahun }}</p>

<table>
<thead><tr><th>No</th><th>Tanggal</th><th>Kendaraan</th><th>No. Polisi</th><th>Jenis Servis</th><th>KM</th><th>Biaya</th><th>Tempat</th><th>Pegawai</th><th>Status</th></tr></thead>
<tbody>
@forelse($servis as $i => $s)
<tr><td>{{ $i+1 }}</td><td>{{ $s->tanggal_servis->format('d/m/Y') }}</td><td>{{ $s->kendaraan->merk_tipe ?? '-' }}</td><td>{{ $s->kendaraan->nomor_polisi ?? '-' }}</td><td>{{ $s->jenis_servis }}</td><td>{{ $s->km_saat_servis ? number_format($s->km_saat_servis) : '-' }}</td><td class="right">{{ $fmtRp($s->biaya) }}</td><td>{{ $s->tempat_servis ?? '-' }}</td><td>{{ $s->pegawai->nama ?? '-' }}</td><td>{{ $s->status }}</td></tr>
@empty
<tr><td colspan="10" style="text-align:center">Tidak ada data</td></tr>
@endforelse
<tr><td colspan="6" class="right"><strong>TOTAL</strong></td><td class="right"><strong>{{ $totalBiaya }}</strong></td><td colspan="3"></td></tr>
</tbody>
</table>

<div class="ttd">
    <div class="ttd-box"><div>Dibuat oleh</div><div class="line">........................</div><div>NIP. ........................</div></div>
    <div class="ttd-box"><div>Mengetahui</div><div class="line">........................</div><div>NIP. ........................</div></div>
</div>
<div class="footer">Dokumen dicetak dari Sistem BMN BPKH Wilayah XI | {{ now()->format('d/m/Y H:i') }}</div>
</body>
</html>
