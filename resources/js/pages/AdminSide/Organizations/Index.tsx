import { Head, Link, router, usePage } from '@inertiajs/react';
import { Building2, CheckCircle2, Edit3, Eye, Layers3, Plus, Search, Trash2, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';

import AdminLayout from '@/layouts/AdminLayout';
import { confirmDelete } from '@/lib/confirm';

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

interface Position {
    id: number;
    position_name: string;
    position_order: number;
}

interface Organization {
    id: number;
    name: string;
    type: 'SSG' | 'FLP' | 'OTHER';
    positions: Position[];
    created_at: string;
    updated_at: string;
}

interface Props {
    organizations: Organization[];
}

type OrganizationType = 'SSG' | 'FLP' | 'OTHER';

/*
|--------------------------------------------------------------------------
| ORGANIZATION DESCRIPTIONS
|--------------------------------------------------------------------------
*/

const organizationDescriptions: Record<OrganizationType, string> = {
    SSG: 'Supreme Student Government',
    FLP: 'Future Leader of the Philippines',
    OTHER: 'Independent or other recognized organization',
};

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export default function OrganizationIndex({ organizations }: Props) {
    /*
    |--------------------------------------------------------------------------
    | STATES
    |--------------------------------------------------------------------------
    */

    const [search, setSearch] = useState('');

    const [filterType, setFilterType] = useState<'ALL' | OrganizationType>('ALL');

    /*
    |--------------------------------------------------------------------------
    | FLASH MESSAGE
    |--------------------------------------------------------------------------
    */

    const { props } = usePage();

    const flash = (
        props as {
            flash?: {
                organizationCreated?: string;
                organizationUpdated?: string;
                organizationDeleted?: string;
                error?: string;
            };
        }
    ).flash;

    useEffect(() => {
        if (flash?.organizationCreated) {
            Swal.fire({
                icon: 'success',
                title: 'Organization Created',
                text: flash.organizationCreated,
                timer: 1800,
                showConfirmButton: false,
            });
        }

        if (flash?.organizationUpdated) {
            Swal.fire({
                icon: 'success',
                title: 'Organization Updated',
                text: flash.organizationUpdated,
                timer: 1800,
                showConfirmButton: false,
            });
        }

        if (flash?.organizationDeleted) {
            Swal.fire({
                icon: 'success',
                title: 'Organization Deleted',
                text: flash.organizationDeleted,
                timer: 1800,
                showConfirmButton: false,
            });
        }

        if (flash?.error) {
            Swal.fire({
                icon: 'error',
                title: 'Action Failed',
                text: flash.error,
            });
        }
    }, [flash]);

    /*
    |--------------------------------------------------------------------------
    | FILTERED ORGANIZATIONS
    |--------------------------------------------------------------------------
    */

    const filteredOrganizations = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return organizations.filter((organization) => {
            const matchesSearch = !keyword || organization.name.toLowerCase().includes(keyword) || organization.type.toLowerCase().includes(keyword);

            const matchesType = filterType === 'ALL' || organization.type === filterType;

            return matchesSearch && matchesType;
        });
    }, [organizations, search, filterType]);

    /*
    |--------------------------------------------------------------------------
    | COUNTS
    |--------------------------------------------------------------------------
    */

    const totalOrganizations = organizations.length;

    const ssgCount = organizations.filter((organization) => organization.type === 'SSG').length;

    const flpCount = organizations.filter((organization) => organization.type === 'FLP').length;

    const otherCount = organizations.filter((organization) => organization.type === 'OTHER').length;

    /*
    |--------------------------------------------------------------------------
    | DELETE ORGANIZATION
    |--------------------------------------------------------------------------
    */

    const deleteOrganization = async (organization: Organization) => {
        const confirmed = await confirmDelete({
            title: 'Delete Organization?',
            itemName: organization.name,
            subtitle: `${organization.positions.length} position(s) will also be removed.`,
        });

        if (!confirmed) {
            return;
        }

        router.delete(`/admin/organizations/${organization.id}`, {
            preserveScroll: true,
        });
    };

    /*
    |--------------------------------------------------------------------------
    | TYPE BADGE
    |--------------------------------------------------------------------------
    */

    const getTypeBadge = (organizationType: OrganizationType) => {
        if (organizationType === 'SSG') {
            return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
        }

        if (organizationType === 'FLP') {
            return 'bg-blue-50 text-blue-700 ring-blue-200';
        }

        return 'bg-purple-50 text-purple-700 ring-purple-200';
    };

    /*
    |--------------------------------------------------------------------------
    | TYPE ICON BACKGROUND
    |--------------------------------------------------------------------------
    */

    const getTypeIconStyle = (organizationType: OrganizationType) => {
        if (organizationType === 'SSG') {
            return 'bg-emerald-50 text-emerald-700';
        }

        if (organizationType === 'FLP') {
            return 'bg-blue-50 text-blue-700';
        }

        return 'bg-purple-50 text-purple-700';
    };

    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (
        <AdminLayout>
            <Head title="Organization Management" />

            <div className="min-h-full space-y-6">
                {/* ==========================================================
                    PAGE HEADER
                ========================================================== */}

                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1B4332] text-white shadow-sm">
                                <Building2 size={22} />
                            </div>

                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Organization Management</h1>

                                <p className="mt-0.5 text-sm text-gray-500">Manage recognized organizations and their election positions.</p>
                            </div>
                        </div>
                    </div>

                    <Link
                        href="/admin/organizations/create"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1B4332] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#143728] focus:ring-4 focus:ring-[#1B4332]/20 focus:outline-none"
                    >
                        <Plus className="h-5 w-5" />
                        Add Organization
                    </Link>
                </div>

                {/* ==========================================================
                    SUMMARY CARDS
                ========================================================== */}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {/* TOTAL */}

                    <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Organizations</p>

                                <p className="mt-1 text-3xl font-bold tracking-tight text-gray-900">{totalOrganizations}</p>

                                <p className="mt-1 text-xs text-gray-400">All registered organizations</p>
                            </div>

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-[#2D6A4F] transition group-hover:bg-[#1B4332] group-hover:text-white">
                                <Building2 size={23} />
                            </div>
                        </div>
                    </div>

                    {/* SSG */}

                    <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">SSG Organizations</p>

                                <p className="mt-1 text-3xl font-bold tracking-tight text-gray-900">{ssgCount}</p>

                                <p className="mt-1 text-xs text-gray-400">Supreme Student Government</p>
                            </div>

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 transition group-hover:bg-emerald-600 group-hover:text-white">
                                <Users size={23} />
                            </div>
                        </div>
                    </div>

                    {/* FLP */}

                    <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">FLP Organizations</p>

                                <p className="mt-1 text-3xl font-bold tracking-tight text-gray-900">{flpCount}</p>

                                <p className="mt-1 text-xs text-gray-400">Future Leader of the Philippines</p>
                            </div>

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                                <Layers3 size={23} />
                            </div>
                        </div>
                    </div>

                    {/* OTHER */}

                    <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Other Organizations</p>

                                <p className="mt-1 text-3xl font-bold tracking-tight text-gray-900">{otherCount}</p>

                                <p className="mt-1 text-xs text-gray-400">Other recognized organizations</p>
                            </div>

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 transition group-hover:bg-purple-600 group-hover:text-white">
                                <Building2 size={23} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ==========================================================
                    SEARCH / FILTER
                ========================================================== */}

                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="pointer-events-none absolute top-1/2 left-3.5 h-5 w-5 -translate-y-1/2 text-gray-400" />

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search organizations..."
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pr-4 pl-11 text-sm text-gray-900 transition outline-none placeholder:text-gray-400 focus:border-[#40916C] focus:bg-white focus:ring-4 focus:ring-[#40916C]/10"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <select
                                value={filterType}
                                onChange={(event) => setFilterType(event.target.value as 'ALL' | OrganizationType)}
                                className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 transition outline-none focus:border-[#40916C] focus:bg-white focus:ring-4 focus:ring-[#40916C]/10 sm:min-w-[220px]"
                            >
                                <option value="ALL">All Organization Types</option>

                                <option value="SSG">SSG</option>

                                <option value="FLP">FLP</option>

                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* ==========================================================
                    ORGANIZATION TABLE
                ========================================================== */}

                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    {/* TABLE TOP */}

                    <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-[#2D6A4F]">
                                    <Building2 size={17} />
                                </div>

                                <h2 className="text-base font-bold text-gray-900">Organization List</h2>
                            </div>

                            <p className="mt-1 text-xs text-gray-500">
                                Showing <span className="font-semibold text-gray-700">{filteredOrganizations.length}</span> of{' '}
                                <span className="font-semibold text-gray-700">{totalOrganizations}</span> organization(s)
                            </p>
                        </div>

                        <div className="inline-flex items-center gap-2 self-start rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-[#2D6A4F] sm:self-auto">
                            <CheckCircle2 size={14} />
                            Position sets automatically managed
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/80">
                                    <th className="w-16 px-5 py-4 text-left text-[11px] font-bold tracking-wider text-gray-500 uppercase">#</th>

                                    <th className="min-w-[320px] px-5 py-4 text-left text-[11px] font-bold tracking-wider text-gray-500 uppercase">
                                        Organization
                                    </th>

                                    <th className="px-5 py-4 text-left text-[11px] font-bold tracking-wider text-gray-500 uppercase">Type</th>

                                    <th className="px-5 py-4 text-center text-[11px] font-bold tracking-wider text-gray-500 uppercase">Positions</th>

                                    <th className="px-5 py-4 text-right text-[11px] font-bold tracking-wider text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {filteredOrganizations.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20">
                                            <div className="flex flex-col items-center justify-center text-center">
                                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                                                    <Building2 size={30} />
                                                </div>

                                                <h3 className="mt-4 text-base font-bold text-gray-900">No organizations found</h3>

                                                <p className="mt-1 max-w-sm text-sm text-gray-500">
                                                    Try changing your search or filter, or add a new organization.
                                                </p>

                                                {search || filterType !== 'ALL' ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSearch('');
                                                            setFilterType('ALL');
                                                        }}
                                                        className="mt-5 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                                                    >
                                                        Clear Filters
                                                    </button>
                                                ) : (
                                                    <Link
                                                        href="/admin/organizations/create"
                                                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#1B4332] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#143728]"
                                                    >
                                                        <Plus size={17} />
                                                        Add Organization
                                                    </Link>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOrganizations.map((organization, index) => (
                                        <tr key={organization.id} className="group transition hover:bg-emerald-50/30">
                                            {/* NUMBER */}

                                            <td className="px-5 py-5 text-sm font-semibold text-gray-400">{String(index + 1).padStart(2, '0')}</td>

                                            {/* ORGANIZATION */}

                                            <td className="px-5 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition ${getTypeIconStyle(
                                                            organization.type,
                                                        )} `}
                                                    >
                                                        <Building2 size={21} />
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-bold text-gray-900">{organization.name}</p>

                                                        <p className="mt-1 truncate text-xs text-gray-500">
                                                            {organizationDescriptions[organization.type]}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* TYPE */}

                                            <td className="px-5 py-5">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-bold ring-1 ring-inset ${getTypeBadge(
                                                        organization.type,
                                                    )} `}
                                                >
                                                    {organization.type}
                                                </span>
                                            </td>

                                            {/* POSITIONS */}

                                            <td className="px-5 py-5 text-center">
                                                <Link
                                                    href={`/admin/organizations/${organization.id}`}
                                                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-bold text-gray-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-[#2D6A4F]"
                                                >
                                                    <Users size={15} />

                                                    {organization.positions.length}

                                                    <span>positions</span>

                                                    <Eye size={14} />
                                                </Link>
                                            </td>

                                            {/* ACTIONS */}

                                            <td className="px-5 py-5">
                                                <div className="flex justify-end gap-1">
                                                    <Link
                                                        href={`/admin/organizations/${organization.id}/edit`}
                                                        title="Edit organization"
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-blue-50 hover:text-blue-600"
                                                    >
                                                        <Edit3 size={17} />
                                                    </Link>

                                                    <button
                                                        type="button"
                                                        onClick={() => deleteOrganization(organization)}
                                                        title="Delete organization"
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                                                    >
                                                        <Trash2 size={17} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
