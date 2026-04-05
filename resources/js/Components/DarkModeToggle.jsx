import { useEffect, useState } from 'react';

export default function DarkModeToggle() {
    const [dark, setDark] = useState(() => {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem('theme') === 'dark';
    });

    useEffect(() => {
        const root = document.documentElement;
        if (dark) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [dark]);

    // Apply on first load
    useEffect(() => {
        const saved = localStorage.getItem('theme');
        if (saved === 'dark') {
            document.documentElement.classList.add('dark');
        }
    }, []);

    return (
        <button
            type="button"
            onClick={() => setDark(!dark)}
            className="rounded-lg border border-white/20 px-2.5 py-1.5 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
            title={dark ? 'Light mode' : 'Dark mode'}
        >
            {dark ? '☀️' : '🌙'}
        </button>
    );
}
