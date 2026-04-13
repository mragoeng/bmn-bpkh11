import AppLayout from '@/Layouts/AppLayout';
import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';

function Field({ label, children }) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
            </span>
            {children}
        </label>
    );
}

function Input(props) {
    return (
        <input
            {...props}
            className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm"
        />
    );
}

function Select({ children, ...props }) {
    return (
        <select
            {...props}
            className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm"
        >
            {children}
        </select>
    );
}

/* ── Pegawai Search Autocomplete ── */
function PegawaiSearch({ options, value, onChange, error }) {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const selected = options.find((o) => String(o.id) === String(value));

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const filtered = query.length === 0
        ? options
        : options.filter((o) => {
            const q = query.toLowerCase();
            return o.nama.toLowerCase().includes(q) || (o.nip || '').toLowerCase().includes(q);
        });

    return (
        <div className="relative" ref={ref}>
            {selected ? (
                <div className="flex items-center justify-between rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 px-4 py-3 text-sm">
                    <span className="dark:text-gray-100">{selected.nama} {selected.nip ? `(${selected.nip})` : ''}</span>
                    <button
                        type="button"
                        className="ml-2 text-gray-400 hover:text-red-500"
                        onClick={() => { onChange(''); setQuery(''); }}
                    >✕</button>
                </div>
            ) : (
                <input
                    type="text"
                    className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm"
                    placeholder="Ketik nama atau NIP pegawai..."
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                    onFocus={() => setOpen(true)}
                />
            )}
            {open && !selected && filtered.length > 0 && (
                <div className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-lg">
                    {filtered.map((o) => (
                        <button
                            key={o.id}
                            type="button"
                            className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-100 flex items-center justify-between"
                            onClick={() => { onChange(String(o.id)); setQuery(''); setOpen(false); }}
                        >
                            <span>{o.nama}</span>
                            <span className="text-xs text-gray-400">{o.nip || ''}</span>
                        </button>
                    ))}
                </div>
            )}
            {open && !selected && filtered.length === 0 && query.length > 0 && (
                <div className="absolute z-50 mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-lg px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    Pegawai tidak ditemukan
                </div>
            )}
            <InputError className="mt-2" message={error} />
        </div>
    );
}

/* ── Single Struk Row ── */
function StrukRow({ index, struk, onChange, onRemove, canRemove, errors }) {
    const totalBiaya = (Number(struk.liter || 0) * Number(struk.harga_per_liter || 0)) || 0;

    return (
        <div className="rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900/40 p-4 space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Struk #{index + 1}
                </p>
                {canRemove && (
                    <button type="button" onClick={onRemove}
                        className="rounded-lg border border-rose-300 px-3 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30">
                        Hapus
                    </button>
                )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Liter">
                    <Input type="number" step="0.01" placeholder="Contoh: 24"
                        value={struk.liter}
                        onChange={(e) => onChange(index, 'liter', e.target.value)} />
                    <InputError className="mt-1" message={errors?.[`struks.${index}.liter`]} />
                </Field>
                <Field label="Harga per Liter">
                    <Input type="number" step="0.01" placeholder="Contoh: 10000"
                        value={struk.harga_per_liter}
                        onChange={(e) => onChange(index, 'harga_per_liter', e.target.value)} />
                    <InputError className="mt-1" message={errors?.[`struks.${index}.harga_per_liter`]} />
                </Field>
                <Field label="Total (Rp)">
                    <Input type="number" step="1"
                        placeholder={String(totalBiaya || '')}
                        value={struk.total}
                        onChange={(e) => onChange(index, 'total', e.target.value)} />
                    <p className="mt-1 text-xs text-gray-400">
                        Otomatis: Rp {new Intl.NumberFormat('id-ID').format(totalBiaya)}
                        {struk.total && Number(struk.total) !== totalBiaya ? (
                            <span className="text-amber-500"> (Manual)</span>
                        ) : null}
                    </p>
                    <InputError className="mt-1" message={errors?.[`struks.${index}.total`]} />
                </Field>
                <Field label="SPBU">
                    <Input type="text" placeholder="Nama SPBU"
                        value={struk.spbu}
                        onChange={(e) => onChange(index, 'spbu', e.target.value)} />
                </Field>
                <Field label="Nomor Nota">
                    <Input type="text" placeholder="Nomor nota"
                        value={struk.nomor_nota}
                        onChange={(e) => onChange(index, 'nomor_nota', e.target.value)} />
                </Field>
            </div>
        </div>
    );
}

const emptyStruk = () => ({ liter: '', harga_per_liter: '', total: '', spbu: '', nomor_nota: '' });

export default function PencatatanBbm({
    pegawaiOptions,
    kendaraanOptions,
    akunOptions,
    transaction,
}) {
    const isEditMode = Boolean(transaction?.id);
    const form = useForm({
        tanggal: transaction?.tanggal || new Date().toISOString().slice(0, 10),
        pegawai_id: transaction?.pegawai_id ? String(transaction.pegawai_id) : '',
        kendaraan_id: transaction?.kendaraan_id ? String(transaction.kendaraan_id) : '',
        akun_pembayaran_id: transaction?.akun_pembayaran_id ? String(transaction.akun_pembayaran_id) : '',
        odometer: transaction?.odometer === null || transaction?.odometer === undefined ? '' : String(transaction.odometer),
        jenis_bbm: transaction?.jenis_bbm || '',
        catatan: transaction?.catatan || '',
        struks: transaction
            ? [{ liter: String(transaction.liter ?? ''), harga_per_liter: String(transaction.harga_per_liter ?? ''), total: String(transaction.total ?? ''), spbu: transaction.spbu || '', nomor_nota: transaction.nomor_nota || '' }]
            : [emptyStruk()],
    });

    const selectedKendaraan = kendaraanOptions.find((item) => String(item.id) === String(form.data.kendaraan_id));
    const selectedPegawai = pegawaiOptions.find((item) => String(item.id) === String(form.data.pegawai_id));
    const tahunAnggaran = form.data.tanggal ? Number(form.data.tanggal.slice(0, 4)) : null;
    const akunOtomatis = akunOptions.find((item) => item.tahun === tahunAnggaran && item.jenis_kendaraan === selectedKendaraan?.jenis_kendaraan);
    const selectedAkun = akunOptions.find((item) => String(item.id) === String(form.data.akun_pembayaran_id || akunOtomatis?.id || ''));

    const totalLiter = form.data.struks.reduce((s, r) => s + Number(r.liter || 0), 0);
    const totalBiaya = form.data.struks.reduce((s, r) => {
        const calc = Number(r.liter || 0) * Number(r.harga_per_liter || 0);
        const val = r.total && r.total !== '' ? Number(r.total) : calc;
        return s + val;
    }, 0);
    const formattedTotal = new Intl.NumberFormat('id-ID').format(totalBiaya);
    const formattedLiter = totalLiter.toFixed(2).replace(/\.?0+$/, '');

    const handleKendaraanChange = (value) => {
        const kendaraan = kendaraanOptions.find((item) => String(item.id) === String(value));
        const akun = akunOptions.find((item) => item.tahun === tahunAnggaran && item.jenis_kendaraan === kendaraan?.jenis_kendaraan);
        form.setData((data) => ({ ...data, kendaraan_id: value, jenis_bbm: kendaraan?.jenis_bbm_default || '', akun_pembayaran_id: akun?.id ? String(akun.id) : '' }));
    };

    const handleTanggalChange = (value) => {
        const tahun = value ? Number(value.slice(0, 4)) : null;
        const akun = akunOptions.find((item) => item.tahun === tahun && item.jenis_kendaraan === selectedKendaraan?.jenis_kendaraan);
        form.setData((data) => ({ ...data, tanggal: value, akun_pembayaran_id: akun?.id ? String(akun.id) : '' }));
    };

    const handleStrukChange = (index, field, value) => {
        form.setData((data) => {
            const struks = [...data.struks];
            struks[index] = { ...struks[index], [field]: value };
            return { ...data, struks };
        });
    };

    const addStruk = () => {
        form.setData((data) => ({ ...data, struks: [...data.struks, emptyStruk()] }));
    };

    const removeStruk = (index) => {
        form.setData((data) => ({ ...data, struks: data.struks.filter((_, i) => i !== index) }));
    };

    const submit = (event) => {
        event.preventDefault();
        const options = { preserveScroll: true };
        if (isEditMode) {
            form.put(route('bbm.pencatatan.update', transaction.id), options);
        } else {
            form.post(route('bbm.pencatatan.store'), options);
        }
    };

    return (
        <AppLayout
            title={isEditMode ? 'Edit Pencatatan BBM' : 'Pencatatan BBM'}
            description={isEditMode
                ? 'Perbarui data transaksi lalu simpan. SPJ PDF akan menyesuaikan otomatis dari data terbaru.'
                : 'Isi transaksi BBM dengan alur singkat agar mudah dipakai oleh pengguna awam.'}
            actions={
                <>
                    {isEditMode ? (
                        <Link href={route('bbm.riwayat')}
                            className="rounded-2xl border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Kembali ke Riwayat
                        </Link>
                    ) : null}
                    <button type="submit" form="pencatatan-bbm-form" disabled={form.processing}
                        className="rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-white disabled:opacity-60">
                        {form.processing
                            ? isEditMode ? 'Menyimpan Perubahan...' : 'Menyimpan...'
                            : isEditMode ? 'Simpan Perubahan' : 'Simpan Transaksi'}
                    </button>
                </>
            }
        >
            <Head title={isEditMode ? 'Edit Pencatatan BBM' : 'Pencatatan BBM'} />

            <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
                <form id="pencatatan-bbm-form" onSubmit={submit} className="space-y-6">
                    {/* Data Dasar */}
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-6">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">Data Dasar</p>
                        <div className="mt-5 grid gap-5 md:grid-cols-2">
                            <Field label="Tanggal">
                                <Input type="date" value={form.data.tanggal}
                                    onChange={(e) => handleTanggalChange(e.target.value)} />
                                <InputError className="mt-2" message={form.errors.tanggal} />
                            </Field>
                            <Field label="Pegawai">
                                <PegawaiSearch
                                    options={pegawaiOptions}
                                    value={form.data.pegawai_id}
                                    onChange={(v) => form.setData('pegawai_id', v)}
                                    error={form.errors.pegawai_id}
                                />
                            </Field>
                            <Field label="Kendaraan">
                                <Select value={form.data.kendaraan_id}
                                    onChange={(e) => handleKendaraanChange(e.target.value)}>
                                    <option value="">Pilih kendaraan</option>
                                    {kendaraanOptions.map((item) => (
                                        <option key={item.id} value={item.id}>{item.nomor_polisi} - {item.merk_tipe}</option>
                                    ))}
                                </Select>
                                <InputError className="mt-2" message={form.errors.kendaraan_id} />
                            </Field>
                            <Field label="Jenis BBM">
                                <select className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm"
                                    value={form.data.jenis_bbm}
                                    onChange={(e) => form.setData('jenis_bbm', e.target.value)}>
                                    <option value="">Pilih BBM</option>
                                    <option value="Pertamax">Pertamax</option>
                                    <option value="Pertamax Turbo">Pertamax Turbo</option>
                                    <option value="Dexlite">Dexlite</option>
                                    <option value="Pertamina Dex">Pertamina Dex</option>
                                    <option value="Solar">Solar</option>
                                </select>
                                <InputError className="mt-2" message={form.errors.jenis_bbm} />
                            </Field>
                            <Field label="Odometer">
                                <Input type="number" placeholder="Contoh: 15420"
                                    value={form.data.odometer}
                                    onChange={(e) => form.setData('odometer', e.target.value)} />
                                <InputError className="mt-2" message={form.errors.odometer} />
                            </Field>
                        </div>
                    </div>

                    {/* Detail Pembelian - Multi Struk */}
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-6">
                        <div className="flex items-center justify-between mb-5">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
                                Detail Pembelian
                            </p>
                            {!isEditMode && (
                                <button type="button" onClick={addStruk}
                                    className="rounded-xl border border-primary text-primary px-4 py-2 text-xs font-medium hover:bg-primary hover:text-white transition">
                                    + Tambah Struk
                                </button>
                            )}
                        </div>
                        <div className="space-y-4">
                            {form.data.struks.map((struk, i) => (
                                <StrukRow
                                    key={i}
                                    index={i}
                                    struk={struk}
                                    onChange={handleStrukChange}
                                    onRemove={() => removeStruk(i)}
                                    canRemove={!isEditMode && form.data.struks.length > 1}
                                    errors={form.errors}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Catatan */}
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-6">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">Catatan Tambahan</p>
                        <div className="mt-5">
                            <Field label="Catatan">
                                <textarea rows="4"
                                    className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm"
                                    placeholder="Catatan tambahan bila perlu"
                                    value={form.data.catatan}
                                    onChange={(e) => form.setData('catatan', e.target.value)} />
                                <InputError className="mt-2" message={form.errors.catatan} />
                            </Field>
                        </div>
                    </div>
                </form>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">Mapping SPJ</p>
                        <div className="mt-4 space-y-4">
                            <Field label="Akun Pembayaran">
                                <Select value={form.data.akun_pembayaran_id || akunOtomatis?.id || ''}
                                    onChange={(e) => form.setData('akun_pembayaran_id', e.target.value)}>
                                    <option value="">Pilih akun</option>
                                    {akunOptions.map((item) => (
                                        <option key={`${item.tahun}-${item.kode_akun}`} value={item.id}>
                                            {item.tahun} - {item.jenis_kendaraan.replace('_', ' ')} - {item.kode_akun}
                                        </option>
                                    ))}
                                </Select>
                                <InputError className="mt-2" message={form.errors.akun_pembayaran_id} />
                            </Field>
                            <div className="rounded-2xl bg-accent-light dark:bg-accent-dark/30 p-4 text-sm leading-6 text-accent-dark dark:text-accent-light">
                                Akun pembayaran akan dipilih otomatis sesuai tahun transaksi dan jenis kendaraan. Jika perlu, Anda tetap bisa menggantinya manual.
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-primary p-6 text-stone-100">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">Ringkasan</p>
                        <dl className="mt-4 space-y-3 text-sm">
                            <div className="flex items-center justify-between gap-4">
                                <dt>Pegawai</dt>
                                <dd className="text-right">{selectedPegawai?.nama || 'Belum dipilih'}</dd>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <dt>Kendaraan</dt>
                                <dd className="text-right">{selectedKendaraan ? selectedKendaraan.nomor_polisi : 'Belum dipilih'}</dd>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <dt>Akun SPJ</dt>
                                <dd className="text-right">{selectedAkun?.kode_akun || 'Belum tersedia'}</dd>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <dt>Jumlah Struk</dt>
                                <dd className="text-right">{form.data.struks.length}</dd>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <dt>Total Liter</dt>
                                <dd className="text-right">{formattedLiter} L</dd>
                            </div>
                            <div className="flex items-center justify-between gap-4 border-t border-white/20 pt-3">
                                <dt className="font-semibold">Total Biaya</dt>
                                <dd className="text-right font-semibold">Rp {formattedTotal}</dd>
                            </div>
                        </dl>
                        <div className="mt-5 rounded-2xl border border-white/10 dark:border-gray-700 bg-white/5 dark:bg-gray-800/50 p-4 text-sm leading-6 text-gray-300 dark:text-gray-400">
                            {isEditMode
                                ? 'Setelah disimpan, transaksi ini bisa langsung dicetak ke PDF dari halaman riwayat.'
                                : `${form.data.struks.length} struk akan disimpan sebagai transaksi terpisah, masing-masing bisa dicetak PDF sendiri.`}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
