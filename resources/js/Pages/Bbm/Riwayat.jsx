import Pagination from '@/Components/Pagination';
import CsvImportCard from '@/Components/CsvImportCard';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Riwayat({ transactions }) {
    const [isDeletingId, setIsDeletingId] = useState(null);
    const [actionError, setActionError] = useState('');
    const [showImport, setShowImport] = useState(false);

    const items = transactions.data || transactions;
    const currentPage = transactions.current_page || 1;
    const lastPage = transactions.last_page || 1;
    const total = transactions.total || 0;
    const from = transactions.from || 0;
    const to = transactions.to || 0;

    const handleDelete = (item) => {
        if (
            !window.confirm(
                `Hapus transaksi BBM tanggal ${item.tanggal} untuk ${item.nomor_polisi}?`,
            )
        ) {
            return;
        }

        setIsDeletingId(item.id);
        setActionError('');

        router.delete(item.delete_url, {
            preserveScroll: true,
            onFinish: () => setIsDeletingId(null),
            onError: () => {
                setActionError('Transaksi BBM gagal dihapus.');
            },
        });
    };

    return (
        <AppLayout
            title="Riwayat BBM"
            description="Daftar transaksi BBM yang siap diedit, dihapus, atau langsung dicetak ke PDF tanpa langkah preview tambahan."
            actions={
                <>
                    <button
                        type="button"
                        onClick={() => setShowImport((value) => !value)}
                        className="rounded-2xl border border-stone-300 px-4 py-3 text-sm font-medium text-stone-700"
                    >
                        {showImport ? 'Tutup Import' : 'Import Riwayat'}
                    </button>
                    <Link
                        href={route('bbm.pencatatan')}
                        className="rounded-2xl bg-stone-900 px-4 py-3 text-sm font-medium text-white"
                    >
                        Catat BBM Baru
                    </Link>
                </>
            }
        >
            <Head title="Riwayat BBM" />

            <div className="space-y-6">
                {showImport ? (
                    <CsvImportCard
                        title="Import Riwayat Pencatatan BBM"
                        description="Import transaksi lama dari Google Sheets atau file CSV arsip. Sistem akan mencocokkan pegawai dan kendaraan dari data master yang sudah ada."
                        action={route('bbm.riwayat.import')}
                        templateUrl={route('bbm.riwayat.template')}
                        columns={[
                            'tanggal',
                            'pegawai_nip',
                            'pegawai_nama',
                            'nomor_polisi',
                            'kode_kendaraan',
                            'odometer',
                            'jenis_bbm',
                            'liter',
                            'harga_per_liter',
                            'spbu',
                            'nomor_nota',
                            'catatan',
                            'kode_akun',
                        ]}
                    />
                ) : null}

                {actionError ? (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                        {actionError}
                    </div>
                ) : null}

                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-[24px] border border-stone-200 bg-stone-50 p-5">
                        <p className="text-sm text-stone-500">Total transaksi</p>
                        <p className="mt-2 text-2xl font-semibold text-stone-950">
                            {total}
                        </p>
                    </div>
                    <div className="rounded-[24px] border border-stone-200 bg-stone-50 p-5">
                        <p className="text-sm text-stone-500">Halaman aktif</p>
                        <p className="mt-2 text-2xl font-semibold text-stone-950">
                            {currentPage} / {lastPage}
                        </p>
                    </div>
                    <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-5">
                        <p className="text-sm text-amber-800">Cara paling cepat</p>
                        <p className="mt-2 text-sm leading-6 text-amber-950">
                            Ketuk <strong>Cetak PDF</strong> untuk membuka SPJ
                            siap print di tab baru.
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 lg:hidden">
                    {items.length ? (
                        items.map((item) => (
                            <article
                                key={item.id}
                                className="rounded-[24px] border border-stone-200 bg-white p-5"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
                                            {item.tanggal}
                                        </p>
                                        <h3 className="mt-2 text-lg font-semibold text-stone-950">
                                            {item.nomor_polisi}
                                        </h3>
                                        <p className="mt-1 text-sm text-stone-600">
                                            {item.kendaraan}
                                        </p>
                                    </div>
                                    <div className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900">
                                        {item.jenis_bbm}
                                    </div>
                                </div>

                                <dl className="mt-4 grid gap-3 text-sm text-stone-600 sm:grid-cols-2">
                                    <div>
                                        <dt className="text-stone-400">Pegawai</dt>
                                        <dd className="mt-1 font-medium text-stone-950">
                                            {item.pegawai}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-stone-400">Liter</dt>
                                        <dd className="mt-1 font-medium text-stone-950">
                                            {item.liter}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-stone-400">Total</dt>
                                        <dd className="mt-1 font-medium text-stone-950">
                                            {item.total}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-stone-400">Nota</dt>
                                        <dd className="mt-1 font-medium text-stone-950">
                                            {item.nomor_nota || '-'}
                                        </dd>
                                    </div>
                                </dl>

                                <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                                    <a
                                        href={item.spj_pdf_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="rounded-2xl bg-stone-900 px-4 py-3 text-center text-sm font-medium text-white"
                                    >
                                        Cetak PDF
                                    </a>
                                    <Link
                                        href={item.edit_url}
                                        className="rounded-2xl border border-stone-300 px-4 py-3 text-center text-sm font-medium text-stone-700"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(item)}
                                        disabled={isDeletingId === item.id}
                                        className="rounded-2xl border border-rose-300 px-4 py-3 text-sm font-medium text-rose-700 disabled:opacity-60"
                                    >
                                        {isDeletingId === item.id ? 'Menghapus...' : 'Hapus'}
                                    </button>
                                </div>
                            </article>
                        ))
                    ) : (
                        <div className="rounded-[24px] border border-dashed border-stone-300 bg-stone-50 p-8 text-center text-sm text-stone-500">
                            Belum ada transaksi BBM yang tercatat.
                        </div>
                    )}
                </div>

                <div className="hidden overflow-hidden rounded-[24px] border border-stone-200 bg-white lg:block">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[820px] divide-y divide-stone-200 text-sm">
                            <thead className="bg-stone-50 text-left text-stone-500">
                                <tr>
                                    <th className="px-5 py-4 font-medium">Tanggal</th>
                                    <th className="px-5 py-4 font-medium">Pegawai</th>
                                    <th className="px-5 py-4 font-medium">Kendaraan</th>
                                    <th className="px-5 py-4 font-medium">Nomor Polisi</th>
                                    <th className="px-5 py-4 font-medium">Jenis BBM</th>
                                    <th className="px-5 py-4 font-medium">Liter</th>
                                    <th className="px-5 py-4 font-medium">Total</th>
                                    <th className="px-5 py-4 font-medium">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {items.length ? (
                                    items.map((item) => (
                                        <tr key={item.id}>
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
                                                {item.nomor_polisi}
                                            </td>
                                            <td className="px-5 py-4 text-stone-600">
                                                {item.jenis_bbm}
                                            </td>
                                            <td className="px-5 py-4 text-stone-600">
                                                {item.liter}
                                            </td>
                                            <td className="px-5 py-4 font-medium text-stone-950">
                                                {item.total}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex flex-wrap gap-2">
                                                    <a
                                                        href={item.spj_pdf_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="rounded-xl bg-stone-900 px-3 py-2 text-xs font-medium text-white"
                                                    >
                                                        Cetak PDF
                                                    </a>
                                                    <Link
                                                        href={item.edit_url}
                                                        className="rounded-xl border border-stone-300 px-3 py-2 text-xs font-medium text-stone-700"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(item)}
                                                        disabled={isDeletingId === item.id}
                                                        className="rounded-xl border border-rose-300 px-3 py-2 text-xs font-medium text-rose-700 disabled:opacity-60"
                                                    >
                                                        {isDeletingId === item.id ? 'Menghapus...' : 'Hapus'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="8"
                                            className="px-5 py-8 text-center text-stone-500"
                                        >
                                            Belum ada transaksi BBM yang tercatat.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {items.length ? (
                    <div className="rounded-[24px] border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600">
                        Menampilkan {from}&ndash;{to} dari {total} transaksi.
                    </div>
                ) : null}

                <Pagination data={transactions} routeName="bbm.riwayat" />
            </div>
        </AppLayout>
    );
}
