# BMN-BPKH11 Blueprint

## Tujuan Aplikasi

BMN-BPKH11 adalah aplikasi arsip pencatatan BBM kendaraan dinas. Fokus aplikasi adalah mencatat transaksi BBM, menyimpan master data pendukung, menampilkan riwayat, membuat laporan, dan menyiapkan data cetak SPJ berbasis template.

Tidak ada fitur role atau otorisasi bertingkat pada tahap ini. Aplikasi digunakan sebagai sistem pencatatan internal.

## Struktur Menu

### Dashboard

Halaman ringkasan aplikasi yang menampilkan:

- jumlah pegawai
- jumlah kendaraan
- jumlah transaksi BBM
- total nominal BBM periode berjalan
- transaksi terbaru

### Database

Submenu:

- Pegawai
- Kendaraan

### BBM

Submenu:

- Pencatatan BBM
- Riwayat
- Laporan

### Settings

Submenu:

- Pengaturan Print

## Modul dan Fungsi

### 1. Pegawai

Fungsi:

- menambah data pegawai
- mengubah data pegawai
- menghapus data pegawai
- mencari data pegawai
- memilih pegawai saat pencatatan BBM

Field utama:

- `id`
- `nip`
- `nama`
- `jabatan`
- `unit`
- `keterangan`
- `created_at`
- `updated_at`

### 2. Kendaraan

Fungsi:

- menambah data kendaraan
- mengubah data kendaraan
- menghapus data kendaraan
- mencari data kendaraan
- memilih kendaraan saat pencatatan BBM

Field utama:

- `id`
- `kode_kendaraan`
- `nomor_polisi`
- `merk_tipe`
- `tahun`
- `jenis_bbm_default`
- `pegawai_id` atau pengguna kendaraan
- `keterangan`
- `created_at`
- `updated_at`

Catatan:

- relasi `pegawai_id` bersifat opsional jika kendaraan tidak selalu melekat ke satu pegawai

### 3. Pencatatan BBM

Fungsi:

- input transaksi BBM
- hitung otomatis total biaya
- simpan data transaksi
- sediakan data untuk riwayat, laporan, dan print SPJ

Field utama:

- `id`
- `tanggal`
- `pegawai_id`
- `kendaraan_id`
- `odometer`
- `jenis_bbm`
- `liter`
- `harga_per_liter`
- `total`
- `spbu`
- `nomor_nota`
- `catatan`
- `created_at`
- `updated_at`

Aturan dasar:

- `total = liter x harga_per_liter`
- `pegawai` dipilih dari master pegawai
- `kendaraan` dipilih dari master kendaraan
- `jenis_bbm` otomatis terisi dari kendaraan tetapi tetap bisa diubah saat transaksi

### 4. Riwayat

Fungsi:

- menampilkan seluruh transaksi BBM
- filter berdasarkan tanggal
- filter berdasarkan pegawai
- filter berdasarkan kendaraan
- pencarian cepat
- lihat detail transaksi
- cetak SPJ dari transaksi yang dipilih

Kolom tabel utama:

- tanggal
- nama pegawai
- kendaraan
- nomor polisi
- jenis BBM
- liter
- harga per liter
- total
- SPBU

### 5. Laporan

Fungsi:

- rekap transaksi per periode
- rekap total liter
- rekap total nominal
- rekap per kendaraan
- rekap per pegawai

Versi MVP:

- filter tanggal mulai dan tanggal akhir
- tampilkan total transaksi
- tampilkan total liter
- tampilkan total nominal
- tabel ringkasan transaksi

Pengembangan berikutnya:

- export PDF
- export Excel
- ringkasan bulanan otomatis

### 6. Pengaturan Print

Fungsi:

- menyimpan template print/SPJ
- mendefinisikan placeholder yang didukung
- menghubungkan transaksi BBM ke hasil print

Konsep:

- user menyiapkan dokumen template, termasuk dari Google Docs
- template memakai placeholder seperti `{{nama_pegawai}}`
- sistem mengganti placeholder dengan data transaksi saat proses print/generate

Field utama:

- `id`
- `nama_template`
- `google_docs_url`
- `template_content`
- `keterangan`
- `created_at`
- `updated_at`

Catatan implementasi:

- pada tahap awal, cukup simpan daftar placeholder dan URL template
- integrasi penuh ke Google Docs API bisa dibuat di tahap lanjutan

## Alur Penggunaan

1. User mengisi data pegawai di menu `Database > Pegawai`.
2. User mengisi data kendaraan di menu `Database > Kendaraan`.
3. User membuat transaksi di menu `BBM > Pencatatan BBM`.
4. Sistem menghitung total biaya secara otomatis.
5. Data transaksi tampil di menu `BBM > Riwayat`.
6. Data riwayat dipakai untuk rekap di menu `BBM > Laporan`.
7. Data transaksi yang dipilih dapat digunakan untuk print SPJ melalui template di menu `Settings > Pengaturan Print`.

## Placeholder SPJ Awal

Daftar placeholder yang disarankan:

- `{{tanggal}}`
- `{{nama_pegawai}}`
- `{{nip}}`
- `{{jabatan}}`
- `{{unit}}`
- `{{kode_kendaraan}}`
- `{{nomor_polisi}}`
- `{{merk_tipe}}`
- `{{jenis_bbm}}`
- `{{total}}`
- `{{terbilang}}`
- `{{catatan}}`

## Rancangan Halaman

### Dashboard

Komponen:

- kartu statistik
- tabel transaksi terakhir
- filter periode singkat

### Halaman Pegawai

Komponen:

- tombol tambah pegawai
- form tambah/edit
- tabel data pegawai
- pencarian

### Halaman Kendaraan

Komponen:

- tombol tambah kendaraan
- form tambah/edit
- tabel data kendaraan
- pencarian

### Halaman Pencatatan BBM

Komponen:

- form transaksi BBM
- pilihan pegawai
- pilihan kendaraan
- hitung otomatis total
- tombol simpan

### Halaman Riwayat

Komponen:

- filter tanggal
- filter pegawai
- filter kendaraan
- tabel transaksi
- aksi detail
- aksi print

### Halaman Laporan

Komponen:

- filter periode
- kartu total
- tabel rekap

### Halaman Pengaturan Print

Komponen:

- form nama template
- field URL Google Docs
- field isi template atau catatan placeholder
- daftar placeholder tersedia
- preview hasil merge di tahap lanjutan

## Skema Database Awal

### Tabel `pegawai`

| Kolom | Tipe | Catatan |
| --- | --- | --- |
| id | bigint / uuid | primary key |
| nip | varchar | opsional sesuai kebutuhan |
| nama | varchar | wajib |
| jabatan | varchar | opsional |
| unit | varchar | opsional |
| keterangan | text | opsional |
| created_at | timestamp | |
| updated_at | timestamp | |

### Tabel `kendaraan`

| Kolom | Tipe | Catatan |
| --- | --- | --- |
| id | bigint / uuid | primary key |
| kode_kendaraan | varchar | opsional |
| nomor_polisi | varchar | wajib |
| merk_tipe | varchar | wajib |
| tahun | integer | opsional |
| jenis_bbm_default | varchar | opsional |
| pegawai_id | foreign key | opsional |
| keterangan | text | opsional |
| created_at | timestamp | |
| updated_at | timestamp | |

### Tabel `transaksi_bbm`

| Kolom | Tipe | Catatan |
| --- | --- | --- |
| id | bigint / uuid | primary key |
| tanggal | date | wajib |
| pegawai_id | foreign key | wajib |
| kendaraan_id | foreign key | wajib |
| odometer | decimal | opsional |
| jenis_bbm | varchar | wajib |
| liter | decimal | wajib |
| harga_per_liter | decimal | wajib |
| total | decimal | wajib |
| spbu | varchar | opsional |
| nomor_nota | varchar | opsional |
| catatan | text | opsional |
| created_at | timestamp | |
| updated_at | timestamp | |

### Tabel `print_settings`

| Kolom | Tipe | Catatan |
| --- | --- | --- |
| id | bigint / uuid | primary key |
| nama_template | varchar | wajib |
| google_docs_url | text | opsional |
| template_content | longtext / text | opsional |
| keterangan | text | opsional |
| created_at | timestamp | |
| updated_at | timestamp | |

## Prioritas Pengembangan

### Tahap 1

- struktur project aplikasi
- master pegawai
- master kendaraan
- transaksi pencatatan BBM
- riwayat transaksi

### Tahap 2

- laporan periode
- pengaturan print
- placeholder SPJ

### Tahap 3

- integrasi generate dokumen
- export PDF/Excel
- penyempurnaan dashboard

## Catatan Teknis untuk Tahap Berikutnya

- pilih stack aplikasi terlebih dahulu sebelum implementasi
- siapkan migrasi database dari skema di atas
- buat komponen form yang konsisten untuk master dan transaksi
- buat utility formatter rupiah, tanggal, dan angka liter
- buat helper pengganti placeholder untuk kebutuhan SPJ
