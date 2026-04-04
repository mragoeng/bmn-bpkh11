import AppLayout from '@/Layouts/AppLayout';
import axios from 'axios';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function SpjPreview({
    transaction,
    template,
    placeholders,
    mergedContent,
    printUrl,
}) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [generateError, setGenerateError] = useState('');

    const generateGoogleDoc = async () => {
        const popup = window.open('', '_blank');

        if (popup) {
            popup.document.write('Membuat dokumen Google Docs...');
        }

        setIsGenerating(true);
        setGenerateError('');

        try {
            const response = await axios.post(
                route('bbm.riwayat.spj-generate-google-doc', transaction.id),
            );

            const generatedUrl = response.data?.document?.url;

            if (!generatedUrl) {
                throw new Error('URL dokumen Google Docs tidak ditemukan.');
            }

            if (popup) {
                popup.location.href = generatedUrl;
            } else {
                window.open(generatedUrl, '_blank');
            }
        } catch (error) {
            if (popup) {
                popup.close();
            }

            setGenerateError(
                error.response?.data?.message ||
                    error.message ||
                    'Gagal membuat Google Docs.',
            );
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <AppLayout
            title="Preview SPJ"
            description="Data placeholder SPJ yang dihasilkan dari satu transaksi BBM dan hasil merge dengan template print aktif."
            actions={
                <>
                    {template.google_docs_url ? (
                        <a
                            href={template.google_docs_url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-2xl border border-stone-300 px-4 py-3 text-sm font-medium text-stone-700"
                        >
                            Buka Google Docs
                        </a>
                    ) : null}
                    <button
                        type="button"
                        onClick={generateGoogleDoc}
                        disabled={isGenerating}
                        className="rounded-2xl border border-stone-300 px-4 py-3 text-sm font-medium text-stone-700 disabled:opacity-60"
                    >
                        {isGenerating
                            ? 'Membuat Google Docs...'
                            : 'Generate Google Docs'}
                    </button>
                    <a
                        href={printUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-2xl border border-stone-300 px-4 py-3 text-sm font-medium text-stone-700"
                    >
                        Cetak SPJ
                    </a>
                    <a
                        href={route('bbm.riwayat.spj-pdf', transaction.id)}
                        className="rounded-2xl bg-amber-700 px-4 py-3 text-sm font-medium text-white hover:bg-amber-800"
                    >
                        Download PDF
                    </a>
                    <Link
                        href={route('bbm.riwayat')}
                        className="rounded-2xl bg-stone-900 px-4 py-3 text-sm font-medium text-white"
                    >
                        Kembali ke Riwayat
                    </Link>
                </>
            }
        >
            <Head title="Preview SPJ" />

            <div className="space-y-6">
                {generateError ? (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                        {generateError}
                    </div>
                ) : null}

                <div className="grid gap-4 lg:grid-cols-4">
                    <div className="rounded-[24px] border border-stone-200 bg-stone-50 p-5">
                        <p className="text-sm text-stone-500">Tanggal</p>
                        <p className="mt-2 text-lg font-semibold text-stone-950">
                            {transaction.tanggal}
                        </p>
                    </div>
                    <div className="rounded-[24px] border border-stone-200 bg-stone-50 p-5">
                        <p className="text-sm text-stone-500">Pegawai</p>
                        <p className="mt-2 text-lg font-semibold text-stone-950">
                            {transaction.pegawai}
                        </p>
                    </div>
                    <div className="rounded-[24px] border border-stone-200 bg-stone-50 p-5">
                        <p className="text-sm text-stone-500">Kendaraan</p>
                        <p className="mt-2 text-lg font-semibold text-stone-950">
                            {transaction.kendaraan}
                        </p>
                    </div>
                    <div className="rounded-[24px] border border-stone-200 bg-stone-50 p-5">
                        <p className="text-sm text-stone-500">Total</p>
                        <p className="mt-2 text-lg font-semibold text-stone-950">
                            {transaction.total}
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                    <div className="overflow-hidden rounded-[24px] border border-stone-200 bg-white">
                        <div className="border-b border-stone-200 px-5 py-4">
                            <h3 className="text-lg font-semibold text-stone-950">
                                Placeholder Terisi
                            </h3>
                            <p className="mt-1 text-sm text-stone-500">
                                Sumber data yang akan dipakai untuk isi template
                                SPJ.
                            </p>
                        </div>
                        <table className="min-w-full divide-y divide-stone-200 text-sm">
                            <thead className="bg-stone-50 text-left text-stone-500">
                                <tr>
                                    <th className="px-5 py-4 font-medium">
                                        Placeholder
                                    </th>
                                    <th className="px-5 py-4 font-medium">
                                        Nilai
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {placeholders.map((item) => (
                                    <tr key={item.key}>
                                        <td className="px-5 py-4 font-medium text-stone-950">
                                            {item.key}
                                        </td>
                                        <td className="px-5 py-4 text-stone-600">
                                            {item.value || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-[24px] border border-stone-200 bg-white p-6">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-400">
                                Template Aktif
                            </p>
                            <dl className="mt-4 space-y-3 text-sm">
                                <div className="flex items-start justify-between gap-4">
                                    <dt className="text-stone-500">
                                        Nama Template
                                    </dt>
                                    <dd className="text-right font-medium text-stone-950">
                                        {template.nama_template}
                                    </dd>
                                </div>
                                <div className="flex items-start justify-between gap-4">
                                    <dt className="text-stone-500">
                                        Google Docs
                                    </dt>
                                    <dd className="text-right text-stone-700">
                                        {template.google_docs_url || '-'}
                                    </dd>
                                </div>
                                <div className="flex items-start justify-between gap-4">
                                    <dt className="text-stone-500">Catatan</dt>
                                    <dd className="max-w-sm text-right text-stone-700">
                                        {template.keterangan || '-'}
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        <div className="rounded-[24px] border border-stone-200 bg-stone-900 p-6 text-stone-100">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-400">
                                Hasil Merge Template
                            </p>
                            <pre className="mt-4 overflow-x-auto whitespace-pre-wrap text-sm leading-7 text-stone-100">
                                {mergedContent}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
