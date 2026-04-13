import AppLayout from '@/Layouts/AppLayout';
import InputError from '@/Components/InputError';
import { Head, Link } from '@inertiajs/react';

const colorMap = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
};
const colorNum = { blue: 'text-blue-600', green: 'text-green-600', purple: 'text-purple-600', amber: 'text-amber-600', red: 'text-red-600' };

export default function Dashboard({ stats, bbmStats, peminjamanStats, bbmMonthly, topKendaraanBbm, latestTransactions, latestPeminjaman, perluPerhatian }) {
    const maxLiter = Math.max(...(bbmMonthly || []).map(m => m.liter), 1);

    return (
        <AppLayout title="Dashboard" description="Ringkasan data BMN BPKH Wilayah XI">
            <Head title="Dashboard" />
            <div className="min-w-0 overflow-x-hidden">
                {/* Row 1: Quick Stats */}
                <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 mb-4">
                    {(stats || []).map(s => (
                        <div key={s.key} className={`rounded-xl border p-3 ${colorMap[s.color] || colorMap.blue}`}>
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-medium opacity-80">{s.label}</p>
                                <span className="text-xl">{s.icon}</span>
                            </div>
                            <p className={`mt-1 text-xl font-bold ${colorNum[s.color] || 'text-blue-600'}`}>{s.value}</p>
                            <p className="mt-1 text-[10px] opacity-70">{s.detail}</p>
                        </div>
                    ))}
                </div>

                {/* Row 2: BBM + Peminjaman */}
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-3 mb-4">
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400">BBM Bulan Ini</p>
                        <p className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">{bbmStats?.biaya || 'Rp 0'}</p>
                        <div className="mt-2 flex gap-2 text-[10px] text-gray-500 dark:text-gray-400">
                            <span>{bbmStats?.liter || 0}L</span>
                            <span>•</span>
                            <span>{bbmStats?.transaksi || 0} trx</span>
                        </div>
                        {bbmStats?.selisih_persen !== 0 && (
                            <p className={`mt-2 text-xs font-medium ${bbmStats?.naik ? 'text-red-500' : 'text-green-500'}`}>
                                {bbmStats?.naik ? '↑' : '↓'} {Math.abs(bbmStats?.selisih_persen || 0)}% vs bulan lalu
                            </p>
                        )}
                    </div>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Peminjaman</p>
                        <div className="mt-2 space-y-2">
                            <div className="flex justify-between"><span className="text-xs text-gray-600 dark:text-gray-300">Kendaraan Aktif</span><span className="text-xs font-bold text-blue-600">{peminjamanStats?.kendaraan_aktif || 0}</span></div>
                            <div className="flex justify-between"><span className="text-xs text-gray-600 dark:text-gray-300">Menunggu</span><span className="text-xs font-bold text-yellow-600">{peminjamanStats?.kendaraan_menunggu || 0}</span></div>
                            <div className="flex justify-between"><span className="text-xs text-gray-600 dark:text-gray-300">Alat Aktif</span><span className="text-xs font-bold text-purple-600">{peminjamanStats?.alat_aktif || 0}</span></div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-green-200 bg-green-50 p-3">
                        <p className="text-xs text-green-600">✅ Sistem Aktif</p>
                        <p className="mt-1 text-xs text-green-700">Semua modul berjalan normal.</p>
                    </div>
                </div>

                {/* Row 3: Charts */}
                <div className="grid gap-3 lg:grid-cols-2 mb-4">
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Trend BBM 6 Bulan</p>
                        <div className="flex items-end gap-1 h-32">
                            {(bbmMonthly || []).map((m, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center">
                                    <span className="text-[9px] text-gray-400 mb-0.5">{m.liter.toFixed(0)}</span>
                                    <div className="w-full bg-blue-500 rounded-t" style={{ height: `${Math.max((m.liter / maxLiter) * 100, 4)}px` }} />
                                    <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">{m.bulan}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Top 5 BBM (Bulan Ini)</p>
                        {(topKendaraanBbm && topKendaraanBbm.length > 0) ? topKendaraanBbm.map((t, i) => {
                            const maxL = topKendaraanBbm[0]?.liter || 1;
                            return (
                                <div key={i} className="mb-2">
                                    <div className="flex justify-between text-[10px] text-gray-600 dark:text-gray-300 mb-0.5">
                                        <span className="truncate mr-1">{t.kendaraan}</span>
                                        <span className="font-medium flex-shrink-0">{t.liter.toFixed(1)}L</span>
                                    </div>
                                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                                        <div className="bg-blue-500 rounded-full h-1.5" style={{ width: `${(t.liter / maxL) * 100}%` }} />
                                    </div>
                                </div>
                            );
                        }) : <p className="text-xs text-gray-400">Belum ada data bulan ini</p>}
                    </div>
                </div>

                {/* Row 4: Quick Actions */}
                <div className="grid gap-2 grid-cols-3 lg:grid-cols-5 mb-4">
                    {[
                        { label: 'Input BBM', icon: '⛽', href: route('bbm.pencatatan'), color: 'bg-blue-500 hover:bg-blue-600' },
                        { label: 'Pinjam Kendaraan', icon: '🚗', href: route('bbm.peminjaman-kendaraan.index'), color: 'bg-green-500 hover:bg-green-600' },
                        { label: 'Pinjam Alat', icon: '🔧', href: route('peminjaman-alat.index'), color: 'bg-purple-500 hover:bg-purple-600' },
                        { label: 'Laporan BBM', icon: '📊', href: route('bbm.laporan'), color: 'bg-amber-500 hover:bg-amber-600' },
                        { label: 'Database', icon: '🗂️', href: route('database.kendaraan'), color: 'bg-gray-600 hover:bg-gray-700' },
                    ].map(a => (
                        <Link key={a.label} href={a.href} className={`${a.color} rounded-xl p-2 sm:p-3 text-center text-white transition min-h-[56px] flex flex-col items-center justify-center`}>
                            <span className="text-lg mb-0.5">{a.icon}</span>
                            <span className="text-[10px] font-medium">{a.label}</span>
                        </Link>
                    ))}
                </div>

                {/* Row 5: Activities & Alerts */}
                <div className="grid gap-3 lg:grid-cols-2">
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Aktivitas Terbaru</p>
                        <div className="space-y-3">
                            {latestTransactions && latestTransactions.map((t, i) => (
                                <div key={`bbm-${i}`} className="flex gap-2">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs">⛽</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-gray-900 dark:text-gray-100 truncate">{t.pegawai}</p>
                                        <p className="text-[10px] text-gray-400">{t.tanggal} • {t.liter}L • {t.total}</p>
                                    </div>
                                </div>
                            ))}
                            {latestPeminjaman && latestPeminjaman.map((p, i) => (
                                <div key={`pin-${i}`} className="flex gap-2">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-xs">🚗</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-gray-900 dark:text-gray-100 truncate">{p.pegawai}</p>
                                        <p className="text-[10px] text-gray-400">{p.tanggal} • <span className={`font-medium ${p.status === 'DISETUJUI' ? 'text-green-500' : p.status === 'MENUNGGU' ? 'text-yellow-500' : 'text-gray-400'}`}>{p.status}</span></p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">⚠️ Perlu Perhatian</p>
                        {perluPerhatian && perluPerhatian.length > 0 ? (
                            <div className="space-y-2">
                                {perluPerhatian.map((k, i) => (
                                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
                                        <span className="text-sm">🚨</span>
                                        <div className="min-w-0">
                                            <p className="text-xs font-medium text-red-700 dark:text-red-300 truncate">{k.nama}</p>
                                            <p className="text-[10px] text-red-500 truncate">{k.merk} • {k.nopol} — {k.kondisi}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-green-600">✅ Semua kendaraan dalam kondisi baik</p>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
