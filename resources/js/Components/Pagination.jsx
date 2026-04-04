import { router } from '@inertiajs/react';

export default function Pagination({ data, routeName }) {
    if (!data || !data.last_page || data.last_page <= 1) return null;

    const currentPage = data.current_page || 1;
    const lastPage = data.last_page || 1;
    const total = data.total || 0;
    const from = data.from || 0;
    const to = data.to || 0;

    const goToPage = (page) => {
        if (page < 1 || page > lastPage) return;
        router.visit(route(routeName), {
            data: { page },
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        const end = Math.min(lastPage, start + maxVisible - 1);
        start = Math.max(1, end - maxVisible + 1);
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    };

    return (
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <p className="text-xs text-stone-500 sm:text-sm">
                {from}–{to} dari {total}
            </p>
            <div className="flex items-center gap-1">
                <button
                    type="button"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="rounded-lg border border-stone-300 px-2 py-1.5 text-xs text-stone-700 disabled:opacity-40 sm:rounded-xl sm:px-3 sm:py-2 sm:text-sm"
                >
                    ←
                </button>
                {getPageNumbers().map((page) => (
                    <button
                        key={page}
                        type="button"
                        onClick={() => goToPage(page)}
                        className={`rounded-lg px-2 py-1.5 text-xs font-medium sm:rounded-xl sm:px-3 sm:py-2 sm:text-sm ${
                            page === currentPage
                                ? 'bg-amber-400 text-stone-950'
                                : 'border border-stone-300 text-stone-700'
                        }`}
                    >
                        {page}
                    </button>
                ))}
                <button
                    type="button"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage >= lastPage}
                    className="rounded-lg border border-stone-300 px-2 py-1.5 text-xs text-stone-700 disabled:opacity-40 sm:rounded-xl sm:px-3 sm:py-2 sm:text-sm"
                >
                    →
                </button>
            </div>
        </div>
    );
}
