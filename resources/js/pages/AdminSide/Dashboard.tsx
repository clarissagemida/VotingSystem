import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Building2, CheckCircle2, Clock, Flag, ScrollText, Settings2, ShieldCheck, UserCheck, UserX, Users, Vote } from 'lucide-react';

import AdminLayout from '@/layouts/AdminLayout';

/*
|--------------------------------------------------------------------------
| DASHBOARD PROPS
|--------------------------------------------------------------------------
*/

interface DashboardProps {
    totalVoters: number;
    activeElections: number;
    totalPartylists: number;
    totalOrganizations: number;
    votersVoted: number;
    votersNotVoted: number;
    voterTurnoutPercent: number;
    voteLog: VoteLogEntry[];
    electionTurnout: ElectionTurnoutEntry[];
}

interface VoteLogEntry {
    voter: {
        id: number | null;
        name: string | null;
        username: string | null;
    };
    election: {
        id: number | null;
        title: string | null;
    };
    positions: number;
    voted_at: string | null;
}

interface ElectionTurnoutEntry {
    id: number;
    title: string;
    status: 'Upcoming' | 'Ongoing' | 'Closed';
    voted: number;
    total_voters: number;
    percent: number;
}

/*
|--------------------------------------------------------------------------
| DASHBOARD COMPONENT
|--------------------------------------------------------------------------
*/

export default function Dashboard({
    totalVoters,
    activeElections,
    totalPartylists,
    totalOrganizations,
    votersVoted,
    votersNotVoted,
    voterTurnoutPercent,
    voteLog,
    electionTurnout,
}: DashboardProps) {
    return (
        <AdminLayout>
            <Head title="Admin Dashboard" />

            <div className="mx-auto w-full max-w-[1600px] space-y-6">
                {/* ==========================================================
                    WELCOME HEADER
                ========================================================== */}

                <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#143728] via-[#1B4332] to-[#2D6A4F] px-6 py-7 text-white shadow-sm sm:px-8 sm:py-8">
                    {/* Decorative background */}

                    <div className="pointer-events-none absolute -top-24 -right-20 h-64 w-64 rounded-full bg-white/[0.04]" />

                    <div className="pointer-events-none absolute right-32 -bottom-32 h-56 w-56 rounded-full bg-white/[0.04]" />

                    <div className="pointer-events-none absolute bottom-0 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-white/[0.025]" />

                    <div className="relative z-10 max-w-3xl">
                        {/* Badge */}

                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-green-100">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Administrator
                        </div>

                        {/* Title */}

                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                            Voting &amp; Elections
                            <br className="hidden sm:block" />
                            Management System
                        </h1>

                        {/* Description */}

                        <p className="mt-3 max-w-2xl text-sm leading-6 text-green-100 sm:text-base">
                            Manage voters, elections, partylists, and organizations from one centralized administration platform.
                        </p>
                    </div>
                </section>

                {/* ==========================================================
                    SYSTEM OVERVIEW
                ========================================================== */}

                <section>
                    <div className="mb-4">
                        <h2 className="text-lg font-bold text-gray-900">System Overview</h2>

                        <p className="mt-1 text-sm text-gray-500">Current statistics across your election system.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <StatCard
                            icon={Users}
                            label="Total Voters"
                            value={totalVoters}
                            description="Registered voter accounts"
                            iconClass="bg-green-50 text-[#2D6A4F]"
                        />

                        <StatCard
                            icon={Vote}
                            label="Active Elections"
                            value={activeElections}
                            description="Currently ongoing"
                            iconClass="bg-blue-50 text-blue-600"
                        />

                        <StatCard
                            icon={Flag}
                            label="Partylists"
                            value={totalPartylists}
                            description="Registered partylists"
                            iconClass="bg-amber-50 text-amber-600"
                        />

                        <StatCard
                            icon={Building2}
                            label="Organizations"
                            value={totalOrganizations}
                            description="Registered organizations"
                            iconClass="bg-purple-50 text-purple-600"
                        />
                    </div>
                </section>

                {/* ==========================================================
                    MANAGEMENT + STATUS
                ========================================================== */}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* ======================================================
                        QUICK ACTIONS
                    ====================================================== */}

                    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-2">
                        {/* Section Header */}

                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-[#2D6A4F]">
                                <Settings2 className="h-5 w-5" />
                            </div>

                            <div>
                                <h2 className="text-base font-bold text-gray-900">Management</h2>

                                <p className="mt-0.5 text-xs text-gray-500">Access your election management modules.</p>
                            </div>
                        </div>

                        {/* Actions */}

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <QuickAction
                                href="/admin/voters"
                                icon={Users}
                                title="Voter Management"
                                description="Manage voter accounts and credentials."
                            />

                            <QuickAction
                                href="/admin/elections"
                                icon={Vote}
                                title="Election Management"
                                description="Create and manage election schedules."
                            />

                            <QuickAction
                                href="/admin/partylist"
                                icon={Flag}
                                title="Partylist Management"
                                description="Manage partylists and candidates."
                            />

                            <QuickAction
                                href="/admin/organizations"
                                icon={Building2}
                                title="Organization Management"
                                description="Manage organizations and positions."
                            />
                        </div>
                    </section>

                    {/* ======================================================
                        SYSTEM STATUS
                    ====================================================== */}

                    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="mb-5">
                            <h2 className="text-base font-bold text-gray-900">System Status</h2>

                            <p className="mt-1 text-xs text-gray-500">Current records in each module.</p>
                        </div>

                        <div className="space-y-2.5">
                            <StatusItem icon={Users} label="Voters" value={totalVoters} />

                            <StatusItem icon={Vote} label="Active Elections" value={activeElections} />

                            <StatusItem icon={Flag} label="Partylists" value={totalPartylists} />

                            <StatusItem icon={Building2} label="Organizations" value={totalOrganizations} />
                        </div>
                    </section>
                </div>

                {/* ==========================================================
                    VOTER TURNOUT + VOTE LOG
                ========================================================== */}

                <section>
                    <div className="mb-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#143728] text-white">
                                <ScrollText className="h-5 w-5" />
                            </div>

                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Voter Turnout &amp; Vote Log</h2>

                                <p className="mt-0.5 text-sm text-gray-500">Who has cast a ballot, grouped by election.</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            icon={UserCheck}
                            label="Voters Who Voted"
                            value={votersVoted}
                            description={`${voterTurnoutPercent}% turnout`}
                            iconClass="bg-green-50 text-[#2D6A4F]"
                        />

                        <StatCard
                            icon={UserX}
                            label="Voters Not Voted"
                            value={votersNotVoted}
                            description="Registered but have not voted"
                            iconClass="bg-rose-50 text-rose-600"
                        />

                        <StatCard
                            icon={Users}
                            label="Total Voters"
                            value={totalVoters}
                            description="Registered voter accounts"
                            iconClass="bg-green-50 text-[#2D6A4F]"
                        />

                        <StatCard
                            icon={Flag}
                            label="Partylists"
                            value={totalPartylists}
                            description="Registered partylists"
                            iconClass="bg-amber-50 text-amber-600"
                        />
                    </div>

                    {/* Turnout summary bar */}

                    <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">Overall Turnout</h3>
                                <p className="mt-0.5 text-xs text-gray-500">
                                    {votersVoted} of {totalVoters} voters have cast a ballot.
                                </p>
                            </div>

                            <span className="text-2xl font-bold tracking-tight text-[#2D6A4F]">{voterTurnoutPercent}%</span>
                        </div>

                        <div className="flex h-3 w-full overflow-hidden rounded-full bg-gray-100">
                            <div
                                className="h-full rounded-l-full bg-[#2D6A4F] transition-all duration-500"
                                style={{
                                    width: `${voterTurnoutPercent}%`,
                                }}
                            />

                            <div
                                className={`h-full bg-rose-200 transition-all duration-500 ${voterTurnoutPercent >= 100 ? 'rounded-r-full' : 'rounded-r-full'}`}
                                style={{
                                    width: `${Math.max(0, 100 - voterTurnoutPercent)}%`,
                                }}
                            />
                        </div>

                        <div className="mt-2 flex items-center justify-between text-[11px] font-medium text-gray-500">
                            <span className="inline-flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-[#2D6A4F]" />
                                Voted · {votersVoted}
                            </span>

                            <span className="inline-flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-rose-200" />
                                Not voted · {votersNotVoted}
                            </span>
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-5">
                        {/* Per-election turnout */}

                        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-2">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-sm font-bold text-gray-900">Turnout by Election</h3>

                                <span className="text-xs text-gray-400">
                                    {electionTurnout.length} election
                                    {electionTurnout.length !== 1 ? 's' : ''}
                                </span>
                            </div>

                            <div className="space-y-3">
                                {electionTurnout.length === 0 ? (
                                    <p className="py-6 text-center text-sm text-gray-400">No elections yet.</p>
                                ) : (
                                    electionTurnout.map((e) => (
                                        <div key={e.id} className="rounded-xl border border-gray-100 bg-gray-50/70 p-3">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="truncate text-sm font-semibold text-gray-800">{e.title}</p>

                                                <StatusPill status={e.status} />
                                            </div>

                                            <div className="mt-2.5 flex items-center gap-3">
                                                <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                                                    <div
                                                        className="h-full rounded-full bg-[#2D6A4F] transition-all duration-500"
                                                        style={{ width: `${e.percent}%` }}
                                                    />
                                                </div>

                                                <span className="text-xs font-bold text-gray-700">
                                                    {e.voted} / {e.total_voters}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>

                        {/* Vote log */}

                        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-3">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-50 text-[#2D6A4F]">
                                        <Clock className="h-4 w-4" />
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900">Vote Log</h3>
                                        <p className="text-xs text-gray-500">Voters who have cast a ballot</p>
                                    </div>
                                </div>

                                <span className="text-xs text-gray-400">
                                    {voteLog.length} voter{voteLog.length !== 1 ? 's' : ''}
                                </span>
                            </div>

                            {voteLog.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                                    <Users className="h-8 w-8 text-gray-300" />

                                    <p className="text-sm font-medium text-gray-500">No votes cast yet</p>

                                    <p className="text-xs text-gray-400">Vote logs will appear here once voters submit their ballots.</p>
                                </div>
                            ) : (
                                <div className="flow-root">
                                    <ul className="-my-2 divide-y divide-gray-100">
                                        {voteLog.map((entry) => {
                                            const initials = (entry.voter.name ?? '?')
                                                .split(' ')
                                                .map((n) => n.charAt(0))
                                                .slice(0, 2)
                                                .join('')
                                                .toUpperCase();

                                            return (
                                                <li key={entry.voter.id ?? entry.voted_at} className="flex items-center gap-3 py-2.5">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#143728] text-xs font-bold text-white">
                                                        {initials || 'V'}
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-semibold text-gray-900">
                                                            {entry.voter.name ?? 'Unknown voter'}
                                                        </p>

                                                        <p className="truncate text-xs text-gray-500">
                                                            {entry.voter.username ? `@${entry.voter.username} · ` : ''}
                                                            {entry.election.title ?? 'Unknown election'}
                                                        </p>
                                                    </div>

                                                    <div className="hidden shrink-0 flex-col items-end sm:flex">
                                                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#2D6A4F]">
                                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                                            Voted
                                                        </span>

                                                        <span className="text-[11px] text-gray-400">{formatTimestamp(entry.voted_at)}</span>
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}
                        </section>
                    </div>
                </section>

                {/* ==========================================================
                    ADMINISTRATION NOTICE
                ========================================================== */}

                <section className="flex flex-col gap-4 rounded-2xl border border-green-100 bg-green-50/60 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#2D6A4F] shadow-sm">
                            <CheckCircle2 className="h-5 w-5" />
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-gray-900">Administration Center</p>

                            <p className="mt-1 text-xs leading-5 text-gray-600">
                                Your election management modules are ready. Select a module above to manage your system.
                            </p>
                        </div>
                    </div>

                    <Link
                        href="/admin/voters"
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#2D6A4F] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1B4332] focus:ring-2 focus:ring-[#2D6A4F]/30 focus:ring-offset-2 focus:outline-none"
                    >
                        Open Voter Management
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </section>
            </div>
        </AdminLayout>
    );
}

/*
|--------------------------------------------------------------------------
| STAT CARD
|--------------------------------------------------------------------------
*/

interface StatCardProps {
    icon: typeof Users;
    label: string;
    value: number;
    description: string;
    iconClass: string;
}

function StatCard({ icon: Icon, label, value, description, iconClass }: StatCardProps) {
    return (
        <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass} `}>
                    <Icon className="h-5 w-5" />
                </div>

                <div className="h-2 w-2 rounded-full bg-green-500" title="Active module" />
            </div>

            <div className="mt-5">
                <p className="text-3xl font-bold tracking-tight text-gray-900">{value}</p>

                <p className="mt-1 text-sm font-semibold text-gray-800">{label}</p>

                <p className="mt-1 text-xs text-gray-400">{description}</p>
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| QUICK ACTION
|--------------------------------------------------------------------------
*/

interface QuickActionProps {
    href: string;
    icon: typeof Users;
    title: string;
    description: string;
}

function QuickAction({ href, icon: Icon, title, description }: QuickActionProps) {
    return (
        <Link
            href={href}
            className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-all duration-200 hover:border-green-200 hover:bg-green-50/40 hover:shadow-sm"
        >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-[#2D6A4F] transition duration-200 group-hover:bg-[#2D6A4F] group-hover:text-white">
                <Icon className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">{title}</p>

                <p className="mt-1 text-xs leading-5 text-gray-500">{description}</p>
            </div>

            <ArrowRight className="h-4 w-4 shrink-0 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-[#2D6A4F]" />
        </Link>
    );
}

/*
|--------------------------------------------------------------------------
| STATUS ITEM
|--------------------------------------------------------------------------
*/

interface StatusItemProps {
    icon: typeof Users;
    label: string;
    value: number;
}

function StatusItem({ icon: Icon, label, value }: StatusItemProps) {
    return (
        <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/70 px-3 py-3 transition hover:border-gray-200 hover:bg-gray-50">
            <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#2D6A4F] shadow-sm">
                    <Icon className="h-4 w-4" />
                </div>

                <span className="truncate text-sm font-medium text-gray-700">{label}</span>
            </div>

            <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900">{value}</span>

                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| STATUS PILL
|--------------------------------------------------------------------------
*/

const statusStyles: Record<ElectionTurnoutEntry['status'], string> = {
    Ongoing: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    Upcoming: 'bg-amber-50 text-amber-700 ring-amber-200',
    Closed: 'bg-gray-100 text-gray-600 ring-gray-200',
};

function StatusPill({ status }: { status: ElectionTurnoutEntry['status'] }) {
    return (
        <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${statusStyles[status]} `}>
            {status}
        </span>
    );
}

/*
|--------------------------------------------------------------------------
| FORMAT TIMESTAMP
|--------------------------------------------------------------------------
*/

function formatTimestamp(value: string | null): string {
    if (!value) return '—';

    const date = new Date(value.replace(' ', 'T'));

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}
