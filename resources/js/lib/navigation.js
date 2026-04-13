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
                title: 'Peminjaman Alat',
                href: '/database/peminjaman-alat',
                routeName: 'database.peminjaman-alat',
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
                title: 'Pencatatan BBM',
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
