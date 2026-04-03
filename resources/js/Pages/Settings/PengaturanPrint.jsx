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
        google_drive_folder_url: template.google_drive_folder_url || '',
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
                    'Gagal menguji koneksi Google Docs.',
            );
        } finally {
            setIsTestingConnection(false);
        }
    };

    return (
        <AppLayout
            title="Pengaturan Print"
            description="Tempat menyimpan template SPJ dan daftar placeholder yang akan diisi otomatis dari transaksi BBM."
            actions={
                <button
                    type="submit"
                    form="print-setting-form"
                    disabled={form.processing}
                    className="rounded-2xl bg-stone-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
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
                    className="rounded-[28px] border border-stone-200 bg-stone-50 p-6"
                >
                    <div className="grid gap-5">
                        <label className="block">
                            <span className="mb-2 block text-sm font-medium text-stone-700">
                                Nama Template
                            </span>
                            <input
                                className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm"
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

                        <label className="block">
                            <span className="mb-2 block text-sm font-medium text-stone-700">
                                URL Google Docs
                            </span>
                            <input
                                className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm"
                                value={form.data.google_docs_url}
                                placeholder="https://docs.google.com/..."
                                onChange={(event) =>
                                    form.setData(
                                        'google_docs_url',
                                        event.target.value,
                                    )
                                }
                            />
                            <InputError
                                className="mt-2"
                                message={form.errors.google_docs_url}
                            />
                        </label>

                        <label className="block">
                            <span className="mb-2 block text-sm font-medium text-stone-700">
                                URL Folder Output Google Drive
                            </span>
                            <input
                                className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm"
                                value={form.data.google_drive_folder_url}
                                placeholder="https://drive.google.com/drive/folders/..."
                                onChange={(event) =>
                                    form.setData(
                                        'google_drive_folder_url',
                                        event.target.value,
                                    )
                                }
                            />
                            <InputError
                                className="mt-2"
                                message={form.errors.google_drive_folder_url}
                            />
                        </label>

                        <label className="block">
                            <span className="mb-2 block text-sm font-medium text-stone-700">
                                Isi Template Manual
                            </span>
                            <textarea
                                rows="8"
                                className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm"
                                placeholder="Opsional. Isi template manual atau potongan format SPJ di sini."
                                value={form.data.template_content}
                                onChange={(event) =>
                                    form.setData(
                                        'template_content',
                                        event.target.value,
                                    )
                                }
                            />
                            <InputError
                                className="mt-2"
                                message={form.errors.template_content}
                            />
                        </label>

                        <label className="block">
                            <span className="mb-2 block text-sm font-medium text-stone-700">
                                Catatan Template
                            </span>
                            <textarea
                                rows="6"
                                className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm"
                                placeholder="Catatan penggunaan template atau instruksi internal."
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
                </form>

                <div className="rounded-[28px] border border-stone-200 bg-white p-6">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-400">
                        Placeholder Tersedia
                    </p>
                    <div className="mt-4">
                        <button
                            type="button"
                            onClick={testGoogleDocsConnection}
                            disabled={isTestingConnection}
                            className="rounded-2xl border border-stone-300 px-4 py-3 text-sm font-medium text-stone-700 disabled:opacity-60"
                        >
                            {isTestingConnection
                                ? 'Menguji Koneksi...'
                                : 'Tes Koneksi Google Docs'}
                        </button>
                    </div>
                    <div className="mt-4 rounded-2xl bg-stone-50 p-4 text-sm leading-7 text-stone-700">
                        <div>
                            `GOOGLE_SERVICE_ACCOUNT_JSON_PATH`:{' '}
                            {googleDocsSetup.service_account_configured
                                ? 'sudah diatur'
                                : 'belum diatur'}
                        </div>
                        <div>
                            `GOOGLE_IMPERSONATED_USER`:{' '}
                            {googleDocsSetup.impersonated_user ||
                                'opsional / belum diatur'}
                        </div>
                        <div className="mt-2">
                            Template Google Docs dan folder output perlu
                            dibagikan ke service account, atau gunakan
                            impersonasi Google Workspace agar dokumen hasil
                            generate langsung muncul di akun pengguna target.
                        </div>
                    </div>
                    {connectionError ? (
                        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm leading-7 text-rose-800">
                            {connectionError}
                        </div>
                    ) : null}
                    {connectionResult ? (
                        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-7 text-emerald-900">
                            <div>{connectionResult.message}</div>
                            <div className="mt-2">
                                Template: {connectionResult.template?.title}
                            </div>
                            <div>
                                Owner: {connectionResult.template?.owner || '-'}
                            </div>
                            <div>
                                Folder Output:{' '}
                                {connectionResult.folder?.name ||
                                    'tidak diatur'}
                            </div>
                        </div>
                    ) : null}
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
            </div>
        </AppLayout>
    );
}
