import AppLayout from '@/Layouts/AppLayout';
import InputError from '@/Components/InputError';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function PeminjamanAlat({ peminjaman, alatOptions, pegawaiOptions }) {
    const [showForm, setShowForm] = useState(false);
    const [filterStatus, setFilterStatus] = useState('');
    const [filterDateFrom, setFilterDateFrom] = useState('');
    const [filterDateTo, setFilterDateTo] = useState('');

    const form = useForm({
        alat_id: '',
        pegawai_id: '',
        tanggal_pinjam: '',
        tanggal_kembali: '',
        keperluan: '',
        catatan: '',
    });

    const filteredPeminjaman = peminjaman.filter((item) => {
        if (filterStatus && item.status !== filterStatus) return false;
        if (filterDateFrom && item.tanggal_pinjam < filterDateFrom) return false;
        if (filterDateTo && item.tanggal_pinjam > filterDateTo) return false;
        return true;
    });

    const statsDipinjam = peminjaman.filter((i) => i.status === 'dipinjam').length;
    const statsDikembalikan = peminjaman.filter((i) => i.status === 'dikembalikan').length;
    const statsTerlambat = peminjaman.filter((i) => i.status === 'terlambat').length;

    const submit = (event) => {
        event.preventDefault();
        form.post(route('database.peminjaman-alat.store'), {
            preserveScroll: true,
            onSuccess: () => { form.reset(); setShowForm(false); },
        });
    };

    const cancelForm = () => {
        form.reset();
        form.clearErrors();
        setShowForm(false);
    };

    const handleKembalikan = (item) => {
        if (confirm('Kembalikan alat "' + (item.alat?.nama_barang || '') + '"?')) {
            router.put(route('database.peminjaman-alat.update', item.id), {
                _method: 'PUT',
                kembali_aktual: new Date().toISOString().slice(0, 10),
            }, { preserveScroll: true });
        }
    };

    const handleDelete = (item) => {
        if (confirm('Hapus data peminjaman ini?')) {
            router.delete(route('database.peminjaman-alat.destroy', item.id), { preserveScroll: true });
        }
    };

    const statusBadge = (status) => {
        const colors = {
            'dipinjam': 'bg-red-50 text-red-700 border-red-200',
            'dikembalikan': 'bg-green-50 text-green-700 border-green-200',
            'terlambat': 'bg-orange-50 text-orange-700 border-orange-200',
        };
        const labels = { 'dipinjam': 'Dipinjam', 'dikembalikan': 'Dikembalikan', 'terlambat': 'Terlambat' };
        return (
            <span className={'inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ' + (colors[status] || 'bg-gray-50 text-gray-700 border-gray-200')}>
                {labels[status] || status}
            </span>
        );
    };

    const formatDate = (date) => {
        if (!date) return '-';
        const d = new Date(date);
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <AppLayout title="Peminjaman Alat" description="Kelola peminjaman dan pengembalian alat ukur."
            actions={<>
                <button type="button" onClick={() => { if (showForm) cancelForm(); else setShowForm(true); }} className="rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-white">{showForm ? 'Tutup Form' : '+ Peminjaman Baru'}</button>
            </>}
        >
            <Head title="Peminjaman Alat" />

            <div className="mb-6 space-y-6">
                {/* Form */}
                {showForm && (
                <form onSubmit={submit} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 p-5">
                    <div className="mb-5 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Peminjaman Baru</p>
                            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">Form peminjaman alat</p>
                        </div>
                        <button type="button" onClick={cancelForm} className="rounded-full p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-lg">✕</button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Alat *</label>
                            <select className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" value={form.data.alat_id} onChange={e => form.setData('alat_id', e.target.value)}>
                                <option value="">Pilih alat</option>
                                {alatOptions.map(a => (
                                    <option key={a.id} value={a.id}>{a.nama_barang} {a.merk ? '- ' + a.merk : ''} {a.tipe ? '(' + a.tipe + ')' : ''}</option>
                                ))}
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
                            <label className="block text-xs text-gray-500 mb-1">Rencana Kembali</label>
                            <input type="date" className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" value={form.data.tanggal_kembali} onChange={e => form.setData('tanggal_kembali', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Keperluan / Kegiatan</label>
                            <input className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" placeholder="Survey, pengukuran..." value={form.data.keperluan} onChange={e => form.setData('keperluan', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Catatan</label>
                            <input className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" placeholder="Catatan tambahan" value={form.data.catatan} onChange={e => form.setData('catatan', e.target.value)} />
                        </div>
                    </div>
                    <button type="submit" disabled={form.processing} className="mt-5 rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-white disabled:opacity-60">{form.processing ? 'Menyimpan...' : 'Simpan Peminjaman'}</button>
                </form>
                )}

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 p-5"><p className="text-sm text-gray-500">Total Peminjaman</p><p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">{peminjaman.length}</p></div>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 p-5"><p className="text-sm text-gray-500">Sedang Dipinjam</p><p className="mt-2 text-3xl font-semibold text-red-600">{statsDipinjam}</p></div>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 p-5"><p className="text-sm text-gray-500">Dikembalikan</p><p className="mt-2 text-3xl font-semibold text-green-600">{statsDikembalikan}</p></div>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 p-5"><p className="text-sm text-gray-500">Terlambat</p><p className="mt-2 text-3xl font-semibold text-orange-600">{statsTerlambat}</p></div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 items-end">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Status</label>
                        <select className="rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                            <option value="">Semua</option>
                            <option value="dipinjam">Dipinjam</option>
                            <option value="dikembalikan">Dikembalikan</option>
                            <option value="terlambat">Terlambat</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Dari Tanggal</label>
                        <input type="date" className="rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Sampai Tanggal</label>
                        <input type="date" className="rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} />
                    </div>
                    <p className="text-sm text-gray-500">{filteredPeminjaman.length} data</p>
                </div>

                {/* Mobile Cards */}
                <div className="space-y-3 lg:hidden">
                    {filteredPeminjaman.length ? filteredPeminjaman.map(item => (
                        <div key={item.id} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{item.alat?.nama_barang || '-'}</p>
                                    <p className="text-xs text-gray-400 truncate">{[item.alat?.merk, item.alat?.tipe].filter(Boolean).join(' - ') || '-'}</p>
                                </div>
                                {statusBadge(item.status)}
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                                <div><span className="text-gray-400">Peminjam:</span> <span className="text-gray-900 dark:text-gray-100">{item.pegawai?.nama || '-'}</span></div>
                                <div><span className="text-gray-400">Pinjam:</span> <span className="text-gray-900 dark:text-gray-100">{formatDate(item.tanggal_pinjam)}</span></div>
                                <div><span className="text-gray-400">Rencana:</span> <span className="text-gray-900 dark:text-gray-100">{formatDate(item.tanggal_kembali)}</span></div>
                                <div><span className="text-gray-400">Kembali:</span> <span className="text-gray-900 dark:text-gray-100">{formatDate(item.kembali_aktual)}</span></div>
                            </div>
                            {item.keperluan && <p className="mt-2 text-xs text-gray-500 truncate">📋 {item.keperluan}</p>}
                            <div className="mt-3 flex gap-2">
                                {item.status === 'dipinjam' && (
                                    <button type="button" onClick={() => handleKembalikan(item)} className="flex-1 rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white">Kembalikan</button>
                                )}
                                <button type="button" onClick={() => handleDelete(item)} className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-medium text-rose-600">Hapus</button>
                            </div>
                        </div>
                    )) : (
                        <p className="py-6 text-center text-sm text-gray-400">Belum ada data peminjaman.</p>
                    )}
                </div>

                {/* Desktop Table */}
                <div className="hidden overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 lg:block">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                            <tr>
                                <th className="px-4 py-3">Alat</th>
                                <th className="px-4 py-3">Peminjam</th>
                                <th className="px-4 py-3">Tgl Pinjam</th>
                                <th className="px-4 py-3">Rencana Kembali</th>
                                <th className="px-4 py-3">Kembali Aktual</th>
                                <th className="px-4 py-3">Keperluan</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filteredPeminjaman.length ? filteredPeminjaman.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-gray-900 dark:text-gray-100">{item.alat?.nama_barang || '-'}</p>
                                        <p className="text-xs text-gray-400">{[item.alat?.merk, item.alat?.tipe].filter(Boolean).join(' - ')}</p>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{item.pegawai?.nama || '-'}</td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{formatDate(item.tanggal_pinjam)}</td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{formatDate(item.tanggal_kembali)}</td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{formatDate(item.kembali_aktual)}</td>
                                    <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">{item.keperluan || '-'}</td>
                                    <td className="px-4 py-3">{statusBadge(item.status)}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            {item.status === 'dipinjam' && (
                                                <button type="button" onClick={() => handleKembalikan(item)} className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white">Kembalikan</button>
                                            )}
                                            <button type="button" onClick={() => handleDelete(item)} className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600">Hapus</button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="8" className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">Belum ada data peminjaman.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
