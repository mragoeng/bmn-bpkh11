# Deploy aaPanel

Panduan ini dibuat supaya update aplikasi Laravel di VPS aaPanel nanti cukup satu perintah atau satu webhook.

## Struktur yang disarankan

- Path project: `/www/wwwroot/bmn-bpkh11`
- Document root website di aaPanel: `/www/wwwroot/bmn-bpkh11/public`
- Branch deploy: `main`

Laravel secara resmi menyarankan web server diarahkan ke folder `public`, bukan ke root project:
https://laravel.com/docs/11.x/deployment

## Setup awal di VPS

1. Clone repository ke server:

```bash
cd /www/wwwroot
git clone <URL-REPO-ANDA> bmn-bpkh11
cd /www/wwwroot/bmn-bpkh11
```

2. Siapkan environment production:

```bash
cp .env.production.example .env
php artisan key:generate
```

3. Edit `.env` sesuai server Anda. Template awal sudah disediakan di:

`.env.production.example`

Minimal pastikan nilai berikut sudah benar:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://domainanda.com
```

4. Install dependency dan build aplikasi:

```bash
composer install --no-dev --optimize-autoloader
npm ci
npm run build
php artisan migrate --force
php artisan db:seed --force
php artisan storage:link
php artisan optimize
```

5. Pastikan permission bisa ditulis web server:

```bash
chown -R www:www /www/wwwroot/bmn-bpkh11
chmod -R 775 /www/wwwroot/bmn-bpkh11/storage
chmod -R 775 /www/wwwroot/bmn-bpkh11/bootstrap/cache
```

Jika user web server Anda bukan `www`, sesuaikan nilainya.

## Cara update manual

Script deploy sudah disiapkan di:

`scripts/deploy-aapanel.sh`

Log deploy akan disimpan di:

`storage/logs/deploy.log`

Setelah project ada di VPS, update aplikasi cukup dengan:

```bash
cd /www/wwwroot/bmn-bpkh11
bash scripts/deploy-aapanel.sh
```

Script ini akan menjalankan:

- `git pull --ff-only`
- `composer install --no-dev`
- `npm ci`
- `npm run build`
- `php artisan migrate --force`
- `php artisan optimize`

Jika deploy berhasil, aplikasi akan otomatis dibuka kembali dari maintenance mode.

## Variabel yang bisa diubah

Kalau branch production Anda bukan `main`, jalankan seperti ini:

```bash
cd /www/wwwroot/bmn-bpkh11
DEPLOY_BRANCH=production bash scripts/deploy-aapanel.sh
```

Kalau Anda tidak ingin `npm build` di server:

```bash
cd /www/wwwroot/bmn-bpkh11
RUN_NPM_BUILD=false bash scripts/deploy-aapanel.sh
```

Kalau Anda ingin seeder ikut dijalankan saat deploy:

```bash
cd /www/wwwroot/bmn-bpkh11
RUN_SEEDER=true bash scripts/deploy-aapanel.sh
```

Kalau Anda ingin menyimpan log deploy ke lokasi lain:

```bash
cd /www/wwwroot/bmn-bpkh11
DEPLOY_LOG_PATH=/tmp/bmn-bpkh11-deploy.log bash scripts/deploy-aapanel.sh
```

## Cara auto update dari GitHub ke aaPanel

Di aaPanel, Anda bisa pakai Git deployment dan webhook agar setiap push ke branch tertentu langsung men-trigger deploy script ini.

Dokumentasi aaPanel:
https://www.aapanel.com/docs/Function/Tutorial/create_for_git.html

Gunakan script berikut sebagai command deploy di aaPanel:

```bash
cd /www/wwwroot/bmn-bpkh11 && bash scripts/deploy-aapanel.sh
```

## Checklist go-live

Checklist ringkas sebelum domain live tersedia di:

`docs/AAPANEL_GO_LIVE_CHECKLIST.md`

## Cron Laravel

Kalau nanti aplikasi memakai scheduler Laravel, tambahkan Cron di aaPanel:

```bash
cd /www/wwwroot/bmn-bpkh11 && php artisan schedule:run >> /dev/null 2>&1
```

Jalankan setiap 1 menit.

Dokumentasi Cron aaPanel:
https://www.aapanel.com/docs/Function/Cron.html

## Catatan penting

- Jangan simpan file `.env` di Git.
- Jika tetap memakai SQLite, backup file `database/database.sqlite` secara rutin.
- Jika nanti memakai queue worker yang selalu hidup, restart worker setelah deploy.
- Script deploy akan gagal jika working tree di VPS tidak bersih, supaya perubahan lokal di server tidak tertimpa diam-diam.
- Jika memakai Git webhook, pastikan branch deploy di server sama dengan branch yang Anda push dari lokal.
