import AppLayout from '@/Layouts/AppLayout';
import CsvImportCard from '@/Components/CsvImportCard';
import InputError from '@/Components/InputError';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

function TableCard({ children }) {
    return (
        <div className="overflow-hidden rounded-[24px] border border-stone-200 bg-white">
            {children}
        </div>
    );
}

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
    };

    const cancelEdit = () => {
        setEditingId(null);
        form.reset();
        form.clearErrors();
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
                        className="rounded-2xl border border-stone-300 px-4 py-3 text-sm font-medium text-stone-700"
                    >
                        {showImport ? 'Tutup Import' : 'Import Pegawai'}
                    </button>
                    <button
                        type="button"
                        onClick={cancelEdit}
                        className="rounded-2xl bg-stone-900 px-4 py-3 text-sm font-medium text-white"
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
                    className="rounded-[24px] border border-stone-200 bg-stone-50 p-5"
                >
                    <div className="mb-5 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-stone-500">
                                {editingId ? 'Edit Pegawai' : 'Tambah Pegawai'}
                            </p>
                            <p className="mt-1 text-lg font-semibold text-stone-950">
                                Form master pegawai
                            </p>
                        </div>
                        {editingId ? (
                            <button
                                type="button"
                                onClick={cancelEdit}
                                className="rounded-2xl border border-stone-300 px-3 py-2 text-sm text-stone-700"
                            >
                                Batal
                            </button>
                        ) : null}
                    </div>

                    <div className="grid gap-4">
                        <div>
                            <input
                                className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm"
                                placeholder="NIP"
                                value={form.data.nip}
                                onChange={(event) =>
                                    form.setData('nip', event.target.value)
                                }
                            />
                            <InputError
                                className="mt-2"
                                message={form.errors.nip}
                            />
                        </div>
                        <div>
                            <input
                                className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm"
                                placeholder="Nama pegawai"
                                value={form.data.nama}
                                onChange={(event) =>
                                    form.setData('nama', event.target.value)
                                }
                            />
                            <InputError
                                className="mt-2"
                                message={form.errors.nama}
                            />
                        </div>
                        <div>
                            <input
                                className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm"
                                placeholder="Jabatan"
                                value={form.data.jabatan}
                                onChange={(event) =>
                                    form.setData('jabatan', event.target.value)
                                }
                            />
                            <InputError
                                className="mt-2"
                                message={form.errors.jabatan}
                            />
                        </div>
                        <div>
                            <input
                                className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm"
                                placeholder="Unit"
                                value={form.data.unit}
                                onChange={(event) =>
                                    form.setData('unit', event.target.value)
                                }
                            />
                            <InputError
                                className="mt-2"
                                message={form.errors.unit}
                            />
                        </div>
                        <div>
                            <textarea
                                rows="4"
                                className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm"
                                placeholder="Keterangan"
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
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={form.processing}
                        className="mt-5 rounded-2xl bg-stone-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
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
                        <div className="rounded-[24px] border border-stone-200 bg-stone-50 p-5">
                            <p className="text-sm text-stone-500">
                                Total Pegawai
                            </p>
                            <p className="mt-2 text-3xl font-semibold text-stone-950">
                                {pegawai.length}
                            </p>
                        </div>
                        <div className="rounded-[24px] border border-stone-200 bg-stone-50 p-5 md:col-span-3">
                            <input
                                className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm"
                                placeholder="Cari nama, NIP, jabatan, atau unit"
                                value={keyword}
                                onChange={(event) =>
                                    setKeyword(event.target.value)
                                }
                            />
                        </div>
                    </div>

                    <TableCard>
                        <table className="min-w-full divide-y divide-stone-200 text-sm">
                            <thead className="bg-stone-50 text-left text-stone-500">
                                <tr>
                                    <th className="px-5 py-4 font-medium">
                                        NIP
                                    </th>
                                    <th className="px-5 py-4 font-medium">
                                        Nama
                                    </th>
                                    <th className="px-5 py-4 font-medium">
                                        Jabatan
                                    </th>
                                    <th className="px-5 py-4 font-medium">
                                        Unit
                                    </th>
                                    <th className="px-5 py-4 font-medium">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {filteredPegawai.length ? (
                                    filteredPegawai.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-5 py-4 text-stone-600">
                                                {item.nip || '-'}
                                            </td>
                                            <td className="px-5 py-4 font-medium text-stone-950">
                                                {item.nama}
                                            </td>
                                            <td className="px-5 py-4 text-stone-600">
                                                {item.jabatan || '-'}
                                            </td>
                                            <td className="px-5 py-4 text-stone-600">
                                                {item.unit || '-'}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            editPegawai(item)
                                                        }
                                                        className="rounded-xl border border-stone-300 px-3 py-2 text-xs text-stone-700"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            router.delete(
                                                                route(
                                                                    'database.pegawai.destroy',
                                                                    item.id,
                                                                ),
                                                                {
                                                                    preserveScroll:
                                                                        true,
                                                                },
                                                            )
                                                        }
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
                                        <td
                                            colSpan="5"
                                            className="px-5 py-8 text-center text-stone-500"
                                        >
                                            Belum ada data pegawai.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </TableCard>
                </div>
                </div>
            </div>
        </AppLayout>
    );
}
