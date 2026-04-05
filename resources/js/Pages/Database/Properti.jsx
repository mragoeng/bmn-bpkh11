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

const jenisIcon = (j) => j === 'Tanah' ? '🌍' : j === 'Bangunan' ? '🏢' : j === 'Rumah Negara' ? '🏠' : '🏗️';
const jenisColor = (j) => j === 'Tanah' ? 'bg-amber-50 text-amber-700' : j === 'Bangunan' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700';

export default function Properti({ properti, filters }) {
    const [editingId, setEditingId] = useState(null);
    const [keyword, setKeyword] = useState(filters?.search || '');
    const [detailId, setDetailId] = useState(null);

    const form = useForm({
        kode_barang: '', nup: '', nama_barang: '', jenis_properti: 'Tanah',
        tipe: '', kondisi: 'Baik', status_bmn: 'Aktif',
        nilai_perolehan: '', nilai_buku: '',
        luas_tanah: '', luas_bangunan: '', jumlah_lantai: '',
        alamat: '', kelurahan: '', kecamatan: '', kab_kota: '', provinsi: '', kode_pos: '',
        pengguna: '', status_penggunaan: '', no_sertifikat: '', status_sertifikasi: '',
        kode_register: '', tanggal_perolehan: '',
        foto_bergeotag: '', foto_url: '', keterangan: '',
    });

    const detailItem = properti.find(i => i.id === detailId);
    const filtered = properti.filter(item => {
        const q = keyword.toLowerCase();
        return (item.nama_barang || '').toLowerCase().includes(q) ||
            (item.kode_barang || '').toLowerCase().includes(q) ||
            (item.alamat || '').toLowerCase().includes(q) ||
            (item.pengguna || '').toLowerCase().includes(q) ||
            (item.jenis_properti || '').toLowerCase().includes(q);
    });

    const submit = (e) => {
        e.preventDefault();
        if (editingId) {
            form.put(route('properti.update', editingId), { preserveScroll: true, onSuccess: () => { setEditingId(null); form.reset(); } });
        } else {
            form.post(route('properti.store'), { preserveScroll: true, onSuccess: () => form.reset() });
        }
    };

    const editItem = (item) => {
        setEditingId(item.id); setDetailId(null);
        form.setData({
            kode_barang: item.kode_barang || '', nup: item.nup || '', nama_barang: item.nama_barang || '',
            jenis_properti: item.jenis_properti || 'Tanah', tipe: item.tipe || '',
            kondisi: item.kondisi || 'Baik', status_bmn: item.status_bmn || 'Aktif',
            nilai_perolehan: item.nilai_perolehan || '', nilai_buku: item.nilai_buku || '',
            luas_tanah: item.luas_tanah || '', luas_bangunan: item.luas_bangunan || '', jumlah_lantai: item.jumlah_lantai || '',
            alamat: item.alamat || '', kelurahan: item.kelurahan || '', kecamatan: item.kecamatan || '',
            kab_kota: item.kab_kota || '', provinsi: item.provinsi || '', kode_pos: item.kode_pos || '',
            pengguna: item.pengguna || '', status_penggunaan: item.status_penggunaan || '',
            no_sertifikat: item.no_sertifikat || '', status_sertifikasi: item.status_sertifikasi || '',
            kode_register: item.kode_register || '', tanggal_perolehan: item.tanggal_perolehan || '',
            foto_bergeotag: item.foto_bergeotag || '', foto_url: item.foto_url || '', keterangan: item.keterangan || '',
        });
    };

    const cancelEdit = () => { setEditingId(null); form.reset(); form.clearErrors(); };

    const kondisiBadge = (k) => {
        const c = { 'Baik': 'bg-green-50 text-green-700', 'Rusak Ringan': 'bg-yellow-50 text-yellow-700', 'Rusak Berat': 'bg-red-50 text-red-700' };
        return <span className={'inline-block rounded-full px-2 py-0.5 text-xs font-medium ' + (c[k] || 'bg-gray-50 text-gray-700')}>{k || '-'}</span>;
    };

    const ic = 'w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm';

    return (
        <AppLayout title="Database Properti" description="Tanah, Bangunan, dan Rumah Negara BMN">
            <Head title="Properti" />
            <div className="mb-6 space-y-6">
                <form onSubmit={submit} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 p-5">
                    <div className="mb-5 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">{editingId ? 'Edit Properti' : 'Tambah Properti'}</p>
                            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">Form master properti</p>
                        </div>
                        {editingId && <button type="button" onClick={cancelEdit} className="rounded-2xl border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-700 dark:text-gray-200">Batal</button>}
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div><label className="block text-xs text-gray-500 mb-1">Jenis Properti *</label><select className={ic} value={form.data.jenis_properti} onChange={e => form.setData('jenis_properti', e.target.value)}><option value="Tanah">Tanah</option><option value="Bangunan">Bangunan</option><option value="Rumah Negara">Rumah Negara</option></select></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Nama Barang *</label><input className={ic} placeholder="Tanah Bangunan RN Gol II..." value={form.data.nama_barang} onChange={e => form.setData('nama_barang', e.target.value)} /><InputError className="mt-1" message={form.errors.nama_barang} /></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Kode Barang</label><input className={ic} placeholder="2010101002" value={form.data.kode_barang} onChange={e => form.setData('kode_barang', e.target.value)} /></div>
                        <div><label className="block text-xs text-gray-500 mb-1">NUP</label><input type="number" className={ic} value={form.data.nup} onChange={e => form.setData('nup', e.target.value)} /></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Tipe</label><input className={ic} placeholder="120, 70..." value={form.data.tipe} onChange={e => form.setData('tipe', e.target.value)} /></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Kondisi</label><select className={ic} value={form.data.kondisi} onChange={e => form.setData('kondisi', e.target.value)}><option>Baik</option><option>Rusak Ringan</option><option>Rusak Berat</option></select></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Status BMN</label><select className={ic} value={form.data.status_bmn} onChange={e => form.setData('status_bmn', e.target.value)}><option>Aktif</option><option>Tidak Aktif</option></select></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Nilai Perolehan</label><input type="number" className={ic} value={form.data.nilai_perolehan} onChange={e => form.setData('nilai_perolehan', e.target.value)} /></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Nilai Buku</label><input type="number" className={ic} value={form.data.nilai_buku} onChange={e => form.setData('nilai_buku', e.target.value)} /></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Luas Tanah (m2)</label><input type="number" step="0.01" className={ic} value={form.data.luas_tanah} onChange={e => form.setData('luas_tanah', e.target.value)} /></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Luas Bangunan (m2)</label><input type="number" step="0.01" className={ic} value={form.data.luas_bangunan} onChange={e => form.setData('luas_bangunan', e.target.value)} /></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Jumlah Lantai</label><input type="number" className={ic} value={form.data.jumlah_lantai} onChange={e => form.setData('jumlah_lantai', e.target.value)} /></div>
                        <div className="md:col-span-3"><label className="block text-xs text-gray-500 mb-1">Alamat</label><input className={ic} placeholder="JL. ..." value={form.data.alamat} onChange={e => form.setData('alamat', e.target.value)} /></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Kelurahan</label><input className={ic} value={form.data.kelurahan} onChange={e => form.setData('kelurahan', e.target.value)} /></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Kecamatan</label><input className={ic} value={form.data.kecamatan} onChange={e => form.setData('kecamatan', e.target.value)} /></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Kab/Kota</label><input className={ic} value={form.data.kab_kota} onChange={e => form.setData('kab_kota', e.target.value)} /></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Pengguna</label><input className={ic} value={form.data.pengguna} onChange={e => form.setData('pengguna', e.target.value)} /></div>
                        <div><label className="block text-xs text-gray-500 mb-1">No Sertifikat</label><input className={ic} value={form.data.no_sertifikat} onChange={e => form.setData('no_sertifikat', e.target.value)} /></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Status Sertifikasi</label><input className={ic} value={form.data.status_sertifikasi} onChange={e => form.setData('status_sertifikasi', e.target.value)} /></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Kode Register</label><input className={ic} value={form.data.kode_register} onChange={e => form.setData('kode_register', e.target.value)} /></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Tgl Perolehan</label><input type="date" className={ic} value={form.data.tanggal_perolehan} onChange={e => form.setData('tanggal_perolehan', e.target.value)} /></div>
                        <div className="md:col-span-2"><label className="block text-xs text-gray-500 mb-1">URL Foto</label><input className={ic} value={form.data.foto_url} onChange={e => form.setData('foto_url', e.target.value)} /></div>
                        <div className="md:col-span-3"><label className="block text-xs text-gray-500 mb-1">Keterangan</label><textarea rows="2" className={ic} value={form.data.keterangan} onChange={e => form.setData('keterangan', e.target.value)} /></div>
                    </div>
                    <button type="submit" disabled={form.processing} className="mt-5 rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-white disabled:opacity-60">{form.processing ? 'Menyimpan...' : editingId ? 'Update' : 'Simpan'}</button>
                </form>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 p-5"><p className="text-sm text-gray-500">Total</p><p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">{properti.length}</p></div>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-amber-50 p-5"><p className="text-sm text-gray-500">🌍 Tanah</p><p className="mt-2 text-3xl font-semibold text-amber-600">{properti.filter(i=>i.jenis_properti==='Tanah').length}</p></div>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-blue-50 p-5"><p className="text-sm text-gray-500">🏢 Bangunan</p><p className="mt-2 text-3xl font-semibold text-blue-600">{properti.filter(i=>i.jenis_properti==='Bangunan').length}</p></div>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-purple-50 p-5"><p className="text-sm text-gray-500">🏠 Rumah Negara</p><p className="mt-2 text-3xl font-semibold text-purple-600">{properti.filter(i=>i.jenis_properti==='Rumah Negara').length}</p></div>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5"><input className={ic} placeholder="Cari properti..." value={keyword} onChange={e => setKeyword(e.target.value)} /></div>
                </div>

                {detailItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDetailId(null)}>
                        <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-gray-800 shadow-xl" onClick={e => e.stopPropagation()}>
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl">{jenisIcon(detailItem.jenis_properti)}</span>
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{detailItem.nama_barang}</h2>
                                            <span className={'inline-block rounded-full px-2 py-0.5 text-xs font-medium ' + jenisColor(detailItem.jenis_properti)}>{detailItem.jenis_properti}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => setDetailId(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                                </div>
                                {detailItem.foto_url && (
                                    <div className="mb-4 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
                                        <img src={driveImgUrl(detailItem.foto_url)} alt={detailItem.nama_barang} className="w-full max-h-64 object-cover" onError={e => { e.target.style.display='none'; }} />
                                    </div>
                                )}
                                <div className="grid gap-3 sm:grid-cols-2 text-sm">
                                    <div><span className="text-gray-400">Kode Barang / NUP</span><p className="font-semibold text-gray-900 dark:text-gray-100">{detailItem.kode_barang || '-'} / {detailItem.nup || '-'}</p></div>
                                    <div><span className="text-gray-400">Kondisi</span><p>{kondisiBadge(detailItem.kondisi)}</p></div>
                                    <div><span className="text-gray-400">Status BMN</span><p className="font-semibold text-gray-900 dark:text-gray-100">{detailItem.status_bmn}</p></div>
                                    <div><span className="text-gray-400">Tipe</span><p className="font-semibold text-gray-900 dark:text-gray-100">{detailItem.tipe || '-'}</p></div>
                                    <div><span className="text-gray-400">Luas Tanah</span><p className="font-semibold text-gray-900 dark:text-gray-100">{detailItem.luas_tanah ? Number(detailItem.luas_tanah).toLocaleString() + ' m\u00B2' : '-'}</p></div>
                                    <div><span className="text-gray-400">Luas Bangunan</span><p className="font-semibold text-gray-900 dark:text-gray-100">{detailItem.luas_bangunan ? Number(detailItem.luas_bangunan).toLocaleString() + ' m\u00B2' : '-'}</p></div>
                                    <div><span className="text-gray-400">Jumlah Lantai</span><p className="font-semibold text-gray-900 dark:text-gray-100">{detailItem.jumlah_lantai || '-'}</p></div>
                                    <div><span className="text-gray-400">Pengguna</span><p className="font-semibold text-gray-900 dark:text-gray-100">{detailItem.pengguna || '-'}</p></div>
                                    <div className="sm:col-span-2"><span className="text-gray-400">Alamat</span><p className="font-semibold text-gray-900 dark:text-gray-100">{detailItem.alamat || '-'}</p><p className="text-gray-500 text-xs">{[detailItem.kelurahan, detailItem.kecamatan, detailItem.kab_kota, detailItem.provinsi].filter(Boolean).join(', ')}</p></div>
                                    <div><span className="text-gray-400">Nilai Perolehan</span><p className="font-semibold text-emerald-600">{formatRupiah(detailItem.nilai_perolehan)}</p></div>
                                    <div><span className="text-gray-400">Nilai Buku</span><p className="font-semibold text-blue-600">{formatRupiah(detailItem.nilai_buku)}</p></div>
                                    <div><span className="text-gray-400">Sertifikasi</span><p className="font-semibold text-gray-900 dark:text-gray-100">{detailItem.status_sertifikasi || '-'}</p></div>
                                    <div><span className="text-gray-400">No Sertifikat</span><p className="font-semibold text-gray-900 dark:text-gray-100 text-xs">{detailItem.no_sertifikat || '-'}</p></div>
                                    <div><span className="text-gray-400">Kode Register</span><p className="font-semibold text-gray-900 dark:text-gray-100 text-xs break-all">{detailItem.kode_register || '-'}</p></div>
                                    <div><span className="text-gray-400">Tgl Perolehan</span><p className="font-semibold text-gray-900 dark:text-gray-100">{detailItem.tanggal_perolehan || '-'}</p></div>
                                    {detailItem.keterangan && <div className="sm:col-span-2"><span className="text-gray-400">Keterangan</span><p className="text-gray-700 dark:text-gray-300">{detailItem.keterangan}</p></div>}
                                </div>
                                <div className="mt-6 flex gap-2">
                                    <button type="button" onClick={() => { editItem(detailItem); setDetailId(null); }} className="rounded-2xl border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200">Edit</button>
                                    <button type="button" onClick={() => setDetailId(null)} className="rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-white">Tutup</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.length ? filtered.map(item => (
                        <article key={item.id} className="group cursor-pointer rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden hover:shadow-lg transition-shadow" onClick={() => setDetailId(item.id)}>
                            <div className="h-32 bg-gray-100 dark:bg-gray-700 relative overflow-hidden flex items-center justify-center">
                                <span className="text-4xl">{jenisIcon(item.jenis_properti)}</span>
                                <div className="absolute top-2 right-2"><span className={'inline-block rounded-full px-2 py-0.5 text-xs font-medium ' + jenisColor(item.jenis_properti)}>{item.jenis_properti}</span></div>
                                <div className="absolute top-2 left-2">{kondisiBadge(item.kondisi)}</div>
                            </div>
                            <div className="p-4">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{item.nama_barang}</h3>
                                <p className="text-xs text-gray-500 mt-1 truncate">{item.alamat || '-'}</p>
                                <div className="mt-2 flex items-center justify-between">
                                    <p className="text-xs font-medium text-primary">{item.kode_barang}.{item.nup}</p>
                                    {item.luas_tanah && <p className="text-xs text-gray-500">{Number(item.luas_tanah).toLocaleString()} m2</p>}
                                </div>
                                {item.pengguna && <p className="mt-1 text-xs text-gray-500 truncate">👤 {item.pengguna}</p>}
                                {item.nilai_perolehan && <p className="mt-1 text-xs font-medium text-emerald-600">{formatRupiah(item.nilai_perolehan)}</p>}
                            </div>
                        </article>
                    )) : (
                        <div className="col-span-full rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-8 text-center text-sm text-gray-500">Belum ada data properti.</div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
