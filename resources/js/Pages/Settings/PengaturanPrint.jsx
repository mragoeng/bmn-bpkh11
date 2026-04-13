import AppLayout from '@/Layouts/AppLayout';
import axios from 'axios';
import InputError from '@/Components/InputError';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function PengaturanPrint({ template, googleDocsSetup }) {
    const [isTestingConnection, setIsTestingConnection] = useState(false);
    const [connectionError, setConnectionError] = useState('');
    const [connectionResult, setConnectionResult] = useState(null);
    const form = useForm({
        nama_template: template.nama_template || '',
        google_docs_url: template.google_docs_url || '',
        template_content: template.template_content || '',
        keterangan: template.keterangan || '',
    });

    const submit = (event) => {
        event.preventDefault();

        form.post(route('settings.pengaturan-print.update'), {
            preserveScroll: true,
        });
    };

    const testGoogleDocsConnection = async () => {
        setIsTestingConnection(true);
        setConnectionError('');
        setConnectionResult(null);

        try {
            const response = await axios.post(
                route('settings.pengaturan-print.test-google-docs'),
            );

            setConnectionResult(response.data);
        } catch (error) {
            setConnectionError(
                error.response?.data?.message ||
                    error.message ||
                    'Gagal mengecek akses Google Docs.',
            );
        } finally {
            setIsTestingConnection(false);
        }
    };

    return (
        <AppLayout
            title="Pengaturan Print"
            description="Atur sumber template SPJ yang akan langsung diubah menjadi PDF. Fokusnya dibuat sederhana supaya pengguna cukup isi template lalu cetak."
            actions={
                <button
                    type="submit"
                    form="print-setting-form"
                    disabled={form.processing}
                    className="rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
                >
                    {form.processing ? 'Menyimpan...' : 'Simpan Pengaturan'}
                </button>
            }
        >
            <Head title="Pengaturan Print" />

            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <form
                    id="print-setting-form"
                    onSubmit={submit}
                    className="space-y-6"
                >
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 p-6">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
                            Template SPJ
                        </p>

                        <div className="mt-5 grid gap-5">
                            <label className="block">
                                <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                                    Nama Template
                                </span>
                                <input
                                    className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm"
                                    value={form.data.nama_template}
                                    onChange={(event) =>
                                        form.setData(
                                            'nama_template',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError
                                    className="mt-2"
                                    message={form.errors.nama_template}
                                />
                            </label>

                            <div className="rounded-2xl border border-accent-200 bg-accent-light p-4 text-sm leading-6 text-amber-950">
                                Jika URL Google Docs diisi, sistem akan membaca
                                dokumen itu langsung dan mencetak PDF dari
                                desain yang sama. Tidak ada lagi pembuatan
                                file Google Docs baru untuk setiap transaksi.
                            </div>

                            <label className="block">
                                <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                                    URL Google Docs
                                </span>
                                <input
                                    className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm"
                                    value={form.data.google_docs_url}
                                    placeholder="https://docs.google.com/document/d/..."
                                    onChange={(event) =>
                                        form.setData(
                                            'google_docs_url',
                                            event.target.value,
                                        )
                                    }
                                />
                                <p className="mt-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
                                    Opsional. Cocok jika template SPJ masih
                                    disimpan di Google Docs.
                                </p>
                                <InputError
                                    className="mt-2"
                                    message={form.errors.google_docs_url}
                                />
                            </label>

                            {form.data.google_docs_url ? (
                                <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 text-sm leading-6 text-gray-700 dark:text-gray-200">
                                    Desain cetak mengikuti Google Docs di atas.
                                    Tidak ada template kedua yang perlu Anda
                                    isi. Sistem hanya menyimpan salinan sinkron
                                    otomatis di belakang layar agar cetak tetap
                                    stabil saat koneksi Google bermasalah.
                                </div>
                            ) : (
                                <label className="block">
                                    <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                                        Template Manual
                                    </span>
                                    <textarea
                                        rows="12"
                                        className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm leading-6"
                                        placeholder="Isi template SPJ jika tidak menggunakan Google Docs."
                                        value={form.data.template_content}
                                        onChange={(event) =>
                                            form.setData(
                                                'template_content',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <p className="mt-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
                                        Dipakai hanya jika Anda tidak memakai
                                        Google Docs sebagai template utama.
                                    </p>
                                    <InputError
                                        className="mt-2"
                                        message={form.errors.template_content}
                                    />
                                </label>
                            )}

                            <label className="block">
                                <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                                    Catatan
                                </span>
                                <textarea
                                    rows="5"
                                    className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm"
                                    placeholder="Catatan singkat untuk admin."
                                    value={form.data.keterangan}
                                    onChange={(event) =>
                                        form.setData(
                                            'keterangan',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError
                                    className="mt-2"
                                    message={form.errors.keterangan}
                                />
                            </label>
                        </div>
                    </div>
                </form>

                <div className="space-y-6">
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 dark:text-gray-500">
                            Akses Google
                        </p>

                        <div className="mt-4 rounded-2xl bg-gray-50 dark:bg-gray-700 p-4 text-sm leading-7 text-gray-700 dark:text-gray-200">
                            <div>
                                Mode aktif:{' '}
                                <span className="font-semibold text-gray-900 dark:text-gray-100">
                                    {googleDocsSetup.auth_mode.label}
                                </span>
                            </div>
                            <div>{googleDocsSetup.auth_mode.description}</div>
                            <div className="mt-2">
                                `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
                                `GOOGLE_REFRESH_TOKEN`:{' '}
                                {googleDocsSetup.oauth_configured
                                    ? 'sudah diatur'
                                    : 'belum diatur'}
                            </div>
                            <div>
                                Sinkron terakhir:{' '}
                                {template.google_last_synced_at || 'belum pernah'}
                            </div>
                        </div>

                        <div className="mt-4 rounded-2xl border border-accent-200 bg-accent-light p-4 text-sm leading-6 text-amber-950">
                            Cara paling simpel: buat refresh token lewat Google
                            OAuth Playground, lalu simpan nilainya di `.env`.
                            Setelah itu sistem bisa baca template Google Docs
                            langsung tanpa share folder output.
                        </div>

                        <div className="mt-4">
                            <button
                                type="button"
                                onClick={testGoogleDocsConnection}
                                disabled={isTestingConnection}
                                className="rounded-2xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 disabled:opacity-60"
                            >
                                {isTestingConnection
                                    ? 'Mengecek Template...'
                                    : 'Tes Akses Google Docs'}
                            </button>
                        </div>

                        {connectionError ? (
                            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm leading-7 text-rose-800">
                                {connectionError}
                            </div>
                        ) : null}

                        {template.google_last_error ? (
                            <div className="mt-4 rounded-2xl border border-accent-200 bg-accent-light p-4 text-sm leading-7 text-amber-950">
                                Error sinkron terakhir: {template.google_last_error}
                            </div>
                        ) : null}

                        {connectionResult ? (
                            <div className="mt-4 rounded-2xl border border-primary-pale dark:border-primary-dark bg-primary-pale/30 dark:bg-primary-dark/30 p-4 text-sm leading-7 text-primary-dark dark:text-green-300">
                                <div>{connectionResult.message}</div>
                                <div className="mt-2">
                                    Template: {connectionResult.template?.title}
                                </div>
                                <div>
                                    Owner: {connectionResult.template?.owner || '-'}
                                </div>
                                <div>
                                    Pratinjau teks:{' '}
                                    {connectionResult.template_preview || 'Template kosong'}
                                </div>
                                <div>
                                    Salinan sinkron internal:{' '}
                                    {connectionResult.cache_updated
                                        ? 'berhasil diperbarui'
                                        : 'tidak berubah'}
                                </div>
                            </div>
                        ) : null}
                    </div>

                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 dark:text-gray-500">
                            Placeholder Tersedia
                        </p>
                        <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
                            Gunakan placeholder ini di Google Docs atau template
                            manual agar nilainya terisi otomatis.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-3">
                            {template.placeholders.map((item) => (
                                <span
                                    key={item}
                                    className="rounded-full bg-amber-100 px-4 py-2 text-sm text-amber-950"
                                >
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-primary p-6 text-stone-100">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
                            Alur Baru
                        </p>
                        <div className="mt-4 space-y-3 text-sm leading-6">
                            <p>1. User pilih transaksi di riwayat.</p>
                            <p>2. User ketuk tombol cetak PDF.</p>
                            <p>
                                3. Sistem baca template Google Docs lalu
                                langsung membuka PDF dengan isi placeholder yang
                                sudah terisi.
                            </p>
                            <p>
                                4. Sistem menyimpan salinan sinkron internal
                                otomatis supaya proses cetak tetap jalan saat
                                akses Google sedang bermasalah.
                            </p>
                            <p>
                                5. Tidak ada file Google Docs baru yang dibuat
                                untuk setiap transaksi.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
