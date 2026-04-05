<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Laporan BBM - {{ $periode_label }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'DejaVu Sans', sans-serif; font-size: 10pt; color: #333; }
        .header { text-align: center; border-bottom: 3px double #333; padding-bottom: 10px; margin-bottom: 15px; }
        .header h1 { font-size: 14pt; margin-bottom: 4px; }
        .header p { font-size: 10pt; color: #555; }
        .summary { display: flex; justify-content: space-between; margin-bottom: 15px; }
        .summary-box { flex: 1; text-align: center; padding: 8px; margin: 0 4px; background: #f5f5f5; border-radius: 4px; }
        .summary-box .label { font-size: 8pt; color: #777; text-transform: uppercase; }
        .summary-box .value { font-size: 12pt; font-weight: bold; margin-top: 4px; }
        .section-title { font-size: 11pt; font-weight: bold; margin: 15px 0 8px 0; padding-bottom: 4px; border-bottom: 1px solid #ccc; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 9pt; }
        th { background: #2c3e50; color: #fff; padding: 6px 8px; text-align: left; font-weight: bold; }
        td { padding: 5px 8px; border-bottom: 1px solid #eee; }
        tr:nth-child(even) { background: #f9f9f9; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .footer { margin-top: 20px; text-align: right; font-size: 9pt; color: #777; }
        @page { margin: 15mm; }
    </style>
</head>
<body>
    <div class="header">
        <h1>LAPORAN PEMAKAIAN BBM</h1>
        <p>BPKH XI</p>
        <p style="margin-top:4px; font-weight:bold;">Periode: {{ $periode_label }}</p>
    </div>

    <div class="summary">
        <div class="summary-box">
            <div class="label">Total Transaksi</div>
            <div class="value">{{ $summary['total_transaksi'] }}</div>
        </div>
        <div class="summary-box">
            <div class="label">Total Liter</div>
            <div class="value">{{ $summary['total_liter'] }} L</div>
        </div>
        <div class="summary-box">
            <div class="label">Total Nominal</div>
            <div class="value">{{ $summary['total_nominal'] }}</div>
        </div>
    </div>

    <div class="section-title">A. Rekap per Kendaraan</div>
    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Kendaraan</th>
                <th>Nopol</th>
                <th>Jenis</th>
                <th class="text-center">Transaksi</th>
                <th class="text-right">Total Liter</th>
                <th class="text-right">Rata² Liter</th>
                <th class="text-center">Jarak</th>
                <th class="text-center">KM/L</th>
                <th class="text-right">Total Biaya</th>
            </tr>
        </thead>
        <tbody>
            @foreach($perKendaraan as $i => $k)
            <tr>
                <td>{{ $i + 1 }}</td>
                <td>{{ $k['merk_tipe'] }}</td>
                <td>{{ $k['nomor_polisi'] }}</td>
                <td>{{ $k['jenis_kendaraan'] }}</td>
                <td class="text-center">{{ $k['jumlah_transaksi'] }}</td>
                <td class="text-right">{{ $k['total_liter'] }}</td>
                <td class="text-right">{{ $k['rata_rata_liter'] }}</td>
                <td class="text-center">{{ $k['jarak_tempuh'] }}</td>
                <td class="text-center">{{ $k['km_per_liter'] }}</td>
                <td class="text-right">{{ $k['total_biaya'] }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="section-title">B. Rekap per Pegawai</div>
    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Nama</th>
                <th>NIP</th>
                <th>Unit</th>
                <th class="text-center">Transaksi</th>
                <th class="text-right">Total Liter</th>
                <th class="text-right">Total Biaya</th>
            </tr>
        </thead>
        <tbody>
            @foreach($perPegawai as $i => $p)
            <tr>
                <td>{{ $i + 1 }}</td>
                <td>{{ $p['nama'] }}</td>
                <td>{{ $p['nip'] }}</td>
                <td>{{ $p['unit'] }}</td>
                <td class="text-center">{{ $p['jumlah_transaksi'] }}</td>
                <td class="text-right">{{ $p['total_liter'] }}</td>
                <td class="text-right">{{ $p['total_biaya'] }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="section-title">C. Rekap per Jenis BBM</div>
    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Jenis BBM</th>
                <th class="text-center">Jumlah Transaksi</th>
                <th class="text-right">Total Liter</th>
                <th class="text-right">Total Nominal</th>
            </tr>
        </thead>
        <tbody>
            @foreach($perBbm as $i => $b)
            <tr>
                <td>{{ $i + 1 }}</td>
                <td>{{ $b['jenis_bbm'] }}</td>
                <td class="text-center">{{ $b['jumlah_transaksi'] }}</td>
                <td class="text-right">{{ $b['total_liter'] }}</td>
                <td class="text-right">{{ $b['total_nominal'] }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        <p>Dicetak pada: {{ $tanggal_cetak }}</p>
    </div>
</body>
</html>
