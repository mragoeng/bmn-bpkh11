import AppLayout from '@/Layouts/AppLayout';
import axios from 'axios';
import CsvImportCard from '@/Components/CsvImportCard';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Riwayat({ transactions }) {
    const [isGeneratingId, setIsGeneratingId] = useState(null);
    const [isDeletingId, setIsDeletingId] = useState(null);
    const [actionError, setActionError] = useState('');
    const [generatedDocument, setGeneratedDocument] = useState(null);
    const [showImport, setShowImport] = useState(false);

    const handleGenerateGoogleDoc = async (item) => {
        const popup = window.open('', '_blank');

        if (popup) {
            popup.document.write('Membuat dokumen Google Docs...');
        }

        setIsGeneratingId(item.id);
        setActionError('');
        setGeneratedDocument(null);

        try {
            const response = await axios.post(item.spj_generate_google_doc_url);
            const document = response.data?.document;

            if (!document?.url) {
                throw new Error('URL dokumen Google Docs tidak ditemukan.');
            }

            setGeneratedDocument(document);

            if (popup) {
                popup.location.href = document.url;
            } else {
                window.open(document.url, '_blank');
            }
        } catch (error) {
            if (popup) {
                popup.close();
            }

            setActionError(
                error.response?.data?.message ||
                    error.message ||
                    'Gagal membuat Google Docs.',
            );
        } finally {
            setIsGeneratingId(null);
        }
    };

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
        setGeneratedDocument(null);

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
            description="Arsip seluruh transaksi BBM yang bisa difilter per tanggal, kendaraan, pegawai, dan digunakan untuk cetak SPJ."
            actions={
                <button
                    type="button"
                    onClick={() => setShowImport((value) => !value)}
                    className="rounded-2xl border border-stone-300 px-4 py-3 text-sm font-medium text-stone-700"
                >
                    {showImport ? 'Tutup Import' : 'Import Riwayat BBM'}
                </button>
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

                {generatedDocument ? (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                        Google Docs berhasil dibuat.{' '}
                        <a
                            href={generatedDocument.url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold underline"
                        >
                            Buka dokumen
                        </a>
                    </div>
                ) : null}

                {actionError ? (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                        {actionError}
                    </div>
                ) : null}

                <div className="grid gap-4 md:grid-cols-4">
                    <input
                        className="rounded-2xl border border-stone-300 px-4 py-3 text-sm"
                        type="date"
                    />
                    <input
                        className="rounded-2xl border border-stone-300 px-4 py-3 text-sm"
                        type="date"
                    />
                    <input
                        className="rounded-2xl border border-stone-300 px-4 py-3 text-sm"
                        placeholder="Filter pegawai"
                    />
                    <input
                        className="rounded-2xl border border-stone-300 px-4 py-3 text-sm"
                        placeholder="Cari kendaraan atau nota"
                    />
                </div>

                <div className="overflow-hidden rounded-[24px] border border-stone-200 bg-white">
                    <table className="min-w-full divide-y divide-stone-200 text-sm">
                        <thead className="bg-stone-50 text-left text-stone-500">
                            <tr>
                                <th className="px-5 py-4 font-medium">Tanggal</th>
                                <th className="px-5 py-4 font-medium">Pegawai</th>
                                <th className="px-5 py-4 font-medium">Kendaraan</th>
                                <th className="px-5 py-4 font-medium">
                                    Nomor Polisi
                                </th>
                                <th className="px-5 py-4 font-medium">
                                    Jenis BBM
                                </th>
                                <th className="px-5 py-4 font-medium">Liter</th>
                                <th className="px-5 py-4 font-medium">Total</th>
                                <th className="px-5 py-4 font-medium">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {transactions.length ? (
                                transactions.map((item) => (
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
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleGenerateGoogleDoc(
                                                            item,
                                                        )
                                                    }
                                                    disabled={
                                                        isGeneratingId ===
                                                        item.id
                                                    }
                                                    className="rounded-xl border border-stone-300 px-3 py-2 text-xs text-stone-700 disabled:opacity-60"
                                                >
                                                    {isGeneratingId === item.id
                                                        ? 'Generating...'
                                                        : 'Generate Google Docs'}
                                                </button>
                                                <Link
                                                    href={item.spj_preview_url}
                                                    className="rounded-xl border border-stone-300 px-3 py-2 text-xs text-stone-700"
                                                >
                                                    Preview SPJ
                                                </Link>
                                                <Link
                                                    href={item.edit_url}
                                                    className="rounded-xl border border-stone-300 px-3 py-2 text-xs text-stone-700"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(item)
                                                    }
                                                    disabled={
                                                        isDeletingId === item.id
                                                    }
                                                    className="rounded-xl border border-rose-300 px-3 py-2 text-xs text-rose-700 disabled:opacity-60"
                                                >
                                                    {isDeletingId === item.id
                                                        ? 'Menghapus...'
                                                        : 'Hapus'}
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
        </AppLayout>
    );
}
