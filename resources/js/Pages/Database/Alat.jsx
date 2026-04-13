import AppLayout from '@/Layouts/AppLayout';
import InputError from '@/Components/InputError';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

const formatRupiah = (num) => {
    if (!num) return '-';
    return 'Rp ' + Number(num).toLocaleString('id-ID');
};

const driveImgUrl = (url) => {
    if (!url) return '';
    const m = url.match(/\/file\/d\/([\w-]+)/);
    if (m) return 'https://lh3.googleusercontent.com/d/' + m[1];
    if (url.includes('lh3.googleusercontent.com')) return url;
    if (url.includes('drive.google.com/uc')) {
        const m2 = url.match(/id=([\w-]+)/);
        if (m2) return 'https://lh3.googleusercontent.com/d/' + m2[1];
    }
    return url;
};

const isFilename = (val) => {
    if (!val) return false;
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(val) && !val.startsWith('http');
};

export default function Alat({ alat, pegawaiOptions }) {
    const [editingId, setEditingId] = useState(null);
    const [keyword, setKeyword] = useState('');
    const [detailId, setDetailId] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const form = useForm({
        kode_barang: '',
        nup: '',
        nama_barang: '',
        merk: '',
        tipe: '',
        kode_register: '',
        kondisi: 'Baik',
        status_bmn: 'Aktif',
        nilai_perolehan: '',
        lokasi: 'GK 07 - Ruang Penyimpanan Alat Ukur',
        foto_url: '',
        foto_bergeotag: '',
        status: 'tersedia',
        keterangan: '',
    });

    const detailItem = alat.find((i) => i.id === detailId);

    const filteredAlat = alat.filter((item) => {
        const query = keyword.toLowerCase();
        return (
            (item.nama_barang || '').toLowerCase().includes(query) ||
            (item.merk || '').toLowerCase().includes(query) ||
            (item.tipe || '').toLowerCase().includes(query) ||
            (item.kode_barang || '').toLowerCase().includes(query) ||
            (item.lokasi || '').toLowerCase().includes(query)
        );
    });

    const statsTotal = alat.length;
    const statsTersedia = alat.filter((i) => i.status === 'tersedia').length;
    const statsDipinjam = alat.filter((i) => i.status === 'dipinjam').length;
    const statsMaintenance = alat.filter((i) => i.status === 'maintenance').length;
    const statsBaik = alat.filter((i) => i.kondisi === 'Baik').length;
    const statsRusakRingan = alat.filter((i) => i.kondisi === 'Rusak Ringan').length;
    const statsRusakBerat = alat.filter((i) => i.kondisi === 'Rusak Berat').length;

    const submit = (event) => {
        event.preventDefault();
        if (editingId) {
            form.put(route('database.alat.update', editingId), {
                preserveScroll: true,
                onSuccess: () => { setEditingId(null); form.reset(); form.setData('kondisi', 'Baik'); form.setData('status_bmn', 'Aktif'); form.setData('status', 'tersedia'); form.setData('lokasi', 'GK 07 - Ruang Penyimpanan Alat Ukur'); setShowForm(false); },
            });
            return;
        }
        form.post(route('database.alat.store'), {
            preserveScroll: true,
            onSuccess: () => { form.reset(); form.setData('kondisi', 'Baik'); form.setData('status_bmn', 'Aktif'); form.setData('status', 'tersedia'); form.setData('lokasi', 'GK 07 - Ruang Penyimpanan Alat Ukur'); setShowForm(false); },
        });
    };

    const editAlat = (item) => {
        setEditingId(item.id);
        setDetailId(null);
        setShowForm(true);
        form.setData({
            kode_barang: item.kode_barang || '',
            nup: item.nup || '',
            nama_barang: item.nama_barang || '',
            merk: item.merk || '',
            tipe: item.tipe || '',
            kode_register: item.kode_register || '',
            kondisi: item.kondisi || 'Baik',
            status_bmn: item.status_bmn || 'Aktif',
            nilai_perolehan: item.nilai_perolehan || '',
            lokasi: item.lokasi || 'GK 07 - Ruang Penyimpanan Alat Ukur',
            foto_url: item.foto_url || '',
            foto_bergeotag: item.foto_bergeotag || '',
            status: item.status || 'tersedia',
            keterangan: item.keterangan || '',
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        form.reset();
        form.setData('kondisi', 'Baik');
        form.setData('status_bmn', 'Aktif');
        form.setData('status', 'tersedia');
        form.setData('lokasi', 'GK 07 - Ruang Penyimpanan Alat Ukur');
        form.clearErrors();
        setShowForm(false);
    };

    const handleDelete = (item) => {
        if (confirm('Hapus alat "' + item.nama_barang + '"?')) {
            router.delete(route('database.alat.destroy', item.id), { preserveScroll: true });
        }
    };

    const kondisiBadge = (kondisi) => {
        const colors = { 'Baik': 'bg-green-50 text-green-700', 'Rusak Ringan': 'bg-yellow-50 text-yellow-700', 'Rusak Berat': 'bg-red-50 text-red-700' };
        return <span className={'inline-block rounded-full px-2 py-0.5 text-xs font-medium ' + (colors[kondisi] || 'bg-gray-50 text-gray-700')}>{kondisi || '-'}</span>;
    };

    const statusBadge = (status) => {
        const colors = { 'tersedia': 'bg-emerald-50 text-emerald-700', 'dipinjam': 'bg-amber-50 text-amber-700', 'maintenance': 'bg-slate-100 text-slate-600' };
        const labels = { 'tersedia': 'Tersedia', 'dipinjam': 'Dipinjam', 'maintenance': 'Maintenance' };
        return <span className={'inline-block rounded-full px-2 py-0.5 text-xs font-medium ' + (colors[status] || 'bg-gray-50 text-gray-700')}>{labels[status] || status}</span>;
    };

    const renderFoto = (item) => {
        if (item.foto_url) {
            return <img src={driveImgUrl(item.foto_url)} alt={item.nama_barang} className="w-full h-full object-cover group-hover:scale-105 transition-transform" onError={e => { e.target.style.display = 'none'; e.target.nextSibling && (e.target.nextSibling.style.display = 'flex'); }} />;
        }
        if (item.foto_bergeotag) {
            if (isFilename(item.foto_bergeotag)) {
                return <div className="flex items-center justify-center h-full text-5xl">📷</div>;
            }
            return <img src={driveImgUrl(item.foto_bergeotag)} alt={item.nama_barang} className="w-full h-full object-cover group-hover:scale-105 transition-transform" onError={e => { e.target.style.display = 'none'; }} />;
        }
        return <div className="flex items-center justify-center h-full text-5xl">🔧</div>;
    };

    return (
        <AppLayout title="Database Alat Ukur" description="Master data alat ukur beserta informasi BMN dan status peminjaman."
            actions={<>
                <button type="button" onClick={() => { if (showForm) cancelEdit(); else setShowForm(true); }} className="rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-white">{showForm ? 'Tutup Form' : '+ Alat Baru'}</button>
            </>}
        >
            <Head title="Alat Ukur" />

            <div className="mb-6 space-y-6">
                {/* Form */}
                {showForm && (
                <form onSubmit={submit} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 p-5">
                    <div className="mb-5 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{editingId ? 'Edit Alat' : 'Tambah Alat'}</p>
                            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">Form master alat ukur</p>
                        </div>
                        <button type="button" onClick={cancelEdit} className="rounded-full p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-lg">✕</button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div><label className="block text-xs text-gray-500 mb-1">Nama Barang *</label><input className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" placeholder="Theodolite, Total Station..." value={form.data.nama_barang} onChange={e => form.setData('nama_barang', e.target.value)} /><InputError className="mt-1" message={form.errors.nama_barang} /></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Merk</label><input className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" placeholder="Topcon, Nikon, Leica..." value={form.data.merk} onChange={e => form.setData('merk', e.target.value)} /></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Tipe</label><input className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" placeholder="ES-103, DS-32..." value={form.data.tipe} onChange={e => form.setData('tipe', e.target.value)} /></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Kode Barang BMN</label><input className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" placeholder="3020101002" value={form.data.kode_barang} onChange={e => form.setData('kode_barang', e.target.value)} /></div>
                        <div><label className="block text-xs text-gray-500 mb-1">NUP</label><input type="number" className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" placeholder="1" value={form.data.nup} onChange={e => form.setData('nup', e.target.value)} /></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Kode Register</label><input className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" placeholder="Kode Register" value={form.data.kode_register} onChange={e => form.setData('kode_register', e.target.value)} /></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Kondisi</label><select className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" value={form.data.kondisi} onChange={e => form.setData('kondisi', e.target.value)}><option value="Baik">Baik</option><option value="Rusak Ringan">Rusak Ringan</option><option value="Rusak Berat">Rusak Berat</option></select></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Status BMN</label><select className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" value={form.data.status_bmn} onChange={e => form.setData('status_bmn', e.target.value)}><option value="Aktif">Aktif</option><option value="Tidak Aktif">Tidak Aktif</option></select></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Status</label><select className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" value={form.data.status} onChange={e => form.setData('status', e.target.value)}><option value="tersedia">Tersedia</option><option value="dipinjam">Dipinjam</option><option value="maintenance">Maintenance</option></select></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Nilai Perolehan</label><input type="number" className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" placeholder="15000000" value={form.data.nilai_perolehan} onChange={e => form.setData('nilai_perolehan', e.target.value)} /></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Lokasi</label><input className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" placeholder="GK 07 - Ruang Penyimpanan Alat Ukur" value={form.data.lokasi} onChange={e => form.setData('lokasi', e.target.value)} /></div>
                        <div><label className="block text-xs text-gray-500 mb-1">URL Foto (Google Drive)</label><input className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" placeholder="https://drive.google.com/file/d/.../view" value={form.data.foto_url} onChange={e => form.setData('foto_url', e.target.value)} /></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Foto Berveotag</label><input className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" placeholder="URL Drive atau nama file" value={form.data.foto_bergeotag} onChange={e => form.setData('foto_bergeotag', e.target.value)} /></div>
                        <div className="md:col-span-3"><label className="block text-xs text-gray-500 mb-1">Keterangan</label><textarea rows="2" className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" placeholder="Catatan tambahan" value={form.data.keterangan} onChange={e => form.setData('keterangan', e.target.value)} /></div>
                    </div>
                    <div className="mt-5 flex gap-2">
                        <button type="submit" disabled={form.processing} className="rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-white disabled:opacity-60">{form.processing ? 'Menyimpan...' : editingId ? 'Update Alat' : 'Simpan Alat'}</button>
                        {editingId && <button type="button" onClick={cancelEdit} className="rounded-2xl border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-700 dark:text-gray-200">Batal</button>}
                    </div>
                </form>
                )}

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 p-5"><p className="text-sm text-gray-500">Total Alat</p><p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">{statsTotal}</p></div>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 p-5"><p className="text-sm text-gray-500">Tersedia</p><p className="mt-2 text-3xl font-semibold text-emerald-600">{statsTersedia}</p></div>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 p-5"><p className="text-sm text-gray-500">Dipinjam</p><p className="mt-2 text-3xl font-semibold text-amber-600">{statsDipinjam}</p></div>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 p-5">
                        <p className="text-sm text-gray-500 mb-2">Kondisi</p>
                        <div className="flex flex-wrap gap-2 text-xs">
                            <span className="rounded-full bg-green-50 px-2 py-1 text-green-700 font-medium">Baik: {statsBaik}</span>
                            <span className="rounded-full bg-yellow-50 px-2 py-1 text-yellow-700 font-medium">Ringan: {statsRusakRingan}</span>
                            <span className="rounded-full bg-red-50 px-2 py-1 text-red-700 font-medium">Berat: {statsRusakBerat}</span>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <input className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" placeholder="Cari nama, merk, kode barang..." value={keyword} onChange={e => setKeyword(e.target.value)} />
                    <p className="flex items-center text-sm text-gray-500">{filteredAlat.length} dari {alat.length} alat</p>
                </div>

                {/* Detail Modal */}
                {detailItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDetailId(null)}>
                        <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-gray-800 shadow-xl" onClick={e => e.stopPropagation()}>
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{detailItem.nama_barang}</h2>
                                    <button onClick={() => setDetailId(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                                </div>
                                {/* Foto preview */}
                                <div className="mb-4 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 h-48 bg-gray-100 dark:bg-gray-700 relative">
                                    {detailItem.foto_url ? (
                                        <img src={driveImgUrl(detailItem.foto_url)} alt={detailItem.nama_barang} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; e.target.nextSibling && (e.target.nextSibling.style.display = 'flex'); }} />
                                    ) : null}
                                    {!detailItem.foto_url && detailItem.foto_bergeotag && !isFilename(detailItem.foto_bergeotag) ? (
                                        <img src={driveImgUrl(detailItem.foto_bergeotag)} alt={detailItem.nama_barang} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
                                    ) : null}
                                    {(!detailItem.foto_url && (!detailItem.foto_bergeotag || isFilename(detailItem.foto_bergeotag))) && (
                                        <div className="flex items-center justify-center h-full text-5xl">🔧</div>
                                    )}
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2 text-sm">
                                    <div><span className="text-gray-400">Merk</span><p className="font-semibold text-gray-900 dark:text-gray-100">{detailItem.merk || '-'}</p></div>
                                    <div><span className="text-gray-400">Tipe</span><p className="font-semibold text-gray-900 dark:text-gray-100">{detailItem.tipe || '-'}</p></div>
                                    <div><span className="text-gray-400">Kode Barang</span><p className="font-semibold text-gray-900 dark:text-gray-100">{detailItem.kode_barang || '-'}</p></div>
                                    <div><span className="text-gray-400">NUP</span><p className="font-semibold text-gray-900 dark:text-gray-100">{detailItem.nup || '-'}</p></div>
                                    <div><span className="text-gray-400">Kode Register</span><p className="font-semibold text-gray-900 dark:text-gray-100">{detailItem.kode_register || '-'}</p></div>
                                    <div><span className="text-gray-400">Kondisi</span><p>{kondisiBadge(detailItem.kondisi)}</p></div>
                                    <div><span className="text-gray-400">Status BMN</span><p className="font-semibold text-gray-900 dark:text-gray-100">{detailItem.status_bmn || '-'}</p></div>
                                    <div><span className="text-gray-400">Status</span><p>{statusBadge(detailItem.status)}</p></div>
                                    <div className="sm:col-span-2"><span className="text-gray-400">Nilai Perolehan</span><p className="font-semibold text-emerald-600">{formatRupiah(detailItem.nilai_perolehan)}</p></div>
                                    <div className="sm:col-span-2"><span className="text-gray-400">Lokasi</span><p className="font-semibold text-gray-900 dark:text-gray-100">{detailItem.lokasi || '-'}</p></div>
                                    {detailItem.foto_bergeotag && (
                                        <div className="sm:col-span-2">
                                            <span className="text-gray-400">Foto Berveotag</span>
                                            {isFilename(detailItem.foto_bergeotag) ? (
                                                <p className="font-semibold text-gray-900 dark:text-gray-100">📷 {detailItem.foto_bergeotag}</p>
                                            ) : (
                                                <div className="mt-1 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                                    <img src={driveImgUrl(detailItem.foto_bergeotag)} alt="Foto Berveotag" className="max-h-64 object-contain" onError={e => { e.target.style.display = 'none'; }} />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {detailItem.keterangan && <div className="sm:col-span-2"><span className="text-gray-400">Keterangan</span><p className="text-gray-700 dark:text-gray-300">{detailItem.keterangan}</p></div>}
                                </div>
                                <div className="mt-6 flex gap-2">
                                    <button type="button" onClick={() => { editAlat(detailItem); setDetailId(null); }} className="rounded-2xl border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200">Edit</button>
                                    <button type="button" onClick={() => setDetailId(null)} className="rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-white">Tutup</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Card Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredAlat.length ? filteredAlat.map(item => (
                        <article key={item.id} className="group cursor-pointer rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden hover:shadow-lg transition-shadow" onClick={() => setDetailId(item.id)}>
                            <div className="h-36 bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
                                {renderFoto(item)}
                                <div className="absolute top-2 right-2 flex gap-1">
                                    {statusBadge(item.status)}
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{item.nama_barang}</h3>
                                {(item.merk || item.tipe) && <p className="mt-1 text-xs text-gray-500 truncate">{[item.merk, item.tipe].filter(Boolean).join(' - ')}</p>}
                                {(item.kode_barang || item.nup) && <p className="mt-1 text-xs text-gray-400 truncate">{[item.kode_barang, item.nup ? 'NUP ' + item.nup : null].filter(Boolean).join(' · ')}</p>}
                                <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                                    {kondisiBadge(item.kondisi)}
                                </div>
                                {item.nilai_perolehan && <p className="mt-2 text-xs font-medium text-emerald-600">{formatRupiah(item.nilai_perolehan)}</p>}
                                {item.lokasi && <p className="mt-1 text-xs text-gray-400 truncate">📍 {item.lokasi}</p>}
                            </div>
                        </article>
                    )) : (
                        <div className="col-span-full rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-8 text-center text-sm text-gray-500">Tidak ada alat ditemukan.</div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
