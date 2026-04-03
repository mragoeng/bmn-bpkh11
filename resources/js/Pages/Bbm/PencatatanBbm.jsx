import AppLayout from '@/Layouts/AppLayout';
import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';

function Field({ label, children }) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-medium text-stone-700">
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
            className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm"
        />
    );
}

function Select({ children, ...props }) {
    return (
        <select
            {...props}
            className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm"
        >
            {children}
        </select>
    );
}

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
        kendaraan_id: transaction?.kendaraan_id
            ? String(transaction.kendaraan_id)
            : '',
        akun_pembayaran_id: transaction?.akun_pembayaran_id
            ? String(transaction.akun_pembayaran_id)
            : '',
        odometer:
            transaction?.odometer === null || transaction?.odometer === undefined
                ? ''
                : String(transaction.odometer),
        jenis_bbm: transaction?.jenis_bbm || '',
        liter:
            transaction?.liter === null || transaction?.liter === undefined
                ? ''
                : String(transaction.liter),
        harga_per_liter:
            transaction?.harga_per_liter === null ||
            transaction?.harga_per_liter === undefined
                ? ''
                : String(transaction.harga_per_liter),
        spbu: transaction?.spbu || '',
        nomor_nota: transaction?.nomor_nota || '',
        catatan: transaction?.catatan || '',
    });

    const selectedKendaraan = kendaraanOptions.find(
        (item) => String(item.id) === String(form.data.kendaraan_id),
    );
    const selectedPegawai = pegawaiOptions.find(
        (item) => String(item.id) === String(form.data.pegawai_id),
    );
    const tahunAnggaran = form.data.tanggal
        ? Number(form.data.tanggal.slice(0, 4))
        : null;
    const akunOtomatis = akunOptions.find(
        (item) =>
            item.tahun === tahunAnggaran &&
            item.jenis_kendaraan === selectedKendaraan?.jenis_kendaraan,
    );
    const selectedAkun = akunOptions.find(
        (item) =>
            String(item.id) ===
            String(form.data.akun_pembayaran_id || akunOtomatis?.id || ''),
    );
    const totalBiaya =
        (Number(form.data.liter || 0) * Number(form.data.harga_per_liter || 0)) ||
        0;
    const formattedTotal = new Intl.NumberFormat('id-ID').format(totalBiaya);

    const handleKendaraanChange = (value) => {
        const kendaraan = kendaraanOptions.find(
            (item) => String(item.id) === String(value),
        );
        const akun = akunOptions.find(
            (item) =>
                item.tahun === tahunAnggaran &&
                item.jenis_kendaraan === kendaraan?.jenis_kendaraan,
        );

        form.setData((data) => ({
            ...data,
            kendaraan_id: value,
            jenis_bbm: kendaraan?.jenis_bbm_default || '',
            akun_pembayaran_id: akun?.id ? String(akun.id) : '',
        }));
    };

    const handleTanggalChange = (value) => {
        const tahun = value ? Number(value.slice(0, 4)) : null;
        const akun = akunOptions.find(
            (item) =>
                item.tahun === tahun &&
                item.jenis_kendaraan === selectedKendaraan?.jenis_kendaraan,
        );

        form.setData((data) => ({
            ...data,
            tanggal: value,
            akun_pembayaran_id: akun?.id ? String(akun.id) : '',
        }));
    };

    const submit = (event) => {
        event.preventDefault();

        const options = {
            preserveScroll: true,
        };

        if (isEditMode) {
            form.put(route('bbm.pencatatan.update', transaction.id), options);

            return;
        }

        form.post(route('bbm.pencatatan.store'), options);
    };

    return (
        <AppLayout
            title={isEditMode ? 'Edit Pencatatan BBM' : 'Pencatatan BBM'}
            description={
                isEditMode
                    ? 'Perbarui transaksi BBM yang sudah tercatat agar arsip dan data SPJ tetap sesuai.'
                    : 'Form transaksi BBM untuk arsip pengisian bahan bakar kendaraan dinas dan persiapan data SPJ.'
            }
            actions={
                <>
                    {isEditMode ? (
                        <Link
                            href={route('bbm.riwayat')}
                            className="rounded-2xl border border-stone-300 px-4 py-3 text-sm font-medium text-stone-700"
                        >
                            Kembali ke Riwayat
                        </Link>
                    ) : null}
                    <button
                        type="submit"
                        form="pencatatan-bbm-form"
                        disabled={form.processing}
                        className="rounded-2xl bg-stone-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
                    >
                        {form.processing
                            ? isEditMode
                                ? 'Menyimpan Perubahan...'
                                : 'Menyimpan...'
                            : isEditMode
                              ? 'Simpan Perubahan'
                              : 'Simpan Transaksi'}
                    </button>
                </>
            }
        >
            <Head title={isEditMode ? 'Edit Pencatatan BBM' : 'Pencatatan BBM'} />

            <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
                <form
                    id="pencatatan-bbm-form"
                    onSubmit={submit}
                    className="rounded-[28px] border border-stone-200 bg-stone-50 p-6"
                >
                    <div className="grid gap-5 md:grid-cols-2">
                        <Field label="Tanggal">
                            <>
                                <Input
                                    type="date"
                                    value={form.data.tanggal}
                                    onChange={(event) =>
                                        handleTanggalChange(event.target.value)
                                    }
                                />
                                <InputError
                                    className="mt-2"
                                    message={form.errors.tanggal}
                                />
                            </>
                        </Field>
                        <Field label="Pegawai">
                            <>
                                <Select
                                    value={form.data.pegawai_id}
                                    onChange={(event) =>
                                        form.setData(
                                            'pegawai_id',
                                            event.target.value,
                                        )
                                    }
                                >
                                    <option value="">Pilih pegawai</option>
                                    {pegawaiOptions.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.nama}
                                        </option>
                                    ))}
                                </Select>
                                <InputError
                                    className="mt-2"
                                    message={form.errors.pegawai_id}
                                />
                            </>
                        </Field>
                        <Field label="Kendaraan">
                            <>
                                <Select
                                    value={form.data.kendaraan_id}
                                    onChange={(event) =>
                                        handleKendaraanChange(
                                            event.target.value,
                                        )
                                    }
                                >
                                    <option value="">Pilih kendaraan</option>
                                    {kendaraanOptions.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.nomor_polisi} -{' '}
                                            {item.merk_tipe}
                                        </option>
                                    ))}
                                </Select>
                                <InputError
                                    className="mt-2"
                                    message={form.errors.kendaraan_id}
                                />
                            </>
                        </Field>
                        <Field label="Jenis BBM">
                            <>
                                <Input
                                    type="text"
                                    value={form.data.jenis_bbm}
                                    onChange={(event) =>
                                        form.setData(
                                            'jenis_bbm',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError
                                    className="mt-2"
                                    message={form.errors.jenis_bbm}
                                />
                            </>
                        </Field>
                        <Field label="Odometer">
                            <>
                                <Input
                                    type="number"
                                    placeholder="Contoh: 15420"
                                    value={form.data.odometer}
                                    onChange={(event) =>
                                        form.setData(
                                            'odometer',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError
                                    className="mt-2"
                                    message={form.errors.odometer}
                                />
                            </>
                        </Field>
                        <Field label="Liter">
                            <>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="Contoh: 24"
                                    value={form.data.liter}
                                    onChange={(event) =>
                                        form.setData('liter', event.target.value)
                                    }
                                />
                                <InputError
                                    className="mt-2"
                                    message={form.errors.liter}
                                />
                            </>
                        </Field>
                        <Field label="Harga per Liter">
                            <>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="Contoh: 10000"
                                    value={form.data.harga_per_liter}
                                    onChange={(event) =>
                                        form.setData(
                                            'harga_per_liter',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError
                                    className="mt-2"
                                    message={form.errors.harga_per_liter}
                                />
                            </>
                        </Field>
                        <Field label="Total">
                            <Input
                                type="text"
                                value={`Rp ${formattedTotal}`}
                                readOnly
                            />
                        </Field>
                        <Field label="SPBU">
                            <>
                                <Input
                                    type="text"
                                    placeholder="Nama SPBU"
                                    value={form.data.spbu}
                                    onChange={(event) =>
                                        form.setData('spbu', event.target.value)
                                    }
                                />
                                <InputError
                                    className="mt-2"
                                    message={form.errors.spbu}
                                />
                            </>
                        </Field>
                        <Field label="Nomor Nota">
                            <>
                                <Input
                                    type="text"
                                    placeholder="Nomor nota"
                                    value={form.data.nomor_nota}
                                    onChange={(event) =>
                                        form.setData(
                                            'nomor_nota',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError
                                    className="mt-2"
                                    message={form.errors.nomor_nota}
                                />
                            </>
                        </Field>
                        <Field label="Catatan">
                            <>
                                <textarea
                                    rows="4"
                                    className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm"
                                    placeholder="Catatan tambahan"
                                    value={form.data.catatan}
                                    onChange={(event) =>
                                        form.setData(
                                            'catatan',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError
                                    className="mt-2"
                                    message={form.errors.catatan}
                                />
                            </>
                        </Field>
                    </div>
                </form>

                <div className="space-y-6">
                    <div className="rounded-[28px] border border-stone-200 bg-white p-6">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-400">
                            Mapping SPJ
                        </p>
                        <div className="mt-4 space-y-4">
                            <Field label="Akun Pembayaran">
                                <>
                                    <Select
                                        value={
                                            form.data.akun_pembayaran_id ||
                                            akunOtomatis?.id ||
                                            ''
                                        }
                                        onChange={(event) =>
                                            form.setData(
                                                'akun_pembayaran_id',
                                                event.target.value,
                                            )
                                        }
                                    >
                                        <option value="">Pilih akun</option>
                                        {akunOptions.map((item) => (
                                            <option
                                                key={`${item.tahun}-${item.kode_akun}`}
                                                value={item.id}
                                            >
                                                {item.tahun} -{' '}
                                                {item.jenis_kendaraan.replace(
                                                    '_',
                                                    ' ',
                                                )}{' '}
                                                - {item.kode_akun}
                                            </option>
                                        ))}
                                    </Select>
                                    <InputError
                                        className="mt-2"
                                        message={
                                            form.errors.akun_pembayaran_id
                                        }
                                    />
                                </>
                            </Field>
                            <div className="rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                                Sistem nanti akan menyesuaikan akun pembayaran
                                otomatis berdasarkan tahun transaksi dan jenis
                                kendaraan.
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[28px] border border-stone-200 bg-stone-900 p-6 text-stone-100">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-400">
                            Ringkasan
                        </p>
                        <dl className="mt-4 space-y-3 text-sm">
                            <div className="flex items-center justify-between">
                                <dt>Pegawai</dt>
                                <dd>{selectedPegawai?.nama || 'Belum dipilih'}</dd>
                            </div>
                            <div className="flex items-center justify-between">
                                <dt>Kendaraan</dt>
                                <dd>
                                    {selectedKendaraan
                                        ? `${selectedKendaraan.nomor_polisi}`
                                        : 'Belum dipilih'}
                                </dd>
                            </div>
                            <div className="flex items-center justify-between">
                                <dt>Akun SPJ</dt>
                                <dd className="text-right">
                                    {selectedAkun?.kode_akun || 'Belum tersedia'}
                                </dd>
                            </div>
                            <div className="flex items-center justify-between">
                                <dt>Total Biaya</dt>
                                <dd className="font-semibold">
                                    Rp {formattedTotal}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
