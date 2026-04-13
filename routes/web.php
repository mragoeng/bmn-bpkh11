<?php

use App\Http\Controllers\AlatController;
use App\Http\Controllers\PeminjamanKendaraanController;
use App\Http\Controllers\ServisKendaraanController;
use App\Http\Controllers\KelompokAkunPembayaranController;
use App\Http\Controllers\KendaraanController;
use App\Http\Controllers\LaporanController;
use App\Http\Controllers\PegawaiController;
use App\Http\Controllers\PeminjamanAlatController;
use App\Http\Controllers\PropertiController;
use App\Http\Controllers\PrintSettingController;
use App\Http\Controllers\LogoSettingController;
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

// New renderDashboard closure - replace the old one in routes/web.php
// This goes in routes/web.php replacing the $renderDashboard variable

$renderDashboard = function () use ($formatRupiah) {
    if (! Schema::hasTable('transaksi_bbm')) {
        return Inertia::render('Dashboard', [
            'stats' => [],
            'latestTransactions' => [],
            'bbmMonthly' => [],
            'topKendaraanBbm' => [],
            'peminjamanAktif' => [],
            'perluPerhatian' => [],
        ]);
    }

    // === ROW 1: Quick Stats ===
    $totalKendaraan = Kendaraan::count();
    $kendaraanBaik = Kendaraan::where('kondisi', 'like', '%Baik%')->count();
    $kendaraanRusak = Kendaraan::where('kondisi', 'like', '%Rusak%')->count();
    $totalPegawai = Pegawai::count();
    $totalAlat = \DB::table('alat')->count();
    $totalProperti = \DB::table('properti')->count();

    $stats = [
        ['key' => 'kendaraan', 'label' => 'Kendaraan', 'value' => $totalKendaraan, 'icon' => '🚗', 'color' => 'blue',
         'detail' => "{$kendaraanBaik} Baik, {$kendaraanRusak} Rusak"],
        ['key' => 'pegawai', 'label' => 'Pegawai', 'value' => $totalPegawai, 'icon' => '👥', 'color' => 'green', 'detail' => 'Pegawai terdaftar'],
        ['key' => 'alat', 'label' => 'Alat Ukur', 'value' => $totalAlat, 'icon' => '🔧', 'color' => 'purple', 'detail' => 'Alat tercatat'],
        ['key' => 'properti', 'label' => 'Properti', 'value' => $totalProperti, 'icon' => '🏢', 'color' => 'amber', 'detail' => 'Aset properti'],
    ];

    // === ROW 2: BBM Stats ===
    $now = now();
    $bbmBulanIni = TransaksiBbm::whereYear('tanggal', $now->year)->whereMonth('tanggal', $now->month);
    $bbmBulanLalu = TransaksiBbm::whereYear('tanggal', $now->copy()->subMonth()->year)
        ->whereMonth('tanggal', $now->copy()->subMonth()->month);

    $bbmIniLiter = (float) $bbmBulanIni->sum('liter');
    $bbmIniBiaya = (float) $bbmBulanIni->sum('total');
    $bbmIniCount = $bbmBulanIni->count();

    $bbmLaluBiaya = (float) $bbmBulanLalu->sum('total');
    $bbmSelisih = $bbmLaluBiaya > 0 ? round((($bbmIniBiaya - $bbmLaluBiaya) / $bbmLaluBiaya) * 100, 1) : 0;

    $bbmStats = [
        'liter' => rtrim(rtrim(number_format($bbmIniLiter, 2, '.', ''), '0'), '.'),
        'biaya' => $formatRupiah($bbmIniBiaya),
        'transaksi' => $bbmIniCount,
        'selisih_persen' => $bbmSelisih,
        'naik' => $bbmSelisih >= 0,
    ];

    $peminjamanKendaraanAktif = \DB::table('peminjaman_kendaraan')->where('status', 'DISETUJUI')->count();
    $peminjamanKendaraanMenunggu = \DB::table('peminjaman_kendaraan')->where('status', 'MENUNGGU')->count();
    $peminjamanAlatAktif = \DB::table('peminjaman_alat')->where('status', 'dipinjam')->count();

    $peminjamanStats = [
        'kendaraan_aktif' => $peminjamanKendaraanAktif,
        'kendaraan_menunggu' => $peminjamanKendaraanMenunggu,
        'alat_aktif' => $peminjamanAlatAktif,
    ];

    // === ROW 3: Charts ===
    // BBM 6 bulan terakhir
    $bbmMonthly = [];
    for ($i = 5; $i >= 0; $i--) {
        $m = $now->copy()->subMonths($i);
        $data = TransaksiBbm::whereYear('tanggal', $m->year)->whereMonth('tanggal', $m->month)
            ->selectRaw('COALESCE(SUM(liter),0) as liter, COALESCE(SUM(total),0) as total')
            ->first();
        $bbmMonthly[] = [
            'bulan' => $m->translatedFormat('M'),
            'liter' => (float) $data->liter,
            'total' => (float) $data->total,
        ];
    }

    // Top 5 kendaraan BBM bulan ini
    $topKendaraanBbm = TransaksiBbm::whereYear('tanggal', $now->year)->whereMonth('tanggal', $now->month)
        ->select('kendaraan_id', \DB::raw('SUM(liter) as total_liter'), \DB::raw('SUM(total) as total_biaya'))
        ->with('kendaraan:id,merk_tipe,nomor_polisi')
        ->groupBy('kendaraan_id')
        ->orderByDesc('total_liter')
        ->limit(5)
        ->get()
        ->map(fn($t) => [
            'kendaraan' => ($t->kendaraan?->merk_tipe ?? '-') . ' (' . ($t->kendaraan?->nomor_polisi ?? '-') . ')',
            'liter' => (float) $t->total_liter,
            'biaya' => $formatRupiah((float) $t->total_biaya),
        ]);

    // === ROW 5: Activities ===
    $latestTransactions = TransaksiBbm::query()
        ->with(['pegawai:id,nama', 'kendaraan:id,merk_tipe,nomor_polisi'])
        ->latest('tanggal')->latest('id')->limit(5)->get()
        ->map(fn($t) => [
            'tanggal' => $t->tanggal,
            'pegawai' => $t->pegawai?->nama ?? '-',
            'kendaraan' => $t->kendaraan?->merk_tipe ?? '-',
            'nomor_polisi' => $t->kendaraan?->nomor_polisi ?? '-',
            'liter' => rtrim(rtrim(number_format((float) $t->liter, 2, '.', ''), '0'), '.'),
            'total' => $formatRupiah((float) $t->total),
        ]);

    $latestPeminjaman = \DB::table('peminjaman_kendaraan')
        ->join('kendaraan', 'peminjaman_kendaraan.kendaraan_id', '=', 'kendaraan.id')
        ->join('pegawai', 'peminjaman_kendaraan.pegawai_id', '=', 'pegawai.id')
        ->select('peminjaman_kendaraan.*', 'kendaraan.merk_tipe', 'kendaraan.nomor_polisi', 'pegawai.nama as pegawai_nama')
        ->orderByDesc('peminjaman_kendaraan.created_at')->limit(5)->get()
        ->map(fn($p) => [
            'tanggal' => $p->tanggal_pinjam,
            'pegawai' => $p->pegawai_nama,
            'kendaraan' => $p->merk_tipe . ' (' . $p->nomor_polisi . ')',
            'status' => $p->status,
            'keperluan' => $p->keperluan,
        ]);

    // Perlu perhatian
    $perluPerhatian = Kendaraan::where('kondisi', 'not like', '%Baik%')
        ->get(['id', 'nama_barang', 'merk_tipe', 'nomor_polisi', 'kondisi'])
        ->map(fn($k) => ['nama' => $k->nama_barang, 'merk' => $k->merk_tipe, 'nopol' => $k->nomor_polisi, 'kondisi' => $k->kondisi]);

    return Inertia::render('Dashboard', [
        'stats' => $stats,
        'bbmStats' => $bbmStats,
        'peminjamanStats' => $peminjamanStats,
        'bbmMonthly' => $bbmMonthly,
        'topKendaraanBbm' => $topKendaraanBbm,
        'latestTransactions' => $latestTransactions,
        'latestPeminjaman' => $latestPeminjaman,
        'perluPerhatian' => $perluPerhatian,
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
        Route::post('/pegawai', [PegawaiController::class, 'store'])->middleware('throttle:web')->name('pegawai.store');
        Route::post('/pegawai/import', [PegawaiController::class, 'import'])->middleware('throttle:web')->name('pegawai.import');
        Route::get('/pegawai/template', [PegawaiController::class, 'downloadTemplate'])->name('pegawai.template');
        Route::put('/pegawai/{pegawai}', [PegawaiController::class, 'update'])->middleware('throttle:web')->name('pegawai.update');
        Route::delete('/pegawai/{pegawai}', [PegawaiController::class, 'destroy'])->middleware('throttle:web')->name('pegawai.destroy');

        Route::get('/kendaraan', [KendaraanController::class, 'index'])->name('kendaraan');
        Route::post('/kendaraan', [KendaraanController::class, 'store'])->middleware('throttle:web')->name('kendaraan.store');
        Route::post('/kendaraan/import', [KendaraanController::class, 'import'])->middleware('throttle:web')->name('kendaraan.import');
        Route::get('/kendaraan/template', [KendaraanController::class, 'downloadTemplate'])->name('kendaraan.template');
        Route::put('/kendaraan/{kendaraan}', [KendaraanController::class, 'update'])->middleware('throttle:web')->name('kendaraan.update');
        Route::delete('/kendaraan/{kendaraan}', [KendaraanController::class, 'destroy'])->middleware('throttle:web')->name('kendaraan.destroy');

        Route::resource('alat', AlatController::class);
        Route::resource('properti', PropertiController::class);
    });

    Route::prefix('peminjaman-alat')->name('peminjaman-alat.')->group(function () {
        Route::resource('/', PeminjamanAlatController::class)->parameter('', 'peminjaman_alat');
    });

    Route::prefix('bbm')->name('bbm.')->group(function () use ($formatRupiah) {
        Route::get('/kelompok-akun-pembayaran', [KelompokAkunPembayaranController::class, 'index'])->name('kelompok-akun-pembayaran');
        Route::post('/kelompok-akun-pembayaran', [KelompokAkunPembayaranController::class, 'store'])->middleware('throttle:web')->name('kelompok-akun-pembayaran.store');
        Route::put('/kelompok-akun-pembayaran/{akun}', [KelompokAkunPembayaranController::class, 'update'])->middleware('throttle:web')->name('kelompok-akun-pembayaran.update');
        Route::delete('/kelompok-akun-pembayaran/{akun}', [KelompokAkunPembayaranController::class, 'destroy'])->middleware('throttle:web')->name('kelompok-akun-pembayaran.destroy');

        Route::get('/pencatatan', [TransaksiBbmController::class, 'create'])->name('pencatatan');
        Route::post('/pencatatan', [TransaksiBbmController::class, 'store'])->middleware('throttle:web')->name('pencatatan.store');
        Route::post('/riwayat/import', [TransaksiBbmController::class, 'import'])->middleware('throttle:web')->name('riwayat.import');
        Route::get('/riwayat/template', [TransaksiBbmController::class, 'downloadTemplate'])->name('riwayat.template');
        Route::get('/pencatatan/{transaksi}/edit', [TransaksiBbmController::class, 'edit'])->name('pencatatan.edit');
        Route::put('/pencatatan/{transaksi}', [TransaksiBbmController::class, 'update'])->middleware('throttle:web')->name('pencatatan.update');
        Route::delete('/pencatatan/{transaksi}', [TransaksiBbmController::class, 'destroy'])->middleware('throttle:web')->name('pencatatan.destroy');
        Route::get('/riwayat/{transaksi}/spj-preview', [TransaksiBbmController::class, 'previewSpj'])->name('riwayat.spj-preview');
        Route::get('/riwayat/{transaksi}/spj-print', [TransaksiBbmController::class, 'printSpj'])->name('riwayat.spj-print');
        Route::get('/riwayat/{transaksi}/spj-pdf', [TransaksiBbmController::class, 'downloadPdf'])->name('riwayat.spj-pdf');
        Route::get('/riwayat', [TransaksiBbmController::class, 'index'])->name('riwayat');

        Route::get('/laporan', [LaporanController::class, 'index'])->name('laporan');
        Route::get('/laporan/pdf', [LaporanController::class, 'cetakPdf'])->name('laporan.pdf');

        // Servis Kendaraan
        Route::get('servis-kendaraan/laporan', [ServisKendaraanController::class, 'laporan'])->name('bbm.servis-kendaraan.laporan');
        Route::get('servis-kendaraan/laporan/pdf', [ServisKendaraanController::class, 'laporanPdf'])->name('bbm.servis-kendaraan.laporan.pdf');
        Route::get('servis-kendaraan/export', [ServisKendaraanController::class, 'exportExcel'])->name('bbm.servis-kendaraan.export');
        Route::resource('servis-kendaraan', ServisKendaraanController::class)->except(['create', 'show', 'edit']);
        Route::post('servis-kendaraan/{servis_kendaraan}/upload-bukti', [ServisKendaraanController::class, 'uploadBukti'])->name('bbm.servis-kendaraan.upload-bukti');
        Route::delete('servis-kendaraan/{servis_kendaraan}/delete-bukti', [ServisKendaraanController::class, 'deleteBukti'])->name('bbm.servis-kendaraan.delete-bukti');
        // Peminjaman Kendaraan
        Route::resource('peminjaman-kendaraan', PeminjamanKendaraanController::class)->except(['create', 'show', 'edit']);
        Route::put('peminjaman-kendaraan/{peminjaman_kendaraan}/approve', [PeminjamanKendaraanController::class, 'approve'])->name('peminjaman-kendaraan.approve');
        Route::put('peminjaman-kendaraan/{peminjaman_kendaraan}/reject', [PeminjamanKendaraanController::class, 'reject'])->name('peminjaman-kendaraan.reject');
        Route::put('peminjaman-kendaraan/{peminjaman_kendaraan}/return', [PeminjamanKendaraanController::class, 'returnKendaraan'])->name('peminjaman-kendaraan.return');
        Route::get('peminjaman-kendaraan/{peminjaman_kendaraan}/pdf', [PeminjamanKendaraanController::class, 'generatePdf'])->name('peminjaman-kendaraan.pdf');
        Route::post('peminjaman-kendaraan/{peminjaman_kendaraan}/upload-pdf', [PeminjamanKendaraanController::class, 'uploadPdf'])->name('peminjaman-kendaraan.upload-pdf');

        Route::get('/laporan/excel', [LaporanController::class, 'exportExcel'])->name('laporan.excel');
    });

    Route::prefix('settings')->name('settings.')->group(function () {
        Route::get('/pengaturan-user', [SettingsUserController::class, 'index'])->name('pengaturan-user');
        Route::post('/pengaturan-user', [SettingsUserController::class, 'store'])->middleware('throttle:web')->name('pengaturan-user.store');
        Route::put('/pengaturan-user/{user}', [SettingsUserController::class, 'update'])->middleware('throttle:web')->name('pengaturan-user.update');
        Route::delete('/pengaturan-user/{user}', [SettingsUserController::class, 'destroy'])->middleware('throttle:web')->name('pengaturan-user.destroy');

        Route::get('/pengaturan-print', [PrintSettingController::class, 'edit'])->name('pengaturan-print');
        Route::post('/pengaturan-print', [PrintSettingController::class, 'update'])->middleware('throttle:web')->name('pengaturan-print.update');
        Route::post('/pengaturan-print/test-google-docs', [PrintSettingController::class, 'testConnection'])->middleware('throttle:web')->name('pengaturan-print.test-google-docs');

        Route::get('/pengaturan-logo', [LogoSettingController::class, 'edit'])->name('pengaturan-logo');
        Route::post('/pengaturan-logo', [LogoSettingController::class, 'update'])->middleware('throttle:web')->name('pengaturan-logo.update');
    });
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->middleware('throttle:web')->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->middleware('throttle:web')->name('profile.destroy');
});

require __DIR__.'/auth.php';
