import AppLayout from '@/Layouts/AppLayout';
import CsvImportCard from '@/Components/CsvImportCard';
import InputError from '@/Components/InputError';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Pegawai({ pegawai }) {
    const [editingId, setEditingId] = useState(null);
    const [keyword, setKeyword] = useState('');
    const [showImport, setShowImport] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const form = useForm({
        nip: '', nama: '', jabatan: '', unit: '', keterangan: '',
    });

    const filteredPegawai = pegawai.filter((item) => {
        const query = keyword.toLowerCase();
        return (
            item.nama.toLowerCase().includes(query) ||
            (item.nip || '').toLowerCase().includes(query) ||
            (item.unit || '').toLowerCase().includes(query) ||
            (item.jabatan || '').toLowerCase().includes(query)
        );
    });

    const submit = (event) => {
        event.preventDefault();
        const onSuccess = () => { setEditingId(null); form.reset(); setShowForm(false); };
        if (editingId) {
            form.put(route('database.pegawai.update', editingId), { preserveScroll: true, onSuccess });
        } else {
            form.post(route('database.pegawai.store'), { preserveScroll: true, onSuccess });
        }
    };

    const editPegawai = (item) => {
        setEditingId(item.id); setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        form.setData({
            nip: item.nip || '', nama: item.nama || '',
            jabatan: item.jabatan || '', unit: item.unit || '',
            keterangan: item.keterangan || '',
        });
    };

    const cancelEdit = () => {
        setEditingId(null); form.reset(); form.clearErrors(); setShowForm(false);
    };

    const handleDelete = (item) => {
        if (confirm(`Hapus pegawai "${item.nama}"?`)) {
            router.delete(route('database.pegawai.destroy', item.id), { preserveScroll: true });
        }
    };

    return (
        <AppLayout
            title="Database Pegawai"
            description="Master data pegawai untuk pencatatan transaksi BBM dan SPJ."
            actions={
                <>
                    <button type="button" onClick={() => setShowImport((v) => !v)}
                        className="rounded-2xl border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200">
                        {showImport ? 'Tutup Import' : 'Import'}
                    </button>
                    <button type="button" onClick={() => { setShowForm((v) => !v); if (showForm) cancelEdit(); }}
                        className="rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-white">
                        {showForm ? 'Tutup Form' : (editingId ? 'Edit' : '+ Pegawai')}
                    </button>
                </>
            }
        >
            <Head title="Pegawai" />

            <div className="space-y-6">
                {showImport && (
                    <CsvImportCard
                        title="Import Data Pegawai"
                        description="Gunakan file CSV. Jika NIP sudah ada, data diperbarui."
                        action={route('database.pegawai.import')}
                        templateUrl={route('database.pegawai.template')}
                        columns={['nip', 'nama', 'jabatan', 'unit', 'keterangan']}
                    />
                )}

                {showForm && (
                    <form onSubmit={submit} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {editingId ? 'Edit Pegawai' : 'Tambah Pegawai'}
                            </p>
                            <button type="button" onClick={cancelEdit}
                                className="rounded-full p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">✕</button>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                            <input className="w-full rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-3 py-2.5 text-sm"
                                placeholder="NIP" value={form.data.nip} onChange={(e) => form.setData('nip', e.target.value)} />
                            <input className="w-full rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-3 py-2.5 text-sm"
                                placeholder="Nama pegawai" value={form.data.nama} onChange={(e) => form.setData('nama', e.target.value)} />
                            <input className="w-full rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-3 py-2.5 text-sm"
                                placeholder="Jabatan" value={form.data.jabatan} onChange={(e) => form.setData('jabatan', e.target.value)} />
                            <input className="w-full rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-3 py-2.5 text-sm"
                                placeholder="Unit" value={form.data.unit} onChange={(e) => form.setData('unit', e.target.value)} />
                            <div className="md:col-span-2">
                                <textarea rows="2" className="w-full rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-3 py-2.5 text-sm"
                                    placeholder="Keterangan" value={form.data.keterangan} onChange={(e) => form.setData('keterangan', e.target.value)} />
                            </div>
                        </div>
                        <button type="submit" disabled={form.processing}
                            className="mt-4 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60">
                            {form.processing ? 'Menyimpan...' : editingId ? 'Update' : 'Simpan'}
                        </button>
                    </form>
                )}

                {/* Search + count */}
                <div className="flex items-center gap-2">
                    <span className="shrink-0 rounded-full bg-primary-pale/50 px-2 py-1 text-[10px] font-semibold text-primary-dark">
                        {pegawai.length}
                    </span>
                    <input className="w-full rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-3 py-2 text-sm"
                        placeholder="Cari nama, NIP, jabatan..." value={keyword} onChange={(e) => setKeyword(e.target.value)} />
                </div>

                {/* Card Grid - responsive for all screen sizes */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredPegawai.length ? filteredPegawai.map((item) => (
                        <div key={item.id}
                            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between gap-2 min-w-0">
                                <div className="min-w-0 flex-1 overflow-hidden">
                                    <p className="font-bold text-gray-900 dark:text-gray-100 truncate">{item.nama}</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{item.nip || 'Non-PNS'}</p>
                                </div>
                                {item.jabatan && (
                                    <span className="shrink-0 rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-medium text-violet-700 truncate max-w-[90px]">
                                        {item.jabatan}
                                    </span>
                                )}
                            </div>
                            {item.unit && (
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">{item.unit}</p>
                            )}
                            {item.keterangan && (
                                <p className="mt-1 text-xs text-gray-400 truncate">{item.keterangan}</p>
                            )}
                            <div className="mt-3 flex gap-2">
                                <button type="button" onClick={() => editPegawai(item)}
                                    className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200">Edit</button>
                                <button type="button" onClick={() => handleDelete(item)}
                                    className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600">Hapus</button>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-8 text-center text-sm text-gray-500">Belum ada data.</div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
