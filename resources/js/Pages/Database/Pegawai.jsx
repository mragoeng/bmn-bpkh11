import AppLayout from '@/Layouts/AppLayout';
import CsvImportCard from '@/Components/CsvImportCard';
import InputError from '@/Components/InputError';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Pegawai({ pegawai }) {
    const [editingId, setEditingId] = useState(null);
    const [keyword, setKeyword] = useState('');
    const [showImport, setShowImport] = useState(false);
    const form = useForm({
        nip: '',
        nama: '',
        jabatan: '',
        unit: '',
        keterangan: '',
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

        if (editingId) {
            form.put(route('database.pegawai.update', editingId), {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingId(null);
                    form.reset();
                },
            });

            return;
        }

        form.post(route('database.pegawai.store'), {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    const editPegawai = (item) => {
        setEditingId(item.id);
        form.setData({
            nip: item.nip || '',
            nama: item.nama || '',
            jabatan: item.jabatan || '',
            unit: item.unit || '',
            keterangan: item.keterangan || '',
        });
        // Scroll to form on mobile
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        form.reset();
        form.clearErrors();
    };

    const handleDelete = (item) => {
        if (confirm(`Hapus pegawai "${item.nama}"?`)) {
            router.delete(route('database.pegawai.destroy', item.id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout
            title="Database Pegawai"
            description="Master data pegawai yang dipakai untuk pencatatan transaksi BBM dan kebutuhan SPJ."
            actions={
                <>
                    <button
                        type="button"
                        onClick={() => setShowImport((value) => !value)}
                        className="rounded-2xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700"
                    >
                        {showImport ? 'Tutup Import' : 'Import Pegawai'}
                    </button>
                    <button
                        type="button"
                        onClick={cancelEdit}
                        className="rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-white"
                    >
                        Form Baru
                    </button>
                </>
            }
        >
            <Head title="Pegawai" />

            <div className="mb-6 space-y-6">
                {showImport ? (
                    <CsvImportCard
                        title="Import Data Pegawai"
                        description="Gunakan file CSV dari data pegawai lama. Jika `nip` sudah ada, data akan diperbarui. Jika belum ada, sistem akan menambahkan baris baru."
                        action={route('database.pegawai.import')}
                        templateUrl={route('database.pegawai.template')}
                        columns={['nip', 'nama', 'jabatan', 'unit', 'keterangan']}
                    />
                ) : null}

                <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                    <form
                        onSubmit={submit}
                        className="rounded-xl border border-gray-200 bg-gray-50 p-5"
                    >
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">
                                    {editingId ? 'Edit Pegawai' : 'Tambah Pegawai'}
                                </p>
                                <p className="mt-1 text-lg font-semibold text-gray-900">
                                    Form master pegawai
                                </p>
                            </div>
                            {editingId ? (
                                <button
                                    type="button"
                                    onClick={cancelEdit}
                                    className="rounded-2xl border border-gray-300 px-3 py-2 text-sm text-gray-700"
                                >
                                    Batal
                                </button>
                            ) : null}
                        </div>

                        <div className="grid gap-4">
                            <div>
                                <input
                                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm"
                                    placeholder="NIP"
                                    value={form.data.nip}
                                    onChange={(event) => form.setData('nip', event.target.value)}
                                />
                                <InputError className="mt-2" message={form.errors.nip} />
                            </div>
                            <div>
                                <input
                                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm"
                                    placeholder="Nama pegawai"
                                    value={form.data.nama}
                                    onChange={(event) => form.setData('nama', event.target.value)}
                                />
                                <InputError className="mt-2" message={form.errors.nama} />
                            </div>
                            <div>
                                <input
                                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm"
                                    placeholder="Jabatan"
                                    value={form.data.jabatan}
                                    onChange={(event) => form.setData('jabatan', event.target.value)}
                                />
                                <InputError className="mt-2" message={form.errors.jabatan} />
                            </div>
                            <div>
                                <input
                                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm"
                                    placeholder="Unit"
                                    value={form.data.unit}
                                    onChange={(event) => form.setData('unit', event.target.value)}
                                />
                                <InputError className="mt-2" message={form.errors.unit} />
                            </div>
                            <div>
                                <textarea
                                    rows="4"
                                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm"
                                    placeholder="Keterangan"
                                    value={form.data.keterangan}
                                    onChange={(event) => form.setData('keterangan', event.target.value)}
                                />
                                <InputError className="mt-2" message={form.errors.keterangan} />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={form.processing}
                            className="mt-5 rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
                        >
                            {form.processing
                                ? 'Menyimpan...'
                                : editingId
                                  ? 'Update Pegawai'
                                  : 'Simpan Pegawai'}
                        </button>
                    </form>

                    <div>
                        <div className="mb-4 grid gap-4 md:grid-cols-4">
                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                                <p className="text-sm text-gray-500">Total Pegawai</p>
                                <p className="mt-2 text-3xl font-semibold text-gray-900">
                                    {pegawai.length}
                                </p>
                            </div>
                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 md:col-span-3">
                                <input
                                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm"
                                    placeholder="Cari nama, NIP, jabatan, atau unit"
                                    value={keyword}
                                    onChange={(event) => setKeyword(event.target.value)}
                                />
                            </div>
                        </div>

                        {/* Mobile Card View */}
                        <div className="grid gap-4 xl:hidden">
                            {filteredPegawai.length ? (
                                filteredPegawai.map((item) => (
                                    <article
                                        key={item.id}
                                        className="rounded-xl border border-gray-200 bg-white p-5"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                    {item.nama}
                                                </h3>
                                                <p className="mt-1 text-sm text-gray-500">
                                                    {item.nip || 'Non-PNS'}
                                                </p>
                                            </div>
                                            {item.jabatan ? (
                                                <span className="shrink-0 inline-block rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 truncate max-w-[140px]">
                                                    {item.jabatan}
                                                </span>
                                            ) : null}
                                        </div>

                                        <dl className="mt-4 grid gap-3 text-sm text-gray-600">
                                            {item.unit ? (
                                                <div>
                                                    <dt className="text-gray-400">Unit</dt>
                                                    <dd className="mt-1 font-medium text-gray-900">
                                                        {item.unit}
                                                    </dd>
                                                </div>
                                            ) : null}
                                            {item.keterangan ? (
                                                <div>
                                                    <dt className="text-gray-400">Keterangan</dt>
                                                    <dd className="mt-1 font-medium text-gray-900">
                                                        {item.keterangan}
                                                    </dd>
                                                </div>
                                            ) : null}
                                        </dl>

                                        <div className="mt-5 flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => editPegawai(item)}
                                                className="flex-1 rounded-2xl border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-700"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(item)}
                                                className="rounded-2xl border border-rose-200 px-4 py-3 text-sm font-medium text-rose-700"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </article>
                                ))
                            ) : (
                                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">
                                    Belum ada data pegawai.
                                </div>
                            )}
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white xl:block">
                            <table className="min-w-full divide-y divide-stone-200 text-sm">
                                <thead className="bg-gray-50 text-left text-gray-500">
                                    <tr>
                                        <th className="px-5 py-4 font-medium">NIP</th>
                                        <th className="px-5 py-4 font-medium">Nama</th>
                                        <th className="px-5 py-4 font-medium">Jabatan</th>
                                        <th className="px-5 py-4 font-medium">Unit</th>
                                        <th className="px-5 py-4 font-medium">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                    {filteredPegawai.length ? (
                                        filteredPegawai.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-5 py-4 text-gray-600">
                                                    {item.nip || '-'}
                                                </td>
                                                <td className="px-5 py-4 font-medium text-gray-900">
                                                    {item.nama}
                                                </td>
                                                <td className="px-5 py-4 text-gray-600">
                                                    {item.jabatan || '-'}
                                                </td>
                                                <td className="px-5 py-4 text-gray-600">
                                                    {item.unit || '-'}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => editPegawai(item)}
                                                            className="rounded-xl border border-gray-300 px-3 py-2 text-xs text-gray-700"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(item)}
                                                            className="rounded-xl border border-rose-200 px-3 py-2 text-xs text-rose-700"
                                                        >
                                                            Hapus
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-5 py-8 text-center text-gray-500">
                                                Belum ada data pegawai.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
