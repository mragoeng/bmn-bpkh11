import AppLayout from '@/Layouts/AppLayout';
import { useForm, usePage } from '@inertiajs/react';
import { useState, useRef } from 'react';

export default function PengaturanLogo({ logo, appName }) {
    const { flash } = usePage().props;
    const [preview, setPreview] = useState(logo);
    const fileInputRef = useRef(null);

    const { data, setData, post, processing, errors } = useForm({
        logo: null,
        remove_logo: false,
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('logo', file);
            setData('remove_logo', false);
            const reader = new FileReader();
            reader.onload = (e) => setPreview(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleRemove = () => {
        setData('logo', null);
        setData('remove_logo', true);
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('settings.pengaturan-logo.update'));
    };

    return (
        <AppLayout title="Pengaturan Logo" description="Upload logo aplikasi">
            <div className="py-6 px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pengaturan Logo</h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Upload logo aplikasi yang akan tampil di sidebar dan favicon browser.
                    </p>
                </div>

                {flash?.success && (
                    <div className="mb-4 rounded-lg bg-green-50 dark:bg-green-900/30 p-4">
                        <p className="text-sm text-green-700 dark:text-green-300">{flash.success}</p>
                    </div>
                )}

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Logo Saat Ini
                            </label>
                            <div className="flex items-center gap-6">
                                {preview ? (
                                    <div className="relative">
                                        <img src={preview} alt="Logo preview" className="h-16 w-16 object-contain rounded-lg border border-gray-200 dark:border-gray-600" />
                                    </div>
                                ) : (
                                    <div className="h-16 w-16 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                        <span className="text-xs text-gray-400">No logo</span>
                                    </div>
                                )}
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                        Format: PNG, JPG, GIF. Max 2MB. Maksimal 500x500 pixel.
                                    </p>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-white file:font-medium file:text-sm hover:file:bg-primary/80"
                                    />
                                </div>
                            </div>
                            {errors.logo && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.logo}</p>}
                        </div>

                        <div className="flex items-center gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={processing || (!data.logo && !data.remove_logo)}
                                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                {processing ? 'Menyimpan...' : 'Simpan Logo'}
                            </button>
                            {preview && (
                                <button type="button" onClick={handleRemove} className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg font-medium text-sm hover:bg-red-700 transition">
                                    Hapus Logo
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                <div className="mt-8">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Sidebar Logo</h3>
                            <div className="bg-primary rounded-lg p-4 h-32 flex flex-col items-start">
                                {preview ? (
                                    <img src={preview} alt="Logo in sidebar" className="h-10 w-10 object-contain rounded" />
                                ) : (
                                    <div className="h-10 w-10 rounded bg-white/20 flex items-center justify-center">
                                        <span className="text-xs text-white/50">No logo</span>
                                    </div>
                                )}
                                <p className="text-xs font-semibold uppercase tracking-widest text-accent mt-3">BMN-BPKH11</p>
                                <p className="text-sm text-white/70 mt-1">Arsip Pencatatan BBM</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Favicon (Tab Browser)</h3>
                            <div className="flex items-center gap-4">
                                <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-3 flex items-center gap-3">
                                    {preview ? (
                                        <img src={preview} alt="Favicon preview" className="h-5 w-5 object-contain rounded" />
                                    ) : (
                                        <div className="h-5 w-5 rounded bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                            <span className="text-xs text-gray-500">-</span>
                                        </div>
                                    )}
                                    <span className="text-sm text-gray-600 dark:text-gray-300">BMN-BPKH11 - Dashboard</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
