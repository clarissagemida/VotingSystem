import { Head, Link, router } from '@inertiajs/react';
import { Building2, CheckCircle2, Edit3, Image as ImageIcon, Plus, Search, Trash2, UserRound, UserRoundPlus, Users, Vote, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';

import AdminLayout from '@/layouts/AdminLayout';

import CreatePartylistModal from './CreateModal';
import DeletePartylistModal from './DeleteModal';
import EditPartylistModal from './EditModal';

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

interface Election {
    id: number;
    title: string;
}

interface Organization {
    id: number;
    name: string;
}

interface Candidate {
    id: number;
    partylist_id: number | null;
    candidate_name: string;
    position_name?: string;
    photo: string | null;
    created_at?: string;
    updated_at?: string;
}

interface Partylist {
    id: number;

    partylist_name: string;
    acronym: string;

    election_id: number;
    organization_id: number | null;

    color: string;
    description: string | null;

    logo: string | null;
    banner: string | null;

    election?: Election;
    organization?: Organization;

    candidates?: Candidate[];
    candidates_count?: number;
}

interface Props {
    partylists: Partylist[];
    elections: Election[];
    organizations: Organization[];

    independentCandidatesCount?: number;

    flash?: {
        success?: string;
        error?: string;
    };
}

/*
|--------------------------------------------------------------------------
| CONSTANTS
|--------------------------------------------------------------------------
*/

const PRIMARY = '#1B4332';

/*
|--------------------------------------------------------------------------
| PARTYLIST LOGO URL
|--------------------------------------------------------------------------
*/

const getPartylistLogoUrl = (logo: string | null | undefined): string | null => {
    if (!logo) return null;

    const value = String(logo).trim();

    if (!value) return null;

    if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('blob:')) {
        return value;
    }

    if (value.startsWith('/storage/')) {
        return value;
    }

    if (value.startsWith('storage/')) {
        return `/${value}`;
    }

    if (value.startsWith('/')) {
        return value;
    }

    return `/storage/${value}`;
};

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export default function Index({ partylists, independentCandidatesCount, elections, organizations, flash }: Props) {
    /*
    |--------------------------------------------------------------------------
    | STATE
    |--------------------------------------------------------------------------
    */

    const [search, setSearch] = useState('');
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedPartylist, setSelectedPartylist] = useState<Partylist | null>(null);

    /*
    |--------------------------------------------------------------------------
    | FILTER
    |--------------------------------------------------------------------------
    */

    const filteredPartylists = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) {
            return partylists ?? [];
        }

        return (partylists ?? []).filter((party) => {
            return (
                party.partylist_name?.toLowerCase().includes(keyword) ||
                party.acronym?.toLowerCase().includes(keyword) ||
                party.election?.title?.toLowerCase().includes(keyword) ||
                party.organization?.name?.toLowerCase().includes(keyword) ||
                party.description?.toLowerCase().includes(keyword)
            );
        });
    }, [partylists, search]);

    /*
    |--------------------------------------------------------------------------
    | STATISTICS
    |--------------------------------------------------------------------------
    */

    const totalPartylists = partylists?.length ?? 0;

    const totalCandidates = useMemo(() => {
        return (partylists ?? []).reduce((total, party) => total + (party.candidates_count ?? party.candidates?.length ?? 0), 0);
    }, [partylists]);

    const totalOrganizations = useMemo(() => {
        return new Set((partylists ?? []).map((party) => party.organization_id).filter(Boolean)).size;
    }, [partylists]);

    const totalElections = useMemo(() => {
        return new Set((partylists ?? []).map((party) => party.election_id).filter(Boolean)).size;
    }, [partylists]);

    /*
    |--------------------------------------------------------------------------
    | INDEPENDENT CANDIDATES
    |--------------------------------------------------------------------------
    |
    | Counted server-side (candidates with no partylist).
    | Falls back to 0 so the card always renders.
    |
    */

    const totalIndependentCandidates = independentCandidatesCount ?? 0;

    /*
    |--------------------------------------------------------------------------
    | DELETE PARTYLIST
    |--------------------------------------------------------------------------
    */

    const openEdit = (party: Partylist) => {
        setSelectedPartylist(party);
        setEditOpen(true);
    };
    const closeEdit = () => {
        setEditOpen(false);
        setSelectedPartylist(null);
    };

    const openDelete = (party: Partylist) => {
        setSelectedPartylist(party);
        setDeleteOpen(true);
    };
    const closeDelete = () => {
        setDeleteOpen(false);
        setSelectedPartylist(null);
    };

    /*
    |--------------------------------------------------------------------------
    | PARTYLIST CANDIDATES
    |--------------------------------------------------------------------------
    */

    const openCandidatePage = (party: Partylist) => {
        if (!party?.id) {
            Swal.fire({
                icon: 'error',
                title: 'Unable to Open Candidates',
                text: 'The selected partylist does not have a valid ID.',
            });

            return;
        }

        router.visit(`/admin/partylists/${party.id}/candidates`, {
            preserveScroll: false,
            preserveState: false,
        });
    };

    /*
    |--------------------------------------------------------------------------
    | INDEPENDENT CANDIDATES
    |--------------------------------------------------------------------------
    |
    | Independent candidates are NOT assigned to a partylist.
    |
    | They should therefore have their own management page.
    |
    */

    const openIndependentCandidatePage = () => {
        Swal.fire({
            icon: 'info',
            title: 'Independent Candidates',
            text: 'Independent candidates are not members of a partylist. You will manage them separately by election, organization, and position.',
            showCancelButton: true,
            confirmButtonText: 'Manage Independent Candidates',
            cancelButtonText: 'Cancel',
            confirmButtonColor: PRIMARY,
            cancelButtonColor: '#64748B',
            reverseButtons: true,
        }).then((result) => {
            if (!result.isConfirmed) return;

            router.visit(route('admin.independent-candidates.index'), {
                preserveScroll: false,
                preserveState: false,
            });
        });
    };

    /*
    |--------------------------------------------------------------------------
    | FLASH
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (flash?.success) {
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: flash.success,
                timer: 1600,
                showConfirmButton: false,
            });
        }

        if (flash?.error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: flash.error,
            });
        }
    }, [flash]);

    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (
        <AdminLayout>
            <Head title="Partylist Management" />

            <div className="min-h-full bg-[#F6F8F7] px-1 pb-10 sm:px-2">
                {/* ============================================================
                    PAGE HEADER
                ============================================================ */}

                <section className="mb-6 overflow-hidden rounded-2xl bg-[#143728] shadow-sm">
                    <div className="relative px-5 py-6 sm:px-7 sm:py-7">
                        <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-white/[0.04]" />

                        <div className="absolute right-40 -bottom-28 h-52 w-52 rounded-full bg-white/[0.035]" />

                        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            {/* HEADER INFORMATION */}

                            <div className="flex min-w-0 items-start gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/15">
                                    <Vote size={27} strokeWidth={2} />
                                </div>

                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2.5">
                                        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Partylist Management</h1>

                                        <span className="rounded-md bg-white/10 px-2.5 py-1 text-[9px] font-bold tracking-wider text-white/80 uppercase ring-1 ring-white/10">
                                            Admin
                                        </span>
                                    </div>

                                    <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
                                        Manage partylists, organizations, elections, party identity, and candidate assignments in one place.
                                    </p>

                                    <div className="mt-4 flex flex-wrap items-center gap-2">
                                        <span className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.07] px-2.5 py-1.5 text-[11px] font-semibold text-white/75">
                                            <CheckCircle2 size={13} />
                                            Party Management
                                        </span>

                                        <span className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.07] px-2.5 py-1.5 text-[11px] font-semibold text-white/75">
                                            <Users size={13} />
                                            Candidate Assignment
                                        </span>

                                        <span className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.07] px-2.5 py-1.5 text-[11px] font-semibold text-white/75">
                                            <UserRoundPlus size={13} />
                                            Independent Candidates
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* HEADER BUTTONS */}

                            <div className="flex flex-col gap-2 sm:flex-row">
                                {/* INDEPENDENT CANDIDATE */}

                                <button
                                    type="button"
                                    onClick={openIndependentCandidatePage}
                                    className="inline-flex min-h-[44px] shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-white/15 active:scale-[0.98]"
                                >
                                    <UserRoundPlus size={18} strokeWidth={2.5} />
                                    Independent Candidates
                                </button>

                                {/* ADD PARTYLIST */}

                                <button
                                    type="button"
                                    onClick={() => setCreateOpen(true)}
                                    className="inline-flex min-h-[44px] shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#143728] shadow-sm transition hover:bg-gray-100 active:scale-[0.98]"
                                >
                                    <Plus size={18} strokeWidth={2.5} />
                                    Add Partylist
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ============================================================
                    STATISTICS
                ============================================================ */}

                <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                    {[
                        {
                            label: 'Total Partylists',
                            value: totalPartylists,
                            description: 'Registered party groups',
                            icon: Vote,
                            iconClass: 'bg-[#1B4332] text-white',
                        },
                        {
                            label: 'Total Candidates',
                            value: totalCandidates,
                            description: 'Assigned candidates',
                            icon: Users,
                            iconClass: 'bg-blue-600 text-white',
                        },
                        {
                            label: 'Independent Candidates',
                            value: totalIndependentCandidates,
                            description: 'No partylist affiliation',
                            icon: UserRound,
                            iconClass: 'bg-teal-600 text-white',
                        },
                        {
                            label: 'Organizations',
                            value: totalOrganizations,
                            description: 'Linked organizations',
                            icon: Building2,
                            iconClass: 'bg-violet-600 text-white',
                        },
                        {
                            label: 'Elections',
                            value: totalElections,
                            description: 'Elections with partylists',
                            icon: Vote,
                            iconClass: 'bg-orange-500 text-white',
                        },
                    ].map((item) => {
                        const Icon = item.icon;

                        return (
                            <div
                                key={item.label}
                                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">{item.label}</p>

                                        <p className="mt-1 text-3xl font-bold tracking-tight text-gray-900">{item.value}</p>

                                        <p className="mt-0.5 text-[11px] font-medium text-gray-500">{item.description}</p>
                                    </div>

                                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${item.iconClass}`}>
                                        <Icon size={21} strokeWidth={2} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </section>

                {/* ============================================================
                    SEARCH
                ============================================================ */}

                <section className="mb-5 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <div className="relative flex-1">
                            <Search size={18} className="absolute top-1/2 left-3.5 -translate-y-1/2 text-gray-400" />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search partylist, acronym, election, organization..."
                                className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 pr-10 pl-10 text-sm font-medium text-gray-900 transition outline-none placeholder:text-gray-400 focus:border-[#1B4332] focus:bg-white focus:ring-3 focus:ring-[#1B4332]/10"
                            />

                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch('')}
                                    className="absolute top-1/2 right-2 flex -translate-y-1/2 cursor-pointer items-center justify-center rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                                    title="Clear search"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        <div className="flex h-11 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 px-4 text-xs font-semibold text-gray-500">
                            Showing
                            <span className="mx-1.5 text-sm font-bold text-[#1B4332]">{filteredPartylists.length}</span>
                            of
                            <span className="ml-1.5 text-sm font-bold text-gray-800">{totalPartylists}</span>
                        </div>
                    </div>
                </section>

                {/* ============================================================
                    TABLE
                ============================================================ */}

                <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EAF2ED] text-[#1B4332]">
                                <Vote size={19} />
                            </div>

                            <div>
                                <h2 className="text-sm font-bold text-gray-900">Registered Partylists</h2>

                                <p className="mt-0.5 text-[11px] text-gray-500">Party information and candidate assignments.</p>
                            </div>
                        </div>

                        <span className="w-fit rounded-md bg-gray-50 px-3 py-1.5 text-[11px] font-semibold text-gray-500 ring-1 ring-gray-200">
                            {filteredPartylists.length} {filteredPartylists.length === 1 ? 'partylist' : 'partylists'}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1050px]">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="px-5 py-3.5 text-left text-[10px] font-bold tracking-wider text-gray-500 uppercase">Partylist</th>

                                    <th className="px-5 py-3.5 text-left text-[10px] font-bold tracking-wider text-gray-500 uppercase">Election</th>

                                    <th className="px-5 py-3.5 text-left text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                                        Organization
                                    </th>

                                    <th className="px-5 py-3.5 text-left text-[10px] font-bold tracking-wider text-gray-500 uppercase">Color</th>

                                    <th className="px-5 py-3.5 text-center text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                                        Candidates
                                    </th>

                                    <th className="px-5 py-3.5 text-right text-[10px] font-bold tracking-wider text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {filteredPartylists.length > 0 ? (
                                    filteredPartylists.map((party) => {
                                        const candidateCount = party.candidates_count ?? party.candidates?.length ?? 0;

                                        const logoUrl = getPartylistLogoUrl(party.logo);

                                        return (
                                            <tr key={party.id} className="group transition hover:bg-[#F8FBF9]">
                                                {/* PARTYLIST */}

                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-sm ring-1 ring-gray-200"
                                                            style={{
                                                                backgroundColor: party.color || PRIMARY,
                                                            }}
                                                        >
                                                            {logoUrl ? (
                                                                <img
                                                                    src={logoUrl}
                                                                    alt={`${party.partylist_name} logo`}
                                                                    className="h-full w-full bg-white object-contain p-1"
                                                                    onError={(e) => {
                                                                        e.currentTarget.style.display = 'none';

                                                                        const fallback = e.currentTarget.parentElement?.querySelector(
                                                                            '.logo-fallback',
                                                                        ) as HTMLElement | null;

                                                                        if (fallback) {
                                                                            fallback.style.display = 'flex';
                                                                        }
                                                                    }}
                                                                />
                                                            ) : null}

                                                            <div
                                                                className={`logo-fallback absolute inset-0 ${
                                                                    logoUrl ? 'hidden' : 'flex'
                                                                } items-center justify-center`}
                                                            >
                                                                <ImageIcon size={21} className="text-white/90" />
                                                            </div>
                                                        </div>

                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-1.5">
                                                                <p className="max-w-[240px] truncate text-sm font-bold text-gray-900">
                                                                    {party.partylist_name}
                                                                </p>

                                                                <CheckCircle2 size={14} className="shrink-0 text-[#1B4332]" />
                                                            </div>

                                                            <div className="mt-1.5 flex items-center gap-2">
                                                                <span
                                                                    className="rounded px-2 py-0.5 text-[9px] font-bold tracking-wide text-white uppercase"
                                                                    style={{
                                                                        backgroundColor: party.color || PRIMARY,
                                                                    }}
                                                                >
                                                                    {party.acronym}
                                                                </span>

                                                                {party.description && (
                                                                    <p className="max-w-[180px] truncate text-[10px] text-gray-400">
                                                                        {party.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* ELECTION */}

                                                <td className="px-5 py-4">
                                                    <p className="max-w-[180px] truncate text-xs font-semibold text-gray-800">
                                                        {party.election?.title || '—'}
                                                    </p>
                                                </td>

                                                {/* ORGANIZATION */}

                                                <td className="px-5 py-4">
                                                    <div className="flex max-w-[190px] items-center gap-2">
                                                        <Building2 size={15} className="shrink-0 text-[#1B4332]" />

                                                        <span className="truncate text-xs font-semibold text-gray-700">
                                                            {party.organization?.name || 'Independent'}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* COLOR */}

                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2.5">
                                                        <span
                                                            className="h-7 w-7 shrink-0 rounded-full border border-white shadow-sm ring-1 ring-gray-200"
                                                            style={{
                                                                backgroundColor: party.color || PRIMARY,
                                                            }}
                                                        />

                                                        <span className="font-mono text-[10px] font-bold text-gray-500 uppercase">
                                                            {party.color || PRIMARY}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* CANDIDATES */}

                                                <td className="px-5 py-4 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => openCandidatePage(party)}
                                                        className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-blue-700 transition hover:border-blue-200 hover:bg-blue-100 active:scale-95"
                                                        title={`Manage candidates for ${party.partylist_name}`}
                                                    >
                                                        <Users size={15} />

                                                        <span className="text-sm font-bold">{candidateCount}</span>
                                                    </button>
                                                </td>

                                                {/* ACTIONS */}

                                                <td className="px-5 py-4">
                                                    <div className="flex justify-end gap-1.5">
                                                        {/* CANDIDATES */}

                                                        <button
                                                            type="button"
                                                            onClick={() => openCandidatePage(party)}
                                                            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-[11px] font-bold text-white transition hover:bg-blue-700 active:scale-95"
                                                            title={`Manage candidates for ${party.partylist_name}`}
                                                        >
                                                            <Users size={14} />
                                                            Candidates
                                                        </button>

                                                        {/* EDIT */}

                                                        <button
                                                            type="button"
                                                            onClick={() => openEdit(party)}
                                                            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-700 transition hover:bg-amber-100 active:scale-95"
                                                            title="Edit Partylist"
                                                        >
                                                            <Edit3 size={15} />
                                                        </button>

                                                        {/* DELETE */}

                                                        <button
                                                            type="button"
                                                            onClick={() => openDelete(party)}
                                                            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100 active:scale-95"
                                                            title="Delete Partylist"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-20">
                                            <div className="mx-auto flex max-w-sm flex-col items-center text-center">
                                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                                                    <Vote size={28} />
                                                </div>

                                                <h3 className="mt-4 text-base font-bold text-gray-800">No Partylists Found</h3>

                                                <p className="mt-1.5 text-xs leading-5 text-gray-500">
                                                    {search
                                                        ? 'No partylist matches your search. Try another keyword.'
                                                        : 'There are currently no registered partylists.'}
                                                </p>

                                                {!search && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setCreateOpen(true)}
                                                        className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#1B4332] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#143728] active:scale-95"
                                                    >
                                                        <Plus size={15} />
                                                        Add First Partylist
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>

            <CreatePartylistModal open={createOpen} onClose={() => setCreateOpen(false)} elections={elections} organizations={organizations} />
            <EditPartylistModal open={editOpen} onClose={closeEdit} partylist={selectedPartylist} elections={elections} organizations={organizations} />
            <DeletePartylistModal open={deleteOpen} onClose={closeDelete} partylist={selectedPartylist} />
        </AdminLayout>
    );
}
