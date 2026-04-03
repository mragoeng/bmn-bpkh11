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
        <div className="rounded-[24px] border border-stone-200 bg-stone-50 p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <p className="text-sm font-semibold text-stone-950">{title}</p>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-stone-600">
                        {description}
                    </p>
                </div>
                <a
                    href={templateUrl}
                    className="rounded-2xl border border-stone-300 px-4 py-3 text-sm font-medium text-stone-700"
                >
                    Unduh Template CSV
                </a>
            </div>

            <div className="mt-4 rounded-2xl bg-white p-4 text-sm text-stone-700">
                <p className="font-medium text-stone-900">Kolom CSV yang didukung</p>
                <div className="mt-3 flex flex-wrap gap-2">
                    {columns.map((column) => (
                        <span
                            key={column}
                            className="rounded-full bg-amber-100 px-3 py-1.5 text-xs text-amber-950"
                        >
                            {column}
                        </span>
                    ))}
                </div>
                <p className="mt-4 text-sm leading-6 text-stone-600">
                    Dari Google Sheets gunakan menu <span className="font-medium">File &gt; Download &gt; Comma-separated values (.csv)</span>, lalu upload file hasilnya di sini.
                </p>
            </div>

            <form onSubmit={submit} className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-start">
                <div className="flex-1">
                    <input
                        type="file"
                        accept=".csv,text/csv"
                        className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm"
                        onChange={(event) =>
                            form.setData('file', event.target.files?.[0] || null)
                        }
                    />
                    <InputError className="mt-2" message={form.errors.file} />
                </div>
                <button
                    type="submit"
                    disabled={form.processing}
                    className="rounded-2xl bg-stone-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
                >
                    {form.processing ? 'Mengimpor...' : 'Import CSV'}
                </button>
            </form>
        </div>
    );
}
