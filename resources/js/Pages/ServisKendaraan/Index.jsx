import AppLayout from '@/Layouts/AppLayout';
import InputError from '@/Components/InputError';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function ServisKendaraanIndex({ servis, kendaraanOptions, pegawaiOptions, filters, stats, jenisOptions }) {
    const { flash } = usePage().props;
    const [showForm, setShowForm] = useState(false);
    const [showUpload, setShowUpload] = useState(null);
    const [showBukti, setShowBukti] = useState(null);
    const [keyword, setKeyword] = useState(filters?.search || '');

    const form = useForm({
        kendaraan_id: '', pegawai_id: '', tanggal_servis: '', jenis_servis: '',
        keterangan: '', km_saat_servis: '', biaya: '', tempat_servis: '',
        status: 'SELESAI', catatan: '', bukti_files: [],
    });
    const uploadForm = useForm({ bukti: null });

    const filtered = servis.filter(item => {
        const q = keyword.toLowerCase();
        return (item.kendaraan?.merk_tipe || '').toLowerCase().includes(q) || (item.kendaraan?.nomor_polisi || '').toLowerCase().includes(q) || (item.pegawai?.nama || '').toLowerCase().includes(q);
    });

    const submit = (e) => { e.preventDefault(); form.post(route('bbm.servis-kendaraan.store'), { preserveScroll: true, onSuccess: () => { form.reset(); setShowForm(false); } }); };
    const handleDelete = (item) => { if (confirm('Hapus?')) router.delete(route('bbm.servis-kendaraan.destroy', item.id), { preserveScroll: true }); };
    const submitUpload = (e) => { e.preventDefault(); uploadForm.post(route('bbm.servis-kendaraan.upload-bukti', showUpload), { preserveScroll: true, onSuccess: () => setShowUpload(null) }); };
    const handleDeleteBukti = (id, path) => { if (confirm('Hapus file?')) router.delete(route('bbm.servis-kendaraan.delete-bukti', id), { data: { path }, preserveScroll: true }); };

    const statusBadge = (s) => {
        const c = { SELESAI: 'bg-green-100 text-green-800', PROSES: 'bg-yellow-100 text-yellow-800', DIBATALKAN: 'bg-red-100 text-red-800' };
        return <span className={'inline-block rounded-full px-2 py-0.5 text-xs font-semibold ' + (c[s] || 'bg-gray-100 text-gray-700')}>{s}</span>;
    };

    return (
        <AppLayout title="Servis & Maintenance" description="Manajemen servis dan maintenance kendaraan dinas">
            <Head title="Servis & Maintenance Kendaraan" />
            {flash?.success && <div className="mb-4 rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-700">{flash.success}</div>}
            {flash?.error && <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">{flash.error}</div>}

            <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                <button onClick={() => setShowForm(!showForm)} className="rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-white">
                    {showForm ? 'Tutup Form' : '+ Tambah Servis'}
                </button>
                <div className="flex gap-2">
                    <a href={route('bbm.servis-kendaraan.laporan')} className="rounded-xl border px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50">📊 Laporan</a>
                    <a href={route('bbm.servis-kendaraan.export')} className="rounded-xl border px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50">📥 Export CSV</a>
                </div>
            </div>

            {showForm && (
                <form onSubmit={submit} className="mb-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 p-5">
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Form Servis / Maintenance</p>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div><label className="block text-xs text-gray-500 mb-1">Kendaraan *</label>
                            <select className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" value={form.data.kendaraan_id} onChange={e => form.setData('kendaraan_id', e.target.value)}>
                                <option value="">Pilih kendaraan</option>{kendaraanOptions.map(k => <option key={k.id} value={k.id}>{k.nama_barang} — {k.nomor_polisi}</option>)}
                            </select><InputError message={form.errors.kendaraan_id} /></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Pegawai *</label>
                            <select className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" value={form.data.pegawai_id} onChange={e => form.setData('pegawai_id', e.target.value)}>
                                <option value="">Pilih pegawai</option>{pegawaiOptions.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
                            </select><InputError message={form.errors.pegawai_id} /></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Tanggal Servis *</label>
                            <input type="date" className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" value={form.data.tanggal_servis} onChange={e => form.setData('tanggal_servis', e.target.value)} /></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Jenis Servis *</label>
                            <select className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" value={form.data.jenis_servis} onChange={e => form.setData('jenis_servis', e.target.value)}>
                                <option value="">Pilih jenis</option>{Object.entries(jenisOptions).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                            </select></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Biaya (Rp) *</label>
                            <input type="number" step="0.01" className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" value={form.data.biaya} onChange={e => form.setData('biaya', e.target.value)} /></div>
                        <div><label className="block text-xs text-gray-500 mb-1">KM Saat Servis</label>
                            <input type="number" className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" value={form.data.km_saat_servis} onChange={e => form.setData('km_saat_servis', e.target.value)} /></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Tempat Servis</label>
                            <input className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" value={form.data.tempat_servis} onChange={e => form.setData('tempat_servis', e.target.value)} /></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Status</label>
                            <select className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" value={form.data.status} onChange={e => form.setData('status', e.target.value)}>
                                <option value="SELESAI">Selesai</option><option value="PROSES">Proses</option><option value="DIBATALKAN">Dibatalkan</option>
                            </select></div>
                        <div className="md:col-span-2"><label className="block text-xs text-gray-500 mb-1">Keterangan</label>
                            <input className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" value={form.data.keterangan} onChange={e => form.setData('keterangan', e.target.value)} /></div>
                        <div className="md:col-span-2"><label className="block text-xs text-gray-500 mb-1">Bukti (jpg/png/pdf, max 5)</label>
                            <input type="file" multiple accept=".jpg,.jpeg,.png,.pdf" className="w-full text-sm" onChange={e => form.setData('bukti_files', Array.from(e.target.files))} /></div>
                    </div>
                    <button type="submit" disabled={form.processing} className="mt-5 rounded-2xl bg-primary px-6 py-3 text-sm font-medium text-white disabled:opacity-60">{form.processing ? 'Menyimpan...' : 'Simpan'}</button>
                </form>
            )}

            <div className="mb-6 grid gap-4 grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-5"><p className="text-sm text-gray-500">Servis Bulan Ini</p><p className="mt-2 text-3xl font-bold text-blue-700">{stats?.total_bulan_ini || 0}</p></div>
                <div className="rounded-xl border border-green-200 bg-green-50 p-5"><p className="text-sm text-gray-500">Total Biaya</p><p className="mt-2 text-xl font-bold text-green-700">{stats?.total_biaya_bulan_ini || 'Rp 0'}</p></div>
                <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5"><p className="text-sm text-gray-500">Servis Besar</p><p className="mt-2 text-3xl font-bold text-yellow-700">{stats?.servis_besar || 0}</p></div>
                <div className="rounded-xl border border-purple-200 bg-purple-50 p-5"><p className="text-sm text-gray-500">Maintenance Rutin</p><p className="mt-2 text-3xl font-bold text-purple-700">{stats?.maintenance_rutin || 0}</p></div>
            </div>

            <div className="mb-4"><input className="w-full max-w-md rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" placeholder="Cari kendaraan, pegawai..." value={keyword} onChange={e => setKeyword(e.target.value)} /></div>

            {/* Desktop */}
            <div className="hidden overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 lg:block">
                <table className="min-w-full divide-y divide-stone-200 text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700 text-left text-gray-500"><tr>
                        <th className="px-4 py-3 font-medium">Tanggal</th><th className="px-4 py-3 font-medium">Kendaraan</th><th className="px-4 py-3 font-medium">Jenis</th>
                        <th className="px-4 py-3 font-medium">Biaya</th><th className="px-4 py-3 font-medium">Bukti</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Aksi</th>
                    </tr></thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-gray-700">
                        {filtered.length ? filtered.map(item => (
                            <tr key={item.id}>
                                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{item.tanggal_servis}</td>
                                <td className="px-4 py-3"><p className="font-medium text-gray-900 dark:text-gray-100">{item.kendaraan?.merk_tipe || '-'}</p><p className="text-xs text-gray-400">{item.kendaraan?.nomor_polisi}</p></td>
                                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{jenisOptions[item.jenis_servis] || item.jenis_servis}</td>
                                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">Rp {Number(item.biaya).toLocaleString('id-ID')}</td>
                                <td className="px-4 py-3">{item.bukti_files?.length ? <button onClick={() => setShowBukti(item)} className="text-xs text-blue-600 hover:underline">📎 {item.bukti_files.length}</button> : '-'}</td>
                                <td className="px-4 py-3">{statusBadge(item.status)}</td>
                                <td className="px-4 py-3"><div className="flex gap-1">
                                    <button onClick={() => setShowUpload(item.id)} className="rounded-lg border px-2 py-1 text-xs">Upload</button>
                                    <button onClick={() => handleDelete(item)} className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600">Hapus</button>
                                </div></td>
                            </tr>
                        )) : <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-500">Belum ada data.</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* Mobile */}
            <div className="lg:hidden space-y-3">
                {filtered.length ? filtered.map(item => (
                    <div key={item.id} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
                        <div className="flex justify-between mb-2"><div><p className="font-medium text-gray-900 dark:text-gray-100">{item.kendaraan?.merk_tipe}</p><p className="text-xs text-gray-400">{item.kendaraan?.nomor_polisi}</p></div>{statusBadge(item.status)}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                            <p>{item.tanggal_servis} — {jenisOptions[item.jenis_servis] || item.jenis_servis}</p>
                            <p>Biaya: Rp {Number(item.biaya).toLocaleString('id-ID')}</p>
                            {item.bukti_files?.length > 0 && <button onClick={() => setShowBukti(item)} className="text-xs text-blue-600">📎 {item.bukti_files.length} bukti</button>}
                        </div>
                        <div className="mt-2 flex gap-2">
                            <button onClick={() => setShowUpload(item.id)} className="rounded-lg border px-3 py-2 text-xs">Upload</button>
                            <button onClick={() => handleDelete(item)} className="rounded-lg border border-red-200 px-3 py-2 text-xs text-red-600">Hapus</button>
                        </div>
                    </div>
                )) : <p className="text-center text-gray-500 py-8">Belum ada data.</p>}
            </div>

            {/* Bukti Modal */}
            {showBukti && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowBukti(null)}>
                <div className="w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl bg-white dark:bg-gray-800 p-6" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-4"><p className="text-lg font-semibold text-gray-900 dark:text-gray-100">Bukti Dukung</p><button onClick={() => setShowBukti(null)}>✕</button></div>
                    <div className="space-y-3">{(showBukti.bukti_files || []).map((path, i) => {
                        const isImg = /\.(jpg|jpeg|png)$/i.test(path);
                        return (<div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                            {isImg ? <img src={'/storage/' + path} className="w-20 h-20 object-cover rounded" /> : <span className="text-2xl">📄</span>}
                            <div className="flex-1"><p className="text-sm">{path.split('/').pop()}</p><a href={'/storage/' + path} target="_blank" className="text-xs text-blue-600">Lihat</a></div>
                            <button onClick={() => handleDeleteBukti(showBukti.id, path)} className="text-xs text-red-500">Hapus</button>
                        </div>);
                    })}</div>
                </div></div>
            )}

            {/* Upload Modal */}
            {showUpload && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowUpload(null)}>
                <form onSubmit={submitUpload} className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 p-6" onClick={e => e.stopPropagation()}>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Upload Bukti</p>
                    <input type="file" accept=".jpg,.jpeg,.png,.pdf" className="w-full text-sm" onChange={e => uploadForm.setData('bukti', e.target.files[0])} />
                    <InputError message={uploadForm.errors.bukti} />
                    <div className="mt-4 flex gap-2 justify-end">
                        <button type="button" onClick={() => setShowUpload(null)} className="rounded-xl border px-4 py-2 text-sm">Batal</button>
                        <button type="submit" disabled={uploadForm.processing} className="rounded-xl bg-primary px-4 py-2 text-sm text-white">{uploadForm.processing ? 'Uploading...' : 'Upload'}</button>
                    </div>
                </form>
            </div>)}
        </AppLayout>
    );
}
