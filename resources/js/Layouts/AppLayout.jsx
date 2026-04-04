import { Link, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { navigationSections } from '@/lib/navigation';

function Chevron({ open }) {
    return (
        <svg className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );
}

function NavigationItem({ item, isActive, onNavigate }) {
    return (
        <Link href={item.href} onClick={onNavigate}
            className={`block rounded-lg px-4 py-2.5 text-sm transition ${
                isActive ? 'bg-white/20 text-white font-semibold' : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}>
            {item.title}
        </Link>
    );
}

function NavigationSection({ section, url, openSections, toggleSection, onNavigate }) {
    const hasActiveItem = section.items.some((item) => url.startsWith(item.href));
    const isOpen = openSections[section.key] ?? hasActiveItem;
    return (
        <div>
            <button type="button" onClick={() => toggleSection(section.key)}
                className={`mb-2 flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.2em] transition ${
                    hasActiveItem ? 'text-accent' : 'text-white/50 hover:text-white/70'
                }`}>
                <span>{section.title}</span>
                <Chevron open={isOpen} />
            </button>
            {isOpen ? (
                <div className="space-y-1">
                    {section.items.map((item) => (
                        <NavigationItem key={item.href} item={item} isActive={url.startsWith(item.href)} onNavigate={onNavigate}/>
                    ))}
                </div>
            ) : null}
        </div>
    );
}

export default function AppLayout({ title, description, actions, children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { url, props } = usePage();
    const flashMessage = props.flash?.success;
    const flashError = props.flash?.error;
    const user = props.auth?.user;

    const initialSections = useMemo(() =>
        Object.fromEntries(navigationSections.map((section) => [
            section.key, section.items.some((item) => url.startsWith(item.href)),
        ])), [url]);
    const [openSections, setOpenSections] = useState(initialSections);

    useEffect(() => {
        setOpenSections((current) =>
            Object.fromEntries(navigationSections.map((section) => [
                section.key, current[section.key] || section.items.some((item) => url.startsWith(item.href)),
            ])));
    }, [url]);

    const toggleSection = (key) => setOpenSections((current) => ({ ...current, [key]: !(current[key] ?? false) }));
    const footerText = '@2026 aplikasi buatan humas bpkh wilayah 11 - agoeng wibouuo';

    return (
        <div className="min-h-screen bg-[#F5F5F0] text-gray-900">
            {sidebarOpen ? (
                <>
                    <button type="button" aria-label="Tutup menu" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-40 bg-black/40 xl:hidden"/>
                    <div className="fixed inset-y-0 left-0 right-0 z-50 flex flex-col bg-primary p-5 xl:hidden">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">BMN-BPKH11</p>
                                <p className="mt-2 text-sm text-white/70">Menu aplikasi</p>
                            </div>
                            <button type="button" onClick={() => setSidebarOpen(false)} className="rounded-lg border border-white/30 px-4 py-2 text-sm font-medium text-white">Tutup</button>
                        </div>
                        <nav className="flex-1 space-y-4 overflow-y-auto pr-1">
                            {navigationSections.map((section) => (
                                <div key={section.key}>
                                    <NavigationSection section={section} url={url} openSections={openSections} toggleSection={toggleSection} onNavigate={() => setSidebarOpen(false)}/>
                                </div>
                            ))}
                        </nav>
                    </div>
                </>
            ) : null}

            <div className="flex min-h-screen w-full">
                <aside className="hidden w-64 shrink-0 xl:block">
                    <div className="sticky top-0 flex h-screen flex-col overflow-y-auto bg-primary p-5">
                        <div className="mb-8">
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">BMN-BPKH11</p>
                            <h1 className="mt-3 text-xl font-bold text-white">Arsip Pencatatan BBM</h1>
                            <p className="mt-3 text-sm leading-6 text-white/70">Kendaraan, transaksi BBM, laporan, dan template SPJ dalam satu aplikasi internal.</p>
                        </div>
                        <nav className="flex-1 space-y-4">
                            {navigationSections.map((section) => (
                                <NavigationSection key={section.key} section={section} url={url} openSections={openSections} toggleSection={toggleSection}/>
                            ))}
                        </nav>
                        <div className="mt-4 border-t border-white/20 pt-4 text-xs text-white/40">{footerText}</div>
                    </div>
                </aside>

                <div className="flex-1">
                    <div className="sticky top-0 z-30 flex items-center justify-between bg-primary px-4 py-3 xl:hidden">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">BMN-BPKH11</p>
                            <p className="mt-1 text-sm text-white/80">Arsip Pencatatan BBM</p>
                        </div>
                        <button type="button" onClick={() => setSidebarOpen(true)} className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-primary">Menu</button>
                    </div>

                    <main className="p-4 sm:p-6 lg:p-8">
                        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                            <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Aplikasi Internal</p>
                                    <h2 className="mt-2 text-2xl font-bold text-gray-900">{title}</h2>
                                    {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">{description}</p> : null}
                                </div>
                                <div className="flex flex-col items-start gap-3 lg:items-end">
                                    {user ? (
                                        <div className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600 lg:w-auto">
                                            Login sebagai <span className="font-semibold text-gray-900">{user.name}</span> ({user.username})
                                        </div>
                                    ) : null}
                                    {actions ? <div className="flex w-full shrink-0 flex-col gap-3 sm:flex-row sm:flex-wrap lg:w-auto lg:justify-end">{actions}</div> : null}
                                </div>
                            </div>
                            <div className="pt-6">{children}</div>
                            {flashMessage ? <div className="mt-6 rounded-lg border border-primary-pale bg-primary-pale/30 px-4 py-3 text-sm text-primary-dark">{flashMessage}</div> : null}
                            {flashError ? <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{flashError}</div> : null}
                            <div className="mt-8 border-t border-gray-200 pt-5 text-center text-sm text-gray-400">{footerText}</div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
