import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Crown, Edit3, Image as ImageIcon, Layers3, Plus, Search, Trash2, UserPlus, Users, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';

import AdminLayout from '@/layouts/AdminLayout';
import { PRIMARY, getCandidatePhotoUrl, type Candidate, type Partylist, type Position } from '@/lib/candidates';
import { confirmDelete } from '@/lib/confirm';

import BulkAddModal from './BulkAddModal';

interface Props {
    partylist: Partylist;
    candidates: Candidate[];
    positions: Position[];
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function Index({ partylist, candidates, positions, flash }: Props) {
    const [search, setSearch] = useState('');

    const [showBulkModal, setShowBulkModal] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | SAFE DATA
    |--------------------------------------------------------------------------
    */

    const candidateList = useMemo(() => candidates ?? [], [candidates]);

    const positionList = useMemo(() => {
        return [...(positions ?? [])].sort((a, b) => Number(a.position_order) - Number(b.position_order));
    }, [positions]);

    const candidateByPosition = useMemo(() => {
        const map: Record<string, Candidate> = {};

        candidateList.forEach((candidate) => {
            map[candidate.position_name] = candidate;
        });

        return map;
    }, [candidateList]);

    /*
    |--------------------------------------------------------------------------
    | STATISTICS
    |--------------------------------------------------------------------------
    */

    const totalPositions = positionList.length;

    const filledPositions = positionList.filter((position) => !!candidateByPosition[position.position_name]).length;

    const availablePositions = totalPositions - filledPositions;

    const isPartylistFull = totalPositions > 0 && filledPositions >= totalPositions;

    const bulkSlots = useMemo(
        () => positionList.filter((position) => !candidateByPosition[position.position_name]),
        [positionList, candidateByPosition],
    );

    /*
    |--------------------------------------------------------------------------
    | SEARCH
    |--------------------------------------------------------------------------
    */

    const filteredCandidates = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) {
            return candidateList;
        }

        return candidateList.filter((candidate) => `${candidate.candidate_name} ${candidate.position_name}`.toLowerCase().includes(keyword));
    }, [candidateList, search]);

    /*
    |--------------------------------------------------------------------------
    | DELETE
    |--------------------------------------------------------------------------
    */

    const deleteCandidate = async (candidate: Candidate) => {
        const confirmed = await confirmDelete({
            title: 'Delete Candidate?',
            itemName: candidate.candidate_name,
            subtitle: `This will remove the candidate from ${candidate.position_name}.`,
        });

        if (!confirmed) {
            return;
        }

        router.delete(`/admin/partylists/${partylist.id}/candidates/${candidate.id}`, { preserveScroll: true });
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
            <Head title={`Candidates - ${partylist.partylist_name}`} />

            <div className="min-h-full bg-[#F3F7F5] pb-12">
                {/* HERO HEADER */}
                <section className="relative mb-7 overflow-hidden rounded-[28px] bg-gradient-to-br from-[#102E22] via-[#1B4332] to-[#2D6A4F] shadow-[0_20px_50px_rgba(20,55,40,0.20)]">
                    <div className="absolute -top-24 -right-20 h-64 w-64 rounded-full bg-white/5" />

                    <div className="absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-white/5" />

                    <div className="relative px-5 py-6 sm:px-8 sm:py-8">
                        {/* BACK BUTTON */}
                        <Link
                            href="/admin/partylists"
                            className="mb-6 inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
                        >
                            <ArrowLeft size={17} />
                            Back to Partylists
                        </Link>

                        <div className="flex flex-col gap-7 xl:flex-row xl:items-center xl:justify-between">
                            {/* PARTYLIST INFORMATION */}
                            <div className="flex items-center gap-4 sm:gap-5">
                                <div
                                    className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-white/30 shadow-xl sm:h-24 sm:w-24"
                                    style={{
                                        backgroundColor: partylist.color || PRIMARY,
                                    }}
                                >
                                    {getCandidatePhotoUrl(partylist.logo) ? (
                                        <img
                                            src={getCandidatePhotoUrl(partylist.logo) as string}
                                            alt={partylist.partylist_name}
                                            className="h-full w-full bg-white object-contain p-2"
                                        />
                                    ) : (
                                        <ImageIcon size={38} className="text-white" />
                                    )}
                                </div>

                                <div>
                                    <div className="mb-2 flex flex-wrap items-center gap-2">
                                        <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-black tracking-wider text-white uppercase">
                                            Candidate Management
                                        </span>

                                        <span
                                            className="rounded-full px-3 py-1 text-[10px] font-black tracking-wider text-white uppercase shadow-sm"
                                            style={{
                                                backgroundColor: partylist.color || PRIMARY,
                                            }}
                                        >
                                            {partylist.acronym}
                                        </span>
                                    </div>

                                    <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">{partylist.partylist_name}</h1>

                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {partylist.election && (
                                            <span className="rounded-lg bg-black/20 px-3 py-1.5 text-xs font-bold text-white">
                                                Election: {partylist.election.title}
                                            </span>
                                        )}

                                        {partylist.organization && (
                                            <span className="rounded-lg bg-black/20 px-3 py-1.5 text-xs font-bold text-white">
                                                Organization: {partylist.organization.name}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* ACTIONS */}
                            <div className="flex flex-col gap-3 sm:flex-row">
                                {!isPartylistFull && (
                                    <button
                                        type="button"
                                        onClick={() => setShowBulkModal(true)}
                                        className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-black text-white backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/20"
                                    >
                                        <Layers3 size={18} />
                                        Add Full Partylist
                                    </button>
                                )}

                                {!isPartylistFull && (
                                    <Link
                                        href={`/admin/partylists/${partylist.id}/candidates/create`}
                                        className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-black text-[#143728] shadow-xl transition hover:-translate-y-0.5 hover:bg-gray-50"
                                    >
                                        <UserPlus size={19} />
                                        Add Candidate
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* STATISTICS */}
                <section className="mb-7 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-black tracking-widest text-gray-500 uppercase">Total Positions</p>

                                <p className="mt-2 text-4xl font-black text-gray-950">{totalPositions}</p>

                                <p className="mt-1 text-xs font-semibold text-gray-500">Organization positions</p>
                            </div>

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                                <Layers3 size={22} />
                            </div>
                        </div>
                    </div>

                    <div className="group rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-black tracking-widest text-emerald-700 uppercase">Filled Positions</p>

                                <p className="mt-2 text-4xl font-black text-emerald-800">{filledPositions}</p>

                                <p className="mt-1 text-xs font-semibold text-emerald-600">Candidates assigned</p>
                            </div>

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                                <CheckCircle2 size={22} />
                            </div>
                        </div>
                    </div>

                    <div className="group rounded-2xl border border-blue-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-black tracking-widest text-blue-700 uppercase">Available Positions</p>

                                <p className="mt-2 text-4xl font-black text-blue-900">{availablePositions}</p>

                                <p className="mt-1 text-xs font-semibold text-blue-600">Still available</p>
                            </div>

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                                <Plus size={22} />
                            </div>
                        </div>
                    </div>
                </section>

                {/* PROGRESS */}
                <section className="mb-7 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-lg font-black text-gray-950">Partylist Completion</h2>

                            <p className="mt-1 text-xs font-medium text-gray-500">Candidate assignment progress</p>
                        </div>

                        <span className="text-2xl font-black text-[#1B4332]">
                            {totalPositions > 0 ? Math.round((filledPositions / totalPositions) * 100) : 0}%
                        </span>
                    </div>

                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-gray-100">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-[#1B4332] to-[#40916C] transition-all duration-500"
                            style={{
                                width: totalPositions > 0 ? `${(filledPositions / totalPositions) * 100}%` : '0%',
                            }}
                        />
                    </div>

                    <div className="mt-3 flex justify-between text-xs font-bold text-gray-500">
                        <span>{filledPositions} filled</span>

                        <span>{availablePositions} remaining</span>
                    </div>
                </section>

                {/* POSITION AVAILABILITY */}
                <section className="mb-7 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-lg font-black text-gray-950">Position Availability</h2>

                            <p className="mt-1 text-xs font-medium text-gray-500">Positions follow the organization order.</p>
                        </div>

                        {isPartylistFull && (
                            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-xs font-black text-emerald-700">
                                <CheckCircle2 size={15} />
                                Partylist Complete
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {positionList.map((position, index) => {
                            const candidate = candidateByPosition[position.position_name];

                            const filled = !!candidate;

                            return (
                                <div
                                    key={position.id}
                                    className={`group rounded-xl border p-4 transition hover:-translate-y-0.5 hover:shadow-sm ${
                                        filled ? 'border-emerald-200 bg-emerald-50/70' : 'border-blue-200 bg-blue-50/70'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
                                                Position #{index + 1}
                                            </span>

                                            <p className="mt-1 text-sm font-black text-gray-900">{position.position_name}</p>
                                        </div>

                                        {filled ? (
                                            <CheckCircle2 size={21} className="shrink-0 text-emerald-600" />
                                        ) : (
                                            <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-blue-500" />
                                        )}
                                    </div>

                                    <div className="mt-3 border-t border-black/5 pt-3">
                                        {filled ? (
                                            <p className="text-xs font-bold text-emerald-700">{candidate.candidate_name}</p>
                                        ) : (
                                            <p className="text-xs font-bold text-blue-700">Position available</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* SEARCH */}
                <section className="mb-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-base font-black text-gray-950">Candidate Directory</h2>

                            <p className="mt-1 text-xs font-medium text-gray-500">Search registered candidates by name or position.</p>
                        </div>

                        <span className="w-fit rounded-full bg-[#1B4332]/10 px-3 py-1.5 text-xs font-black text-[#1B4332]">
                            {filteredCandidates.length} candidate
                            {filteredCandidates.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    <div className="relative mt-4">
                        <Search size={19} className="absolute top-1/2 left-4 -translate-y-1/2 text-[#1B4332]" />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search candidate or position..."
                            className="min-h-[54px] w-full rounded-xl border-2 border-slate-200 bg-slate-50 py-3 pr-12 pl-12 text-[15px] font-bold text-slate-950 caret-[#1B4332] transition outline-none selection:bg-[#1B4332]/20 placeholder:font-medium placeholder:text-slate-400 focus:border-[#1B4332] focus:bg-white focus:ring-4 focus:ring-[#1B4332]/10"
                        />

                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch('')}
                                className="absolute top-1/2 right-3 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-200 hover:text-gray-800"
                            >
                                <X size={17} />
                            </button>
                        )}
                    </div>
                </section>

                {/* CANDIDATE TABLE */}
                <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
                    <div className="flex flex-col gap-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1B4332] text-white shadow-sm">
                                <Users size={20} />
                            </div>

                            <div>
                                <h2 className="text-lg font-black text-gray-950">Registered Candidates</h2>

                                <p className="text-xs font-medium text-gray-500">Candidates assigned to this partylist.</p>
                            </div>
                        </div>

                        {!isPartylistFull && (
                            <Link
                                href={`/admin/partylists/${partylist.id}/candidates/create`}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1B4332] px-4 py-2.5 text-xs font-black text-white transition hover:bg-[#143728]"
                            >
                                <Plus size={16} />
                                Add Candidate
                            </Link>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[850px]">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="px-6 py-4 text-left text-[11px] font-black tracking-widest text-gray-500 uppercase">#</th>

                                    <th className="px-6 py-4 text-left text-[11px] font-black tracking-widest text-gray-500 uppercase">Candidate</th>

                                    <th className="px-6 py-4 text-left text-[11px] font-black tracking-widest text-gray-500 uppercase">Position</th>

                                    <th className="px-6 py-4 text-center text-[11px] font-black tracking-widest text-gray-500 uppercase">Status</th>

                                    <th className="px-6 py-4 text-right text-[11px] font-black tracking-widest text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {filteredCandidates.length > 0 ? (
                                    filteredCandidates.map((candidate, index) => {
                                        const photoUrl = getCandidatePhotoUrl(candidate.photo);

                                        return (
                                            <tr key={candidate.id} className="group transition hover:bg-[#F8FBF9]">
                                                <td className="px-6 py-5">
                                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-xs font-black text-gray-500">
                                                        {index + 1}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div
                                                            className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-sm ring-1 ring-black/5"
                                                            style={{
                                                                backgroundColor: partylist.color || PRIMARY,
                                                            }}
                                                        >
                                                            {photoUrl ? (
                                                                <img
                                                                    src={photoUrl}
                                                                    alt={candidate.candidate_name}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <Users size={25} className="text-white" />
                                                            )}
                                                        </div>

                                                        <div>
                                                            <p className="font-black text-gray-950">{candidate.candidate_name}</p>

                                                            <p className="mt-1 text-xs font-medium text-gray-500">Candidate #{candidate.id}</p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-5">
                                                    <span className="inline-flex items-center gap-2 rounded-lg bg-[#1B4332]/10 px-3 py-2 text-xs font-black text-[#1B4332]">
                                                        <Crown size={13} />

                                                        {candidate.position_name}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-5 text-center">
                                                    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 ring-1 ring-emerald-100">
                                                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                                        Active
                                                    </span>
                                                </td>

                                                <td className="px-6 py-5">
                                                    <div className="flex justify-end gap-2">
                                                        <Link
                                                            href={`/admin/partylists/${partylist.id}/candidates/${candidate.id}/edit`}
                                                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-700 transition hover:-translate-y-0.5 hover:bg-amber-100"
                                                            title="Edit candidate"
                                                        >
                                                            <Edit3 size={17} />
                                                        </Link>

                                                        <button
                                                            type="button"
                                                            onClick={() => deleteCandidate(candidate)}
                                                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 transition hover:-translate-y-0.5 hover:bg-red-100"
                                                            title="Delete candidate"
                                                        >
                                                            <Trash2 size={17} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center">
                                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                                                <Users size={30} className="text-gray-400" />
                                            </div>

                                            <p className="mt-4 font-black text-gray-700">No Candidates Found</p>

                                            <p className="mt-1 text-sm text-gray-500">
                                                {search ? 'Try changing your search keyword.' : 'No candidates have been assigned yet.'}
                                            </p>

                                            {!search && !isPartylistFull && (
                                                <Link
                                                    href={`/admin/partylists/${partylist.id}/candidates/create`}
                                                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#1B4332] px-5 py-3 text-sm font-black text-white transition hover:bg-[#143728]"
                                                >
                                                    <UserPlus size={17} />
                                                    Add First Candidate
                                                </Link>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>

            <BulkAddModal open={showBulkModal} partylist={partylist} slots={bulkSlots} onClose={() => setShowBulkModal(false)} />
        </AdminLayout>
    );
}
