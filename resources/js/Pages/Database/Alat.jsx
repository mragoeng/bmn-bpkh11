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
    const m2 = url.match(/id=([\w-]+)/);
    if (m2) return 'https://lh3.googleusercontent.com/d/' + m2[1];
    return url;
};

export default function Alat({ alat, pegawaiOptions }) {
    const [editingId, setEditingId] = useState(null);
    const [keyword, setKeyword] = useState('');
    const [detailId, setDetailId] = useState(null);

    const form = useForm({
        kode_barang: '',
        nup: '',
        nama_barang: '',
        merk: '',
        tipe: '',
        kondisi: 'Baik',
        status_bmn: 'Aktif',
        nilai_perolehan: '',
        kode_register: '',
        lokasi: 'GK 07 - Ruang Penyimpanan Alat Ukur',
        foto_url: '',
        foto_bergeotag: '',
        keterangan: '',
    });

    const detailItem = alat.find((i) => i.id === detailId);
    const filteredAlat = alat.filter((item) => {
        const query = keyword.toLowerCase();
        return (
            (item.kode_barang || '').toLowerCase().includes(query) ||
            (item.nama_barang || '').toLowerCase().includes(query) ||
            item.merk.toLowerCase().includes(query) ||
            (item.tipe || '').toLowerCase().includes(query)
        );
    });

    const submit = (event) => {
        event.preventDefault();
        if (editingId) {
            form.put(route('database.alat.update', editingId), {
                preserveScroll: true,
                onSuccess: () => { setEditingId(null); form.reset(); },
            });
            return;
        }
        form.post(route('database.alat.store'), {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    const editAlat = (item) => {
        setEditingId(item.id);
        setDetailId(null);
        form.setData({
            kode_barang: item.kode_barang || '',
            nup: item.nup || '',
            nama_barang: item.nama_barang || '',
            merk: item.merk || '',
            tipe: item.tipe || '',
            kondisi: item.kondisi || 'Baik',
            status_bmn: item.status_bmn || 'Aktif',
            nilai_perolehan: item.nilai_perolehan || '',
            kode_register: item.kode_register || '',
            lokasi: item.lokasi || '',
            foto_url: item.foto_url || '',
            foto_bergeotag: item.foto_bergeotag || '',
            keterangan: item.keterangan || '',
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        form.reset();
        form.clearErrors();
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

    const alatIcon = (nama) => {
        const n = nama.toLowerCase();
        if (n.includes('gps')) return '📡';
        if (n.includes('kompas')) return '🧭';
        if (n.includes('camera') || n.includes('kamera')) return '📷';
        if (n.includes('drone') || n.includes('udara')) return '🚁';
        if (n.includes('theodolite')) return '📐';
        if (n.includes('clinometer')) return '📏';
        if (n.includes('spiegel') || n.includes('relascope')) return '🔭';
        if (n.includes('hammer')) return '🔨';
        if (n.includes('tablet') || n.includes('pc')) return '📱';
        if (n.includes('software') || n.includes('lisensi')) return '💿';
        return '🔧';
    };

    return (
        <AppLayout title="Database Alat Ukur" description="Master alat ukur BMN beserta peminjaman."
            actions={<button type="button" onClick={cancelEdit} className="rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-white">Form Baru</button>}
        >
            <Head title="Alat" />
            <div className="mb-6 space-y-6">
                {/* Form */}
                <form onSubmit={submit} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 p-5">
                    <div className="mb-5 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">{editingId ? 'Edit Alat' : 'Tambah Alat'}</p>
                            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">Form master alat</p>
                        </div>
                        {editingId && <button type="button" onClick={cancelEdit} className="rounded-2xl border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-700 dark:text-gray-200">Batal</button>}
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div><label className="block text-xs text-gray-500 mb-1">Kode Barang BMN</label><input className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" placeholder="3020101002" value={form.data.kode_barang} onChange={e => form.setData('kode_barang', e.target.value)} /></div>
                        <div><label className="block text-xs text-gray-500 mb-1">NUP</label><input type="number" className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" placeholder="1" value={form.data.nup} onChange={e => form.setData('nup', e.target.value)} /></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Nama Alat *</label><input className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" placeholder="GPS Receiver, Distance Meter..." value={form.data.nama_barang} onChange={e => form.setData('nama_barang', e.target.value)} /><InputError className="mt-1" message={form.errors.nama_barang} /></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Merk</label><input className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" placeholder="Leica, Nikon..." value={form.data.merk} onChange={e => form.setData('merk', e.target.value)} /></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Tipe</label><input className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" placeholder="Disto D2" value={form.data.tipe} onChange={e => form.setData('tipe', e.target.value)} /></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Lokasi</label><input className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" value={form.data.lokasi} onChange={e => form.setData('lokasi', e.target.value)} /></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Kondisi</label><select className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" value={form.data.kondisi} onChange={e => form.setData('kondisi', e.target.value)}><option value="Baik">Baik</option><option value="Rusak Ringan">Rusak Ringan</option><option value="Rusak Berat">Rusak Berat</option></select></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Status BMN</label><select className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" value={form.data.status_bmn} onChange={e => form.setData('status_bmn', e.target.value)}><option value="Aktif">Aktif</option><option value="Tidak Aktif">Tidak Aktif</option></select></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Nilai Perolehan</label><input type="number" className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" placeholder="369900000" value={form.data.nilai_perolehan} onChange={e => form.setData('nilai_perolehan', e.target.value)} /></div>
                        <div className="md:col-span-2"><label className="block text-xs text-gray-500 mb-1">URL Foto (Google Drive)</label><input className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" placeholder="https://drive.google.com/file/d/.../view" value={form.data.foto_url} onChange={e => form.setData('foto_url', e.target.value)} /></div>
                        <div className="md:col-span-3"><label className="block text-xs text-gray-500 mb-1">Keterangan</label><textarea rows="2" className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" placeholder="Catatan" value={form.data.keterangan} onChange={e => form.setData('keterangan', e.target.value)} /></div>
                    </div>
                    <button type="submit" disabled={form.processing} className="mt-5 rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-white disabled:opacity-60">
                        {form.processing ? 'Menyimpan...' : editingId ? 'Update Alat' : 'Simpan Alat'}
                    </button>
                </form>

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 p-5"><p className="text-sm text-gray-500">Total Alat</p><p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">{alat.length}</p></div>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-emerald-50 p-5"><p className="text-sm text-gray-500">Tersedia</p><p className="mt-2 text-3xl font-semibold text-emerald-600">{alat.filter(i => i.status === 'tersedia').length}</p></div>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-blue-50 p-5"><p className="text-sm text-gray-500">Dipinjam</p><p className="mt-2 text-3xl font-semibold text-blue-600">{alat.filter(i => i.status === 'dipinjam').length}</p></div>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5"><input className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" placeholder="Cari alat..." value={keyword} onChange={e => setKeyword(e.target.value)} /></div>
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
                                <div className="grid gap-3 sm:grid-cols-2 text-sm">
                                    <div><span className="text-gray-400">Merk / Tipe</span><p className="font-semibold text-gray-900 dark:text-gray-100">{detailItem.merk} {detailItem.tipe}</p></div>
                                    <div><span className="text-gray-400">Kode Barang</span><p className="font-semibold text-gray-900 dark:text-gray-100">{detailItem.kode_barang || '-'} {detailItem.nup ? 'NUP: ' + detailItem.nup : ''}</p></div>
                                    <div><span className="text-gray-400">Kondisi</span><p>{kondisiBadge(detailItem.kondisi)}</p></div>
                                    <div><span className="text-gray-400">Status BMN</span><p className="font-semibold text-gray-900 dark:text-gray-100">{detailItem.status_bmn}</p></div>
                                    <div><span className="text-gray-400">Status</span><p className={'font-semibold ' + (detailItem.status === 'tersedia' ? 'text-emerald-600' : 'text-blue-600')}>{detailItem.status}</p></div>
                                    <div className="sm:col-span-2"><span className="text-gray-400">Nilai Perolehan</span><p className="font-semibold text-emerald-600">{formatRupiah(detailItem.nilai_perolehan)}</p></div>
                                    <div><span className="text-gray-400">Lokasi</span><p className="font-semibold text-gray-900 dark:text-gray-100">{detailItem.lokasi || '-'}</p></div>
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
                            <div className="h-40 bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
                                {item.foto_url ? (
                                    <img src={driveImgUrl(item.foto_url)} alt={item.nama_barang} className="w-full h-full object-cover group-hover:scale-105 transition-transform" onError={e => { e.target.style.display = 'none'; }} />
                                ) : (
                                <div className="flex items-center justify-center h-full text-5xl">{alatIcon(item.nama_barang)}</div>
                                )}
                                <div className="absolute top-2 right-2 flex gap-1">{kondisiBadge(item.kondisi)}</div>
                            </div>
                            <div className="p-4">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{item.nama_barang}</h3>
                                <p className="text-xs text-gray-500">{item.merk} {item.tipe}</p>
                                <div className="mt-2 flex items-center justify-between">
                                    <p className="text-xs font-medium text-primary">{item.kode_barang}.{item.nup}</p>
                                    <span className={'text-xs font-medium ' + (item.status === 'tersedia' ? 'text-emerald-600' : 'text-blue-600')}>{item.status}</span>
                                </div>
                                {item.nilai_perolehan && <p className="mt-1 text-xs font-medium text-emerald-600">{formatRupiah(item.nilai_perolehan)}</p>}
                            </div>
                        </article>
                    )) : (
                        <div className="col-span-full rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-8 text-center text-sm text-gray-500">Belum ada data alat.</div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
