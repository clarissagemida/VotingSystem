import AdminLayout from '@/layouts/AdminLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        start_at: '',
        end_at: '',
    });

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();

        post('/admin/elections', {
            preserveScroll: true,

            onSuccess: () => {
                router.visit('/admin/elections');
            },
        });
    };

    return (
        <AdminLayout>
            <Head title="Create Election" />

            <div className="mx-auto max-w-2xl">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Create Election</h1>

                    <p className="mt-1 text-sm text-gray-500">Create a new election.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">Election Title</label>

                        <input
                            type="text"
                            value={data.title}
                            onChange={(event) => setData('title', event.target.value)}
                            placeholder="Enter election title"
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#40916C] focus:ring-2 focus:ring-green-100"
                        />

                        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">Description</label>

                        <textarea
                            value={data.description}
                            onChange={(event) => setData('description', event.target.value)}
                            rows={4}
                            placeholder="Enter election description"
                            className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#40916C] focus:ring-2 focus:ring-green-100"
                        />

                        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">Start Date & Time</label>

                        <input
                            type="datetime-local"
                            value={data.start_at}
                            onChange={(event) => setData('start_at', event.target.value)}
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#40916C] focus:ring-2 focus:ring-green-100"
                        />

                        {errors.start_at && <p className="mt-1 text-sm text-red-600">{errors.start_at}</p>}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">End Date & Time</label>

                        <input
                            type="datetime-local"
                            value={data.end_at}
                            onChange={(event) => setData('end_at', event.target.value)}
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#40916C] focus:ring-2 focus:ring-green-100"
                        />

                        {errors.end_at && <p className="mt-1 text-sm text-red-600">{errors.end_at}</p>}
                    </div>

                    <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">
                        <button
                            type="button"
                            onClick={() => router.visit('/admin/elections')}
                            className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-[#2D6A4F] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1B4332] disabled:opacity-50"
                        >
                            {processing ? 'Creating...' : 'Create Election'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
