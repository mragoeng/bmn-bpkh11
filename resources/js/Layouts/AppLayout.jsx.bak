import { Link, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { navigationSections } from '@/lib/navigation';

function Chevron({ open }) {
    return (
        <svg
            className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M5 7.5L10 12.5L15 7.5"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function NavigationItem({ item, isActive, onNavigate }) {
    return (
        <Link
            href={item.href}
            onClick={onNavigate}
            className={`block rounded-2xl px-4 py-3 text-sm transition ${
                isActive
                    ? 'bg-amber-400 text-stone-950 shadow-sm'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-950'
            }`}
        >
            {item.title}
        </Link>
    );
}

function NavigationSection({
    section,
    url,
    openSections,
    toggleSection,
    onNavigate,
}) {
    const hasActiveItem = section.items.some((item) => url.startsWith(item.href));
    const isOpen = openSections[section.key] ?? hasActiveItem;

    return (
        <div>
            <button
                type="button"
                onClick={() => toggleSection(section.key)}
                className={`mb-3 flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.25em] transition ${
                    hasActiveItem
                        ? 'bg-amber-50 text-amber-800'
                        : 'text-stone-400 hover:bg-stone-50 hover:text-stone-600'
                }`}
            >
                <span>{section.title}</span>
                <Chevron open={isOpen} />
            </button>

            {isOpen ? (
                <div className="space-y-2">
                    {section.items.map((item) => (
                        <NavigationItem
                            key={item.href}
                            item={item}
                            isActive={url.startsWith(item.href)}
                            onNavigate={onNavigate}
                        />
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

    const initialSections = useMemo(
        () =>
            Object.fromEntries(
                navigationSections.map((section) => [
                    section.key,
                    section.items.some((item) => url.startsWith(item.href)),
                ]),
            ),
        [url],
    );

    const [openSections, setOpenSections] = useState(initialSections);

    useEffect(() => {
        setOpenSections((current) =>
            Object.fromEntries(
                navigationSections.map((section) => [
                    section.key,
                    current[section.key] ||
                        section.items.some((item) => url.startsWith(item.href)),
                ]),
            ),
        );
    }, [url]);

    const toggleSection = (key) => {
        setOpenSections((current) => ({
            ...current,
            [key]: !(current[key] ?? false),
        }));
    };

    const footerText = '@2026 aplikasi buatan humas bpkh wilayah 11 - agoeng wibouuo';

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.22),_transparent_28%),linear-gradient(180deg,#f7f3ec_0%,#f3efe6_100%)] text-stone-900">
            <div className="flex min-h-screen w-full gap-6 px-4 py-4 sm:px-6 lg:px-8 2xl:px-10">
                <aside className="hidden w-72 shrink-0 xl:block">
                    <div className="sticky top-4 rounded-[28px] border border-white/60 bg-white/80 p-6 shadow-[0_25px_80px_-35px_rgba(41,37,36,0.35)] backdrop-blur">
                        <div className="mb-8">
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
                                BMN-BPKH11
                            </p>
                            <h1 className="mt-3 font-serif text-3xl text-stone-900">
                                Arsip Pencatatan BBM
                            </h1>
                            <p className="mt-3 text-sm leading-6 text-stone-600">
                                Kendaraan, transaksi BBM, laporan, dan template
                                SPJ dalam satu aplikasi internal.
                            </p>
                        </div>

                        <nav className="space-y-6">
                            {navigationSections.map((section) => (
                                <NavigationSection
                                    key={section.key}
                                    section={section}
                                    url={url}
                                    openSections={openSections}
                                    toggleSection={toggleSection}
                                />
                            ))}
                        </nav>
                    </div>
                </aside>

                <div className="flex-1">
                    <div className="mb-4 flex items-center justify-between rounded-[28px] border border-white/60 bg-white/80 px-5 py-4 shadow-[0_25px_80px_-35px_rgba(41,37,36,0.35)] backdrop-blur xl:hidden">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
                                BMN-BPKH11
                            </p>
                            <p className="mt-1 text-sm text-stone-600">
                                Arsip Pencatatan BBM
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setSidebarOpen((value) => !value)}
                            className="rounded-2xl bg-stone-900 px-4 py-2 text-sm font-medium text-white"
                        >
                            Menu
                        </button>
                    </div>

                    {sidebarOpen ? (
                        <div className="mb-4 rounded-[28px] border border-white/60 bg-white/90 p-4 shadow-[0_25px_80px_-35px_rgba(41,37,36,0.35)] backdrop-blur xl:hidden">
                            {navigationSections.map((section) => (
                                <div key={section.key} className="mb-5 last:mb-0">
                                    <NavigationSection
                                        section={section}
                                        url={url}
                                        openSections={openSections}
                                        toggleSection={toggleSection}
                                        onNavigate={() => setSidebarOpen(false)}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : null}

                    <main className="rounded-[32px] border border-white/60 bg-white/80 p-6 shadow-[0_25px_80px_-35px_rgba(41,37,36,0.35)] backdrop-blur sm:p-8">
                        <div className="flex flex-col gap-4 border-b border-stone-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-400">
                                    Aplikasi Internal
                                </p>
                                <h2 className="mt-2 font-serif text-3xl text-stone-950">
                                    {title}
                                </h2>
                                {description ? (
                                    <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">
                                        {description}
                                    </p>
                                ) : null}
                            </div>

                            <div className="flex flex-col items-start gap-3 lg:items-end">
                                {user ? (
                                    <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
                                        Login sebagai <span className="font-semibold">{user.name}</span> ({user.username})
                                    </div>
                                ) : null}
                                {actions ? (
                                    <div className="flex shrink-0 flex-wrap gap-3">
                                        {actions}
                                    </div>
                                ) : null}
                            </div>
                        </div>

                        <div className="pt-6">{children}</div>

                        {flashMessage ? (
                            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                                {flashMessage}
                            </div>
                        ) : null}

                        {flashError ? (
                            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
                                {flashError}
                            </div>
                        ) : null}

                        <div className="mt-8 border-t border-stone-200 pt-5 text-center text-sm text-stone-500">
                            {footerText}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
