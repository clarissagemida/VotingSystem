import { Head, Link } from '@inertiajs/react';
import { ArrowRight, CheckCircle2, Clock3, Vote } from 'lucide-react';

import VoterLayout from '@/layouts/VoterLayout';
import { formatDateTime } from '@/lib/format';
import { getImageUrl } from '@/lib/utils';

interface VoteEntry {
    id: number;
    election: { id: number; title: string } | null;
    candidate: { id: number; name: string; photo: string | null } | null;
    partylist: string | null;
    position: string;
    voted_at: string | null;
}

interface Props {
    votes: VoteEntry[];
}

export default function VoteHistoryIndex({ votes }: Props) {
    const groupedByElection = votes.reduce<Record<number, { title: string; votes: VoteEntry[] }>>((acc, v) => {
        const eid = v.election?.id ?? 0;
        if (!acc[eid]) acc[eid] = { title: v.election?.title ?? 'Unknown', votes: [] };
        acc[eid].votes.push(v);
        return acc;
    }, {});

    const electionIds = Object.keys(groupedByElection).map(Number);

    return (
        <VoterLayout>
            <Head title="Vote History" />

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <div className="flex items-center gap-2">
                        <Clock3 className="h-6 w-6 text-[#2D6A4F]" />
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Vote History</h1>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">Review your previous voting activity across elections.</p>
                </div>

                {votes.length === 0 ? (
                    <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                            <Vote className="h-7 w-7" />
                        </div>
                        <h3 className="mt-4 text-base font-bold text-gray-900">No Vote History</h3>
                        <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
                            You haven't voted in any elections yet. Participate in an active election to see your history here.
                        </p>
                        <Link
                            href="/voter/elections"
                            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#2D6A4F] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#1B4332]"
                        >
                            <Vote className="h-4 w-4" />
                            View Elections
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {electionIds.map((eid) => {
                            const group = groupedByElection[eid];
                            return (
                                <div key={eid} className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                                    <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-[#2D6A4F]">
                                                <Vote className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-gray-900">{group.title}</h3>
                                                <p className="text-xs text-gray-400">{group.votes.length} vote(s) cast</p>
                                            </div>
                                        </div>
                                        <Link
                                            href={`/voter/vote-history/${eid}`}
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-[#2D6A4F] transition hover:border-[#2D6A4F] hover:bg-[#2D6A4F] hover:text-white"
                                        >
                                            Details
                                            <ArrowRight className="h-3 w-3" />
                                        </Link>
                                    </div>
                                    <div className="divide-y divide-gray-100">
                                        {group.votes.map((v) => (
                                            <div key={v.id} className="flex items-center gap-4 px-6 py-3 transition hover:bg-green-50/30">
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-green-100 text-xs font-bold text-[#2D6A4F]">
                                                    {v.candidate?.photo ? (
                                                        <img
                                                            src={getImageUrl(v.candidate.photo) ?? ''}
                                                            alt={v.candidate.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        (v.candidate?.name?.charAt(0) ?? '?')
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-semibold text-gray-900">{v.candidate?.name ?? 'Unknown'}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {v.position}
                                                        {v.partylist && ` · ${v.partylist}`}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="flex items-center gap-1 text-xs text-gray-400">
                                                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                                                        {formatDateTime(v.voted_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </VoterLayout>
    );
}
