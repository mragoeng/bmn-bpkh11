import AppLayout from '@/Layouts/AppLayout';
import CsvImportCard from '@/Components/CsvImportCard';
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
    // already direct link
    if (url.includes('lh3.googleusercontent.com')) return url;
    if (url.includes('drive.google.com/uc')) {
        const m2 = url.match(/id=([\w-]+)/);
        if (m2) return 'https://lh3.googleusercontent.com/d/' + m2[1];
    }
    return url;
};

export default function Kendaraan({ kendaraan, pegawaiOptions }) {
    const [editingId, setEditingId] = useState(null);
    const [keyword, setKeyword] = useState('');
    const [showImport, setShowImport] = useState(false);
    const [detailId, setDetailId] = useState(null);

    const form = useForm({
        kode_kendaraan: '',
        kode_barang: '',
        nup: '',
        nama_barang: '',
        nomor_polisi: '',
        merk_tipe: '',
        jenis_kendaraan: 'roda_4',
        tahun: '',
        jenis_bbm_default: '',
        pegawai_id: '',
        kondisi: 'Baik',
        status_bmn: 'Aktif',
        nilai_perolehan: '',
        pengguna: '',
        foto_url: '',
        keterangan: '',
    });

    const detailItem = kendaraan.find((i) => i.id === detailId);

    const filteredKendaraan = kendaraan.filter((item) => {
        const query = keyword.toLowerCase();
        return (
            (item.kode_kendaraan || '').toLowerCase().includes(query) ||
            item.nomor_polisi.toLowerCase().includes(query) ||
            item.merk_tipe.toLowerCase().includes(query) ||
            (item.pengguna || '').toLowerCase().includes(query) ||
            (item.nama_barang || '').toLowerCase().includes(query)
        );
    });

    const submit = (event) => {
        event.preventDefault();
        if (editingId) {
            form.put(route('database.kendaraan.update', editingId), {
                preserveScroll: true,
                onSuccess: () => { setEditingId(null); form.reset(); form.setData('jenis_kendaraan', 'roda_4'); },
            });
            return;
        }
        form.post(route('database.kendaraan.store'), {
            preserveScroll: true,
            onSuccess: () => { form.reset(); form.setData('jenis_kendaraan', 'roda_4'); },
        });
    };

    const editKendaraan = (item) => {
        setEditingId(item.id);
        setDetailId(null);
        form.setData({
            kode_kendaraan: item.kode_kendaraan || '',
            kode_barang: item.kode_barang || '',
            nup: item.nup || '',
            nama_barang: item.nama_barang || '',
            nomor_polisi: item.nomor_polisi || '',
            merk_tipe: item.merk_tipe || '',
            jenis_kendaraan: item.jenis_kendaraan || 'roda_4',
            tahun: item.tahun || '',
            jenis_bbm_default: item.jenis_bbm_default || '',
            pegawai_id: item.pegawai_id || '',
            kondisi: item.kondisi || 'Baik',
            status_bmn: item.status_bmn || 'Aktif',
            nilai_perolehan: item.nilai_perolehan || '',
            pengguna: item.pengguna || '',
            foto_url: item.foto_url || '',
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
        if (confirm('Hapus kendaraan "' + item.merk_tipe + '"?')) {
            router.delete(route('database.kendaraan.destroy', item.id), { preserveScroll: true });
        }
    };

    const jenisBadge = (jenis) => {
        const isRoda2 = jenis === 'roda_2';
        return (
            <span className={'inline-block rounded-full px-2 py-0.5 text-xs font-medium ' + (isRoda2 ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700')}>
                {isRoda2 ? 'Roda 2' : 'Roda 4'}
            </span>
        );
    };

    const kondisiBadge = (kondisi) => {
        const colors = { 'Baik': 'bg-green-50 text-green-700', 'Rusak Ringan': 'bg-yellow-50 text-yellow-700', 'Rusak Berat': 'bg-red-50 text-red-700' };
        return <span className={'inline-block rounded-full px-2 py-0.5 text-xs font-medium ' + (colors[kondisi] || 'bg-gray-50 text-gray-700')}>{kondisi || '-'}</span>;
    };

    return (
        <AppLayout title="Database Kendaraan" description="Master kendaraan dinas beserta informasi BMN lengkap."
            actions={<>
                <button type="button" onClick={() => setShowImport(v => !v)} className="rounded-2xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200">{showImport ? 'Tutup Import' : 'Import Kendaraan'}</button>
                <button type="button" onClick={cancelEdit} className="rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-white">Form Baru</button>
            </>}
        >
            <Head title="Kendaraan" />
            <div className="mb-6 space-y-6">
                {showImport && <CsvImportCard title="Import Data Kendaraan" description="Upload CSV kendaraan." action={route('database.kendaraan.import')} templateUrl={route('database.kendaraan.template')} columns={['kode_kendaraan','nomor_polisi','merk_tipe','jenis_kendaraan','tahun','jenis_bbm_default','pegawai_nip','keterangan']} />}

                {/* Form */}
                <form onSubmit={submit} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 p-5">
                    <div className="mb-5"><p className="text-sm text-gray-500 dark:text-gray-400">{editingId ? 'Edit Kendaraan' : 'Tambah Kendaraan'}</p><p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">Form master kendaraan</p></div>
                    {editingId && <button type="button" onClick={cancelEdit} className="mb-3 rounded-2xl border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-700 dark:text-gray-200">Batal</button>}
                    <div className="grid gap-4 md:grid-cols-3">
                        <div><label className="block text-xs text-gray-500 mb-1">Kode Barang BMN</label><input className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" placeholder="3020101002" value={form.data.kode_barang} onChange={e => form.setData('kode_barang', e.target.value)} /></div>
                        <div><label className="block text-xs text-gray-500 mb-1">NUP</label><input type="number" className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" placeholder="1" value={form.data.nup} onChange={e => form.setData('nup', e.target.value)} /></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Kode Kendaraan</label><input className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" placeholder="KD-01" value={form.data.kode_kendaraan} onChange={e => form.setData('kode_kendaraan', e.target.value)} /></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Nama Barang (BMN)</label><input className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" placeholder="Mini Bus, Jeep, Pick Up..." value={form.data.nama_barang} onChange={e => form.setData('nama_barang', e.target.value)} /></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Nomor Polisi *</label><input className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" placeholder="AB 1234 CD" value={form.data.nomor_polisi} onChange={e => form.setData('nomor_polisi', e.target.value)} /><InputError className="mt-1" message={form.errors.nomor_polisi} /></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Merk / Tipe *</label><input className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" placeholder="Toyota Innova 2.0 V M/T" value={form.data.merk_tipe} onChange={e => form.setData('merk_tipe', e.target.value)} /><InputError className="mt-1" message={form.errors.merk_tipe} /></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Jenis Kendaraan *</label><select className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" value={form.data.jenis_kendaraan} onChange={e => form.setData('jenis_kendaraan', e.target.value)}><option value="roda_2">Roda 2</option><option value="roda_4">Roda 4</option></select></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Tahun</label><input type="number" className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" placeholder="2024" value={form.data.tahun} onChange={e => form.setData('tahun', e.target.value)} /></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Jenis BBM Default</label><input className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" placeholder="Pertalite / Dex" value={form.data.jenis_bbm_default} onChange={e => form.setData('jenis_bbm_default', e.target.value)} /></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Kondisi</label><select className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" value={form.data.kondisi} onChange={e => form.setData('kondisi', e.target.value)}><option value="Baik">Baik</option><option value="Rusak Ringan">Rusak Ringan</option><option value="Rusak Berat">Rusak Berat</option></select></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Status BMN</label><select className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" value={form.data.status_bmn} onChange={e => form.setData('status_bmn', e.target.value)}><option value="Aktif">Aktif</option><option value="Tidak Aktif">Tidak Aktif</option></select></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Nilai Perolehan</label><input type="number" className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" placeholder="369900000" value={form.data.nilai_perolehan} onChange={e => form.setData('nilai_perolehan', e.target.value)} /></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Pengguna</label><select className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" value={form.data.pegawai_id} onChange={e => form.setData('pegawai_id', e.target.value)}><option value="">Pilih pengguna</option>{pegawaiOptions.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}</select></div>
                        <div className="md:col-span-2"><label className="block text-xs text-gray-500 mb-1">URL Foto (Google Drive)</label><input className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" placeholder="https://drive.google.com/file/d/.../view" value={form.data.foto_url} onChange={e => form.setData('foto_url', e.target.value)} /></div>
                        <div className="md:col-span-3"><label className="block text-xs text-gray-500 mb-1">Keterangan</label><textarea rows="2" className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" placeholder="Catatan tambahan" value={form.data.keterangan} onChange={e => form.setData('keterangan', e.target.value)} /></div>
                    </div>
                    <button type="submit" disabled={form.processing} className="mt-5 rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-white disabled:opacity-60">{form.processing ? 'Menyimpan...' : editingId ? 'Update Kendaraan' : 'Simpan Kendaraan'}</button>
                </form>

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 p-5"><p className="text-sm text-gray-500">Total Kendaraan</p><p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">{kendaraan.length}</p></div>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 p-5"><p className="text-sm text-gray-500">Roda 2</p><p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">{kendaraan.filter(i => i.jenis_kendaraan === 'roda_2').length}</p></div>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 p-5"><p className="text-sm text-gray-500">Roda 4</p><p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">{kendaraan.filter(i => i.jenis_kendaraan === 'roda_4').length}</p></div>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5"><input className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm" placeholder="Cari..." value={keyword} onChange={e => setKeyword(e.target.value)} /></div>
                </div>

                {/* Detail Modal */}
                {detailItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDetailId(null)}>
                        <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-gray-800 shadow-xl" onClick={e => e.stopPropagation()}>
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{detailItem.merk_tipe}</h2>
                                    <button onClick={() => setDetailId(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                                </div>
                                {detailItem.foto_url && (
                                    <div className="mb-4 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                                        <img src={driveImgUrl(detailItem.foto_url)} alt={detailItem.merk_tipe} className="w-full h-48 object-cover" onError={e => { e.target.style.display = 'none'; }} />
                                    </div>
                                )}
                                <div className="grid gap-3 sm:grid-cols-2 text-sm">
                                    <div><span className="text-gray-400">Nomor Polisi</span><p className="font-semibold text-gray-900 dark:text-gray-100">{detailItem.nomor_polisi}</p></div>
                                    <div><span className="text-gray-400">Nama Barang BMN</span><p className="font-semibold text-gray-900 dark:text-gray-100">{detailItem.nama_barang || '-'}</p></div>
                                    <div><span className="text-gray-400">Kode Barang</span><p className="font-semibold text-gray-900 dark:text-gray-100">{detailItem.kode_barang || '-'}</p></div>
                                    <div><span className="text-gray-400">NUP</span><p className="font-semibold text-gray-900 dark:text-gray-100">{detailItem.nup || '-'}</p></div>
                                    <div><span className="text-gray-400">Tahun</span><p className="font-semibold text-gray-900 dark:text-gray-100">{detailItem.tahun || '-'}</p></div>
                                    <div><span className="text-gray-400">Jenis</span><p>{jenisBadge(detailItem.jenis_kendaraan)}</p></div>
                                    <div><span className="text-gray-400">Kondisi</span><p>{kondisiBadge(detailItem.kondisi)}</p></div>
                                    <div><span className="text-gray-400">Status BMN</span><p className="font-semibold text-gray-900 dark:text-gray-100">{detailItem.status_bmn || '-'}</p></div>
                                    <div className="sm:col-span-2"><span className="text-gray-400">Nilai Perolehan</span><p className="font-semibold text-emerald-600">{formatRupiah(detailItem.nilai_perolehan)}</p></div>
                                    <div><span className="text-gray-400">Pengguna</span><p className="font-semibold text-gray-900 dark:text-gray-100">{detailItem.pengguna || '-'}</p></div>
                                    <div><span className="text-gray-400">BBM Default</span><p className="font-semibold text-gray-900 dark:text-gray-100">{detailItem.jenis_bbm_default || '-'}</p></div>
                                    {detailItem.keterangan && <div className="sm:col-span-2"><span className="text-gray-400">Keterangan</span><p className="text-gray-700 dark:text-gray-300">{detailItem.keterangan}</p></div>}
                                </div>
                                <div className="mt-6 flex gap-2">
                                    <button type="button" onClick={() => { editKendaraan(detailItem); setDetailId(null); }} className="rounded-2xl border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200">Edit</button>
                                    <button type="button" onClick={() => setDetailId(null)} className="rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-white">Tutup</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Card Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredKendaraan.length ? filteredKendaraan.map(item => (
                        <article key={item.id} className="group cursor-pointer rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden hover:shadow-lg transition-shadow" onClick={() => setDetailId(item.id)}>
                            <div className="h-40 bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
                                {item.foto_url ? (
                                    <img src={driveImgUrl(item.foto_url)} alt={item.merk_tipe} className="w-full h-full object-cover group-hover:scale-105 transition-transform" onError={e => { e.target.style.display = 'none'; }} />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-5xl">{item.jenis_kendaraan === 'roda_2' ? '🛵' : '🚗'}</div>
                                )}
                                <div className="absolute top-2 right-2">{jenisBadge(item.jenis_kendaraan)}</div>
                            </div>
                            <div className="p-4">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{item.merk_tipe}</h3>
                                <p className="mt-1 text-lg font-bold text-primary">{item.nomor_polisi}</p>
                                <div className="mt-2 flex flex-wrap gap-2 text-xs">{item.tahun && <span className="text-gray-500">{item.tahun}</span>}{kondisiBadge(item.kondisi)}</div>
                                {item.nama_barang && <p className="mt-1 text-xs text-gray-400 truncate">{item.nama_barang}</p>}
                                {item.nilai_perolehan && <p className="mt-2 text-xs font-medium text-emerald-600">{formatRupiah(item.nilai_perolehan)}</p>}
                            </div>
                        </article>
                    )) : (
                        <div className="col-span-full rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-8 text-center text-sm text-gray-500">Belum ada data kendaraan.</div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
