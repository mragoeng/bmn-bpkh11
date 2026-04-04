import AppLayout from '@/Layouts/AppLayout';
import CsvImportCard from '@/Components/CsvImportCard';
import InputError from '@/Components/InputError';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Kendaraan({ kendaraan, pegawaiOptions }) {
    const [editingId, setEditingId] = useState(null);
    const [keyword, setKeyword] = useState('');
    const [showImport, setShowImport] = useState(false);
    const form = useForm({
        kode_kendaraan: '',
        nomor_polisi: '',
        merk_tipe: '',
        jenis_kendaraan: 'roda_4',
        tahun: '',
        jenis_bbm_default: '',
        pegawai_id: '',
        keterangan: '',
    });

    const filteredKendaraan = kendaraan.filter((item) => {
        const query = keyword.toLowerCase();

        return (
            (item.kode_kendaraan || '').toLowerCase().includes(query) ||
            item.nomor_polisi.toLowerCase().includes(query) ||
            item.merk_tipe.toLowerCase().includes(query) ||
            (item.pengguna || '').toLowerCase().includes(query)
        );
    });

    const submit = (event) => {
        event.preventDefault();

        if (editingId) {
            form.put(route('database.kendaraan.update', editingId), {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingId(null);
                    form.reset();
                    form.setData('jenis_kendaraan', 'roda_4');
                },
            });

            return;
        }

        form.post(route('database.kendaraan.store'), {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                form.setData('jenis_kendaraan', 'roda_4');
            },
        });
    };

    const editKendaraan = (item) => {
        setEditingId(item.id);
        form.setData({
            kode_kendaraan: item.kode_kendaraan || '',
            nomor_polisi: item.nomor_polisi || '',
            merk_tipe: item.merk_tipe || '',
            jenis_kendaraan: item.jenis_kendaraan || 'roda_4',
            tahun: item.tahun || '',
            jenis_bbm_default: item.jenis_bbm_default || '',
            pegawai_id: item.pegawai_id || '',
            keterangan: item.keterangan || '',
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        form.reset();
        form.setData('jenis_kendaraan', 'roda_4');
        form.clearErrors();
    };

    const handleDelete = (item) => {
        if (confirm(`Hapus kendaraan "${item.merk_tipe}"?`)) {
            router.delete(route('database.kendaraan.destroy', item.id), {
                preserveScroll: true,
            });
        }
    };

    const jenisBadge = (jenis) => {
        const isRoda2 = jenis === 'roda_2' || jenis?.toLowerCase().includes('roda 2');
        return (
            <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${isRoda2 ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}>
                {jenis || '-'}
            </span>
        );
    };

    return (
        <AppLayout
            title="Database Kendaraan"
            description="Master kendaraan dinas beserta jenis kendaraan, BBM default, dan pengguna kendaraan."
            actions={
                <>
                    <button
                        type="button"
                        onClick={() => setShowImport((value) => !value)}
                        className="rounded-2xl border border-stone-300 px-4 py-3 text-sm font-medium text-stone-700"
                    >
                        {showImport ? 'Tutup Import' : 'Import Kendaraan'}
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
            <Head title="Kendaraan" />

            <div className="mb-6 space-y-6">
                {showImport ? (
                    <CsvImportCard
                        title="Import Data Kendaraan"
                        description="Upload CSV kendaraan dari database lama. Sistem akan mencocokkan kendaraan berdasarkan `nomor_polisi`, lalu memperbarui atau menambahkan data baru."
                        action={route('database.kendaraan.import')}
                        templateUrl={route('database.kendaraan.template')}
                        columns={[
                            'kode_kendaraan',
                            'nomor_polisi',
                            'merk_tipe',
                            'jenis_kendaraan',
                            'tahun',
                            'jenis_bbm_default',
                            'pegawai_nip',
                            'keterangan',
                        ]}
                    />
                ) : null}

                <form
                    onSubmit={submit}
                    className="rounded-[24px] border border-stone-200 bg-stone-50 p-5"
                >
                    <div className="mb-5 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-stone-500">
                                {editingId
                                    ? 'Edit Kendaraan'
                                    : 'Tambah Kendaraan'}
                            </p>
                            <p className="mt-1 text-lg font-semibold text-stone-950">
                                Form master kendaraan
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

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <input
                                className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm"
                                placeholder="Kode kendaraan"
                                value={form.data.kode_kendaraan}
                                onChange={(event) =>
                                    form.setData('kode_kendaraan', event.target.value)
                                }
                            />
                            <InputError className="mt-2" message={form.errors.kode_kendaraan} />
                        </div>
                        <div>
                            <input
                                className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm"
                                placeholder="Nomor polisi"
                                value={form.data.nomor_polisi}
                                onChange={(event) =>
                                    form.setData('nomor_polisi', event.target.value)
                                }
                            />
                            <InputError className="mt-2" message={form.errors.nomor_polisi} />
                        </div>
                        <div>
                            <input
                                className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm"
                                placeholder="Merk / tipe"
                                value={form.data.merk_tipe}
                                onChange={(event) =>
                                    form.setData('merk_tipe', event.target.value)
                                }
                            />
                            <InputError className="mt-2" message={form.errors.merk_tipe} />
                        </div>
                        <div>
                            <select
                                className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm"
                                value={form.data.jenis_kendaraan}
                                onChange={(event) =>
                                    form.setData('jenis_kendaraan', event.target.value)
                                }
                            >
                                <option value="roda_2">Roda 2</option>
                                <option value="roda_4">Roda 4</option>
                            </select>
                            <InputError className="mt-2" message={form.errors.jenis_kendaraan} />
                        </div>
                        <div>
                            <input
                                type="number"
                                className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm"
                                placeholder="Tahun"
                                value={form.data.tahun}
                                onChange={(event) => form.setData('tahun', event.target.value)}
                            />
                            <InputError className="mt-2" message={form.errors.tahun} />
                        </div>
                        <div>
                            <input
                                className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm"
                                placeholder="Jenis BBM default"
                                value={form.data.jenis_bbm_default}
                                onChange={(event) =>
                                    form.setData('jenis_bbm_default', event.target.value)
                                }
                            />
                            <InputError className="mt-2" message={form.errors.jenis_bbm_default} />
                        </div>
                        <div>
                            <select
                                className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm"
                                value={form.data.pegawai_id}
                                onChange={(event) =>
                                    form.setData('pegawai_id', event.target.value)
                                }
                            >
                                <option value="">Pilih pengguna kendaraan</option>
                                {pegawaiOptions.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.nama}
                                    </option>
                                ))}
                            </select>
                            <InputError className="mt-2" message={form.errors.pegawai_id} />
                        </div>
                        <div className="md:col-span-2">
                            <textarea
                                rows="4"
                                className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm"
                                placeholder="Keterangan"
                                value={form.data.keterangan}
                                onChange={(event) =>
                                    form.setData('keterangan', event.target.value)
                                }
                            />
                            <InputError className="mt-2" message={form.errors.keterangan} />
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
                              ? 'Update Kendaraan'
                              : 'Simpan Kendaraan'}
                    </button>
                </form>

                <div>
                    <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-[0.8fr_0.8fr_0.8fr_1.6fr]">
                        <div className="rounded-[24px] border border-stone-200 bg-stone-50 p-5">
                            <p className="text-sm text-stone-500">Total Kendaraan</p>
                            <p className="mt-2 text-3xl font-semibold text-stone-950">
                                {kendaraan.length}
                            </p>
                        </div>
                        <div className="rounded-[24px] border border-stone-200 bg-stone-50 p-5">
                            <p className="text-sm text-stone-500">Roda 2</p>
                            <p className="mt-2 text-3xl font-semibold text-stone-950">
                                {kendaraan.filter((item) => item.jenis_kendaraan === 'roda_2').length}
                            </p>
                        </div>
                        <div className="rounded-[24px] border border-stone-200 bg-stone-50 p-5">
                            <p className="text-sm text-stone-500">Roda 4</p>
                            <p className="mt-2 text-3xl font-semibold text-stone-950">
                                {kendaraan.filter((item) => item.jenis_kendaraan === 'roda_4').length}
                            </p>
                        </div>
                        <div className="rounded-[24px] border border-stone-200 bg-white p-5 sm:col-span-2 lg:col-span-1">
                            <input
                                className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm"
                                placeholder="Cari kode, polisi, merk, atau pengguna"
                                value={keyword}
                                onChange={(event) => setKeyword(event.target.value)}
                            />
                        </div>
                    </div>

                    {/* Mobile Card View */}
                    <div className="grid gap-4 lg:hidden">
                        {filteredKendaraan.length ? (
                            filteredKendaraan.map((item) => (
                                <article
                                    key={item.id}
                                    className="rounded-[24px] border border-stone-200 bg-white p-5"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <h3 className="text-lg font-semibold text-stone-950 truncate">
                                                {item.merk_tipe}
                                            </h3>
                                            <p className="mt-1 text-sm font-medium text-stone-700">
                                                {item.nomor_polisi}
                                            </p>
                                        </div>
                                        {jenisBadge(item.jenis_kendaraan)}
                                    </div>

                                    <dl className="mt-4 grid gap-3 text-sm text-stone-600 sm:grid-cols-2">
                                        <div>
                                            <dt className="text-stone-400">Kode BMN</dt>
                                            <dd className="mt-1 font-medium text-stone-950 truncate">
                                                {item.kode_kendaraan || '-'}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-stone-400">BBM Default</dt>
                                            <dd className="mt-1 font-medium text-stone-950">
                                                {item.jenis_bbm_default || '-'}
                                            </dd>
                                        </div>
                                        <div className="sm:col-span-2">
                                            <dt className="text-stone-400">Pengguna</dt>
                                            <dd className="mt-1 font-medium text-stone-950">
                                                {item.pengguna || '-'}
                                            </dd>
                                        </div>
                                    </dl>

                                    <div className="mt-5 flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => editKendaraan(item)}
                                            className="flex-1 rounded-2xl border border-stone-300 px-4 py-3 text-center text-sm font-medium text-stone-700"
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
                            <div className="rounded-[24px] border border-dashed border-stone-300 bg-stone-50 p-8 text-center text-sm text-stone-500">
                                Belum ada data kendaraan.
                            </div>
                        )}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden overflow-hidden rounded-[24px] border border-stone-200 bg-white lg:block">
                        <table className="min-w-full divide-y divide-stone-200 text-sm">
                            <thead className="bg-stone-50 text-left text-stone-500">
                                <tr>
                                    <th className="px-5 py-4 font-medium">Kode Kendaraan</th>
                                    <th className="px-5 py-4 font-medium">Nomor Polisi</th>
                                    <th className="px-5 py-4 font-medium">Merk/Tipe</th>
                                    <th className="px-5 py-4 font-medium">Jenis</th>
                                    <th className="px-5 py-4 font-medium">BBM</th>
                                    <th className="px-5 py-4 font-medium">Pengguna</th>
                                    <th className="px-5 py-4 font-medium">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {filteredKendaraan.length ? (
                                    filteredKendaraan.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-5 py-4 text-stone-600">
                                                {item.kode_kendaraan || '-'}
                                            </td>
                                            <td className="px-5 py-4 font-medium text-stone-950">
                                                {item.nomor_polisi}
                                            </td>
                                            <td className="px-5 py-4 text-stone-600">
                                                {item.merk_tipe}
                                            </td>
                                            <td className="px-5 py-4">
                                                {jenisBadge(item.jenis_kendaraan)}
                                            </td>
                                            <td className="px-5 py-4 text-stone-600">
                                                {item.jenis_bbm_default || '-'}
                                            </td>
                                            <td className="px-5 py-4 text-stone-600">
                                                {item.pengguna || '-'}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => editKendaraan(item)}
                                                        className="rounded-xl border border-stone-300 px-3 py-2 text-xs text-stone-700"
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
                                        <td colSpan="7" className="px-5 py-8 text-center text-stone-500">
                                            Belum ada data kendaraan.
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
