import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard({ stats, latestTransactions }) {
    return (
        <AppLayout title="Dashboard" description="Ringkasan cepat data master, transaksi terbaru, dan titik masuk utama untuk modul pencatatan BBM.">
            <Head title="Dashboard" />
            <div className="space-y-8">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {stats.map((item) => (
                        <div key={item.label} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-primary-pale/30 dark:bg-primary-dark/30 p-5">
                            <p className="text-sm text-primary">{item.label}</p>
                            <p className="mt-2 text-3xl font-bold text-primary-dark dark:text-green-300">{item.value}</p>
                            <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">{item.description}</p>
                        </div>
                    ))}
                </div>
                <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                        <div className="border-b border-gray-200 dark:border-gray-700 bg-primary px-5 py-4">
                            <h3 className="text-lg font-semibold text-white">Transaksi Terbaru</h3>
                        </div>
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700 text-left text-gray-500 dark:text-gray-400">
                                <tr>
                                    <th className="px-5 py-3 font-medium">Tanggal</th>
                                    <th className="px-5 py-3 font-medium">Pegawai</th>
                                    <th className="px-5 py-3 font-medium">Kendaraan</th>
                                    <th className="px-5 py-3 font-medium">Liter</th>
                                    <th className="px-5 py-3 font-medium">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {latestTransactions.length ? (
                                    latestTransactions.map((item) => (
                                        <tr key={`${item.tanggal}-${item.nomor_polisi}`}>
                                            <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{item.tanggal}</td>
                                            <td className="px-5 py-3 font-medium text-gray-900 dark:text-gray-100">{item.pegawai}</td>
                                            <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{item.kendaraan}</td>
                                            <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{item.liter}</td>
                                            <td className="px-5 py-3 font-medium text-gray-900 dark:text-gray-100">{item.total}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="5" className="px-5 py-8 text-center text-gray-400 dark:text-gray-500">Belum ada transaksi BBM terbaru.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="rounded-xl bg-primary p-6 text-white">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Fokus Tahap Awal</p>
                        <ul className="mt-4 space-y-3 text-sm leading-6 text-white/80">
                            <li>Rapikan master pegawai dan kendaraan.</li>
                            <li>Pastikan kelompok akun pembayaran per tahun tersedia.</li>
                            <li>Lanjutkan implementasi simpan transaksi BBM ke database.</li>
                            <li>Siapkan placeholder print untuk kebutuhan SPJ.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
