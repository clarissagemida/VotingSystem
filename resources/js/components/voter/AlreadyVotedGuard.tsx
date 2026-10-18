import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Shield, Vote } from 'lucide-react';

import VoterLayout from '@/layouts/VoterLayout';

import type { ElectionSummary } from './candidate-types';

interface AlreadyVotedGuardProps {
    election: ElectionSummary;
}

export default function AlreadyVotedGuard({ election }: AlreadyVotedGuardProps) {
    return (
        <VoterLayout>
            <Head title={`Vote - ${election.title}`} />
            <div className="mx-auto max-w-2xl space-y-6 py-8">
                <Link
                    href={`/voter/elections/${election.id}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#2D6A4F]"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Election Details
                </Link>

                <div className="rounded-3xl border border-green-200 bg-white p-8 text-center shadow-lg">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-700 shadow-inner">
                        <CheckCircle2 className="h-10 w-10" />
                    </div>

                    <span className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3.5 py-1 text-xs font-bold text-green-800">
                        <Shield className="h-3.5 w-3.5" />
                        Ballot Already Cast & Verified
                    </span>

                    <h1 className="mt-3 text-2xl font-extrabold text-gray-900 sm:text-3xl">{election.title}</h1>

                    <p className="mt-3 text-sm leading-relaxed text-gray-600">
                        You have already cast your vote in this election. To protect the integrity and fairness of the election, each voter is
                        permitted to submit their ballot only once.
                    </p>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <Link
                            href={`/voter/vote-history/${election.id}`}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2D6A4F] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1B4332]"
                        >
                            <Vote className="h-4 w-4" />
                            View My Cast Ballot
                        </Link>

                        <Link
                            href="/voter/dashboard"
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
                        >
                            Return to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </VoterLayout>
    );
}
