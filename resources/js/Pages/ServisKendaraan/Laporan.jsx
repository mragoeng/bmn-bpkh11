import AppLayout from '@/Layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

export default function LaporanServis({ perKendaraan, perJenis, totalBiaya, bulan, tahun }) {
    const [b, setB] = useState(bulan);
    const [t, setT] = useState(tahun);
    const apply = () => router.get(route('bbm.servis-kendaraan.laporan'), { bulan: b, tahun: t }, { preserveState: true });
    const maxBiaya = Math.max(...perKendaraan.map(p => parseFloat(p.total_biaya.replace(/[^0-9]/g, '') || 0)), 1);
    const bulanNama = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    return (
        <AppLayout title="Laporan Servis" description="Laporan servis dan maintenance kendaraan">
            <Head title="Laporan Servis Kendaraan" />
            <div className="flex flex-wrap gap-3 items-center mb-6">
                <select value={b} onChange={e => setB(e.target.value)} className="rounded-xl border px-4 py-2 text-sm dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600">
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => <option key={m} value={m}>{bulanNama[m]}</option>)}
                </select>
                <input type="number" value={t} onChange={e => setT(e.target.value)} className="rounded-xl border px-4 py-2 text-sm w-24 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600" />
                <button onClick={apply} className="rounded-xl bg-primary px-4 py-2 text-sm text-white">Filter</button>
                <a href={route('bbm.servis-kendaraan.laporan.pdf', { bulan: b, tahun: t })} target="_blank" className="rounded-xl border px-4 py-2 text-sm text-gray-700 dark:text-gray-300">📥 Download PDF</a>
            </div>
            <div className="mb-6 p-5 rounded-xl bg-blue-50 border border-blue-200">
                <p className="text-sm text-blue-600">Total Biaya Servis — {bulanNama[b]} {t}</p>
                <p className="mt-2 text-3xl font-bold text-blue-700">{totalBiaya}</p>
            </div>
            <div className="grid gap-4 lg:grid-cols-2 mb-6">
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Biaya per Kendaraan</p>
                    {perKendaraan.length ? perKendaraan.map((p, i) => {
                        const val = parseFloat(p.total_biaya.replace(/[^0-9]/g, '') || 0);
                        return (<div key={i} className="mb-3">
                            <div className="flex justify-between text-xs mb-1"><span className="truncate max-w-[70%]">{p.kendaraan} ({p.jumlah}x)</span><span className="font-medium">{p.total_biaya}</span></div>
                            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2"><div className="bg-blue-500 rounded-full h-2" style={{ width: `${(val / maxBiaya) * 100}%` }} /></div>
                        </div>);
                    }) : <p className="text-sm text-gray-400">Tidak ada data</p>}
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Breakdown per Jenis</p>
                    <table className="w-full text-sm">
                        <thead><tr className="text-left text-gray-500"><th className="pb-2">Jenis</th><th className="pb-2">Jumlah</th><th className="pb-2">Total</th></tr></thead>
                        <tbody>{perJenis.map((p, i) => <tr key={i} className="border-t dark:border-gray-700"><td className="py-2">{p.jenis}</td><td className="py-2">{p.jumlah}x</td><td className="py-2 font-medium">{p.total_biaya}</td></tr>)}</tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
