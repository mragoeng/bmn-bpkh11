import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    const footerText = '@2026 aplikasi buatan humas bpkh wilayah 11 - agoeng wibouuo';

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.22),_transparent_26%),linear-gradient(180deg,#f7f3ec_0%,#efe7da_100%)] px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-7xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="flex rounded-[32px] border border-white/60 bg-stone-900 px-8 py-10 text-stone-100 shadow-[0_25px_80px_-35px_rgba(41,37,36,0.45)]">
                    <div className="my-auto">
                        <Link href="/" className="inline-flex items-center gap-4">
                            <span className="rounded-3xl bg-white/10 p-4 backdrop-blur">
                                <ApplicationLogo className="h-14 w-14 fill-current text-amber-300" />
                            </span>
                            <span>
                                <span className="block text-xs font-semibold uppercase tracking-[0.35em] text-amber-300">
                                    BMN-BPKH11
                                </span>
                                <span className="mt-2 block font-serif text-3xl">
                                    Arsip Pencatatan BBM
                                </span>
                            </span>
                        </Link>

                        <p className="mt-8 max-w-xl text-base leading-8 text-stone-300">
                            Satu aplikasi internal untuk master kendaraan,
                            pencatatan BBM, laporan, dan pembuatan SPJ berbasis
                            template Google Docs.
                        </p>

                        <div className="mt-10 grid gap-4 sm:grid-cols-3">
                            <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
                                    Database
                                </p>
                                <p className="mt-3 text-sm leading-6 text-stone-200">
                                    Pegawai dan kendaraan tersimpan rapi untuk
                                    arsip.
                                </p>
                            </div>
                            <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
                                    Transaksi
                                </p>
                                <p className="mt-3 text-sm leading-6 text-stone-200">
                                    Pencatatan BBM cepat dengan riwayat dan
                                    laporan.
                                </p>
                            </div>
                            <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
                                    SPJ
                                </p>
                                <p className="mt-3 text-sm leading-6 text-stone-200">
                                    Placeholder otomatis sampai generate Google
                                    Docs.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex">
                    <div className="my-auto w-full overflow-hidden rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-[0_25px_80px_-35px_rgba(41,37,36,0.35)] backdrop-blur sm:p-8">
                        {children}
                        <div className="mt-8 border-t border-stone-200 pt-5 text-center text-sm text-stone-500">
                            {footerText}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
