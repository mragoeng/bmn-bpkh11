import AppLayout from '@/Layouts/AppLayout';
import InputError from '@/Components/InputError';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function PeminjamanKendaraan({ peminjaman, kendaraanOptions, pegawaiOptions, filters }) {
    const { flash } = usePage().props;
    const [showForm, setShowForm] = useState(false);
    const [keyword, setKeyword] = useState(filters?.search || '');
    const [filterStatus, setFilterStatus] = useState(filters?.status || 'semua');
    const [showReject, setShowReject] = useState(null);
    const [showUpload, setShowUpload] = useState(null);

    const form = useForm({
        kendaraan_id: '',
        pegawai_id: '',
        tanggal_pinjam: '',
        tanggal_kembali: '',
        keperluan: '',
    });

    const rejectForm = useForm({ keterangan: '' });
    const uploadForm = useForm({ bukti_pdf: null });

    const filtered = peminjaman.filter(item => {
        if (filterStatus !== 'semua' && item.status !== filterStatus) return false;
        const q = keyword.toLowerCase();
        return (
            (item.kendaraan?.nama_barang || '').toLowerCase().includes(q) ||
            (item.kendaraan?.nomor_polisi || '').toLowerCase().includes(q) ||
            (item.pegawai?.nama || '').toLowerCase().includes(q) ||
            (item.keperluan || '').toLowerCase().includes(q)
        );
    });

    const submit = (e) => {
        e.preventDefault();
        form.post(route('peminjaman-kendaraan.store'), {
            preserveScroll: true,
            onSuccess: () => { form.reset(); setShowForm(false); },
        });
    };

    const handleApprove = (item) => {
        if (confirm('Setujui peminjaman ini?')) {
            router.put(route('peminjaman-kendaraan.approve', item.id), {}, { preserveScroll: true });
        }
    };

    const submitReject = (e) => {
        e.preventDefault();
        rejectForm.put(route('peminjaman-kendaraan.reject', showReject), {
            preserveScroll: true,
            onSuccess: () => setShowReject(null),
        });
    };

    const handleReturn = (item) => {
        if (confirm('Kembalikan kendaraan ini?')) {
            router.put(route('peminjaman-kendaraan.return', item.id), {}, { preserveScroll: true });
        }
    };

    const handleDelete = (item) => {
        if (confirm('Hapus data peminjaman ini?')) {
            router.delete(route('peminjaman-kendaraan.destroy', item.id), { preserveScroll: true });
        }
    };

    const submitUpload = (e) => {
        e.preventDefault();
        uploadForm.post(route('peminjaman-kendaraan.upload-pdf', showUpload), {
            preserveScroll: true,
            onSuccess: () => setShowUpload(null),
        });
    };

    const statusBadge = (status) => {
        const cfg = {
            'MENUNGGU': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'DISETUJUI': 'bg-blue-100 text-blue-800 border-blue-200',
            'DITOLAK': 'bg-red-100 text-red-800 border-red-200',
            'DIKEMBALIKAN': 'bg-green-100 text-green-800 border-green-200',
        };
        return <span className={'inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ' + (cfg[status] || 'bg-gray-100 text-gray-700')}>{status}</span>;
    };

    const stats = {
        total: peminjaman.length,
        menunggu: peminjaman.filter(i => i.status === 'MENUNGGU').length,
        disetujui: peminjaman.filter(i => i.status === 'DISETUJUI').length,
        dikembalikan: peminjaman.filter(i => i.status === 'DIKEMBALIKAN').length,
    };

    return (
        <AppLayout title="Peminjaman Kendaraan" description="Kelola peminjaman kendaraan dinas BPKH XI."
            actions={
                <button type="button" onClick={() => { setShowForm(!showForm); form.reset(); }}
                    className="rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-white">
                    {showForm ? 'Tutup Form' : '+ Peminjaman Baru'}
                </button>
            }
        >
            <Head title="Peminjaman Kendaraan" />
            {flash?.success && <div className="mb-4 rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-700">{flash.success}</div>}
            {flash?.error && <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">{flash.error}</div>}

            {showForm && (
                <form onSubmit={submit} className="mb-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 p-5">
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Form Peminjaman Kendaraan</p>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Kendaraan *</label>
                            <select className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm"
                                value={form.data.kendaraan_id} onChange={e => form.setData('kendaraan_id', e.target.value)}>
                                <option value="">Pilih kendaraan</option>
                                {kendaraanOptions.map(k => <option key={k.id} value={k.id}>{k.nama_barang} — {k.nomor_polisi} ({k.merk_tipe})</option>)}
                            </select>
                            <InputError className="mt-1" message={form.errors.kendaraan_id} />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Pegawai *</label>
                            <select className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm"
                                value={form.data.pegawai_id} onChange={e => form.setData('pegawai_id', e.target.value)}>
                                <option value="">Pilih pegawai</option>
                                {pegawaiOptions.map(p => <option key={p.id} value={p.id}>{p.nama}{p.jabatan ? ` — ${p.jabatan}` : ''}</option>)}
                            </select>
                            <InputError className="mt-1" message={form.errors.pegawai_id} />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Tanggal Pinjam *</label>
                            <input type="date" className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm"
                                value={form.data.tanggal_pinjam} onChange={e => form.setData('tanggal_pinjam', e.target.value)} />
                            <InputError className="mt-1" message={form.errors.tanggal_pinjam} />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Tanggal Kembali *</label>
                            <input type="date" className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm"
                                value={form.data.tanggal_kembali} onChange={e => form.setData('tanggal_kembali', e.target.value)} />
                            <InputError className="mt-1" message={form.errors.tanggal_kembali} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs text-gray-500 mb-1">Keperluan *</label>
                            <input className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm"
                                placeholder="Keperluan peminjaman..." value={form.data.keperluan} onChange={e => form.setData('keperluan', e.target.value)} />
                            <InputError className="mt-1" message={form.errors.keperluan} />
                        </div>
                    </div>
                    <button type="submit" disabled={form.processing} className="mt-5 rounded-2xl bg-primary px-6 py-3 text-sm font-medium text-white disabled:opacity-60">
                        {form.processing ? 'Menyimpan...' : 'Simpan Peminjaman'}
                    </button>
                </form>
            )}

            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 p-5"><p className="text-sm text-gray-500">Total</p><p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">{stats.total}</p></div>
                <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5"><p className="text-sm text-gray-500">Menunggu</p><p className="mt-2 text-3xl font-semibold text-yellow-700">{stats.menunggu}</p></div>
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-5"><p className="text-sm text-gray-500">Disetujui</p><p className="mt-2 text-3xl font-semibold text-blue-700">{stats.disetujui}</p></div>
                <div className="rounded-xl border border-green-200 bg-green-50 p-5"><p className="text-sm text-gray-500">Dikembalikan</p><p className="mt-2 text-3xl font-semibold text-green-700">{stats.dikembalikan}</p></div>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
                <input className="flex-1 min-w-[200px] rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm"
                    placeholder="Cari kendaraan, pegawai..." value={keyword} onChange={e => setKeyword(e.target.value)} />
                <select className="rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm"
                    value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="semua">Semua Status</option>
                    <option value="MENUNGGU">Menunggu</option>
                    <option value="DISETUJUI">Disetujui</option>
                    <option value="DITOLAK">Ditolak</option>
                    <option value="DIKEMBALIKAN">Dikembalikan</option>
                </select>
            </div>

            {/* Desktop Table */}
            <div className="hidden overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 lg:block">
                <table className="min-w-full divide-y divide-stone-200 text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700 text-left text-gray-500">
                        <tr>
                            <th className="px-4 py-3 font-medium">No. Surat</th>
                            <th className="px-4 py-3 font-medium">Kendaraan</th>
                            <th className="px-4 py-3 font-medium">Peminjam</th>
                            <th className="px-4 py-3 font-medium">Tanggal</th>
                            <th className="px-4 py-3 font-medium">Keperluan</th>
                            <th className="px-4 py-3 font-medium">Status</th>
                            <th className="px-4 py-3 font-medium">Bukti</th>
                            <th className="px-4 py-3 font-medium">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-gray-700">
                        {filtered.length ? filtered.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-4 py-3 text-xs font-mono text-gray-600">{item.nomor_surat || '-'}</td>
                                <td className="px-4 py-3">
                                    <p className="font-medium text-gray-900 dark:text-gray-100">{item.kendaraan?.nama_barang || '-'}</p>
                                    <p className="text-xs text-gray-400">{item.kendaraan?.nomor_polisi} - {item.kendaraan?.merk_tipe}</p>
                                </td>
                                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{item.pegawai?.nama || '-'}</td>
                                <td className="px-4 py-3 text-gray-600 dark:text-gray-300 text-xs">
                                    <p>{item.tanggal_pinjam}</p>
                                    <p className="text-gray-400">s/d {item.tanggal_kembali}</p>
                                </td>
                                <td className="px-4 py-3 text-gray-600 dark:text-gray-300 max-w-[200px] truncate">{item.keperluan}</td>
                                <td className="px-4 py-3">{statusBadge(item.status)}</td>
                                <td className="px-4 py-3">
                                    {item.bukti_pdf_path
                                        ? <a href={'/storage/' + item.bukti_pdf_path} target="_blank" className="text-xs text-blue-600 hover:underline">Lihat PDF</a>
                                        : '-'}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-wrap gap-1">
                                        {item.status === 'MENUNGGU' && <>
                                            <button onClick={() => handleApprove(item)} className="rounded-lg bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600">Setujui</button>
                                            <button onClick={() => setShowReject(item.id)} className="rounded-lg bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600">Tolak</button>
                                        </>}
                                        {item.status === 'DISETUJUI' && <button onClick={() => handleReturn(item)} className="rounded-lg bg-green-500 px-2 py-1 text-xs text-white hover:bg-green-600">Kembalikan</button>}
                                        <a href={route('peminjaman-kendaraan.pdf', item.id)} target="_blank" className="rounded-lg border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100">PDF</a>
                                        <button onClick={() => setShowUpload(item.id)} className="rounded-lg border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100">Upload</button>
                                        <button onClick={() => handleDelete(item)} className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50">Hapus</button>
                                    </div>
                                </td>
                            </tr>
                        )) : <tr><td colSpan="8" className="px-4 py-8 text-center text-gray-500">Belum ada data.</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-3">
                {filtered.length ? filtered.map(item => (
                    <div key={item.id} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100">{item.kendaraan?.nama_barang || '-'}</p>
                                <p className="text-xs text-gray-400">{item.kendaraan?.nomor_polisi} - {item.kendaraan?.merk_tipe}</p>
                            </div>
                            {statusBadge(item.status)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                            <p>Peminjam: {item.pegawai?.nama || '-'}</p>
                            <p>Tanggal: {item.tanggal_pinjam} s/d {item.tanggal_kembali}</p>
                            <p>Keperluan: {item.keperluan}</p>
                            {item.keterangan && <p className="text-red-500">Alasan: {item.keterangan}</p>}
                            {item.bukti_pdf_path && <a href={'/storage/' + item.bukti_pdf_path} target="_blank" className="text-xs text-blue-600">Lihat Bukti PDF</a>}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {item.status === 'MENUNGGU' && <>
                                <button onClick={() => handleApprove(item)} className="rounded-lg bg-blue-500 px-3 py-2 text-xs text-white">Setujui</button>
                                <button onClick={() => setShowReject(item.id)} className="rounded-lg bg-red-500 px-3 py-2 text-xs text-white">Tolak</button>
                            </>}
                            {item.status === 'DISETUJUI' && <button onClick={() => handleReturn(item)} className="rounded-lg bg-green-500 px-3 py-2 text-xs text-white">Kembalikan</button>}
                            <a href={route('peminjaman-kendaraan.pdf', item.id)} target="_blank" className="rounded-lg border px-3 py-2 text-xs text-gray-700 dark:text-gray-300">Cetak PDF</a>
                            <button onClick={() => setShowUpload(item.id)} className="rounded-lg border px-3 py-2 text-xs text-gray-700 dark:text-gray-300">Upload Bukti</button>
                            <button onClick={() => handleDelete(item)} className="rounded-lg border border-red-200 px-3 py-2 text-xs text-red-600">Hapus</button>
                        </div>
                    </div>
                )) : <p className="text-center text-gray-500 py-8">Belum ada data.</p>}
            </div>

            {/* Reject Modal */}
            {showReject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowReject(null)}>
                    <form onSubmit={submitReject} className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl" onClick={e => e.stopPropagation()}>
                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Alasan Penolakan</p>
                        <textarea rows={3} className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm"
                            placeholder="Masukkan alasan penolakan..." value={rejectForm.data.keterangan} onChange={e => rejectForm.setData('keterangan', e.target.value)} />
                        <InputError className="mt-1" message={rejectForm.errors.keterangan} />
                        <div className="mt-4 flex gap-2 justify-end">
                            <button type="button" onClick={() => setShowReject(null)} className="rounded-xl border px-4 py-2 text-sm text-gray-700 dark:text-gray-300">Batal</button>
                            <button type="submit" disabled={rejectForm.processing} className="rounded-xl bg-red-500 px-4 py-2 text-sm text-white disabled:opacity-60">Tolak</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Upload Modal */}
            {showUpload && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowUpload(null)}>
                    <form onSubmit={submitUpload} className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl" onClick={e => e.stopPropagation()}>
                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Upload Bukti PDF</p>
                        <input type="file" accept=".pdf" className="w-full text-sm text-gray-600 dark:text-gray-300" onChange={e => uploadForm.setData('bukti_pdf', e.target.files[0])} />
                        <InputError className="mt-1" message={uploadForm.errors.bukti_pdf} />
                        <div className="mt-4 flex gap-2 justify-end">
                            <button type="button" onClick={() => setShowUpload(null)} className="rounded-xl border px-4 py-2 text-sm text-gray-700 dark:text-gray-300">Batal</button>
                            <button type="submit" disabled={uploadForm.processing} className="rounded-xl bg-primary px-4 py-2 text-sm text-white disabled:opacity-60">{uploadForm.processing ? 'Uploading...' : 'Upload'}</button>
                        </div>
                    </form>
                </div>
            )}
        </AppLayout>
    );
}
