import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    const footerText = '@2026 aplikasi buatan humas bpkh wilayah 11 - agoeng wibouuo';

    return (
        <div className="min-h-screen bg-[#F5F5F0] px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-7xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="flex rounded-2xl bg-primary px-8 py-10 text-white shadow">
                    <div className="my-auto">
                        <Link href="/" className="inline-flex items-center gap-4">
                            <span className="rounded-xl bg-white/10 p-4">
                                <ApplicationLogo className="h-14 w-14 fill-current text-accent"/>
                            </span>
                            <span>
                                <span className="block text-xs font-semibold uppercase tracking-[0.35em] text-accent">BMN-BPKH11</span>
                                <span className="mt-2 block text-2xl font-bold">Arsip Pencatatan BBM</span>
                            </span>
                        </Link>
                        <p className="mt-8 max-w-xl text-base leading-8 text-white/80">Satu aplikasi internal untuk master kendaraan, pencatatan BBM, laporan, dan pembuatan SPJ berbasis template Google Docs.</p>
                        <div className="mt-10 grid gap-4 sm:grid-cols-3">
                            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Database</p>
                                <p className="mt-3 text-sm leading-6 text-white/80">Pegawai dan kendaraan tersimpan rapi untuk arsip.</p>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Transaksi</p>
                                <p className="mt-3 text-sm leading-6 text-white/80">Pencatatan BBM cepat dengan riwayat dan laporan.</p>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">SPJ</p>
                                <p className="mt-3 text-sm leading-6 text-white/80">Placeholder otomatis sampai generate Google Docs.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex">
                    <div className="my-auto w-full overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow sm:p-8">
                        {children}
                        <div className="mt-8 border-t border-gray-200 pt-5 text-center text-sm text-gray-400">{footerText}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
