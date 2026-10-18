import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, CheckCircle2, Clock, Eye, FileText, Shield, Users, Vote } from 'lucide-react';
import { useState } from 'react';

import CandidatePreviewModal from '@/components/voter/CandidatePreviewModal';
import CountdownTimer from '@/components/voter/CountdownTimer';
import type { Candidate, ElectionSummary } from '@/components/voter/candidate-types';
import VoterLayout from '@/layouts/VoterLayout';
import { formatDateTimeLong } from '@/lib/format';
import { getImageUrl } from '@/lib/utils';

interface Props {
    election: ElectionSummary;
    candidates: Candidate[];
}

function statusStyle(status: string) {
    switch (status) {
        case 'Ongoing':
            return 'bg-green-50 text-green-700 ring-green-200';
        case 'Upcoming':
            return 'bg-blue-50 text-blue-700 ring-blue-200';
        case 'Completed':
            return 'bg-gray-100 text-gray-600 ring-gray-200';
        default:
            return 'bg-gray-100 text-gray-600 ring-gray-200';
    }
}

export default function Show({ election, candidates }: Props) {
    const [previewCandidate, setPreviewCandidate] = useState<Candidate | null>(null);

    const grouped = candidates.reduce<Record<string, Candidate[]>>((acc, c) => {
        (acc[c.position_name] ??= []).push(c);
        return acc;
    }, {});

    return (
        <VoterLayout>
            <Head title={election.title} />

            <div className="space-y-6 pb-12">
                {/* Back */}
                <Link
                    href="/voter/elections"
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#2D6A4F]"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Elections
                </Link>

                {/* Election Header Card */}
                <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
                    <div className="p-6 sm:p-8">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex items-start gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-[#2D6A4F] shadow-inner">
                                    <Vote className="h-7 w-7" />
                                </div>
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{election.title}</h1>
                                        {election.has_voted && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                You Already Voted
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1.5">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            Starts: {formatDateTimeLong(election.start_at)}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="h-4 w-4 text-gray-400" />
                                            Ends: {formatDateTimeLong(election.end_at)}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Users className="h-4 w-4 text-gray-400" />
                                            {candidates.length} candidate(s)
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <span
                                className={`inline-flex w-fit items-center rounded-full px-3.5 py-1.5 text-xs font-bold ring-1 ring-inset ${statusStyle(
                                    election.status,
                                )}`}
                            >
                                {election.status === 'Ongoing' && <span className="mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />}
                                {election.status}
                            </span>
                        </div>

                        {election.description && <p className="mt-5 max-w-3xl text-sm leading-6 text-gray-600">{election.description}</p>}

                        {/* Live Countdown Timer Section */}
                        {election.status === 'Ongoing' && election.end_at && (
                            <div className="mt-6 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50/70 to-teal-50/50 p-5 shadow-xs">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <CountdownTimer targetDate={election.end_at} label="Voting Closes In" size="lg" />
                                    <div>
                                        {election.has_voted ? (
                                            <Link
                                                href={`/voter/vote-history/${election.id}`}
                                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
                                            >
                                                <CheckCircle2 className="h-4 w-4" />
                                                View My Cast Ballot
                                            </Link>
                                        ) : (
                                            <Link
                                                href={`/voter/elections/${election.id}/vote`}
                                                className="inline-flex items-center gap-2 rounded-xl bg-[#2D6A4F] px-7 py-3 text-sm font-bold text-white shadow-md transition-all duration-200 hover:bg-[#1B4332] hover:shadow-lg focus:ring-2 focus:ring-[#2D6A4F]/30 focus:outline-none"
                                            >
                                                <Vote className="h-4 w-4" />
                                                Vote Now
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {election.status === 'Upcoming' && election.start_at && (
                            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
                                <CountdownTimer targetDate={election.start_at} label="Election Starts In" size="lg" />
                            </div>
                        )}

                        {election.status === 'Completed' && (
                            <div className="mt-6 rounded-2xl border border-rose-100 bg-gradient-to-r from-rose-50/70 to-orange-50/40 p-5">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                                            <Clock className="h-5 w-5" />
                                        </div>
                                        <div>
                                            {election.end_at && (
                                                <CountdownTimer
                                                    targetDate={election.end_at}
                                                    label="Voting Closed In"
                                                    expiredLabel=""
                                                    countUpAfterExpiry
                                                    countUpLabel="Election closed"
                                                    showIcon={false}
                                                    size="lg"
                                                />
                                            )}
                                            <p className="mt-1 text-xs text-gray-500">This election has concluded. Voting is no longer open.</p>
                                        </div>
                                    </div>
                                    {election.has_voted && (
                                        <Link
                                            href={`/voter/vote-history/${election.id}`}
                                            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-xs transition hover:bg-gray-100"
                                        >
                                            <Vote className="h-3.5 w-3.5 text-[#2D6A4F]" />
                                            View Your Submitted Votes
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Candidates by Position */}
                {Object.keys(grouped).length > 0 && (
                    <section className="space-y-8">
                        <div>
                            <h2 className="text-xl font-bold tracking-tight text-gray-900">Candidates Roster</h2>
                            <p className="mt-1 text-sm text-gray-500">View all running candidates and their platforms for this election.</p>
                        </div>

                        {Object.entries(grouped).map(([position, cands]) => (
                            <div key={position} className="space-y-4">
                                {/* Position Header */}
                                <div className="flex items-center gap-3 border-b border-gray-200/80 pb-2">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2D6A4F]/10">
                                        <Shield className="h-4 w-4 text-[#2D6A4F]" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-gray-900">{position}</h3>
                                        <p className="text-xs text-gray-500">
                                            {cands.length} candidate{cands.length !== 1 ? 's' : ''} running
                                        </p>
                                    </div>
                                </div>

                                {/* Candidate Cards */}
                                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                    {cands.map((c) => (
                                        <div
                                            key={c.id}
                                            className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
                                        >
                                            {/* Photo Area with 100% Contained Full Image */}
                                            <div className="group/photo relative flex h-60 items-center justify-center overflow-hidden border-b border-gray-100 bg-gradient-to-b from-gray-50 via-slate-100 to-gray-200/70 p-4">
                                                {c.photo ? (
                                                    <>
                                                        {/* Soft ambient color wash (no noisy blur) */}
                                                        <img
                                                            src={getImageUrl(c.photo) ?? ''}
                                                            alt=""
                                                            aria-hidden="true"
                                                            className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-10 blur-lg transition-opacity duration-300 select-none group-hover/photo:opacity-20"
                                                        />
                                                        {/* Foreground Contained Image - 100% visible, never cut off */}
                                                        <img
                                                            src={getImageUrl(c.photo) ?? ''}
                                                            alt={c.candidate_name}
                                                            className="relative z-10 max-h-full max-w-full rounded-lg bg-white/60 object-contain p-1 shadow-sm ring-1 ring-black/5 drop-shadow-sm transition-all duration-300 group-hover/photo:scale-[1.03]"
                                                        />
                                                    </>
                                                ) : (
                                                    <div className="flex h-full w-full flex-col items-center justify-center">
                                                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-2xl font-black text-[#2D6A4F]">
                                                            {c.candidate_name.charAt(0)}
                                                        </div>
                                                        <span className="mt-2 text-xs font-medium text-gray-400">No photo</span>
                                                    </div>
                                                )}

                                                {/* Candidate Type Badge */}
                                                <div className="absolute top-3 right-3 z-20">
                                                    <span
                                                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase shadow-xs backdrop-blur-md ${
                                                            c.candidate_type === 'partylist'
                                                                ? 'bg-white/95 text-[#2D6A4F] ring-1 ring-green-200'
                                                                : 'bg-white/95 text-amber-700 ring-1 ring-amber-200'
                                                        }`}
                                                    >
                                                        {c.candidate_type === 'partylist' ? (
                                                            <Shield className="h-2.5 w-2.5" />
                                                        ) : (
                                                            <Users className="h-2.5 w-2.5" />
                                                        )}
                                                        {c.candidate_type === 'partylist' ? 'Partylist' : 'Independent'}
                                                    </span>
                                                </div>

                                                {/* Quick View Button */}
                                                <button
                                                    type="button"
                                                    title="View candidate platform and details"
                                                    onClick={() => setPreviewCandidate(c)}
                                                    className="absolute right-3 bottom-3 z-20 flex h-8 w-8 items-center justify-center rounded-lg bg-black/60 text-white opacity-0 shadow-md backdrop-blur-md transition-opacity group-hover:opacity-100 hover:bg-black/80"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                            </div>

                                            {/* Info Area */}
                                            <div className="flex flex-1 flex-col justify-between p-5">
                                                <div>
                                                    <h4 className="text-base font-bold text-gray-900 transition-colors group-hover:text-[#2D6A4F]">
                                                        {c.candidate_name}
                                                    </h4>

                                                    {/* Partylist / Organization */}
                                                    {c.candidate_type === 'partylist' && c.partylist ? (
                                                        <div className="mt-2 space-y-2">
                                                            <div className="flex items-center gap-2">
                                                                <div
                                                                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                                                                    style={{
                                                                        backgroundColor: c.partylist.color ?? '#2D6A4F',
                                                                    }}
                                                                />
                                                                <span className="text-xs font-semibold text-gray-700">
                                                                    {c.partylist.partylist_name}
                                                                </span>
                                                                {c.partylist.acronym && (
                                                                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-500">
                                                                        {c.partylist.acronym}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {c.partylist.description && (
                                                                <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-3">
                                                                    <div className="mb-1 flex items-center gap-1">
                                                                        <FileText className="h-3 w-3 text-gray-400" />
                                                                        <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                                                                            Platform
                                                                        </span>
                                                                    </div>
                                                                    <p className="line-clamp-2 text-xs leading-relaxed text-gray-600">
                                                                        {c.partylist.description}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="mt-2 space-y-2">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200 ring-inset">
                                                                    Independent
                                                                </span>
                                                                {c.organization && (
                                                                    <span className="truncate text-xs text-gray-500">
                                                                        {c.organization.organization_name}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {c.platform && (
                                                                <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-3">
                                                                    <div className="mb-1 flex items-center gap-1">
                                                                        <FileText className="h-3 w-3 text-gray-400" />
                                                                        <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                                                                            Platform
                                                                        </span>
                                                                    </div>
                                                                    <p className="line-clamp-2 text-xs leading-relaxed text-gray-600">{c.platform}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => setPreviewCandidate(c)}
                                                    className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white py-2 text-xs font-bold text-gray-700 transition hover:border-[#2D6A4F] hover:bg-emerald-50/30 hover:text-[#2D6A4F]"
                                                >
                                                    <FileText className="h-3.5 w-3.5" />
                                                    View Details & Platform
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </section>
                )}

                {candidates.length === 0 && (
                    <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                            <Users className="h-7 w-7" />
                        </div>
                        <h3 className="mt-4 text-base font-bold text-gray-900">No Candidates Registered</h3>
                        <p className="mt-2 text-sm text-gray-500">No candidates have been registered for this election yet.</p>
                    </div>
                )}
            </div>

            {previewCandidate && <CandidatePreviewModal candidate={previewCandidate} onClose={() => setPreviewCandidate(null)} />}
        </VoterLayout>
    );
}
