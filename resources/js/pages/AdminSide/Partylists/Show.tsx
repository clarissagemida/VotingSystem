import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Building2, Edit3, Image as ImageIcon, UserRound, Users } from 'lucide-react';
import { useMemo } from 'react';

import AdminLayout from '@/layouts/AdminLayout';
import { PRIMARY, getPartylistLogoUrl, type Partylist } from '@/lib/partylists';

interface Props {
    partylist: Partylist;
}

export default function Show({ partylist }: Props) {
    const logoUrl = getPartylistLogoUrl(partylist.logo);
    const color = partylist.color || PRIMARY;

    const candidates = useMemo(() => partylist.candidates ?? [], [partylist.candidates]);

    return (
        <AdminLayout>
            <Head title={partylist.partylist_name} />

            <div className="mx-auto max-w-3xl space-y-6">
                <button
                    type="button"
                    onClick={() => router.visit('/admin/partylists')}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-gray-800"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Partylists
                </button>

                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    {/* HEADER */}
                    <div
                        className="flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between"
                        style={{ backgroundColor: `${color}14` }}
                    >
                        <div className="flex items-center gap-4">
                            <div
                                className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl shadow-sm ring-1 ring-black/10"
                                style={{ backgroundColor: color }}
                            >
                                {logoUrl ? (
                                    <img
                                        src={logoUrl}
                                        alt={`${partylist.partylist_name} logo`}
                                        className="h-full w-full bg-white object-contain p-1.5"
                                    />
                                ) : (
                                    <ImageIcon size={26} className="text-white/90" />
                                )}
                            </div>

                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-xl font-bold text-gray-900">{partylist.partylist_name}</h1>

                                    <span
                                        className="rounded px-2 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase"
                                        style={{ backgroundColor: color }}
                                    >
                                        {partylist.acronym}
                                    </span>
                                </div>

                                {partylist.description && <p className="mt-1 max-w-lg text-sm text-gray-600">{partylist.description}</p>}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Link
                                href={`/admin/partylists/${partylist.id}/edit`}
                                className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
                            >
                                <Edit3 size={16} />
                                Edit
                            </Link>

                            <Link
                                href={`/admin/partylists/${partylist.id}/candidates`}
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                            >
                                <Users size={16} />
                                Candidates
                            </Link>
                        </div>
                    </div>

                    {/* DETAILS */}
                    <div className="grid gap-4 border-b border-gray-100 px-6 py-5 sm:grid-cols-3">
                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                            <p className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">Election</p>
                            <p className="mt-1 text-sm font-semibold text-gray-800">{partylist.election?.title || '—'}</p>
                        </div>

                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                            <p className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">Organization</p>
                            <div className="mt-1 flex items-center gap-2">
                                <Building2 size={15} className="shrink-0 text-[#1B4332]" />
                                <p className="truncate text-sm font-semibold text-gray-800">{partylist.organization?.name || 'Independent'}</p>
                            </div>
                        </div>

                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                            <p className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">Candidates</p>
                            <div className="mt-1 flex items-center gap-2">
                                <UserRound size={15} className="shrink-0 text-blue-600" />
                                <p className="text-sm font-semibold text-gray-800">{candidates.length}</p>
                            </div>
                        </div>
                    </div>

                    {/* CANDIDATE LIST */}
                    <div className="p-6">
                        <h2 className="mb-4 font-bold text-gray-900">Candidates</h2>

                        {candidates.length === 0 ? (
                            <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
                                No candidates assigned to this partylist yet.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {candidates.map((candidate) => (
                                    <div key={candidate.id} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white text-[#1B4332] shadow-sm">
                                            {candidate.photo ? (
                                                <img src={candidate.photo} alt={candidate.candidate_name} className="h-full w-full object-cover" />
                                            ) : (
                                                <UserRound size={18} />
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-gray-800">{candidate.candidate_name}</p>
                                            <p className="text-[11px] text-gray-400">{candidate.position_name || '—'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
