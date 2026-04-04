import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { useEffect, useRef } from 'react';

export default function Login({ status, turnstile }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        password: '',
        remember: false,
        cf_turnstile_response: '',
    });
    const widgetRef = useRef(null);
    const widgetIdRef = useRef(null);

    const resetTurnstile = () => {
        if (!turnstile?.enabled) return;
        if (window.turnstile && widgetIdRef.current !== null && widgetIdRef.current !== undefined) {
            window.turnstile.reset(widgetIdRef.current);
        }
        setData('cf_turnstile_response', '');
    };

    useEffect(() => {
        if (!turnstile?.enabled || !turnstile.siteKey || !widgetRef.current) return undefined;
        let cancelled = false;
        const renderWidget = () => {
            if (cancelled || !window.turnstile || !widgetRef.current || widgetIdRef.current !== null) return;
            widgetIdRef.current = window.turnstile.render(widgetRef.current, {
                sitekey: turnstile.siteKey,
                action: 'login',
                theme: 'light',
                callback: (token) => setData('cf_turnstile_response', token),
                'expired-callback': () => setData('cf_turnstile_response', ''),
                'error-callback': () => setData('cf_turnstile_response', ''),
            });
        };
        if (window.turnstile) { renderWidget(); return () => { cancelled = true; }; }
        let script = document.querySelector('script[data-cloudflare-turnstile="true"]');
        const handleLoad = () => renderWidget();
        if (!script) {
            script = document.createElement('script');
            script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
            script.async = true;
            script.defer = true;
            script.dataset.cloudflareTurnstile = 'true';
            document.head.appendChild(script);
        }
        script.addEventListener('load', handleLoad);
        return () => { cancelled = true; script?.removeEventListener('load', handleLoad); };
    }, [setData, turnstile]);

    useEffect(() => {
        if (turnstile?.enabled && (errors.username || errors.password || errors.cf_turnstile_response)) resetTurnstile();
    }, [errors.cf_turnstile_response, errors.username, errors.password, turnstile?.enabled]);

    const submit = (event) => {
        event.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    return (
        <GuestLayout>
            <Head title="Login" />
            <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">Akses Internal</p>
                <h1 className="mt-3 text-2xl font-bold text-gray-900">Masuk ke BMN-BPKH11</h1>
                <p className="mt-3 text-sm leading-6 text-gray-500">Gunakan akun aplikasi untuk mengelola database, transaksi BBM, laporan, dan SPJ.</p>
            </div>
            {status ? <div className="mt-6 rounded-lg border border-primary-pale bg-primary-pale/30 px-4 py-3 text-sm font-medium text-primary-dark">{status}</div> : null}
            <form onSubmit={submit} className="mt-8 space-y-5">
                <div>
                    <InputLabel htmlFor="username" value="Username" className="text-gray-700"/>
                    <TextInput id="username" type="text" name="username" value={data.username}
                        className="mt-2 block w-full rounded-lg border-gray-300" autoComplete="username" isFocused={true}
                        onChange={(event) => setData('username', event.target.value)}/>
                    <InputError message={errors.username} className="mt-2"/>
                </div>
                <div>
                    <InputLabel htmlFor="password" value="Password" className="text-gray-700"/>
                    <TextInput id="password" type="password" name="password" value={data.password}
                        className="mt-2 block w-full rounded-lg border-gray-300" autoComplete="current-password"
                        onChange={(event) => setData('password', event.target.value)}/>
                    <InputError message={errors.password} className="mt-2"/>
                </div>
                <label className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                    <Checkbox name="remember" checked={data.remember} onChange={(event) => setData('remember', event.target.checked)}/>
                    <span className="text-sm text-gray-700">Tetap masuk di perangkat ini</span>
                </label>
                {turnstile?.enabled ? (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <p className="mb-3 text-sm font-medium text-gray-700">Verifikasi keamanan</p>
                        <div ref={widgetRef}/>
                        <InputError message={errors.cf_turnstile_response} className="mt-2"/>
                    </div>
                ) : null}
                <div className="flex items-center justify-end">
                    <PrimaryButton className="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white shadow-none hover:bg-primary-light focus:bg-primary-light" disabled={processing}>
                        {processing ? 'Memproses...' : 'Masuk'}
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
