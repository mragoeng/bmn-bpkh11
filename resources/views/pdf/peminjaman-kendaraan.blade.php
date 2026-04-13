<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Surat Peminjaman Kendaraan</title>
    <style>
        body { font-family: 'Times New Roman', serif; font-size: 12pt; margin: 40px; color: #000; }
        .header { text-align: center; border-bottom: 3px double #000; padding-bottom: 10px; margin-bottom: 20px; }
        .header h1 { font-size: 14pt; margin: 0; text-transform: uppercase; }
        .header h2 { font-size: 12pt; margin: 2px 0; font-weight: normal; }
        .header h3 { font-size: 11pt; margin: 2px 0; font-weight: normal; }
        .title { text-align: center; margin: 20px 0; }
        .title h2 { font-size: 13pt; text-decoration: underline; margin: 0; }
        .nomor-surat { text-align: center; margin-bottom: 20px; font-size: 11pt; }
        table.data { width: 100%; margin: 15px 0; }
        table.data td { padding: 3px 0; vertical-align: top; }
        table.data td:first-child { width: 160px; }
        .content { margin: 15px 0; text-align: justify; line-height: 1.6; }
        .ttd-area { margin-top: 40px; display: flex; justify-content: space-between; }
        .ttd-box { text-align: center; width: 45%; }
        .ttd-box .name { margin-top: 60px; border-bottom: 1px solid #000; padding-bottom: 2px; font-weight: bold; }
        .ttd-box .title-role { font-size: 10pt; }
        .footer { margin-top: 30px; font-size: 9pt; color: #666; text-align: center; border-top: 1px solid #ccc; padding-top: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>KEMENTERIAN KEHUTANAN</h1>
        <h2>BADAN PEMERINTAHAN KEHUTANAN WIILAYAH XI</h2>
        <h3>Jl. Babaran No.60a, Warungboto, Umbulharjo, Yogyakarta 55161</h3>
    </div>

    <div class="title">
        <h2>SURAT PERMINTAAN PENGGUNAAN KENDARAAN DINAS</h2>
    </div>

    <div class="nomor-surat">Nomor: {{ $peminjaman->nomor_surat }}</div>

    <div class="content">
        <p>Yang bertanda tangan di bawah ini, kami sampaikan permintaan penggunaan kendaraan dinas sebagai berikut:</p>

        <table class="data">
            <tr><td>Nama Peminjam</td><td>: {{ $peminjaman->pegawai->nama ?? '-' }}</td></tr>
            <tr><td>NIP</td><td>: {{ $peminjaman->pegawai->nip ?? '-' }}</td></tr>
            <tr><td>Jabatan</td><td>: {{ $peminjaman->pegawai->jabatan ?? '-' }}</td></tr>
            <tr><td>Kendaraan</td><td>: {{ $peminjaman->kendaraan->nama_barang ?? '-' }}</td></tr>
            <tr><td>Merk / Tipe</td><td>: {{ $peminjaman->kendaraan->merk_tipe ?? '-' }}</td></tr>
            <tr><td>Nomor Polisi</td><td>: {{ $peminjaman->kendaraan->nomor_polisi ?? '-' }}</td></tr>
            <tr><td>Tanggal Pinjam</td><td>: {{ $peminjaman->tanggal_pinjam->format('d F Y') }}</td></tr>
            <tr><td>Tanggal Kembali</td><td>: {{ $peminjaman->tanggal_kembali->format('d F Y') }}</td></tr>
            <tr><td>Keperluan</td><td>: {{ $peminjaman->keperluan }}</td></tr>
            @if($peminjaman->keterangan)
            <tr><td>Keterangan</td><td>: {{ $peminjaman->keterangan }}</td></tr>
            @endif
        </table>

        <p>Demikian surat ini dibuat untuk dapat dipergunakan sebagaimana mestinya.</p>
    </div>

    <div class="ttd-area">
        <div class="ttd-box">
            <div class="title-role">Peminjam</div>
            <div class="name">{{ $peminjaman->pegawai->nama ?? '........................' }}</div>
            <div class="title-role">NIP. {{ $peminjaman->pegawai->nip ?? '-' }}</div>
        </div>
        <div class="ttd-box">
            <div class="title-role">Pejabat Berwenang</div>
            <div class="name">........................</div>
            <div class="title-role">NIP. ........................</div>
        </div>
    </div>

    <div class="footer">
        Dokumen dicetak dari Sistem BMN BPKH Wilayah XI | {{ now()->format('d/m/Y H:i') }}
    </div>
</body>
</html>
