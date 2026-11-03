
import { Head, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    CheckCircle2,
    AlertCircle,
    Users,
    Info,
} from 'lucide-react';
import type { FormEvent } from 'react';

import AdminLayout from '@/layouts/AdminLayout';
import {
    defaultNameForType,
    hasFixedName,
    organizationTypeLabels,
    organizationDescriptions,
    positionSets,
    type OrganizationType,
} from '@/lib/organizations';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: 'Supreme Student Government',
        type: 'SSG' as OrganizationType,
    });

    const selectedPositions = positionSets[data.type] ?? [];
    const fixedName = hasFixedName(data.type);

    const handleTypeChange = (value: OrganizationType) => {
        setData({
            ...data,
            type: value,
            name: defaultNameForType(value),
        });
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (selectedPositions.length === 0) {
            return;
        }

        post('/admin/organizations', {
            preserveScroll: true,
            onSuccess: () => {
                // The server should redirect to the organization list
                // after successfully saving the organization.
            },
            onError: (formErrors) => {
                console.error('Organization creation failed:', formErrors);
            },
        });
    };

    return (
        <AdminLayout>
            <Head title="Add Organization" />

            <div className="mx-auto max-w-4xl space-y-6 pb-10">
                {/* Back navigation */}
                <button
                    type="button"
                    onClick={() => router.visit('/admin/organizations')}
                    disabled={processing}
                    className="inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-gray-500 transition hover:text-[#1B4332] disabled:opacity-50"
                >
                    <ArrowLeft size={18} />
                    Back to Organizations
                </button>

                {/* Page heading */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#1B4332] text-white shadow-sm">
                            <Building2 size={27} />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                                Add Organization
                            </h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Register an organization and preview its standard election positions.
                            </p>
                        </div>
                    </div>

                    <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-[#1B4332]">
                        <CheckCircle2 size={14} />
                        Organization Setup
                    </span>
                </div>

                {/* Form card */}
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-100 px-6 py-5 sm:px-8">
                        <h2 className="text-base font-bold text-gray-900">
                            Organization Information
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Complete the details below before creating the organization.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-8 p-6 sm:p-8">
                            {/* Organization type */}
                            <section>
                                <label
                                    htmlFor="organization-type"
                                    className="mb-2 block text-sm font-bold text-gray-800"
                                >
                                    Organization Type
                                    <span className="ml-1 text-red-500">*</span>
                                </label>

                                <select
                                    id="organization-type"
                                    name="type"
                                    value={data.type}
                                    required
                                    disabled={processing}
                                    onChange={(event) =>
                                        handleTypeChange(
                                            event.target.value as OrganizationType,
                                        )
                                    }
                                    aria-invalid={Boolean(errors.type)}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm font-medium text-gray-800 outline-none transition focus:border-[#40916C] focus:bg-white focus:ring-4 focus:ring-[#40916C]/10 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {(
                                        Object.keys(
                                            organizationTypeLabels,
                                        ) as OrganizationType[]
                                    ).map((value) => (
                                        <option key={value} value={value}>
                                            {organizationTypeLabels[value]}
                                        </option>
                                    ))}
                                </select>

                                {errors.type && (
                                    <p className="mt-2 text-sm text-red-600">
                                        {errors.type}
                                    </p>
                                )}

                                <div className="mt-3 flex items-start gap-2 rounded-xl bg-gray-50 p-3">
                                    <Info
                                        size={16}
                                        className="mt-0.5 shrink-0 text-[#40916C]"
                                    />
                                    <p className="text-xs leading-5 text-gray-600">
                                        {organizationDescriptions[data.type]}
                                    </p>
                                </div>
                            </section>

                            {/* Organization name */}
                            <section>
                                <label
                                    htmlFor="organization-name"
                                    className="mb-2 block text-sm font-bold text-gray-800"
                                >
                                    Organization Name
                                    <span className="ml-1 text-red-500">*</span>
                                </label>

                                <input
                                    id="organization-name"
                                    name="name"
                                    type="text"
                                    value={data.name}
                                    required
                                    maxLength={255}
                                    disabled={processing || fixedName}
                                    onChange={(event) =>
                                        setData('name', event.target.value)
                                    }
                                    placeholder="Enter the official organization name"
                                    aria-invalid={Boolean(errors.name)}
                                    className={`w-full rounded-xl border px-4 py-3.5 text-sm outline-none transition focus:ring-4 focus:ring-[#40916C]/10 ${
                                        fixedName
                                            ? 'cursor-not-allowed border-gray-200 bg-gray-100 font-medium text-gray-500'
                                            : 'border-gray-200 bg-gray-50 text-gray-900 focus:border-[#40916C] focus:bg-white'
                                    }`}
                                />

                                {errors.name ? (
                                    <p className="mt-2 text-sm text-red-600">
                                        {errors.name}
                                    </p>
                                ) : (
                                    <p className="mt-2 text-xs text-gray-500">
                                        {fixedName
                                            ? 'This organization type has a standard name.'
                                            : 'Enter the official name of your custom organization.'}
                                    </p>
                                )}
                            </section>

                            {/* Position preview */}
                            <section>
                                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h2 className="text-base font-bold text-gray-900">
                                            Standard Position Set
                                        </h2>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Preview the positions associated with this organization type.
                                        </p>
                                    </div>

                                    <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-[#2D6A4F]">
                                        <Users size={14} />
                                        {selectedPositions.length} positions
                                    </span>
                                </div>

                                {selectedPositions.length > 0 ? (
                                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-5">
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            {selectedPositions.map(
                                                (position, index) => (
                                                    <div
                                                        key={`${position}-${index}`}
                                                        className="group flex min-w-0 items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-3 transition hover:border-[#40916C]/50 hover:shadow-sm"
                                                    >
                                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-xs font-bold text-[#2D6A4F] transition group-hover:bg-[#1B4332] group-hover:text-white">
                                                            {String(
                                                                index + 1,
                                                            ).padStart(2, '0')}
                                                        </span>

                                                        <span className="text-sm font-medium text-gray-700">
                                                            {position}
                                                        </span>

                                                        <CheckCircle2
                                                            size={16}
                                                            className="ml-auto shrink-0 text-emerald-600"
                                                        />
                                                    </div>
                                                ),
                                            )}
                                        </div>

                                        <div className="mt-4 flex items-start gap-2 border-t border-gray-200 pt-4">
                                            <Info
                                                size={15}
                                                className="mt-0.5 shrink-0 text-gray-400"
                                            />
                                            <p className="text-xs leading-5 text-gray-500">
                                                This is a preview of the configured
                                                position set. Confirm that your
                                                Laravel controller saves these
                                                positions when the organization
                                                is created.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        role="alert"
                                        className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4"
                                    >
                                        <AlertCircle
                                            size={20}
                                            className="shrink-0 text-amber-600"
                                        />
                                        <div>
                                            <p className="text-sm font-semibold text-amber-800">
                                                No positions configured
                                            </p>
                                            <p className="mt-1 text-xs leading-5 text-amber-700">
                                                Check the positionSets mapping in
                                                src/lib/organizations.ts.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </section>

                            {/* Validation summary */}
                            {Object.keys(errors).length > 0 && (
                                <div
                                    role="alert"
                                    className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
                                >
                                    <AlertCircle
                                        size={19}
                                        className="shrink-0 text-red-600"
                                    />
                                    <div>
                                        <p className="text-sm font-semibold text-red-800">
                                            Unable to create organization
                                        </p>
                                        <p className="mt-1 text-xs leading-5 text-red-700">
                                            Review the validation messages above
                                            and submit the form again.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
                            <button
                                type="button"
                                onClick={() =>
                                    router.visit('/admin/organizations')
                                }
                                disabled={processing}
                                className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={
                                    processing ||
                                    selectedPositions.length === 0 ||
                                    !data.name.trim()
                                }
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1B4332] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#143728] focus:outline-none focus:ring-4 focus:ring-[#40916C]/20 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {processing ? (
                                    <>
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                        Creating Organization...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 size={17} />
                                        Create Organization
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                <p className="text-center text-xs leading-5 text-gray-400">
                    Organization records and position creation are handled by
                    the server. Existing elections and organization data should
                    remain unchanged.
                </p>
            </div>
        </AdminLayout>
    );
}
