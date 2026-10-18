import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Edit3, Users } from 'lucide-react';
import { useMemo } from 'react';

import AdminLayout from '@/layouts/AdminLayout';
import { typeBadgeClass, type OrganizationType } from '@/lib/organizations';

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

export default function Show({ organization }: Props) {
    const positions = useMemo(
        () => [...(organization.positions ?? [])].sort((a, b) => a.position_order - b.position_order),
        [organization.positions],
    );

    return (
        <AdminLayout>
            <Head title={organization.name} />

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
                    {/* HEADER */}
                    <div className="flex flex-col gap-4 border-b border-gray-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1B4332] text-white">
                                <Users size={21} />
                            </div>

                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-lg font-bold text-gray-900">{organization.name}</h1>

                                    <span
                                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${typeBadgeClass(
                                            organization.type,
                                        )}`}
                                    >
                                        {organization.type}
                                    </span>
                                </div>

                                <p className="mt-1 text-sm text-gray-500">Election position set</p>
                            </div>
                        </div>

                        <Link
                            href={`/admin/organizations/${organization.id}/edit`}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2D6A4F] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1B4332]"
                        >
                            <Edit3 size={16} />
                            Edit
                        </Link>
                    </div>

                    {/* POSITION LIST */}
                    <div className="p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h2 className="font-bold text-gray-900">Available Positions</h2>
                                <p className="mt-1 text-xs text-gray-500">Standard positions assigned to this organization.</p>
                            </div>

                            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-[#2D6A4F]">{positions.length} total</span>
                        </div>

                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {positions.map((position, index) => (
                                <div
                                    key={position.id}
                                    className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3 transition hover:border-emerald-200 hover:bg-emerald-50/40"
                                >
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-bold text-[#2D6A4F] shadow-sm">
                                        {String(index + 1).padStart(2, '0')}
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">{position.position_name}</p>
                                        <p className="mt-0.5 text-[11px] text-gray-400">Position {index + 1}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
