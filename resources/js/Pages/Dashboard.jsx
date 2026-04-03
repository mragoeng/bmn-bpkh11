import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard({ stats, latestTransactions }) {
    return (
        <AppLayout
            title="Dashboard"
            description="Ringkasan cepat data master, transaksi terbaru, dan titik masuk utama untuk modul pencatatan BBM."
        >
            <Head title="Dashboard" />

            <div className="space-y-8">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {stats.map((item) => (
                        <div
                            key={item.label}
                            className="rounded-[24px] border border-stone-200 bg-stone-50 p-5"
                        >
                            <p className="text-sm text-stone-500">
                                {item.label}
                            </p>
                            <p className="mt-2 text-3xl font-semibold text-stone-950">
                                {item.value}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-stone-600">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <div className="overflow-hidden rounded-[24px] border border-stone-200 bg-white">
                        <div className="border-b border-stone-200 px-5 py-4">
                            <h3 className="text-lg font-semibold text-stone-950">
                                Transaksi Terbaru
                            </h3>
                        </div>
                        <table className="min-w-full divide-y divide-stone-200 text-sm">
                            <thead className="bg-stone-50 text-left text-stone-500">
                                <tr>
                                    <th className="px-5 py-4 font-medium">
                                        Tanggal
                                    </th>
                                    <th className="px-5 py-4 font-medium">
                                        Pegawai
                                    </th>
                                    <th className="px-5 py-4 font-medium">
                                        Kendaraan
                                    </th>
                                    <th className="px-5 py-4 font-medium">
                                        Liter
                                    </th>
                                    <th className="px-5 py-4 font-medium">
                                        Total
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {latestTransactions.length ? (
                                    latestTransactions.map((item) => (
                                        <tr
                                            key={`${item.tanggal}-${item.nomor_polisi}`}
                                        >
                                            <td className="px-5 py-4 text-stone-600">
                                                {item.tanggal}
                                            </td>
                                            <td className="px-5 py-4 font-medium text-stone-950">
                                                {item.pegawai}
                                            </td>
                                            <td className="px-5 py-4 text-stone-600">
                                                {item.kendaraan}
                                            </td>
                                            <td className="px-5 py-4 text-stone-600">
                                                {item.liter}
                                            </td>
                                            <td className="px-5 py-4 font-medium text-stone-950">
                                                {item.total}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="px-5 py-8 text-center text-stone-500"
                                        >
                                            Belum ada transaksi BBM terbaru.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="rounded-[24px] border border-stone-200 bg-stone-900 p-6 text-stone-100">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-400">
                            Fokus Tahap Awal
                        </p>
                        <ul className="mt-4 space-y-3 text-sm leading-6 text-stone-200">
                            <li>Rapikan master pegawai dan kendaraan.</li>
                            <li>
                                Pastikan kelompok akun pembayaran per tahun
                                tersedia.
                            </li>
                            <li>
                                Lanjutkan implementasi simpan transaksi BBM ke
                                database.
                            </li>
                            <li>
                                Siapkan placeholder print untuk kebutuhan SPJ.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
