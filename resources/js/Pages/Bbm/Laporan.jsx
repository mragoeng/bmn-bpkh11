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
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                    <p className="text-sm text-gray-500">Periode</p>
                    <p className="mt-2 text-lg font-semibold text-gray-900">
                        {summary.periode}
                    </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                    <p className="text-sm text-gray-500">Total Transaksi</p>
                    <p className="mt-2 text-3xl font-semibold text-gray-900">
                        {summary.total_transaksi}
                    </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                    <p className="text-sm text-gray-500">Total Liter</p>
                    <p className="mt-2 text-3xl font-semibold text-gray-900">
                        {summary.total_liter}
                    </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                    <p className="text-sm text-gray-500">Total Nominal</p>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">
                        {summary.total_nominal}
                    </p>
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-stone-200 text-sm">
                    <thead className="bg-gray-50 text-left text-gray-500">
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
                                    <td className="px-5 py-4 font-medium text-gray-900">
                                        {item.kategori}
                                    </td>
                                    <td className="px-5 py-4 text-gray-600">
                                        {item.liter}
                                    </td>
                                    <td className="px-5 py-4 text-gray-600">
                                        {item.nominal}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="3"
                                    className="px-5 py-8 text-center text-gray-500"
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
