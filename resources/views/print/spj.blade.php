<!DOCTYPE html>
<html lang="id">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>{{ $template['nama_template'] }} - {{ $transaction['nomor_polisi'] }}</title>
        <style>
            :root {
                color-scheme: light;
            }

            * {
                box-sizing: border-box;
            }

            body {
                margin: 0;
                background: #f5f1e8;
                color: #1c1917;
                font-family: Georgia, "Times New Roman", serif;
                line-height: 1.6;
            }

            .toolbar {
                position: sticky;
                top: 0;
                z-index: 10;
                display: flex;
                gap: 12px;
                justify-content: flex-end;
                padding: 20px 24px;
                background: rgba(245, 241, 232, 0.94);
                backdrop-filter: blur(12px);
                border-bottom: 1px solid #d6d3d1;
            }

            .toolbar button,
            .toolbar a {
                appearance: none;
                border: 1px solid #292524;
                background: #292524;
                color: #fafaf9;
                border-radius: 999px;
                padding: 10px 16px;
                font: 600 14px/1.2 Arial, sans-serif;
                text-decoration: none;
                cursor: pointer;
            }

            .toolbar a.secondary,
            .toolbar button.secondary {
                background: transparent;
                color: #292524;
            }

            .page {
                max-width: 960px;
                margin: 24px auto 48px;
                padding: 0 20px;
            }

            .sheet {
                background: #fff;
                border: 1px solid #d6d3d1;
                box-shadow: 0 28px 80px -40px rgba(41, 37, 36, 0.45);
                border-radius: 28px;
                overflow: hidden;
            }

            .header {
                padding: 40px 44px 28px;
                border-bottom: 1px solid #e7e5e4;
            }

            .eyebrow {
                margin: 0 0 10px;
                font: 700 12px/1.2 Arial, sans-serif;
                letter-spacing: 0.28em;
                text-transform: uppercase;
                color: #b45309;
            }

            .title {
                margin: 0;
                font-size: 34px;
                line-height: 1.15;
                color: #1c1917;
            }

            .subtitle {
                margin: 12px 0 0;
                color: #57534e;
                font: 400 15px/1.7 Arial, sans-serif;
            }

            .meta {
                display: grid;
                gap: 16px;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                padding: 28px 44px;
                border-bottom: 1px solid #e7e5e4;
                background: #fcfcfb;
            }

            .meta-card {
                border: 1px solid #e7e5e4;
                border-radius: 18px;
                padding: 16px 18px;
                background: #fff;
            }

            .meta-label {
                margin: 0 0 6px;
                color: #78716c;
                font: 600 12px/1.2 Arial, sans-serif;
                text-transform: uppercase;
                letter-spacing: 0.12em;
            }

            .meta-value {
                margin: 0;
                color: #1c1917;
                font: 600 18px/1.4 Arial, sans-serif;
            }

            .content {
                padding: 36px 44px 44px;
            }

            .content h2 {
                margin: 0 0 14px;
                font-size: 20px;
                color: #1c1917;
            }

            .template-meta {
                margin: 0 0 24px;
                padding: 16px 18px;
                border-radius: 18px;
                background: #fffbeb;
                border: 1px solid #fcd34d;
                color: #78350f;
                font: 400 14px/1.7 Arial, sans-serif;
            }

            .document {
                min-height: 420px;
                padding: 28px;
                border: 1px solid #d6d3d1;
                border-radius: 20px;
                white-space: pre-wrap;
                font-size: 18px;
                line-height: 1.8;
                background: #fff;
            }

            .placeholders {
                margin-top: 32px;
            }

            table {
                width: 100%;
                border-collapse: collapse;
                font: 400 14px/1.5 Arial, sans-serif;
            }

            th,
            td {
                border-bottom: 1px solid #e7e5e4;
                padding: 12px 10px;
                vertical-align: top;
                text-align: left;
            }

            th {
                color: #57534e;
                font-weight: 700;
                background: #fafaf9;
            }

            @media print {
                body {
                    background: #fff;
                }

                .toolbar {
                    display: none;
                }

                .page {
                    max-width: none;
                    margin: 0;
                    padding: 0;
                }

                .sheet {
                    border: none;
                    border-radius: 0;
                    box-shadow: none;
                }

                .document {
                    border: none;
                    padding: 0;
                }

                .placeholders {
                    page-break-before: always;
                }
            }
        </style>
    </head>
    <body>
        <div class="toolbar">
            <a href="{{ route('bbm.riwayat.spj-preview', $transaction['id']) }}" class="secondary">Kembali ke Preview</a>
            <button type="button" onclick="window.print()">Cetak / Simpan PDF</button>
        </div>

        <div class="page">
            <div class="sheet">
                <div class="header">
                    <p class="eyebrow">BMN-BPKH11</p>
                    <h1 class="title">{{ $template['nama_template'] }}</h1>
                    <p class="subtitle">Dokumen SPJ hasil generate dari transaksi BBM. Anda bisa langsung mencetak halaman ini atau menyimpannya sebagai PDF dari browser.</p>
                </div>

                <div class="meta">
                    <div class="meta-card">
                        <p class="meta-label">Tanggal Transaksi</p>
                        <p class="meta-value">{{ $transaction['tanggal'] }}</p>
                    </div>
                    <div class="meta-card">
                        <p class="meta-label">Pegawai</p>
                        <p class="meta-value">{{ $transaction['pegawai'] }}</p>
                    </div>
                    <div class="meta-card">
                        <p class="meta-label">Kendaraan</p>
                        <p class="meta-value">{{ $transaction['kendaraan'] }}</p>
                    </div>
                    <div class="meta-card">
                        <p class="meta-label">Nomor Polisi</p>
                        <p class="meta-value">{{ $transaction['nomor_polisi'] }}</p>
                    </div>
                </div>

                <div class="content">
                    <h2>Dokumen SPJ</h2>

                    <div class="template-meta">
                        @if (filled($template['google_docs_url']))
                            <div>Referensi Google Docs: {{ $template['google_docs_url'] }}</div>
                        @endif
                        @if (filled($template['keterangan']))
                            <div>Catatan Template: {{ $template['keterangan'] }}</div>
                        @endif
                    </div>

                    <div class="document">{{ $mergedContent }}</div>

                    <div class="placeholders">
                        <h2>Referensi Placeholder</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Placeholder</th>
                                    <th>Nilai</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach ($placeholders as $item)
                                    <tr>
                                        <td>{{ $item['key'] }}</td>
                                        <td>{{ $item['value'] ?: '-' }}</td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </body>
</html>
