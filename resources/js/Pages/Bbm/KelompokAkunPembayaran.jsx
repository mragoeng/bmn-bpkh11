import AppLayout from '@/Layouts/AppLayout';
import InputError from '@/Components/InputError';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function KelompokAkunPembayaran({ akunList }) {
    const [editingId, setEditingId] = useState(null);
    const [keyword, setKeyword] = useState('');
    const form = useForm({
        tahun: new Date().getFullYear(),
        jenis_kendaraan: 'roda_4',
        kode_akun: '',
        nama_akun: '',
        keterangan: '',
    });

    const filteredAkun = akunList.filter((item) => {
        const query = keyword.toLowerCase();

        return (
            String(item.tahun).includes(query) ||
            item.jenis_kendaraan.toLowerCase().includes(query) ||
            item.kode_akun.toLowerCase().includes(query) ||
            item.nama_akun.toLowerCase().includes(query)
        );
    });

    const submit = (event) => {
        event.preventDefault();

        if (editingId) {
            form.put(route('bbm.kelompok-akun-pembayaran.update', editingId), {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingId(null);
                    form.reset();
                    form.setData('tahun', new Date().getFullYear());
                    form.setData('jenis_kendaraan', 'roda_4');
                },
            });

            return;
        }

        form.post(route('bbm.kelompok-akun-pembayaran.store'), {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                form.setData('tahun', new Date().getFullYear());
                form.setData('jenis_kendaraan', 'roda_4');
            },
        });
    };

    const editAkun = (item) => {
        setEditingId(item.id);
        form.setData({
            tahun: item.tahun,
            jenis_kendaraan: item.jenis_kendaraan,
            kode_akun: item.kode_akun,
            nama_akun: item.nama_akun,
            keterangan: item.keterangan || '',
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        form.reset();
        form.setData('tahun', new Date().getFullYear());
        form.setData('jenis_kendaraan', 'roda_4');
        form.clearErrors();
    };

    return (
        <AppLayout
            title="Kelompok Akun Pembayaran"
            description="Referensi akun pembayaran pemerintah untuk SPJ, dipisahkan per tahun anggaran dan jenis kendaraan."
            actions={
                <button
                    type="button"
                    onClick={cancelEdit}
                    className="rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-white"
                >
                    Form Baru
                </button>
            }
        >
            <Head title="Kelompok Akun Pembayaran" />

            <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <form
                    onSubmit={submit}
                    className="rounded-xl border border-gray-200 bg-gray-50 p-5"
                >
                    <div className="mb-5 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">
                                {editingId ? 'Edit Akun' : 'Tambah Akun'}
                            </p>
                            <p className="mt-1 text-lg font-semibold text-gray-900">
                                Form kelompok akun pembayaran
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
                                type="number"
                                className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm"
                                placeholder="Tahun"
                                value={form.data.tahun}
                                onChange={(event) =>
                                    form.setData('tahun', event.target.value)
                                }
                            />
                            <InputError
                                className="mt-2"
                                message={form.errors.tahun}
                            />
                        </div>
                        <div>
                            <select
                                className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm"
                                value={form.data.jenis_kendaraan}
                                onChange={(event) =>
                                    form.setData(
                                        'jenis_kendaraan',
                                        event.target.value,
                                    )
                                }
                            >
                                <option value="roda_2">Roda 2</option>
                                <option value="roda_4">Roda 4</option>
                            </select>
                            <InputError
                                className="mt-2"
                                message={form.errors.jenis_kendaraan}
                            />
                        </div>
                        <div>
                            <input
                                className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm"
                                placeholder="Kode akun"
                                value={form.data.kode_akun}
                                onChange={(event) =>
                                    form.setData(
                                        'kode_akun',
                                        event.target.value,
                                    )
                                }
                            />
                            <InputError
                                className="mt-2"
                                message={form.errors.kode_akun}
                            />
                        </div>
                        <div>
                            <input
                                className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm"
                                placeholder="Nama akun"
                                value={form.data.nama_akun}
                                onChange={(event) =>
                                    form.setData(
                                        'nama_akun',
                                        event.target.value,
                                    )
                                }
                            />
                            <InputError
                                className="mt-2"
                                message={form.errors.nama_akun}
                            />
                        </div>
                        <div>
                            <textarea
                                rows="4"
                                className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm"
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
                        className="mt-5 rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
                    >
                        {form.processing
                            ? 'Menyimpan...'
                            : editingId
                              ? 'Update Akun'
                              : 'Simpan Akun'}
                    </button>
                </form>

                <div>
                    <div className="mb-4 grid gap-4 md:grid-cols-4">
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                            <p className="text-sm text-gray-500">
                                Total Akun
                            </p>
                            <p className="mt-2 text-3xl font-semibold text-gray-900">
                                {akunList.length}
                            </p>
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 md:col-span-3">
                            <input
                                className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm"
                                placeholder="Cari tahun, jenis kendaraan, kode akun, atau nama akun"
                                value={keyword}
                                onChange={(event) =>
                                    setKeyword(event.target.value)
                                }
                            />
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                        <table className="min-w-full divide-y divide-stone-200 text-sm">
                            <thead className="bg-gray-50 text-left text-gray-500">
                                <tr>
                                    <th className="px-5 py-4 font-medium">
                                        Tahun
                                    </th>
                                    <th className="px-5 py-4 font-medium">
                                        Jenis Kendaraan
                                    </th>
                                    <th className="px-5 py-4 font-medium">
                                        Kode Akun
                                    </th>
                                    <th className="px-5 py-4 font-medium">
                                        Nama Akun
                                    </th>
                                    <th className="px-5 py-4 font-medium">
                                        Keterangan
                                    </th>
                                    <th className="px-5 py-4 font-medium">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {filteredAkun.length ? (
                                    filteredAkun.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-5 py-4 text-gray-600">
                                                {item.tahun}
                                            </td>
                                            <td className="px-5 py-4 uppercase text-gray-600">
                                                {item.jenis_kendaraan.replace(
                                                    '_',
                                                    ' ',
                                                )}
                                            </td>
                                            <td className="px-5 py-4 font-medium text-gray-900">
                                                {item.kode_akun}
                                            </td>
                                            <td className="px-5 py-4 text-gray-600">
                                                {item.nama_akun}
                                            </td>
                                            <td className="px-5 py-4 text-gray-600">
                                                {item.keterangan || '-'}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            editAkun(item)
                                                        }
                                                        className="rounded-xl border border-gray-300 px-3 py-2 text-xs text-gray-700"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            router.delete(
                                                                route(
                                                                    'bbm.kelompok-akun-pembayaran.destroy',
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
                                            colSpan="6"
                                            className="px-5 py-8 text-center text-gray-500"
                                        >
                                            Belum ada data akun pembayaran.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
