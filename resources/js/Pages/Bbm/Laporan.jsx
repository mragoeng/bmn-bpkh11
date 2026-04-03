import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';

export default function Laporan({ summary, rekap }) {
    return (
        <AppLayout
            title="Laporan BBM"
            description="Ringkasan transaksi BBM per periode yang bisa dikembangkan menjadi rekap bulanan, export, dan cetak."
        >
            <Head title="Laporan BBM" />

            <div className="mb-6 grid gap-4 lg:grid-cols-4">
                <div className="rounded-[24px] border border-stone-200 bg-stone-50 p-5">
                    <p className="text-sm text-stone-500">Periode</p>
                    <p className="mt-2 text-lg font-semibold text-stone-950">
                        {summary.periode}
                    </p>
                </div>
                <div className="rounded-[24px] border border-stone-200 bg-stone-50 p-5">
                    <p className="text-sm text-stone-500">Total Transaksi</p>
                    <p className="mt-2 text-3xl font-semibold text-stone-950">
                        {summary.total_transaksi}
                    </p>
                </div>
                <div className="rounded-[24px] border border-stone-200 bg-stone-50 p-5">
                    <p className="text-sm text-stone-500">Total Liter</p>
                    <p className="mt-2 text-3xl font-semibold text-stone-950">
                        {summary.total_liter}
                    </p>
                </div>
                <div className="rounded-[24px] border border-stone-200 bg-stone-50 p-5">
                    <p className="text-sm text-stone-500">Total Nominal</p>
                    <p className="mt-2 text-2xl font-semibold text-stone-950">
                        {summary.total_nominal}
                    </p>
                </div>
            </div>

            <div className="overflow-hidden rounded-[24px] border border-stone-200 bg-white">
                <table className="min-w-full divide-y divide-stone-200 text-sm">
                    <thead className="bg-stone-50 text-left text-stone-500">
                        <tr>
                            <th className="px-5 py-4 font-medium">Kategori</th>
                            <th className="px-5 py-4 font-medium">Total Liter</th>
                            <th className="px-5 py-4 font-medium">
                                Total Nominal
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {rekap.length ? (
                            rekap.map((item) => (
                                <tr key={item.kategori}>
                                    <td className="px-5 py-4 font-medium text-stone-950">
                                        {item.kategori}
                                    </td>
                                    <td className="px-5 py-4 text-stone-600">
                                        {item.liter}
                                    </td>
                                    <td className="px-5 py-4 text-stone-600">
                                        {item.nominal}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="3"
                                    className="px-5 py-8 text-center text-stone-500"
                                >
                                    Belum ada data transaksi untuk direkap.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AppLayout>
    );
}
