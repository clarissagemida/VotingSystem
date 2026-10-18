import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Calendar, Search, Users, Vote } from 'lucide-react';
import { useMemo, useState } from 'react';

import CountdownTimer from '@/components/voter/CountdownTimer';
import VoterLayout from '@/layouts/VoterLayout';
import { formatDateTime } from '@/lib/format';

interface Election {
    id: number;
    title: string;
    description: string | null;
    start_at: string | null;
    end_at: string | null;
    status: 'Upcoming' | 'Ongoing' | 'Completed';
    candidates_count: number;
}

interface Props {
    elections: Election[];
}

function statusStyle(status: Election['status']) {
    switch (status) {
        case 'Ongoing':
            return 'bg-green-50 text-green-700 ring-green-200';
        case 'Upcoming':
            return 'bg-blue-50 text-blue-700 ring-blue-200';
        case 'Completed':
            return 'bg-gray-100 text-gray-600 ring-gray-200';
    }
}

export default function Index({ elections }: Props) {
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        const kw = search.toLowerCase().trim();
        if (!kw) return elections;
        return elections.filter(
            (e) => e.title.toLowerCase().includes(kw) || e.description?.toLowerCase().includes(kw) || e.status.toLowerCase().includes(kw),
        );
    }, [elections, search]);

    return (
        <VoterLayout>
            <Head title="Elections" />

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <div className="flex items-center gap-2">
                        <Vote className="h-6 w-6 text-[#2D6A4F]" />
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Elections</h1>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">View all available elections and their schedules.</p>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search elections..."
                        className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pr-4 pl-10 text-sm text-gray-900 transition outline-none placeholder:text-gray-400 focus:border-[#40916C] focus:ring-2 focus:ring-green-100"
                    />
                </div>

                {/* Election List */}
                {filtered.length === 0 ? (
                    <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                            <Vote className="h-7 w-7" />
                        </div>
                        <h3 className="mt-4 text-base font-bold text-gray-900">No Elections Found</h3>
                        <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
                            {search ? 'Try changing your search keywords.' : 'There are no elections available at the moment.'}
                        </p>
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch('')}
                                className="mt-4 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                            >
                                Clear Search
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filtered.map((election) => (
                            <div
                                key={election.id}
                                className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md sm:p-6"
                            >
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50 text-[#2D6A4F] transition-colors group-hover:bg-[#2D6A4F] group-hover:text-white">
                                            <Vote className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-base font-bold text-gray-900">{election.title}</h3>
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${statusStyle(election.status)}`}
                                                >
                                                    {election.status === 'Ongoing' && (
                                                        <span className="mr-1 h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                                                    )}
                                                    {election.status}
                                                </span>
                                            </div>
                                            {election.description && (
                                                <p className="mt-1 line-clamp-2 max-w-xl text-sm text-gray-500">{election.description}</p>
                                            )}
                                            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {formatDateTime(election.start_at)} – {formatDateTime(election.end_at)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Users className="h-3.5 w-3.5" />
                                                    {election.candidates_count} candidate(s)
                                                </span>
                                            </div>
                                            {election.status === 'Upcoming' && election.start_at && (
                                                <div className="mt-3">
                                                    <CountdownTimer targetDate={election.start_at} size="sm" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <Link
                                        href={`/voter/elections/${election.id}`}
                                        className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#2D6A4F] shadow-sm transition-all duration-200 hover:border-[#2D6A4F] hover:bg-[#2D6A4F] hover:text-white hover:shadow-md focus:ring-2 focus:ring-[#2D6A4F]/30 focus:ring-offset-2 focus:outline-none"
                                    >
                                        View Details
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </VoterLayout>
    );
}
