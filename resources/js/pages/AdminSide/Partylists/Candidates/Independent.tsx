import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Building2, CheckCircle2, Edit3, Plus, Search, Trash2, UserRound, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';

import AdminLayout from '@/layouts/AdminLayout';
import { PRIMARY, getCandidatePhotoUrl, type Candidate } from '@/lib/candidates';
import { confirmDelete } from '@/lib/confirm';

interface Props {
    candidates: Candidate[];
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function Independent({ candidates, flash }: Props) {
    const [search, setSearch] = useState('');

    const filteredCandidates = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) {
            return candidates ?? [];
        }

        return (candidates ?? []).filter((candidate) => {
            return (
                candidate.candidate_name?.toLowerCase().includes(keyword) ||
                candidate.position_name?.toLowerCase().includes(keyword) ||
                candidate.election?.title?.toLowerCase().includes(keyword) ||
                candidate.organization?.name?.toLowerCase().includes(keyword)
            );
        });
    }, [candidates, search]);

    /*
    |--------------------------------------------------------------------------
    | STATISTICS
    |--------------------------------------------------------------------------
    */

    const totalCandidates = candidates?.length ?? 0;

    const totalElections = useMemo(() => {
        return new Set((candidates ?? []).map((candidate) => candidate.election_id).filter(Boolean)).size;
    }, [candidates]);

    const totalOrganizations = useMemo(() => {
        return new Set((candidates ?? []).map((candidate) => candidate.organization_id).filter(Boolean)).size;
    }, [candidates]);

    /*
    |--------------------------------------------------------------------------
    | DELETE
    |--------------------------------------------------------------------------
    */

    const deleteCandidate = async (candidate: Candidate) => {
        const confirmed = await confirmDelete({
            title: 'Delete Independent Candidate?',
            itemName: candidate.candidate_name,
            subtitle: 'This action cannot be undone.',
        });

        if (!confirmed) {
            return;
        }

        router.delete(`/admin/independent-candidates/${candidate.id}`, {
            preserveScroll: true,
        });
    };

    /*
    |--------------------------------------------------------------------------
    | FLASH MESSAGE
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
                confirmButtonColor: PRIMARY,
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
            <Head title="Independent Candidates" />

            <div className="min-h-full space-y-6">
                {/* PAGE HEADER */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <Link href="/admin/partylists" className="w-fit cursor-pointer text-left">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1B4332] text-white shadow-sm">
                                <UserRound size={22} />
                            </div>

                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Independent Candidates</h1>

                                <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-500">
                                    <ArrowLeft size={13} />
                                    Back to Partylist Management
                                </p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/admin/independent-candidates/create"
                        className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1B4332] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#143728] focus:ring-4 focus:ring-[#1B4332]/20 focus:outline-none active:scale-95"
                    >
                        <Plus size={18} strokeWidth={2.5} />
                        Add Independent Candidate
                    </Link>
                </div>

                {/* STATISTICS */}
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Independent Candidates</p>

                                <p className="mt-1 text-3xl font-bold tracking-tight text-gray-900">{totalCandidates}</p>

                                <p className="mt-1 text-xs text-gray-400">Registered candidates</p>
                            </div>

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-[#2D6A4F] transition group-hover:bg-[#1B4332] group-hover:text-white">
                                <UserRound size={22} />
                            </div>
                        </div>
                    </div>

                    <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Elections</p>

                                <p className="mt-1 text-3xl font-bold tracking-tight text-gray-900">{totalElections}</p>

                                <p className="mt-1 text-xs text-gray-400">Elections represented</p>
                            </div>

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                                <CheckCircle2 size={22} />
                            </div>
                        </div>
                    </div>

                    <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Organizations</p>

                                <p className="mt-1 text-3xl font-bold tracking-tight text-gray-900">{totalOrganizations}</p>

                                <p className="mt-1 text-xs text-gray-400">Linked organizations</p>
                            </div>

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600 transition group-hover:bg-violet-600 group-hover:text-white">
                                <Building2 size={22} />
                            </div>
                        </div>
                    </div>
                </section>

                {/* TABLE */}
                <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative w-full sm:max-w-xs">
                            <Search size={17} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search candidates..."
                                className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pr-9 pl-9 text-sm font-medium text-gray-900 transition outline-none placeholder:text-gray-400 focus:border-[#1B4332] focus:bg-white focus:ring-3 focus:ring-[#1B4332]/10"
                            />

                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch('')}
                                    className="absolute top-1/2 right-1.5 flex -translate-y-1/2 cursor-pointer items-center justify-center rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                                >
                                    <X size={15} />
                                </button>
                            )}
                        </div>

                        <span className="w-fit rounded-md bg-gray-50 px-3 py-1.5 text-[11px] font-semibold text-gray-500 ring-1 ring-gray-200">
                            {filteredCandidates.length} {filteredCandidates.length === 1 ? 'candidate' : 'candidates'}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[860px]">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="px-5 py-3.5 text-left text-[10px] font-bold tracking-wider text-gray-500 uppercase">Candidate</th>

                                    <th className="px-5 py-3.5 text-left text-[10px] font-bold tracking-wider text-gray-500 uppercase">Position</th>

                                    <th className="px-5 py-3.5 text-left text-[10px] font-bold tracking-wider text-gray-500 uppercase">Platform</th>

                                    <th className="px-5 py-3.5 text-left text-[10px] font-bold tracking-wider text-gray-500 uppercase">Election</th>

                                    <th className="px-5 py-3.5 text-left text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                                        Organization
                                    </th>

                                    <th className="px-5 py-3.5 text-right text-[10px] font-bold tracking-wider text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {filteredCandidates.length > 0 ? (
                                    filteredCandidates.map((candidate) => {
                                        const photoUrl = getCandidatePhotoUrl(candidate.photo);

                                        return (
                                            <tr key={candidate.id} className="group transition hover:bg-[#F8FBF9]">
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#1B4332] shadow-sm ring-1 ring-gray-200">
                                                            {photoUrl ? (
                                                                <img
                                                                    src={photoUrl}
                                                                    alt={candidate.candidate_name}
                                                                    className="h-full w-full bg-white object-cover"
                                                                    onError={(e) => {
                                                                        e.currentTarget.style.display = 'none';
                                                                    }}
                                                                />
                                                            ) : (
                                                                <UserRound size={22} className="text-white/90" />
                                                            )}
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="max-w-[220px] truncate text-sm font-bold text-gray-900">
                                                                {candidate.candidate_name}
                                                            </p>

                                                            <div className="mt-1">
                                                                <span className="inline-flex items-center gap-1 rounded bg-[#EAF2ED] px-2 py-0.5 text-[9px] font-bold tracking-wide text-[#1B4332] uppercase">
                                                                    <UserRound size={10} />
                                                                    Independent
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span className="rounded-md bg-gray-100 px-2.5 py-1.5 text-xs font-bold text-gray-700">
                                                        {candidate.position_name}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <p className="max-w-[200px] truncate text-xs text-gray-600">{candidate.platform || '—'}</p>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <p className="max-w-[180px] truncate text-xs font-semibold text-gray-800">
                                                        {candidate.election?.title || '—'}
                                                    </p>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <p className="max-w-[180px] truncate text-xs font-semibold text-gray-700">
                                                        {candidate.organization?.name || '—'}
                                                    </p>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="flex justify-end gap-1.5">
                                                        <Link
                                                            href={`/admin/independent-candidates/${candidate.id}/edit`}
                                                            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-700 transition hover:bg-amber-100 active:scale-95"
                                                            title="Edit Candidate"
                                                        >
                                                            <Edit3 size={15} />
                                                        </Link>

                                                        <button
                                                            type="button"
                                                            onClick={() => deleteCandidate(candidate)}
                                                            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100 active:scale-95"
                                                            title="Delete Candidate"
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
                                                    <UserRound size={28} />
                                                </div>

                                                <h3 className="mt-4 text-base font-bold text-gray-800">No Independent Candidates</h3>

                                                <p className="mt-1.5 text-xs leading-5 text-gray-500">
                                                    {search
                                                        ? 'No independent candidate matches your search.'
                                                        : 'There are currently no registered independent candidates.'}
                                                </p>

                                                {!search && (
                                                    <Link
                                                        href="/admin/independent-candidates/create"
                                                        className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#1B4332] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#143728] active:scale-95"
                                                    >
                                                        <Plus size={15} />
                                                        Add First Candidate
                                                    </Link>
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
        </AdminLayout>
    );
}
