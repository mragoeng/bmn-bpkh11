import AppLayout from '@/Layouts/AppLayout';
import { Head, router, Link } from '@inertiajs/react';
import { useState, useMemo } from 'react';

export default function Laporan({ summary, perKendaraan, perPegawai, perBbm, trendBulanan, filters, tahunTersedia }) {
    const [periode, setPeriode] = useState(filters.periode);
    const [tahun, setTahun] = useState(filters.tahun);
    const [triwulan, setTriwulan] = useState(filters.triwulan);
    const [bulan, setBulan] = useState(filters.bulan);
    const [activeTab, setActiveTab] = useState('kendaraan');

    const bulanNama = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

    const applyFilter = () => {
        const params = new URLSearchParams({ periode, tahun, triwulan: String(triwulan), bulan: String(bulan) });
        window.location.href = `${route('bbm.laporan')}?${params.toString()}`;
    };

    const printPdf = () => {
        const params = new URLSearchParams({ periode, tahun, triwulan, bulan });
        window.open(`/bbm/laporan/pdf?${params.toString()}`, '_blank');
    };

    const maxNominal = useMemo(() => Math.max(...trendBulanan.map(t => t.nominal), 1), [trendBulanan]);

    return (
        <AppLayout
            title="Laporan BBM"
            description="Ringkasan dan rekap pemakaian BBM per periode"
            actions={
                <div className="flex gap-2">
                    <button
                        onClick={printPdf}
                        className="rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-white hover:bg-primary-dark"
                    >
                        📄 Cetak PDF
                    </button>
                    <button
                        onClick={() => {
                            const params = new URLSearchParams({ periode, tahun, triwulan, bulan });
                            window.open(`/bbm/laporan/excel?${params.toString()}`, '_blank');
                        }}
                        className="rounded-2xl bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700"
                    >
                        📊 Export Excel
                    </button>
                </div>
            }
        >
            <Head title="Laporan BBM" />

            <div className="space-y-6">
                {/* Filter Bar */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
                    <div className="flex flex-wrap items-end gap-3">
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Periode</label>
                            <select value={periode} onChange={e => setPeriode(e.target.value)}
                                className="rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                                <option value="tahun">Tahunan</option>
                                <option value="triwulan">Triwulan</option>
                                <option value="bulan">Bulanan</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Tahun</label>
                            <select value={tahun} onChange={e => setTahun(parseInt(e.target.value))}
                                className="rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                                {tahunTersedia.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        {periode === 'triwulan' && (
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Triwulan</label>
                                <select value={triwulan} onChange={e => setTriwulan(parseInt(e.target.value))}
                                    className="rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                                    <option value={1}>Triwulan I (Jan-Mar)</option>
                                    <option value={2}>Triwulan II (Apr-Jun)</option>
                                    <option value={3}>Triwulan III (Jul-Sep)</option>
                                    <option value={4}>Triwulan IV (Okt-Des)</option>
                                </select>
                            </div>
                        )}
                        {periode === 'bulan' && (
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Bulan</label>
                                <select value={bulan} onChange={e => setBulan(parseInt(e.target.value))}
                                    className="rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                                    {bulanNama.map((b, i) => <option key={i} value={i+1}>{b}</option>)}
                            </select>
                            </div>
                        )}
                        <button onClick={applyFilter}
                            className="rounded-2xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">
                            Terapkan
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-primary-pale/30 dark:bg-primary-dark/30 p-5">
                        <p className="text-sm text-primary">Periode</p>
                        <p className="mt-2 text-lg font-bold text-primary-dark dark:text-green-300">{summary.periode}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-primary-pale/30 dark:bg-primary-dark/30 p-5">
                        <p className="text-sm text-primary">Total Transaksi</p>
                        <p className="mt-2 text-3xl font-bold text-primary-dark dark:text-green-300">{summary.total_transaksi}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-primary-pale/30 dark:bg-primary-dark/30 p-5">
                        <p className="text-sm text-primary">Total Liter</p>
                        <p className="mt-2 text-3xl font-bold text-primary-dark dark:text-green-300">{summary.total_liter}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-primary-pale/30 dark:bg-primary-dark/30 p-5">
                        <p className="text-sm text-primary">Total Nominal</p>
                        <p className="mt-2 text-xl font-bold text-primary-dark dark:text-green-300">{summary.total_nominal}</p>
                    </div>
                </div>

                {/* Trend Chart */}
                {periode === 'tahun' && (
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
                        <h3 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-200">Tren Bulanan {tahun}</h3>
                        <div className="flex items-end gap-1" style={{ height: 120 }}>
                            {trendBulanan.map((t, i) => (
                                <div key={i} className="flex flex-1 flex-col items-center">
                                    <div
                                        className="w-full rounded-t bg-primary transition-all hover:bg-primary-dark"
                                        style={{ height: `${Math.max((t.nominal / maxNominal) * 100, 2)}%` }}
                                        title={`${t.bulan}: Rp ${t.nominal.toLocaleString('id-ID')} (${t.transaksi} tx)`}
                                    />
                                    <span className="mt-1 text-[9px] text-gray-400 dark:text-gray-500">{t.bulan}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-1 rounded-xl bg-gray-100 dark:bg-gray-700 p-1">
                    {[
                        { key: 'kendaraan', label: '🚗 Per Kendaraan' },
                        { key: 'pegawai', label: '👤 Per Pegawai' },
                        { key: 'bbm', label: '⛽ Per Jenis BBM' },
                    ].map(tab => (
                        <button key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
                                activeTab === tab.key ? 'bg-white dark:bg-gray-600 text-primary-dark dark:text-green-300 shadow' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Per Kendaraan */}
                {activeTab === 'kendaraan' && (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                                    <tr>
                                        <th className="px-4 py-3">No</th>
                                        <th className="px-4 py-3">Kendaraan</th>
                                        <th className="px-4 py-3">Nopol</th>
                                        <th className="px-4 py-3">Jenis</th>
                                        <th className="px-4 py-3 text-center">Tx</th>
                                        <th className="px-4 py-3 text-right">Liter</th>
                                        <th className="px-4 py-3 text-right">Rata² Ltr</th>
                                        <th className="px-4 py-3 text-center">Jarak</th>
                                        <th className="px-4 py-3 text-center">KM/L</th>
                                        <th className="px-4 py-3 text-right">Total Biaya</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {perKendaraan.length ? perKendaraan.map((k, i) => (
                                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-4 py-3">{i + 1}</td>
                                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{k.merk_tipe}</td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{k.nomor_polisi}</td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{k.jenis_kendaraan}</td>
                                            <td className="px-4 py-3 text-center">{k.jumlah_transaksi}</td>
                                            <td className="px-4 py-3 text-right">{k.total_liter}</td>
                                            <td className="px-4 py-3 text-right text-gray-500 dark:text-gray-400">{k.rata_rata_liter}</td>
                                            <td className="px-4 py-3 text-center">{k.jarak_tempuh}</td>
                                            <td className="px-4 py-3 text-center">{k.km_per_liter}</td>
                                            <td className="px-4 py-3 text-right font-medium">{k.total_biaya}</td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="10" className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">Tidak ada data</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Mobile Cards */}
                        <div className="space-y-3 md:hidden">
                            {perKendaraan.length ? perKendaraan.map((k, i) => (
                                <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
                                    <div className="mb-2 flex items-start justify-between">
                                        <div>
                                            <p className="font-semibold text-gray-900">{k.merk_tipe}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{k.nomor_polisi} · {k.jenis_kendaraan}</p>
                                        </div>
                                        <span className="rounded-full bg-primary-pale/50 px-2 py-0.5 text-xs font-medium text-primary-dark">{k.jumlah_transaksi} tx</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div><span className="text-gray-400 dark:text-gray-500">Liter:</span> <span className="font-medium">{k.total_liter}</span></div>
                                        <div><span className="text-gray-400 dark:text-gray-500">Rata²:</span> <span className="font-medium">{k.rata_rata_liter} L</span></div>
                                        <div><span className="text-gray-400 dark:text-gray-500">Jarak:</span> <span className="font-medium">{k.jarak_tempuh}</span></div>
                                        <div><span className="text-gray-400 dark:text-gray-500">KM/L:</span> <span className="font-medium">{k.km_per_liter}</span></div>
                                    </div>
                                    <div className="mt-2 border-t border-gray-100 dark:border-gray-700 pt-2 text-right">
                                        <span className="text-lg font-bold text-primary-dark dark:text-green-300">{k.total_biaya}</span>
                                    </div>
                                </div>
                            )) : (
                                <p className="py-8 text-center text-gray-400 dark:text-gray-500">Tidak ada data</p>
                            )}
                        </div>
                    </>
                )}

                {/* Per Pegawai */}
                {activeTab === 'pegawai' && (
                    <>
                        <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                                    <tr>
                                        <th className="px-4 py-3">No</th>
                                        <th className="px-4 py-3">Nama</th>
                                        <th className="px-4 py-3">NIP</th>
                                        <th className="px-4 py-3">Jabatan</th>
                                        <th className="px-4 py-3">Unit</th>
                                        <th className="px-4 py-3 text-center">Tx</th>
                                        <th className="px-4 py-3 text-right">Total Liter</th>
                                        <th className="px-4 py-3 text-right">Total Biaya</th>
                                        <th className="px-4 py-3 text-center">Kendaraan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {perPegawai.length ? perPegawai.map((p, i) => (
                                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-4 py-3">{i + 1}</td>
                                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{p.nama}</td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{p.nip}</td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{p.jabatan}</td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{p.unit}</td>
                                            <td className="px-4 py-3 text-center">{p.jumlah_transaksi}</td>
                                            <td className="px-4 py-3 text-right">{p.total_liter}</td>
                                            <td className="px-4 py-3 text-right font-medium">{p.total_biaya}</td>
                                            <td className="px-4 py-3 text-center">{p.kendaraan_digunakan}</td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="9" className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">Tidak ada data</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="space-y-3 md:hidden">
                            {perPegawai.length ? perPegawai.map((p, i) => (
                                <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
                                    <div className="mb-2 flex items-start justify-between">
                                        <div>
                                            <p className="font-semibold text-gray-900">{p.nama}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{p.jabatan} · {p.unit}</p>
                                        </div>
                                        <span className="rounded-full bg-primary-pale/50 px-2 py-0.5 text-xs font-medium text-primary-dark">{p.jumlah_transaksi} tx</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div><span className="text-gray-400 dark:text-gray-500">NIP:</span> <span className="font-medium">{p.nip}</span></div>
                                        <div><span className="text-gray-400 dark:text-gray-500">Liter:</span> <span className="font-medium">{p.total_liter}</span></div>
                                        <div><span className="text-gray-400 dark:text-gray-500">Kendaraan:</span> <span className="font-medium">{p.kendaraan_digunakan}</span></div>
                                    </div>
                                    <div className="mt-2 border-t border-gray-100 dark:border-gray-700 pt-2 text-right">
                                        <span className="text-lg font-bold text-primary-dark dark:text-green-300">{p.total_biaya}</span>
                                    </div>
                                </div>
                            )) : (
                                <p className="py-8 text-center text-gray-400 dark:text-gray-500">Tidak ada data</p>
                            )}
                        </div>
                    </>
                )}

                {/* Per BBM */}
                {activeTab === 'bbm' && (
                    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                                <tr>
                                    <th className="px-4 py-3">No</th>
                                    <th className="px-4 py-3">Jenis BBM</th>
                                    <th className="px-4 py-3 text-center">Transaksi</th>
                                    <th className="px-4 py-3 text-right">Total Liter</th>
                                    <th className="px-4 py-3 text-right">Total Nominal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {perBbm.length ? perBbm.map((b, i) => (
                                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-4 py-3">{i + 1}</td>
                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{b.jenis_bbm}</td>
                                        <td className="px-4 py-3 text-center">{b.jumlah_transaksi}</td>
                                        <td className="px-4 py-3 text-right">{b.total_liter}</td>
                                        <td className="px-4 py-3 text-right font-medium">{b.total_nominal}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">Tidak ada data</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
