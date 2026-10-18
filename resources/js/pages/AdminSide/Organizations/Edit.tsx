import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Edit3 } from 'lucide-react';
import { FormEvent } from 'react';

import AdminLayout from '@/layouts/AdminLayout';
import { defaultNameForType, hasFixedName, organizationTypeLabels, positionSets, typeBadgeClass, type OrganizationType } from '@/lib/organizations';

interface Position {
    id: number;
    position_name: string;
    position_order: number;
}

interface Organization {
    id: number;
    name: string;
    type: OrganizationType;
    positions: Position[];
}

interface Props {
    organization: Organization;
}

export default function Edit({ organization }: Props) {
    const { data, setData, patch, processing, errors } = useForm({
        name: organization.name ?? '',
        type: organization.type,
    });

    const handleTypeChange = (value: OrganizationType) => {
        setData('type', value);
        setData('name', defaultNameForType(value));
    };

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();

        patch(`/admin/organizations/${organization.id}`, {
            preserveScroll: true,

            onSuccess: () => router.visit('/admin/organizations'),
        });
    };

    const fixedName = hasFixedName(data.type);

    return (
        <AdminLayout>
            <Head title="Edit Organization" />

            <div className="mx-auto max-w-2xl space-y-6">
                <button
                    type="button"
                    onClick={() => router.visit('/admin/organizations')}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-gray-800"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Organizations
                </button>

                <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-5">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1B4332] text-white">
                            <Edit3 size={21} />
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-lg font-bold text-gray-900">Edit Organization</h1>

                            <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${typeBadgeClass(organization.type)}`}>
                                {organization.type}
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-6 p-6">
                            {/* TYPE */}
                            <div>
                                <label className="mb-2 block text-sm font-bold text-gray-800">Organization Type</label>

                                <select
                                    value={data.type}
                                    onChange={(event) => handleTypeChange(event.target.value as OrganizationType)}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm font-medium text-gray-800 transition outline-none focus:border-[#40916C] focus:bg-white focus:ring-4 focus:ring-[#40916C]/10"
                                >
                                    {(Object.keys(organizationTypeLabels) as OrganizationType[]).map((value) => (
                                        <option key={value} value={value}>
                                            {organizationTypeLabels[value]}
                                        </option>
                                    ))}
                                </select>

                                {errors.type && <p className="mt-2 text-xs font-medium text-red-600">{errors.type}</p>}
                            </div>

                            {/* NAME */}
                            <div>
                                <label className="mb-2 block text-sm font-bold text-gray-800">Organization Name</label>

                                <input
                                    type="text"
                                    value={data.name}
                                    disabled={fixedName}
                                    onChange={(event) => setData('name', event.target.value)}
                                    className={`w-full rounded-xl border px-4 py-3.5 text-sm transition outline-none focus:ring-4 focus:ring-[#40916C]/10 ${
                                        fixedName
                                            ? 'cursor-not-allowed border-gray-200 bg-gray-100 font-medium text-gray-500'
                                            : 'border-gray-200 bg-gray-50 text-gray-900 focus:border-[#40916C] focus:bg-white'
                                    }`}
                                />

                                {errors.name && <p className="mt-2 text-xs font-medium text-red-600">{errors.name}</p>}
                            </div>

                            {/* POSITION SET PREVIEW */}
                            <div>
                                <div className="mb-3 flex items-center justify-between">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-800">Position Set</label>
                                        <p className="mt-1 text-xs text-gray-500">Changing the type rebuilds the positions on save.</p>
                                    </div>

                                    <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-[#2D6A4F]">
                                        {positionSets[data.type].length} positions
                                    </span>
                                </div>

                                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                        {positionSets[data.type].map((position, index) => (
                                            <div
                                                key={position}
                                                className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-3 py-2.5 shadow-sm"
                                            >
                                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-xs font-bold text-[#2D6A4F]">
                                                    {String(index + 1).padStart(2, '0')}
                                                </span>

                                                <span className="text-sm font-medium text-gray-700">{position}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50 px-6 py-4 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => router.visit('/admin/organizations')}
                                disabled={processing}
                                className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1B4332] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#143728] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <CheckCircle2 size={17} />
                                {processing ? 'Saving...' : 'Update Organization'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
