# aaPanel Go-Live Checklist

Checklist singkat ini membantu memastikan aplikasi siap live dan update berikutnya tidak merepotkan.

## Sebelum domain diarahkan

- Project sudah ada di `/www/wwwroot/bmn-bpkh11`
- Document root website aaPanel mengarah ke `/www/wwwroot/bmn-bpkh11/public`
- Branch deploy production sudah ditentukan, misalnya `main`
- File `.env` production sudah dibuat dari `.env.production.example`
- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL` memakai domain final dengan `https`
- Dependency production sudah terpasang
- Build frontend sudah berhasil
- Migrasi database sudah berjalan tanpa error
- Seeder admin sudah dijalankan jika dibutuhkan
- Permission `storage` dan `bootstrap/cache` sudah benar

## Saat menyalakan domain

- SSL aktif di aaPanel
- Redirect HTTP ke HTTPS aktif
- Website bisa dibuka tanpa error 500
- Halaman login tampil normal
- Upload file dan session berjalan normal
- Link storage sudah aktif

## Agar update berikutnya mudah

- Script [deploy-aapanel.sh](/home/agoeng/Documents/bmn-bpkh11/scripts/deploy-aapanel.sh) sudah ada di VPS
- Update manual cukup `bash scripts/deploy-aapanel.sh`
- Log deploy tersimpan di `storage/logs/deploy.log`
- Repo di VPS tidak diubah manual
- Webhook aaPanel atau Git deployment sudah disiapkan bila ingin auto-deploy
- Backup database dijadwalkan di aaPanel

## Setelah setiap deploy

- Cek hasil deploy di `storage/logs/deploy.log`
- Buka halaman utama dan login
- Cek fitur penting yang paling sering dipakai
- Pastikan tidak ada error baru di `storage/logs/laravel.log`
