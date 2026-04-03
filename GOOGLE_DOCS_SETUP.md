# Google Docs Setup

## Tujuan

Dokumen ini dipakai untuk mengaktifkan fitur generate SPJ ke Google Docs dari aplikasi BMN-BPKH11.

## Yang Dibutuhkan

- 1 file service account JSON dari Google Cloud
- 1 template Google Docs yang berisi placeholder seperti `{{nama_pegawai}}`
- opsional 1 folder Google Drive untuk hasil generate SPJ
- opsional akun Google Workspace untuk impersonasi domain-wide delegation

## Environment

Isi `.env`:

```env
GOOGLE_SERVICE_ACCOUNT_JSON_PATH=storage/app/private/google/service-account.json
GOOGLE_IMPERSONATED_USER=
```

Catatan:

- `GOOGLE_SERVICE_ACCOUNT_JSON_PATH` wajib diisi
- `GOOGLE_IMPERSONATED_USER` opsional
- jika memakai Google Workspace dan domain-wide delegation, isi email user target yang akan menjadi pemilik konteks akses
- path default project ini mengarah ke `storage/app/private/google/service-account.json`

## Google Cloud

Aktifkan API berikut:

- Google Docs API
- Google Drive API

## Share Akses

Bagikan template Google Docs ke email service account, misalnya:

- `bmn-bpkh11-spj@your-project.iam.gserviceaccount.com`

Jika memakai folder output, bagikan juga folder Google Drive tersebut ke service account yang sama.

## Isi Settings Aplikasi

Masuk ke `Settings > Pengaturan Print`, lalu isi:

- `Nama Template`
- `URL Google Docs`
- `URL Folder Output Google Drive` jika ada
- `Isi Template Manual` opsional
- `Catatan Template` opsional

## Uji Koneksi

Setelah kredensial dan URL diisi:

1. buka `Settings > Pengaturan Print`
2. klik `Tes Koneksi Google Docs`
3. pastikan hasilnya menampilkan nama template dan folder output

## Generate SPJ

1. buka `BBM > Riwayat`
2. pilih transaksi
3. klik `Preview SPJ`
4. klik `Generate Google Docs`

Hasilnya:

- aplikasi akan menyalin template Google Docs
- placeholder akan diganti otomatis
- dokumen hasil generate akan terbuka di tab baru
