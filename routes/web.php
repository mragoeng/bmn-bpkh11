<?php

use App\Http\Controllers\KelompokAkunPembayaranController;
use App\Http\Controllers\KendaraanController;
use App\Http\Controllers\PegawaiController;
use App\Http\Controllers\PrintSettingController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SettingsUserController;
use App\Http\Controllers\TransaksiBbmController;
use App\Models\KelompokAkunPembayaran;
use App\Models\Kendaraan;
use App\Models\Pegawai;
use App\Models\TransaksiBbm;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

$formatRupiah = fn (float|int $value): string => 'Rp '.number_format($value, 0, ',', '.');

$renderDashboard = function () use ($formatRupiah) {
    if (! Schema::hasTable('transaksi_bbm')) {
        return Inertia::render('Dashboard', [
            'stats' => [
                [
                    'label' => 'Pegawai',
                    'value' => 0,
                    'description' => 'Data master pegawai terdaftar',
                ],
                [
                    'label' => 'Kendaraan',
                    'value' => 0,
                    'description' => 'Roda 2 dan roda 4 aktif',
                ],
                [
                    'label' => 'Transaksi BBM',
                    'value' => 0,
                    'description' => 'Arsip transaksi BBM tercatat',
                ],
                [
                    'label' => 'Total Nominal',
                    'value' => $formatRupiah(0),
                    'description' => 'Akumulasi pengeluaran BBM',
                ],
            ],
            'latestTransactions' => [],
        ]);
    }

    $transactions = TransaksiBbm::query()
        ->with(['pegawai:id,nama', 'kendaraan:id,merk_tipe,nomor_polisi'])
        ->latest('tanggal')
        ->latest('id')
        ->limit(5)
        ->get();

    return Inertia::render('Dashboard', [
        'stats' => [
            [
                'label' => 'Pegawai',
                'value' => Pegawai::count(),
                'description' => 'Data master pegawai terdaftar',
            ],
            [
                'label' => 'Kendaraan',
                'value' => Kendaraan::count(),
                'description' => 'Roda 2 dan roda 4 aktif',
            ],
            [
                'label' => 'Transaksi BBM',
                'value' => TransaksiBbm::count(),
                'description' => 'Arsip transaksi BBM tercatat',
            ],
            [
                'label' => 'Total Nominal',
                'value' => $formatRupiah((float) TransaksiBbm::sum('total')),
                'description' => 'Akumulasi pengeluaran BBM',
            ],
        ],
        'latestTransactions' => $transactions->map(fn (TransaksiBbm $transaction) => [
            'tanggal' => $transaction->tanggal,
            'pegawai' => $transaction->pegawai?->nama ?? '-',
            'kendaraan' => $transaction->kendaraan?->merk_tipe ?? '-',
            'nomor_polisi' => $transaction->kendaraan?->nomor_polisi ?? '-',
            'liter' => rtrim(rtrim(number_format((float) $transaction->liter, 2, '.', ''), '0'), '.'),
            'total' => $formatRupiah((float) $transaction->total),
        ]),
    ]);
};

Route::get('/', function () {
    return Auth::check()
        ? redirect()->route('dashboard')
        : redirect()->route('login');
});

Route::middleware('auth')->group(function () use ($renderDashboard, $formatRupiah) {
    Route::get('/dashboard', $renderDashboard)->name('dashboard');

    Route::prefix('database')->name('database.')->group(function () {
        Route::get('/pegawai', [PegawaiController::class, 'index'])->name('pegawai');
        Route::post('/pegawai', [PegawaiController::class, 'store'])->name('pegawai.store');
        Route::post('/pegawai/import', [PegawaiController::class, 'import'])->name('pegawai.import');
        Route::get('/pegawai/template', [PegawaiController::class, 'downloadTemplate'])->name('pegawai.template');
        Route::put('/pegawai/{pegawai}', [PegawaiController::class, 'update'])->name('pegawai.update');
        Route::delete('/pegawai/{pegawai}', [PegawaiController::class, 'destroy'])->name('pegawai.destroy');

        Route::get('/kendaraan', [KendaraanController::class, 'index'])->name('kendaraan');
        Route::post('/kendaraan', [KendaraanController::class, 'store'])->name('kendaraan.store');
        Route::post('/kendaraan/import', [KendaraanController::class, 'import'])->name('kendaraan.import');
        Route::get('/kendaraan/template', [KendaraanController::class, 'downloadTemplate'])->name('kendaraan.template');
        Route::put('/kendaraan/{kendaraan}', [KendaraanController::class, 'update'])->name('kendaraan.update');
        Route::delete('/kendaraan/{kendaraan}', [KendaraanController::class, 'destroy'])->name('kendaraan.destroy');
    });

    Route::prefix('bbm')->name('bbm.')->group(function () use ($formatRupiah) {
        Route::get('/kelompok-akun-pembayaran', [KelompokAkunPembayaranController::class, 'index'])->name('kelompok-akun-pembayaran');
        Route::post('/kelompok-akun-pembayaran', [KelompokAkunPembayaranController::class, 'store'])->name('kelompok-akun-pembayaran.store');
        Route::put('/kelompok-akun-pembayaran/{akun}', [KelompokAkunPembayaranController::class, 'update'])->name('kelompok-akun-pembayaran.update');
        Route::delete('/kelompok-akun-pembayaran/{akun}', [KelompokAkunPembayaranController::class, 'destroy'])->name('kelompok-akun-pembayaran.destroy');

        Route::get('/pencatatan', [TransaksiBbmController::class, 'create'])->name('pencatatan');
        Route::post('/pencatatan', [TransaksiBbmController::class, 'store'])->name('pencatatan.store');
        Route::post('/riwayat/import', [TransaksiBbmController::class, 'import'])->name('riwayat.import');
        Route::get('/riwayat/template', [TransaksiBbmController::class, 'downloadTemplate'])->name('riwayat.template');
        Route::get('/pencatatan/{transaksi}/edit', [TransaksiBbmController::class, 'edit'])->name('pencatatan.edit');
        Route::put('/pencatatan/{transaksi}', [TransaksiBbmController::class, 'update'])->name('pencatatan.update');
        Route::delete('/pencatatan/{transaksi}', [TransaksiBbmController::class, 'destroy'])->name('pencatatan.destroy');
        Route::get('/riwayat/{transaksi}/spj-preview', [TransaksiBbmController::class, 'previewSpj'])->name('riwayat.spj-preview');
        Route::get('/riwayat/{transaksi}/spj-print', [TransaksiBbmController::class, 'printSpj'])->name('riwayat.spj-print');
        Route::post('/riwayat/{transaksi}/spj-generate-google-doc', [TransaksiBbmController::class, 'generateGoogleDoc'])->name('riwayat.spj-generate-google-doc');
        Route::get('/riwayat', [TransaksiBbmController::class, 'index'])->name('riwayat');

        Route::get('/laporan', function () use ($formatRupiah) {
            $transactions = TransaksiBbm::query()
                ->with('kendaraan:id,merk_tipe')
                ->get();

            $rekap = $transactions
                ->groupBy(fn (TransaksiBbm $transaction) => $transaction->kendaraan?->merk_tipe ?? 'Tanpa Kendaraan')
                ->map(fn ($items, $kategori) => [
                    'kategori' => $kategori,
                    'liter' => rtrim(rtrim(number_format((float) $items->sum('liter'), 2, '.', ''), '0'), '.'),
                    'nominal' => $formatRupiah((float) $items->sum('total')),
                ])
                ->values();

            return Inertia::render('Bbm/Laporan', [
                'summary' => [
                    'periode' => 'Semua Data',
                    'total_transaksi' => $transactions->count(),
                    'total_liter' => rtrim(rtrim(number_format((float) $transactions->sum('liter'), 2, '.', ''), '0'), '.'),
                    'total_nominal' => $formatRupiah((float) $transactions->sum('total')),
                ],
                'rekap' => $rekap,
            ]);
        })->name('laporan');
    });

    Route::prefix('settings')->name('settings.')->group(function () {
        Route::get('/pengaturan-user', [SettingsUserController::class, 'index'])->name('pengaturan-user');
        Route::post('/pengaturan-user', [SettingsUserController::class, 'store'])->name('pengaturan-user.store');
        Route::put('/pengaturan-user/{user}', [SettingsUserController::class, 'update'])->name('pengaturan-user.update');
        Route::delete('/pengaturan-user/{user}', [SettingsUserController::class, 'destroy'])->name('pengaturan-user.destroy');

        Route::get('/pengaturan-print', [PrintSettingController::class, 'edit'])->name('pengaturan-print');
        Route::post('/pengaturan-print', [PrintSettingController::class, 'update'])->name('pengaturan-print.update');
        Route::post('/pengaturan-print/test-google-docs', [PrintSettingController::class, 'testConnection'])->name('pengaturan-print.test-google-docs');
    });
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
