import AppLayout from '@/Layouts/AppLayout';
import InputError from '@/Components/InputError';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function PeminjamanAlat({ peminjaman, alatOptions, pegawaiOptions }) {
    const [editingId, setEditingId] = useState(null);
    const [keyword, setKeyword] = useState('');
    const [filterStatus, setFilterStatus] = useState('semua');

    const form = useForm({
        alat_id: '',
        pegawai_id: '',
        tanggal_pinjam: '',
        tanggal_kembali_rencana: '',
        keperluan: '',
        catatan: '',
    });

    const filtered = peminjaman.filter(item => {
        if (filterStatus !== 'semua' && item.status !== filterStatus) return false;
        const query = keyword.toLowerCase();
        return (
            (item.alat?.nama_barang || '').toLowerCase().includes(query) ||
            (item.pegawai?.nama || '').toLowerCase().includes(query)
        );
    });

    const submit = (event) => {
        event.preventDefault();
        if (editingId) {
            form.put(route('database.peminjaman-alat.update', editingId), {
                preserveScroll: true,
                onSuccess: () => { setEditingId(null); form.reset(); },
            });
            return;
        }
        form.post(route('database.peminjaman-alat.store'), {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    const editPeminjaman = (item) => {
        setEditingId(item.id);
        form.setData({
            alat_id: item.alat_id || '',
            pegawai_id: item.pegawai_id || '',
            tanggal_pinjam: item.tanggal_pinjam || '',
            tanggal_kembali_rencana: item.tanggal_kembali || '',
            keperluan: item.keperluan || '',
            catatan: item.catatan || '',
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        form.reset();
        form.clearErrors();
    };

    const handleReturn = (item) => {
        if (confirm('Kembalikan alat "' + (item.alat?.nama_barang || '') + '"?')) {
            router.put(route('database.peminjaman-alat.update', item.id), {
                preserveScroll: true,
                data: { status: 'dikembalikan', kembali_aktual: new Date().toISOString().split('T')[0] },
            });
        }
    };

    const handleDelete = (item) => {
        if (confirm('Hapus peminjaman ini?')) {
            router.delete(route('database.peminjaman-alat.destroy', item.id), { preserveScroll: true });
        }
    };

    const statusBadge = (status) => {
        const config = {
            'dipinjam': 'bg-yellow-50 text-yellow-700',
            'dikembalikan': 'bg-green-50 text-green-700',
            'terlambat': 'bg-red-50 text-red-700',
        };
        return <span className={'inline-block rounded-full px-2 py-0.5 text-xs font-medium ' + (config[status] || 'bg-gray-50 text-gray-700')}>{status}</span>;
    };

    return (
        <AppLayout title="Peminjaman Alat" description="Kelola peminjaman alat ukur BPKH XI."
            actions={<button type="button" onClick={cancelEdit} className="rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-white">Form Baru</button>}
        >
            <Head title="Peminjaman Alat" />
            <div className="mb-6 space-y-6">
                {/* Form */}
                <form onSubmit={submit} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 p-5">
                    <div className="mb-5"><p className="text-sm text-gray-500">{editingId ? 'Edit Peminjaman' : 'Peminjaman Baru'}</p><p className="mt-1 text-lg font-semibold text-gray-900">Form peminjaman alat</p></div>
                    {editingId && <button type="button" onClick={cancelEdit} className="mb-3 rounded-2xl border border-gray-300 px-3 py-2 text-sm text-gray-700">Batal</button>}
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Alat *</label>
                            <select className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" value={form.data.alat_id} onChange={e => form.setData('alat_id', e.target.value)}>
                                <option value="">Pilih alat</option>
                                {alatOptions.map(a => <option key={a.id} value={a.id}>{a.nama_barang} - {a.merk} {a.tipe}</option>)}
                            </select>
                            <InputError className="mt-1" message={form.errors.alat_id} />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Pegawai *</label>
                            <select className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" value={form.data.pegawai_id} onChange={e => form.setData('pegawai_id', e.target.value)}>
                                <option value="">Pilih pegawai</option>
                                {pegawaiOptions.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
                            </select>
                            <InputError className="mt-1" message={form.errors.pegawai_id} />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Tanggal Pinjam *</label>
                            <input type="date" className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" value={form.data.tanggal_pinjam} onChange={e => form.setData('tanggal_pinjam', e.target.value)} />
                            <InputError className="mt-1" message={form.errors.tanggal_pinjam} />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Tanggal Kembali Rencana</label>
                            <input type="date" className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" value={form.data.tanggal_kembali_rencana} onChange={e => form.setData('tanggal_kembali_rencana', e.target.value)} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs text-gray-500 mb-1">Keperluan *</label>
                            <input className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" placeholder="Kegiatan survei, lapangan..." value={form.data.keperluan} onChange={e => form.setData('keperluan', e.target.value)} />
                            <InputError className="mt-1" message={form.errors.keperluan} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs text-gray-500 mb-1">Catatan</label>
                            <textarea rows="2" className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" placeholder="Catatan tambahan" value={form.data.catatan} onChange={e => form.setData('catatan', e.target.value)} />
                        </div>
                    </div>
                    <button type="submit" disabled={form.processing} className="mt-5 rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-white disabled:opacity-60">
                        {form.processing ? 'Menyimpan...' : editingId ? 'Update' : 'Simpan Peminjaman'}
                    </button>
                </form>

                {/* Filters & Stats */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 p-5"><p className="text-sm text-gray-500">Total Peminjaman</p><p className="mt-2 text-3xl font-semibold text-gray-900">{peminjaman.length}</p></div>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-yellow-50 p-5"><p className="text-sm text-gray-500">Dipinjam</p><p className="mt-2 text-3xl font-semibold text-yellow-700">{peminjaman.filter(i => i.status === 'dipinjam').length}</p></div>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-green-50 p-5"><p className="text-sm text-gray-500">Dikembalikan</p><p className="mt-2 text-3xl font-semibold text-green-700">{peminjaman.filter(i => i.status === 'dikembalikan').length}</p></div>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
                        <div className="flex gap-2">
                            <input className="flex-1 rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" placeholder="Cari alat/pegawai..." value={keyword} onChange={e => setKeyword(e.target.value)} />
                            <select className="rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                                <option value="semua">Semua</option>
                                <option value="dipinjam">Dipinjam</option>
                                <option value="dikembalikan">Dikembalikan</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="hidden overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 lg:block">
                    <table className="min-w-full divide-y divide-stone-200 text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700 text-left text-gray-500">
                            <tr>
                                <th className="px-5 py-4 font-medium">Tanggal</th>
                                <th className="px-5 py-4 font-medium">Alat</th>
                                <th className="px-5 py-4 font-medium">Pegawai</th>
                                <th className="px-5 py-4 font-medium">Keperluan</th>
                                <th className="px-5 py-4 font-medium">Status</th>
                                <th className="px-5 py-4 font-medium">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {filtered.length ? filtered.map(item => (
                                <tr key={item.id}>
                                    <td className="px-5 py-4 text-gray-600">{item.tanggal_pinjam}</td>
                                    <td className="px-5 py-4"><p className="font-medium text-gray-900">{item.alat?.nama_barang || '-'}</p><p className="text-xs text-gray-400">{item.alat?.merk}</p></td>
                                    <td className="px-5 py-4 text-gray-600">{item.pegawai?.nama || '-'}</td>
                                    <td className="px-5 py-4 text-gray-600">{item.keperluan || '-'}</td>
                                    <td className="px-5 py-4">{statusBadge(item.status)}</td>
                                    <td className="px-5 py-4">
                                        <div className="flex gap-1">
                                            {item.status === 'dipinjam' && (
                                                <button onClick={() => handleReturn(item)} className="rounded-xl bg-green-500 px-3 py-1 text-xs text-white">Kembalikan</button>
                                            )}
                                            <button onClick={() => editPeminjaman(item)} className="rounded-xl border border-gray-300 px-3 py-1 text-xs text-gray-700">Edit</button>
                                            <button onClick={() => handleDelete(item)} className="rounded-xl border border-red-200 px-3 py-1 text-xs text-red-700">Hapus</button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="6" className="px-5 py-8 text-center text-gray-500">Belum ada data.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
