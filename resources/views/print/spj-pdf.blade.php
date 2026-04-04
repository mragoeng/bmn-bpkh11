<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>{{ $template['nama_template'] }} - {{ $transaction['nomor_polisi'] }}</title>
    <style>
        @page {
            margin: 20mm 15mm 20mm 15mm;
            size: A4;
        }
        body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 12pt;
            line-height: 1.6;
            color: #000;
            margin: 0;
            padding: 0;
        }
        .kop {
            text-align: center;
            border-bottom: 3px double #000;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .kop h1 {
            font-size: 14pt;
            margin: 0;
            letter-spacing: 2px;
        }
        .kop h2 {
            font-size: 11pt;
            margin: 4px 0 0;
            font-weight: normal;
        }
        .judul {
            text-align: center;
            font-size: 13pt;
            font-weight: bold;
            margin: 20px 0;
            text-decoration: underline;
        }
        .detail-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .detail-table td {
            padding: 4px 8px;
            vertical-align: top;
            font-size: 11pt;
        }
        .detail-table td.label {
            width: 180px;
            font-weight: normal;
        }
        .detail-table td.separator {
            width: 15px;
        }
        .content-body {
            white-space: pre-wrap;
            font-size: 12pt;
            line-height: 1.8;
            margin: 20px 0;
        }
        .tanda-tangan {
            margin-top: 40px;
            width: 100%;
        }
        .tanda-tangan table {
            width: 100%;
            border-collapse: collapse;
        }
        .tanda-tangan td {
            width: 50%;
            vertical-align: top;
            text-align: center;
            padding: 0;
        }
        .tanda-tangan .nama {
            margin-top: 60px;
            font-weight: bold;
            border-bottom: 1px solid #000;
            display: inline-block;
            min-width: 200px;
        }
        .tanda-tangan .nip {
            margin-top: 4px;
            font-size: 11pt;
        }
    </style>
</head>
<body>
    <div class="kop">
        <h1>BADAN PENGELOLAAN KEUANGAN HAJI</h1>
        <h2>PERWAKILAN WILAYAH XI - YOGYAKARTA</h2>
    </div>

    <div class="judul">{{ $template['nama_template'] }}</div>

    <table class="detail-table">
        <tr>
            <td class="label">Tanggal</td>
            <td class="separator">:</td>
            <td>{{ $transaction['tanggal'] }}</td>
        </tr>
        <tr>
            <td class="label">Nama Pegawai</td>
            <td class="separator">:</td>
            <td>{{ $transaction['pegawai'] }}</td>
        </tr>
        <tr>
            <td class="label">NIP</td>
            <td class="separator">:</td>
            <td>{{ $placeholderMap['nip'] ?? '-' }}</td>
        </tr>
        <tr>
            <td class="label">Jabatan</td>
            <td class="separator">:</td>
            <td>{{ $placeholderMap['jabatan'] ?? '-' }}</td>
        </tr>
        <tr>
            <td class="label">Unit</td>
            <td class="separator">:</td>
            <td>{{ $placeholderMap['unit'] ?? '-' }}</td>
        </tr>
        <tr>
            <td class="label">Kendaraan</td>
            <td class="separator">:</td>
            <td>{{ $transaction['kendaraan'] }} ({{ $transaction['nomor_polisi'] }})</td>
        </tr>
        <tr>
            <td class="label">Jenis BBM</td>
            <td class="separator">:</td>
            <td>{{ $placeholderMap['jenis_bbm'] ?? '-' }}</td>
        </tr>
        <tr>
            <td class="label">Liter</td>
            <td class="separator">:</td>
            <td>{{ $placeholderMap['liter'] ?? '-' }}</td>
        </tr>
        <tr>
            <td class="label">Harga per Liter</td>
            <td class="separator">:</td>
            <td>{{ $placeholderMap['harga_per_liter'] ?? '-' }}</td>
        </tr>
        <tr>
            <td class="label"><strong>Total</strong></td>
            <td class="separator">:</td>
            <td><strong>{{ $transaction['total'] }}</strong></td>
        </tr>
        <tr>
            <td class="label">Terbilang</td>
            <td class="separator">:</td>
            <td>{{ $placeholderMap['terbilang'] ?? '-' }}</td>
        </tr>
        <tr>
            <td class="label">SPBU</td>
            <td class="separator">:</td>
            <td>{{ $placeholderMap['spbu'] ?? '-' }}</td>
        </tr>
        <tr>
            <td class="label">Kode Akun Pembayaran</td>
            <td class="separator">:</td>
            <td>{{ $placeholderMap['kode_akun_pembayaran'] ?? '-' }}</td>
        </tr>
        <tr>
            <td class="label">Nama Akun Pembayaran</td>
            <td class="separator">:</td>
            <td>{{ $placeholderMap['nama_akun_pembayaran'] ?? '-' }}</td>
        </tr>
        <tr>
            <td class="label">Nomor Nota</td>
            <td class="separator">:</td>
            <td>{{ $placeholderMap['nomor_nota'] ?? '-' }}</td>
        </tr>
    </table>

    @if($mergedContent)
    <div class="content-body">{{ $mergedContent }}</div>
    @endif

    <div class="tanda-tangan">
        <table>
            <tr>
                <td>
                    Mengetahui,<br>
                    Kepala Perwakilan Wilayah XI
                    <div class="nama">&nbsp;</div>
                    <div class="nip">NIP. </div>
                </td>
                <td>
                    Yogyakarta, {{ $transaction['tanggal'] }}<br>
                    Yang membuat pertanggungjawaban
                    <div class="nama">{{ $transaction['pegawai'] }}</div>
                    <div class="nip">NIP. {{ $placeholderMap['nip'] ?? '' }}</div>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
