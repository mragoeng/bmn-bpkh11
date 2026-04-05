import AppLayout from '@/Layouts/AppLayout';
import InputError from '@/Components/InputError';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function PengaturanUser({ users }) {
    const [editingId, setEditingId] = useState(null);
    const [keyword, setKeyword] = useState('');
    const form = useForm({
        name: '',
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const filteredUsers = users.filter((item) => {
        const query = keyword.toLowerCase();

        return (
            item.name.toLowerCase().includes(query) ||
            item.username.toLowerCase().includes(query) ||
            (item.email || '').toLowerCase().includes(query)
        );
    });

    const submit = (event) => {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                setEditingId(null);
                form.reset();
                form.clearErrors();
            },
        };

        if (editingId) {
            form.put(route('settings.pengaturan-user.update', editingId), options);

            return;
        }

        form.post(route('settings.pengaturan-user.store'), options);
    };

    const editUser = (item) => {
        setEditingId(item.id);
        form.setData({
            name: item.name || '',
            username: item.username || '',
            email: item.email || '',
            password: '',
            password_confirmation: '',
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        form.reset();
        form.clearErrors();
    };

    return (
        <AppLayout
            title="Pengaturan User"
            description="Kelola akun internal yang dapat login ke aplikasi BMN-BPKH11 menggunakan username dan password."
            actions={
                <button
                    type="button"
                    onClick={cancelEdit}
                    className="rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-white"
                >
                    Form Baru
                </button>
            }
        >
            <Head title="Pengaturan User" />

            <div className="space-y-6">
                <form
                    onSubmit={submit}
                    className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 p-6"
                >
                    <div className="mb-5 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {editingId ? 'Edit User' : 'Tambah User'}
                            </p>
                            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Form akun aplikasi
                            </p>
                        </div>
                        {editingId ? (
                            <button
                                type="button"
                                onClick={cancelEdit}
                                className="rounded-2xl border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-700 dark:text-gray-200"
                            >
                                Batal
                            </button>
                        ) : null}
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                        <div>
                            <input
                                className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm"
                                placeholder="Nama lengkap"
                                value={form.data.name}
                                onChange={(event) =>
                                    form.setData('name', event.target.value)
                                }
                            />
                            <InputError className="mt-2" message={form.errors.name} />
                        </div>
                        <div>
                            <input
                                className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm"
                                placeholder="Username"
                                value={form.data.username}
                                onChange={(event) =>
                                    form.setData('username', event.target.value)
                                }
                            />
                            <InputError
                                className="mt-2"
                                message={form.errors.username}
                            />
                        </div>
                        <div className="lg:col-span-2">
                            <input
                                className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm"
                                placeholder="Email opsional"
                                value={form.data.email}
                                onChange={(event) =>
                                    form.setData('email', event.target.value)
                                }
                            />
                            <InputError className="mt-2" message={form.errors.email} />
                        </div>
                        <div>
                            <input
                                type="password"
                                className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm"
                                placeholder={
                                    editingId
                                        ? 'Password baru opsional'
                                        : 'Password'
                                }
                                value={form.data.password}
                                onChange={(event) =>
                                    form.setData('password', event.target.value)
                                }
                            />
                            <InputError
                                className="mt-2"
                                message={form.errors.password}
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm"
                                placeholder="Konfirmasi password"
                                value={form.data.password_confirmation}
                                onChange={(event) =>
                                    form.setData(
                                        'password_confirmation',
                                        event.target.value,
                                    )
                                }
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={form.processing}
                        className="mt-5 rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
                    >
                        {form.processing
                            ? 'Menyimpan...'
                            : editingId
                              ? 'Update User'
                              : 'Simpan User'}
                    </button>
                </form>

                <div className="grid gap-4 grid-cols-2 lg:grid-cols-[0.8fr_1.2fr_1.6fr]">
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 p-5">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total User</p>
                        <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">
                            {users.length}
                        </p>
                    </div>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 p-5">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Username Login</p>
                        <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-200">
                            Semua user login menggunakan username dan password.
                        </p>
                    </div>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
                        <input
                            className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-3 text-sm"
                            placeholder="Cari nama, username, atau email"
                            value={keyword}
                            onChange={(event) => setKeyword(event.target.value)}
                        />
                    </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <table className="min-w-full divide-y divide-stone-200 dark:divide-gray-700 text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700 text-left text-gray-500 dark:text-gray-400">
                            <tr>
                                <th className="px-5 py-4 font-medium">Nama</th>
                                <th className="px-5 py-4 font-medium">Username</th>
                                <th className="px-5 py-4 font-medium">Email</th>
                                <th className="px-5 py-4 font-medium">Dibuat</th>
                                <th className="px-5 py-4 font-medium">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 dark:divide-gray-700">
                            {filteredUsers.length ? (
                                filteredUsers.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-5 py-4 font-medium text-gray-900 dark:text-gray-100">
                                            {item.name}
                                        </td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                                            {item.username}
                                        </td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                                            {item.email || '-'}
                                        </td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                                            {item.created_at || '-'}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => editUser(item)}
                                                    className="rounded-xl border border-gray-300 dark:border-gray-600 px-3 py-2 text-xs text-gray-700 dark:text-gray-200"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={item.is_current_user}
                                                    onClick={() =>
                                                        router.delete(
                                                            route(
                                                                'settings.pengaturan-user.destroy',
                                                                item.id,
                                                            ),
                                                            {
                                                                preserveScroll:
                                                                    true,
                                                            },
                                                        )
                                                    }
                                                    className="rounded-xl border border-rose-200 dark:border-rose-700 px-3 py-2 text-xs text-rose-700 dark:text-rose-400 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    Hapus
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="px-5 py-8 text-center text-gray-500 dark:text-gray-400"
                                    >
                                        Belum ada user yang cocok dengan pencarian.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="space-y-3 md:hidden">
                    {filteredUsers.length ? (
                        filteredUsers.map((item) => (
                            <div
                                key={item.id}
                                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"
                            >
                                <div className="mb-3 flex items-start justify-between">
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                                            {item.name}
                                        </p>
                                        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                                            @{item.username}
                                        </p>
                                    </div>
                                    {item.is_current_user && (
                                        <span className="rounded-full bg-primary-pale/50 dark:bg-primary-dark/30 px-2.5 py-0.5 text-xs font-medium text-primary-dark dark:text-green-300">
                                            Anda
                                        </span>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <span className="text-gray-400 dark:text-gray-500">Email:</span>{' '}
                                        <span className="text-gray-700 dark:text-gray-300">{item.email || '-'}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 dark:text-gray-500">Dibuat:</span>{' '}
                                        <span className="text-gray-700 dark:text-gray-300">{item.created_at || '-'}</span>
                                    </div>
                                </div>
                                <div className="mt-3 flex gap-2 border-t border-gray-100 dark:border-gray-700 pt-3">
                                    <button
                                        type="button"
                                        onClick={() => editUser(item)}
                                        className="flex-1 rounded-xl border border-gray-300 dark:border-gray-600 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 text-center"
                                    >
                                        ✏️ Edit
                                    </button>
                                    <button
                                        type="button"
                                        disabled={item.is_current_user}
                                        onClick={() =>
                                            router.delete(
                                                route(
                                                    'settings.pengaturan-user.destroy',
                                                    item.id,
                                                ),
                                                { preserveScroll: true },
                                            )
                                        }
                                        className="flex-1 rounded-xl border border-rose-200 dark:border-rose-700 px-3 py-2 text-xs font-medium text-rose-700 dark:text-rose-400 disabled:cursor-not-allowed disabled:opacity-50 text-center"
                                    >
                                        🗑️ Hapus
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="py-8 text-center text-gray-500 dark:text-gray-400">
                            Belum ada user yang cocok dengan pencarian.
                        </p>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
