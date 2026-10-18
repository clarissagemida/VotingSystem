import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Vote } from 'lucide-react';

import VoterLayout from '@/layouts/VoterLayout';
import { formatDateTime } from '@/lib/format';
import { getImageUrl } from '@/lib/utils';

interface VoteEntry {
    id: number;
    candidate: { id: number; name: string; photo: string | null } | null;
    partylist: string | null;
    position: string;
    voted_at: string | null;
}

interface ElectionData {
    id: number;
    title: string;
}

interface Props {
    election: ElectionData;
    votes: VoteEntry[];
}

export default function VoteHistoryElection({ election, votes }: Props) {
    return (
        <VoterLayout>
            <Head title={`Vote History - ${election.title}`} />

            <div className="space-y-6">
                <Link
                    href="/voter/vote-history"
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#2D6A4F]"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Vote History
                </Link>

                {/* Header */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100 text-[#2D6A4F]">
                            <Vote className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">{election.title}</h1>
                            <p className="mt-1 text-sm text-gray-500">Your votes in this election</p>
                        </div>
                    </div>
                </div>

                {/* Votes */}
                {votes.length === 0 ? (
                    <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                        <p className="text-sm text-gray-500">No votes recorded for this election.</p>
                    </div>
                ) : (
                    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <h2 className="text-sm font-bold text-gray-900">{votes.length} Vote(s) Cast</h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {votes.map((v) => (
                                <div key={v.id} className="flex items-center gap-4 px-6 py-4 transition hover:bg-green-50/30">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-green-100 text-sm font-bold text-[#2D6A4F]">
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
                                        <p className="text-sm font-semibold text-gray-900">{v.candidate?.name ?? 'Unknown'}</p>
                                        <p className="mt-0.5 text-xs text-gray-500">
                                            {v.position}
                                            {v.partylist && ` · ${v.partylist}`}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                        {formatDateTime(v.voted_at)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </VoterLayout>
    );
}
