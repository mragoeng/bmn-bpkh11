import InputError from '@/Components/InputError';
import { useForm } from '@inertiajs/react';

export default function CsvImportCard({
    title,
    description,
    action,
    templateUrl,
    columns,
}) {
    const form = useForm({
        file: null,
    });

    const submit = (event) => {
        event.preventDefault();

        form.post(action, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                form.clearErrors();
            },
        });
    };

    return (
        <div className="rounded-[24px] border border-stone-200 dark:border-gray-700 bg-stone-50 dark:bg-gray-800 p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <p className="text-sm font-semibold text-stone-950 dark:text-gray-100">{title}</p>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-stone-600 dark:text-gray-400">
                        {description}
                    </p>
                </div>
                <a
                    href={templateUrl}
                    className="rounded-2xl border border-stone-300 dark:border-gray-600 px-4 py-3 text-sm font-medium text-stone-700 dark:text-gray-300"
                >
                    Unduh Template CSV
                </a>
            </div>

            <div className="mt-4 rounded-2xl bg-white dark:bg-gray-700 p-4 text-sm text-stone-700 dark:text-gray-300">
                <p className="font-medium text-stone-900 dark:text-gray-100">Kolom CSV yang didukung</p>
                <div className="mt-3 flex flex-wrap gap-2">
                    {columns.map((column) => (
                        <span
                            key={column}
                            className="rounded-full bg-amber-100 dark:bg-amber-900/40 px-3 py-1.5 text-xs text-amber-950 dark:text-amber-300"
                        >
                            {column}
                        </span>
                    ))}
                </div>
                <p className="mt-4 text-sm leading-6 text-stone-600 dark:text-gray-400">
                    Dari Google Sheets gunakan menu <span className="font-medium">File &gt; Download &gt; Comma-separated values (.csv)</span>, lalu upload file hasilnya di sini.
                </p>
            </div>

            <form onSubmit={submit} className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-start">
                <div className="flex-1">
                    <input
                        type="file"
                        accept=".csv,text/csv"
                        className="w-full rounded-2xl border border-stone-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-stone-700 dark:text-gray-200 px-4 py-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-stone-100 dark:file:bg-gray-600 file:px-3 file:py-1 file:text-sm file:font-medium file:text-stone-700 dark:file:text-gray-200"
                        onChange={(event) =>
                            form.setData('file', event.target.files?.[0] || null)
                        }
                    />
                    <InputError className="mt-2" message={form.errors.file} />
                </div>
                <button
                    type="submit"
                    disabled={form.processing}
                    className="rounded-2xl bg-stone-900 dark:bg-gray-600 px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
                >
                    {form.processing ? 'Mengimpor...' : 'Import CSV'}
                </button>
            </form>
        </div>
    );
}
