export const navigationSections = [
    {
        key: 'umum',
        title: 'Umum',
        items: [
            { title: 'Dashboard', href: '/dashboard', routeName: 'dashboard' },
        ],
    },
    {
        key: 'database',
        title: 'Database',
        items: [
            {
                title: 'Pegawai',
                href: '/database/pegawai',
                routeName: 'database.pegawai',
            },
            {
                title: 'Kendaraan',
                href: '/database/kendaraan',
                routeName: 'database.kendaraan',
            },
            {
                title: 'Alat Ukur',
                href: '/database/alat',
                routeName: 'database.alat',
            },
            {
                title: 'Properti',
                href: '/database/properti',
                routeName: 'database.properti.index',
            },
        ],
    },
    {
        key: 'bbm',
        title: 'BBM',
        items: [
            {
                title: 'Kelompok Akun Pembayaran',
                href: '/bbm/kelompok-akun-pembayaran',
                routeName: 'bbm.kelompok-akun-pembayaran',
            },
            {
                title: 'Pencatatan',
                href: '/bbm/pencatatan',
                routeName: 'bbm.pencatatan',
            },
            {
                title: 'Riwayat',
                href: '/bbm/riwayat',
                routeName: 'bbm.riwayat',
            },
            {
                title: 'Laporan',
                href: '/bbm/laporan',
                routeName: 'bbm.laporan',
            },
        ],
    },
    {
        key: 'peminjaman',
        title: 'Peminjaman',
        items: [
            {
                title: 'Peminjaman Alat',
                href: '/peminjaman-alat',
                routeName: 'peminjaman-alat.index',
            },
        ],
    },
    {
        key: 'settings',
        title: 'Settings',
        items: [
            {
                title: 'Pengaturan User',
                href: '/settings/pengaturan-user',
                routeName: 'settings.pengaturan-user',
            },
            {
                title: 'Pengaturan Print',
                href: '/settings/pengaturan-print',
                routeName: 'settings.pengaturan-print',
            },
        ],
    },
];
