import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Calendar, CheckCircle2, ClipboardCheck, Clock3, Shield, Trophy, User, Vote } from 'lucide-react';

import VoterLayout from '@/layouts/VoterLayout';
import { formatDate, formatTime } from '@/lib/format';

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

interface UserData {
    id: number;
    name: string;
    username: string;
}

interface ElectionData {
    id: number;
    title: string;
    description: string | null;
    start_at: string | null;
    end_at: string | null;
    status: string;
    has_voted?: boolean;
    voted?: boolean;
}

interface Props {
    user: UserData;
    ongoingElection: ElectionData | null;
    upcomingElections: ElectionData[];
    completedElections: ElectionData[];
}

/*
|--------------------------------------------------------------------------
| DASHBOARD COMPONENT
|--------------------------------------------------------------------------
*/

export default function Dashboard({ user, ongoingElection, upcomingElections, completedElections }: Props) {
    const totalVoted = completedElections.filter((e) => e.voted).length;

    return (
        <VoterLayout>
            <Head title="Voter Dashboard" />

            <div className="space-y-6">
                {/* =====================================================
                    WELCOME HERO SECTION
                ===================================================== */}

                <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#143728] via-[#1B4332] to-[#2D6A4F] px-6 py-7 text-white shadow-sm sm:px-8 sm:py-8">
                    <div className="pointer-events-none absolute -top-24 -right-20 h-64 w-64 rounded-full bg-white/[0.04]" />
                    <div className="pointer-events-none absolute right-32 -bottom-32 h-56 w-56 rounded-full bg-white/[0.04]" />

                    <div className="relative z-10 max-w-3xl">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-green-100">
                            <Shield className="h-3.5 w-3.5" />
                            Voter Dashboard
                        </div>

                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Welcome, {user.name}!</h1>

                        <p className="mt-3 max-w-2xl text-sm leading-6 text-green-100 sm:text-base">
                            Welcome to your voter portal. Here you can view available elections, manage your account, and review your voting history.
                        </p>
                    </div>
                </section>

                {/* =====================================================
                    STATS OVERVIEW
                ===================================================== */}

                <section>
                    <div className="mb-4">
                        <h2 className="text-base font-bold text-gray-900">Overview</h2>
                        <p className="mt-0.5 text-xs text-gray-500">Your voting activity at a glance.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                            <div className="flex items-start justify-between">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-[#2D6A4F]">
                                    <Vote className="h-5 w-5" />
                                </div>
                                <div className="h-2 w-2 rounded-full bg-green-500" />
                            </div>
                            <div className="mt-4">
                                <p className="text-2xl font-bold tracking-tight text-gray-900">{ongoingElection ? 1 : 0}</p>
                                <p className="mt-1 text-xs font-medium text-gray-500">Ongoing Election</p>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                            <div className="flex items-start justify-between">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                    <Calendar className="h-5 w-5" />
                                </div>
                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                            </div>
                            <div className="mt-4">
                                <p className="text-2xl font-bold tracking-tight text-gray-900">{upcomingElections.length}</p>
                                <p className="mt-1 text-xs font-medium text-gray-500">Upcoming Elections</p>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                            <div className="flex items-start justify-between">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                                    <Trophy className="h-5 w-5" />
                                </div>
                                <div className="h-2 w-2 rounded-full bg-amber-500" />
                            </div>
                            <div className="mt-4">
                                <p className="text-2xl font-bold tracking-tight text-gray-900">
                                    {totalVoted}
                                    <span className="text-sm font-medium text-gray-400">/{completedElections.length}</span>
                                </p>
                                <p className="mt-1 text-xs font-medium text-gray-500">Elections Voted</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* =====================================================
                    ONGOING ELECTION
                ===================================================== */}

                {ongoingElection && (
                    <section>
                        <div className="mb-4">
                            <h2 className="text-base font-bold text-gray-900">Ongoing Election</h2>
                            <p className="mt-0.5 text-xs text-gray-500">An election is currently active. Cast your vote now.</p>
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 shadow-sm">
                            <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">
                                        <Vote className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-bold text-gray-900">{ongoingElection.title}</h3>
                                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-semibold text-green-700">
                                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                                                Live
                                            </span>
                                        </div>
                                        {ongoingElection.description && (
                                            <p className="mt-1 line-clamp-2 max-w-xl text-sm text-gray-600">{ongoingElection.description}</p>
                                        )}
                                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {formatDate(ongoingElection.start_at)} – {formatDate(ongoingElection.end_at)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock3 className="h-3.5 w-3.5" />
                                                {formatTime(ongoingElection.start_at)} – {formatTime(ongoingElection.end_at)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="shrink-0">
                                    {ongoingElection.has_voted ? (
                                        <div className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white">
                                            <CheckCircle2 className="h-4 w-4" />
                                            Already Voted
                                        </div>
                                    ) : (
                                        <Link
                                            href={`/voter/elections/${ongoingElection.id}/vote`}
                                            className="inline-flex items-center gap-2 rounded-xl bg-[#2D6A4F] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#1B4332] hover:shadow-md focus:ring-2 focus:ring-[#2D6A4F]/30 focus:ring-offset-2 focus:outline-none"
                                        >
                                            <Vote className="h-4 w-4" />
                                            Vote Now
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* =====================================================
                    UPCOMING ELECTIONS
                ===================================================== */}

                {upcomingElections.length > 0 && (
                    <section>
                        <div className="mb-4">
                            <h2 className="text-base font-bold text-gray-900">Upcoming Elections</h2>
                            <p className="mt-0.5 text-xs text-gray-500">Elections that will be open for voting soon.</p>
                        </div>

                        <div className="space-y-3">
                            {upcomingElections.map((election) => (
                                <div
                                    key={election.id}
                                    className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                                >
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                        <Calendar className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="truncate text-sm font-semibold text-gray-900">{election.title}</h3>
                                        {election.description && <p className="mt-0.5 truncate text-xs text-gray-500">{election.description}</p>}
                                        <p className="mt-1 text-xs text-gray-400">
                                            Starts {formatDate(election.start_at)} at {formatTime(election.start_at)}
                                        </p>
                                    </div>
                                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-200/60">
                                        Upcoming
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* =====================================================
                    RECENT COMPLETED ELECTIONS
                ===================================================== */}

                {completedElections.length > 0 && (
                    <section>
                        <div className="mb-4">
                            <h2 className="text-base font-bold text-gray-900">Completed Elections</h2>
                            <p className="mt-0.5 text-xs text-gray-500">Past elections and your participation status.</p>
                        </div>

                        <div className="space-y-3">
                            {completedElections.slice(0, 5).map((election) => (
                                <div
                                    key={election.id}
                                    className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                                >
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
                                        <ClipboardCheck className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="truncate text-sm font-semibold text-gray-900">{election.title}</h3>
                                        <p className="mt-1 text-xs text-gray-400">Ended {formatDate(election.end_at)}</p>
                                    </div>
                                    {election.voted ? (
                                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 ring-1 ring-green-200/60">
                                            <CheckCircle2 className="h-3 w-3" />
                                            Voted
                                        </span>
                                    ) : (
                                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500 ring-1 ring-gray-200/60">
                                            Not Voted
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* =====================================================
                    NO ELECTIONS STATE
                ===================================================== */}

                {!ongoingElection && upcomingElections.length === 0 && completedElections.length === 0 && (
                    <section className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                            <Vote className="h-7 w-7" />
                        </div>
                        <h3 className="mt-4 text-base font-bold text-gray-900">No Elections Available</h3>
                        <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
                            There are no elections at the moment. Check back later or view your profile.
                        </p>
                        <Link
                            href="/voter/profile"
                            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#2D6A4F] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#1B4332]"
                        >
                            <User className="h-4 w-4" />
                            View Profile
                        </Link>
                    </section>
                )}

                {/* =====================================================
                    QUICK ACCESS
                ===================================================== */}

                <section>
                    <div className="mb-4">
                        <h2 className="text-base font-bold text-gray-900">Quick Access</h2>
                        <p className="mt-0.5 text-xs text-gray-500">Quickly access your voter information.</p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Link
                            href="/voter/vote-history"
                            className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-green-200 hover:bg-green-50/30 hover:shadow-md"
                        >
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50 text-[#2D6A4F] transition-all duration-200 group-hover:bg-[#2D6A4F] group-hover:text-white group-hover:shadow-md">
                                <Clock3 className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="text-sm font-semibold text-gray-900">Vote History</h3>
                                <p className="mt-0.5 text-xs leading-5 text-gray-500">
                                    View your previous voting activity and election participation.
                                </p>
                            </div>
                            <ArrowRight className="h-4 w-4 shrink-0 text-gray-300 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[#2D6A4F]" />
                        </Link>

                        <Link
                            href="/voter/profile"
                            className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-green-200 hover:bg-green-50/30 hover:shadow-md"
                        >
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-all duration-200 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-md">
                                <User className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="text-sm font-semibold text-gray-900">My Profile</h3>
                                <p className="mt-0.5 text-xs leading-5 text-gray-500">View and manage your voter account information.</p>
                            </div>
                            <ArrowRight className="h-4 w-4 shrink-0 text-gray-300 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[#2D6A4F]" />
                        </Link>
                    </div>
                </section>
            </div>
        </VoterLayout>
    );
}
