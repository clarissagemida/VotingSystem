import { Head, router } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    Award,
    BarChart3,
    Building2,
    CalendarClock,
    CheckCircle2,
    ChevronDown,
    Crown,
    RefreshCw,
    ShieldCheck,
    UserCheck,
    UserRound,
    Users,
    Vote,
} from 'lucide-react';

import { useState } from 'react';

import AdminLayout from '@/layouts/AdminLayout';

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

interface Election {
    id: number;
    title: string;
    status: string;
    start_at: string | null;
    end_at: string | null;
}

interface SelectedElection {
    id: number;
    title: string;
    status: string | null;
    start_at: string | null;
    end_at: string | null;
}

interface Overview {
    total_voters: number;
    eligible_voters: number;

    total_elections: number;
    total_partylists: number;
    total_organizations: number;
    total_candidates: number;

    partylist_candidates: number;
    independent_candidates: number;

    total_votes_cast: number;
    total_votes_unique: number;
    total_votes_other: number;

    turnout_percent: number;

    ongoing_elections: number;
}

interface ElectionTurnoutEntry {
    id: number;
    title: string;
    status: 'Upcoming' | 'Ongoing' | 'Completed' | string;
    start_at: string | null;
    end_at: string | null;

    eligible_voters: number;
    voted: number;
    not_voted: number;

    percent: number;
}

interface PartylistInfo {
    name: string;
    acronym: string | null;
    color: string | null;
}

interface PositionVoteEntry {
    id: number;
    name: string;
    type: 'independent' | 'partylist';
    partylist: PartylistInfo | null;
    election: string | null;
    votes: number;
    share: number;
}

interface VotesByPositionEntry {
    position: string;
    total_votes: number;
    candidates: PositionVoteEntry[];
}

interface OrganizationCandidateEntry {
    id: number;
    name: string;
    candidates: number;
}

interface DailyActivityEntry {
    label: string;
    full: string;
    votes: number;
    is_today: boolean;
}

interface HourlyActivityEntry {
    hour: number;
    label: string;
    votes: number;
}

interface DataIntegrityCheck {
    key: string;
    label: string;
    count: number;
    healthy: boolean;
}

interface DataIntegrity {
    status: string;
    healthy: boolean;
    total_votes_checked: number;
    total_problems: number;
    checks: DataIntegrityCheck[];
}

/*
|--------------------------------------------------------------------------
| PAGE PROPS
|--------------------------------------------------------------------------
*/

interface AnalyticsProps {
    elections: Election[];

    selectedElectionId: number | null;

    selectedElection: SelectedElection | null;

    overview: Overview;

    electionTurnout: ElectionTurnoutEntry[];

    votesByPosition: VotesByPositionEntry[];

    candidatesByOrganization: OrganizationCandidateEntry[];

    maxOrganizationCandidates: number;

    dailyActivity: DailyActivityEntry[];

    totalDailyVotes: number;

    hourlyActivity: HourlyActivityEntry[];

    dataIntegrity: DataIntegrity;

    lastUpdated: string;
}

/*
|--------------------------------------------------------------------------
| MAIN COMPONENT
|--------------------------------------------------------------------------
*/

export default function Analytics({
    elections,
    selectedElectionId,
    selectedElection,
    overview,
    electionTurnout,
    votesByPosition,
    candidatesByOrganization,
    maxOrganizationCandidates,
    dailyActivity,
    totalDailyVotes,
    hourlyActivity,
    dataIntegrity,
    lastUpdated,
}: AnalyticsProps) {
    /*
    |--------------------------------------------------------------------------
    | ELECTION FILTER
    |--------------------------------------------------------------------------
    */

    const handleElectionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;

        if (!value) {
            router.get(
                window.location.pathname,
                {},
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );

            return;
        }

        router.get(
            window.location.pathname,
            {
                election_id: value,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    /*
    |--------------------------------------------------------------------------
    | REFRESH
    |--------------------------------------------------------------------------
    */

    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = () => {
        setRefreshing(true);

        router.reload({
            onFinish: () => {
                setRefreshing(false);
            },
        });
    };

    /*
    |--------------------------------------------------------------------------
    | SAFE VALUES
    |--------------------------------------------------------------------------
    */

    const safeTurnout = Math.min(100, Math.max(0, overview.turnout_percent ?? 0));

    const safeEligibleVoters = Math.max(0, overview.eligible_voters ?? 0);

    const safeVotersWhoVoted = Math.max(0, overview.total_votes_unique ?? 0);

    const safeDidNotVote = Math.max(0, overview.total_votes_other ?? 0);

    /*
    |--------------------------------------------------------------------------
    | PAGE TITLE
    |--------------------------------------------------------------------------
    */

    const pageTitle = selectedElection ? `${selectedElection.title} Analytics` : 'Election Analytics';

    return (
        <AdminLayout>
            <Head title={pageTitle} />

            <div className="mx-auto w-full max-w-[1600px] space-y-6">
                {/* ==========================================================
                    HEADER
                ========================================================== */}

                <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#143728] via-[#1B4332] to-[#2D6A4F] px-6 py-7 text-white shadow-sm sm:px-8 sm:py-8">
                    <div className="pointer-events-none absolute -top-24 -right-20 h-64 w-64 rounded-full bg-white/[0.04]" />

                    <div className="pointer-events-none absolute right-40 -bottom-32 h-56 w-56 rounded-full bg-white/[0.04]" />

                    <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/15">
                                <BarChart3 size={27} strokeWidth={2} />
                            </div>

                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2.5">
                                    <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Election Analytics</h1>

                                    {overview.ongoing_elections > 0 && (
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 px-2.5 py-1 text-[10px] font-bold tracking-wider text-emerald-200 uppercase ring-1 ring-emerald-300/30">
                                            <Activity size={12} />
                                            Live
                                        </span>
                                    )}
                                </div>

                                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
                                    Monitor voter participation, candidate performance, election results, and voting activity.
                                </p>

                                <p className="mt-2 text-[11px] text-white/50">Last updated: {lastUpdated}</p>
                            </div>
                        </div>

                        {/* CONTROLS */}

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="relative">
                                <select
                                    value={selectedElectionId ? String(selectedElectionId) : ''}
                                    onChange={handleElectionChange}
                                    className="h-11 min-w-[230px] appearance-none rounded-xl border border-white/15 bg-white/10 px-4 pr-10 text-sm font-semibold text-white backdrop-blur-sm transition outline-none hover:bg-white/15 focus:ring-2 focus:ring-white/30"
                                >
                                    <option value="" className="text-gray-900">
                                        All Elections
                                    </option>

                                    {elections.map((election) => (
                                        <option key={election.id} value={election.id} className="text-gray-900">
                                            {election.title}
                                        </option>
                                    ))}
                                </select>

                                <ChevronDown size={17} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-white/70" />
                            </div>

                            <button
                                type="button"
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-wait disabled:opacity-70"
                            >
                                <RefreshCw size={16} className={refreshing ? 'animate-spin' : undefined} />
                                {refreshing ? 'Refreshing…' : 'Refresh'}
                            </button>
                        </div>
                    </div>
                </section>

                {/* ==========================================================
                    SELECTED ELECTION
                ========================================================== */}

                {selectedElection && (
                    <section className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1B4332] text-white">
                                    <CalendarClock size={18} />
                                </div>

                                <div>
                                    <p className="text-sm font-bold text-gray-900">{selectedElection.title}</p>

                                    <p className="text-xs text-gray-500">Selected election analytics</p>
                                </div>
                            </div>

                            <StatusPill status={selectedElection.status || 'Unknown'} />
                        </div>
                    </section>
                )}

                {/* ==========================================================
                    OVERVIEW CARDS
                ========================================================== */}

                <section className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
                    <StatCard
                        icon={Users}
                        label={selectedElection ? 'Eligible Voters' : 'Total Voters'}
                        value={safeEligibleVoters}
                        iconClass="bg-emerald-50 text-emerald-700"
                    />

                    <StatCard icon={UserCheck} label="Voters Who Voted" value={safeVotersWhoVoted} iconClass="bg-blue-50 text-blue-600" />

                    <StatCard icon={Users} label="Did Not Vote" value={safeDidNotVote} iconClass="bg-rose-50 text-rose-600" />

                    <StatCard icon={Vote} label="Turnout" value={`${safeTurnout}%`} iconClass="bg-amber-50 text-amber-600" />

                    <StatCard icon={Award} label="Candidates" value={overview.total_candidates} iconClass="bg-violet-50 text-violet-600" />

                    <StatCard icon={Vote} label="Vote Records" value={overview.total_votes_cast} iconClass="bg-sky-50 text-sky-600" />
                </section>

                {/* ==========================================================
                    PARTICIPATION
                ========================================================== */}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                    {/* TURNOUT */}

                    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-2">
                        <SectionHeading
                            icon={CheckCircle2}
                            iconClass="bg-emerald-50 text-emerald-700"
                            title={selectedElection ? 'Election Turnout' : 'Turnout by Election'}
                            subtitle="Unique eligible voters who participated"
                        />

                        <div className="mt-6">
                            <TurnoutGauge percent={safeTurnout} voted={safeVotersWhoVoted} total={safeEligibleVoters} />
                        </div>

                        {/* PARTICIPATION BREAKDOWN */}

                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <ParticipationMiniCard
                                label="Participated"
                                value={safeVotersWhoVoted}
                                percentage={safeTurnout}
                                className="border-emerald-100 bg-emerald-50/60"
                                valueClass="text-emerald-700"
                            />

                            <ParticipationMiniCard
                                label="Did not vote"
                                value={safeDidNotVote}
                                percentage={Math.max(0, 100 - safeTurnout)}
                                className="border-rose-100 bg-rose-50/60"
                                valueClass="text-rose-600"
                            />
                        </div>

                        {/* ALL ELECTIONS */}

                        {!selectedElection && (
                            <div className="mt-6 space-y-3">
                                {electionTurnout.length === 0 ? (
                                    <EmptyState message="No elections have been created yet." />
                                ) : (
                                    electionTurnout.slice(0, 6).map((election) => (
                                        <div key={election.id} className="rounded-xl border border-gray-100 bg-gray-50/70 p-3">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="truncate text-sm font-semibold text-gray-800">{election.title}</p>

                                                <span className="text-xs font-bold text-gray-700">{election.percent}%</span>
                                            </div>

                                            <div className="mt-2 flex items-center gap-3">
                                                <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                                                    <div
                                                        className="h-full rounded-full bg-[#2D6A4F] transition-all duration-500"
                                                        style={{
                                                            width: `${Math.min(100, election.percent)}%`,
                                                        }}
                                                    />
                                                </div>

                                                <span className="text-[10px] font-semibold text-gray-500">
                                                    {election.voted} / {election.eligible_voters}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </section>

                    {/* VOTING ACTIVITY (line chart) */}

                    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-3">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <SectionHeading
                                icon={Activity}
                                iconClass="bg-[#1B4332] text-white"
                                title="Voting Activity"
                                subtitle="Daily trend and today's hourly activity"
                            />

                            <span className="w-fit rounded-md bg-gray-50 px-3 py-1.5 text-[11px] font-semibold text-gray-500 ring-1 ring-gray-200">
                                {(totalDailyVotes + hourlyActivity.reduce((sum, entry) => sum + entry.votes, 0)).toLocaleString()} records
                            </span>
                        </div>

                        <div className="mt-6">
                            <VotingActivityChart daily={dailyActivity} hourly={hourlyActivity} />
                        </div>
                    </section>
                </div>

                {/* ==========================================================
                    LEADERBOARD
                ========================================================== */}

                <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <SectionHeading
                            icon={Crown}
                            iconClass="bg-amber-50 text-amber-600"
                            title="Candidate Leaderboard"
                            subtitle="Comparison of candidates per position"
                        />

                        <span className="rounded-md bg-gray-50 px-3 py-1.5 text-[11px] font-semibold text-gray-500 ring-1 ring-gray-200">
                            {votesByPosition.length} positions
                        </span>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
                        {votesByPosition.length === 0 ? (
                            <EmptyState message="No votes have been recorded yet." />
                        ) : (
                            votesByPosition.map((group) => <PositionComparison key={group.position} group={group} showElection={!selectedElection} />)
                        )}
                    </div>
                </section>

                {/* ==========================================================
                    DATA VERIFICATION
                ========================================================== */}

                <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <SectionHeading
                            icon={ShieldCheck}
                            iconClass="bg-emerald-50 text-emerald-700"
                            title="Data Verification"
                            subtitle="Integrity checks on vote records"
                        />

                        <span className="rounded-md bg-gray-50 px-3 py-1.5 text-[11px] font-semibold text-gray-500 ring-1 ring-gray-200">
                            {dataIntegrity.total_votes_checked.toLocaleString()} records checked
                        </span>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {dataIntegrity.checks.map((check) => (
                            <div
                                key={check.key}
                                className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/70 px-3 py-3"
                            >
                                <div className="flex items-center gap-2">
                                    {check.healthy ? (
                                        <CheckCircle2 size={14} className="text-emerald-500" />
                                    ) : (
                                        <AlertTriangle size={14} className="text-amber-500" />
                                    )}

                                    <span className="text-xs font-medium text-gray-500">{check.label}</span>
                                </div>

                                <span className={`text-sm font-bold ${check.healthy ? 'text-gray-900' : 'text-amber-600'}`}>
                                    {check.count.toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div
                        className={`mt-4 rounded-xl border p-3 ${dataIntegrity.healthy ? 'border-emerald-100 bg-emerald-50' : 'border-amber-100 bg-amber-50'}`}
                    >
                        <div className="flex items-center gap-2">
                            {dataIntegrity.healthy ? (
                                <CheckCircle2 size={16} className="text-emerald-600" />
                            ) : (
                                <AlertTriangle size={16} className="text-amber-600" />
                            )}

                            <span className={`text-xs font-semibold ${dataIntegrity.healthy ? 'text-emerald-800' : 'text-amber-800'}`}>
                                {dataIntegrity.healthy
                                    ? `All checks passed — ${dataIntegrity.total_problems} issues found`
                                    : `${dataIntegrity.total_problems} issue(s) detected`}
                            </span>
                        </div>
                    </div>
                </section>

                {/* ==========================================================
                    CANDIDATE DISTRIBUTION
                ========================================================== */}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                    {/* COMPOSITION */}

                    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-2">
                        <SectionHeading
                            icon={UserRound}
                            iconClass="bg-[#EAF2ED] text-[#1B4332]"
                            title="Candidate Composition"
                            subtitle="Partylist vs independent candidates"
                        />

                        <div className="mt-6">
                            <div className="relative mx-auto h-52 w-52">
                                <DonutChart partylist={overview.partylist_candidates} independent={overview.independent_candidates} />
                            </div>

                            <div className="mt-6 grid grid-cols-2 gap-3">
                                <LegendItem
                                    color="bg-[#1B4332]"
                                    label="Partylist"
                                    value={overview.partylist_candidates}
                                    total={overview.total_candidates}
                                />

                                <LegendItem
                                    color="bg-amber-400"
                                    label="Independent"
                                    value={overview.independent_candidates}
                                    total={overview.total_candidates}
                                />
                            </div>
                        </div>
                    </section>

                    {/* ORGANIZATIONS */}

                    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-3">
                        <SectionHeading
                            icon={Building2}
                            iconClass="bg-sky-50 text-sky-600"
                            title="Candidates by Organization"
                            subtitle="Candidate distribution across organizations"
                        />

                        <div className="mt-6 space-y-4">
                            {candidatesByOrganization.length === 0 ? (
                                <EmptyState message="No candidates have been registered." />
                            ) : (
                                candidatesByOrganization.map((entry) => (
                                    <div key={entry.id}>
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="truncate text-sm font-medium text-gray-700">{entry.name}</p>

                                            <span className="text-sm font-bold text-gray-900">{entry.candidates}</span>
                                        </div>

                                        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                                            <div
                                                className="h-full rounded-full bg-sky-500 transition-all duration-500"
                                                style={{
                                                    width: `${
                                                        maxOrganizationCandidates > 0 ? (entry.candidates / maxOrganizationCandidates) * 100 : 0
                                                    }%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>
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
    value: number | string;
    iconClass: string;
}

function StatCard({ icon: Icon, label, value, iconClass }: StatCardProps) {
    return (
        <div className="group rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}>
                <Icon className="h-5 w-5" />
            </div>

            <p className="mt-3 text-2xl font-bold tracking-tight text-gray-900">{typeof value === 'number' ? value.toLocaleString() : value}</p>

            <p className="mt-0.5 truncate text-xs font-medium text-gray-500">{label}</p>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| SECTION HEADING
|--------------------------------------------------------------------------
*/

interface SectionHeadingProps {
    icon: typeof Users;
    iconClass: string;
    title: string;
    subtitle: string;
}

function SectionHeading({ icon: Icon, iconClass, title, subtitle }: SectionHeadingProps) {
    return (
        <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}>
                <Icon className="h-5 w-5" />
            </div>

            <div>
                <h2 className="text-sm font-bold text-gray-900">{title}</h2>

                <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| STATUS PILL
|--------------------------------------------------------------------------
*/

const statusStyles: Record<string, string> = {
    ongoing: 'bg-emerald-50 text-emerald-700 ring-emerald-200',

    upcoming: 'bg-amber-50 text-amber-700 ring-amber-200',

    completed: 'bg-gray-100 text-gray-600 ring-gray-200',

    unknown: 'bg-gray-100 text-gray-600 ring-gray-200',
};

function StatusPill({ status }: { status: string }) {
    const normalized = status.toLowerCase();

    return (
        <span
            className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase ring-1 ${
                statusStyles[normalized] || statusStyles.unknown
            }`}
        >
            {status}
        </span>
    );
}

/*
|--------------------------------------------------------------------------
| TURNOUT GAUGE
|--------------------------------------------------------------------------
*/

function TurnoutGauge({ percent, voted, total }: { percent: number; voted: number; total: number }) {
    const safePercent = Math.min(100, Math.max(0, percent));

    const circumference = 2 * Math.PI * 78;

    const progress = (safePercent / 100) * circumference;

    const gaugeColor = safePercent >= 75 ? '#2D6A4F' : safePercent >= 50 ? '#D97706' : '#DC2626';

    const gaugeLevel = safePercent >= 75 ? 'Excellent' : safePercent >= 50 ? 'Moderate' : 'Low';

    const ticks = [25, 50, 75, 100].map((step) => {
        const rad = ((step / 100) * 360 - 90) * (Math.PI / 180);

        return {
            key: step,
            x: 100 + 78 * Math.cos(rad),
            y: 100 + 78 * Math.sin(rad),
        };
    });

    return (
        <div className="flex flex-col items-center">
            <div className="relative h-52 w-52">
                <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
                    <circle cx="100" cy="100" r="78" fill="none" strokeWidth="18" className="stroke-gray-100" />

                    {ticks.map((tick) => (
                        <circle key={tick.key} cx={tick.x} cy={tick.y} r="2.2" fill="#fff" stroke="#d1d5db" strokeWidth="1.5" />
                    ))}

                    <circle
                        cx="100"
                        cy="100"
                        r="78"
                        fill="none"
                        strokeWidth="18"
                        strokeLinecap="round"
                        stroke={gaugeColor}
                        strokeDasharray={`${progress} ${circumference}`}
                        style={{
                            transition: 'stroke-dasharray 700ms ease-out',
                        }}
                    />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-4xl font-bold tracking-tight text-gray-900">{safePercent}%</p>

                    <p className="mt-1 text-xs font-medium text-gray-400">Turnout</p>

                    <span
                        className="mt-1.5 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wide text-white uppercase"
                        style={{
                            backgroundColor: gaugeColor,
                        }}
                    >
                        {gaugeLevel}
                    </span>
                </div>
            </div>

            <p className="mt-4 text-sm font-semibold text-gray-800">
                {voted.toLocaleString()} of {total.toLocaleString()} voters
            </p>

            <p className="mt-1 text-xs text-gray-400">Unique eligible voters who participated</p>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| PARTICIPATION MINI CARD
|--------------------------------------------------------------------------
*/

function ParticipationMiniCard({
    label,
    value,
    percentage,
    className,
    valueClass,
}: {
    label: string;
    value: number;
    percentage: number;
    className: string;
    valueClass: string;
}) {
    return (
        <div className={`rounded-xl border p-3 ${className}`}>
            <p className="text-[10px] font-bold tracking-wide text-gray-500 uppercase">{label}</p>

            <p className={`mt-1 text-xl font-bold ${valueClass}`}>{value.toLocaleString()}</p>

            <p className="mt-1 text-[10px] text-gray-400">{percentage.toFixed(1)}%</p>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| CANDIDATE ROW
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| CANDIDATE PILL (PARTYLIST COLOR)
|--------------------------------------------------------------------------
*/

function CandidatePill({ type, partylist }: { type: 'independent' | 'partylist'; partylist: PartylistInfo | null }) {
    if (type === 'partylist' && partylist?.color) {
        return (
            <span
                className="inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 text-[8px] font-bold tracking-wide text-white uppercase"
                style={{
                    backgroundColor: partylist.color,
                }}
            >
                {partylist.acronym || partylist.name}
            </span>
        );
    }

    if (type === 'partylist') {
        return (
            <span className="inline-flex items-center gap-1.5 rounded bg-rose-100 px-1.5 py-0.5 text-[8px] font-bold tracking-wide text-rose-600 uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                Partylist
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1.5 rounded bg-emerald-100 px-1.5 py-0.5 text-[8px] font-bold tracking-wide text-emerald-600 uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Independent
        </span>
    );
}

/*
|--------------------------------------------------------------------------
| POSITION COMPARISON
|--------------------------------------------------------------------------
*/

function PositionComparison({ group, showElection }: { group: VotesByPositionEntry; showElection: boolean }) {
    const total = group.total_votes;
    const leader = group.candidates[0];

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-bold text-gray-900">{group.position}</p>

                <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500">{total.toLocaleString()} votes</span>
            </div>

            {group.candidates.length === 0 ? (
                <p className="mt-3 text-xs text-gray-400">No candidates registered for this position.</p>
            ) : (
                <>
                    {leader && leader.votes > 0 && (
                        <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-dashed border-amber-300 bg-amber-50/60 px-3 py-2.5">
                            <div className="flex min-w-0 items-center gap-2.5">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 ring-1 ring-amber-200">
                                    <Crown size={16} />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-[9px] font-bold tracking-wide text-amber-500 uppercase">Currently leading</p>

                                    <p className="truncate text-sm font-bold text-gray-900">{leader.name}</p>
                                </div>
                            </div>

                            <CandidatePill type={leader.type} partylist={leader.partylist} />

                            <div className="shrink-0 text-right">
                                <p className="text-lg leading-none font-bold text-amber-600">{leader.votes.toLocaleString()}</p>

                                <p className="text-[9px] font-medium text-amber-500/80">{leader.share}%</p>
                            </div>
                        </div>
                    )}

                    <div className="mt-3 space-y-2.5">
                        {group.candidates.map((candidate, index) => {
                            const isLeader = index === 0 && leader?.votes > 0;

                            return (
                                <div key={candidate.id} className="flex items-center justify-between gap-2">
                                    <div className="flex min-w-0 items-center gap-2">
                                        <span
                                            className={[
                                                'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[8px] font-bold',
                                                isLeader ? 'bg-amber-400 text-white' : 'bg-gray-200 text-gray-500',
                                            ].join(' ')}
                                        >
                                            {index + 1}
                                        </span>

                                        <div className="min-w-0">
                                            <p className="truncate text-xs font-semibold text-gray-700">{candidate.name}</p>

                                            {showElection && candidate.election && (
                                                <p className="truncate text-[9px] text-gray-400">{candidate.election}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-2">
                                        <CandidatePill type={candidate.type} partylist={candidate.partylist} />

                                        <span className="text-xs font-bold text-gray-900">{candidate.votes.toLocaleString()}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-3 flex h-6 items-end gap-1">
                        {group.candidates.map((candidate, index) => {
                            const pct = total > 0 ? (candidate.votes / total) * 100 : 0;

                            const barColor = candidate.type === 'partylist' ? candidate.partylist?.color || '#E11D48' : '#10B981';

                            return (
                                <div key={candidate.id} className="group relative flex flex-1 flex-col items-center justify-end gap-1">
                                    <span className="text-[8px] font-bold text-gray-400">{Math.round(pct)}%</span>

                                    <div
                                        className={['w-full rounded-t transition-all duration-500', index === 0 ? 'ring-1 ring-amber-300' : ''].join(
                                            ' ',
                                        )}
                                        style={{
                                            height: `${Math.max(4, pct)}%`,
                                            backgroundColor: barColor,
                                        }}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| VOTING ACTIVITY LINE CHART
|--------------------------------------------------------------------------
|
| One SVG line chart combining the daily (14 days) and hourly (today)
| vote activity as two overlaid lines.
|
*/

type LinePoint = {
    label: string;
    value: number;
    highlight?: boolean;
};

function buildPolyline(points: LinePoint[], X: number, W: number, H: number, maxV: number): string {
    const count = Math.max(points.length - 1, 1);

    return points
        .map((p, i) => {
            const x = i === 0 ? X : X + (i / count) * W;
            const y = maxV > 0 ? H - (Math.min(p.value, maxV) / maxV) * H : H;
            return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(' ');
}

function buildAreaPath(points: LinePoint[], X: number, W: number, H: number, maxV: number): string {
    const count = Math.max(points.length - 1, 1);

    if (points.length === 0) {
        return '';
    }

    const firstX = X;
    const lastX = X + count * (W / count);
    const baselineY = H;

    let top = '';
    points.forEach((p, i) => {
        const x = i === 0 ? X : X + (i / count) * W;
        const y = maxV > 0 ? H - (Math.min(p.value, maxV) / maxV) * H : H;
        top += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    });

    return `${top}L${lastX.toFixed(1)},${baselineY.toFixed(1)}L${firstX.toFixed(1)},${baselineY.toFixed(1)}Z`;
}

function VotingActivityChart({ daily, hourly }: { daily: DailyActivityEntry[]; hourly: HourlyActivityEntry[] }) {
    const VW = 800;
    const VH = 380;
    const PAD_X = 34;
    const PAD_TOP = 24;
    const PAD_BOTTOM = 28;

    const chartW = VW - PAD_X - 12;
    const chartH = VH - PAD_TOP - PAD_BOTTOM;

    const dailyPoints: LinePoint[] = daily.map((d) => ({
        label: d.full || d.label,
        value: d.votes,
        highlight: d.is_today,
    }));

    const hourlyPoints: LinePoint[] = hourly.map((h) => ({
        label: h.label,
        value: h.votes,
    }));

    const maxValue = Math.max(...dailyPoints.map((p) => p.value), ...hourlyPoints.map((p) => p.value), 1);

    const dailyPath = buildPolyline(dailyPoints, PAD_X, chartW, chartH, maxValue);

    const hourlyPath = buildPolyline(hourlyPoints, PAD_X, chartW, chartH, maxValue);

    const dailyArea = buildAreaPath(dailyPoints, PAD_X, chartW, chartH, maxValue);

    const hourlyArea = buildAreaPath(hourlyPoints, PAD_X, chartW, chartH, maxValue);

    const ySteps = 4;
    const yTicks = Array.from({ length: ySteps + 1 }, (_, i) => {
        const value = (maxValue / ySteps) * i;
        return {
            value,
            y: PAD_TOP + chartH - (value / maxValue) * chartH,
        };
    });

    const showDaily = dailyPoints.length > 0;
    const showHourly = hourlyPoints.length > 0;

    const hasAnyData = showDaily || showHourly;

    return (
        <div className="relative">
            <div className="flex flex-wrap items-center justify-end gap-4">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-gray-500">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#2D6A4F]" />
                    Daily (14 days)
                </span>

                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-gray-500">
                    <span className="h-2.5 w-2.5 rounded-full bg-violet-500" />
                    Hourly (today)
                </span>
            </div>

            {!hasAnyData ? (
                <div className="mt-4 flex h-56 items-center justify-center rounded-xl bg-gray-50 text-xs text-gray-400">
                    No voting activity recorded yet.
                </div>
            ) : (
                <div className="mt-3">
                    <svg viewBox={`0 0 ${VW} ${VH}`} className="h-80 w-full" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="areaDaily" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#2D6A4F" stopOpacity="0.35" />
                                <stop offset="100%" stopColor="#2D6A4F" stopOpacity="0.02" />
                            </linearGradient>
                            <linearGradient id="areaHourly" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.35" />
                                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.02" />
                            </linearGradient>
                        </defs>

                        {[
                            [0, 25, 50, 75, 100].map((pct) => {
                                const y = PAD_TOP + (1 - pct / 100) * chartH;
                                return (
                                    <line
                                        key={pct}
                                        x1={PAD_X}
                                        y1={y}
                                        x2={VW - 12}
                                        y2={y}
                                        stroke={pct === 0 ? '#cbd5e1' : '#e5e7eb'}
                                        strokeWidth={pct === 0 ? '1.5' : '1'}
                                        strokeDasharray={pct === 0 ? '0' : '4 4'}
                                    />
                                );
                            }),
                        ]}

                        {yTicks.map((tick) => (
                            <text key={tick.value} x={PAD_X - 8} y={tick.y + 3.5} textAnchor="end" fontSize="10" fontWeight="600" fill="#64748b">
                                {Math.round(tick.value).toLocaleString()}
                            </text>
                        ))}

                        {showDaily && <path d={dailyArea} fill="url(#areaDaily)" />}
                        {showHourly && <path d={hourlyArea} fill="url(#areaHourly)" />}

                        {showDaily && (
                            <g>
                                <polyline
                                    points={dailyPath}
                                    fill="none"
                                    stroke="#1B4332"
                                    strokeWidth="3.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    style={{ filter: 'drop-shadow(0 1px 2px rgba(27,67,50,0.25))' }}
                                />
                                {dailyPoints.map((p, i) => {
                                    const count = Math.max(dailyPoints.length - 1, 1);
                                    const cx = i === 0 ? PAD_X : PAD_X + (i / count) * chartW;
                                    const cy = PAD_TOP + chartH - (Math.min(p.value, maxValue) / maxValue) * chartH;
                                    const labelY = p.highlight ? cy - 14 : cy - 10;
                                    return (
                                        <g key={i}>
                                            <circle
                                                cx={cx}
                                                cy={cy}
                                                r={p.highlight ? 7 : 5}
                                                fill={p.highlight ? '#F59E0B' : '#2D6A4F'}
                                                stroke="#fff"
                                                strokeWidth="2.5"
                                            />
                                            {p.highlight && (
                                                <circle cx={cx} cy={cy} r="10" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeOpacity="0.5" />
                                            )}
                                            <text
                                                x={cx}
                                                y={labelY}
                                                textAnchor="middle"
                                                fontSize="11"
                                                fontWeight="700"
                                                fill={p.highlight ? '#D97706' : '#166534'}
                                            >
                                                {p.value.toLocaleString()}
                                            </text>
                                            <title>{`${p.label}: ${p.value.toLocaleString()} votes`}</title>
                                        </g>
                                    );
                                })}
                            </g>
                        )}

                        {showHourly && (
                            <g>
                                <polyline
                                    points={hourlyPath}
                                    fill="none"
                                    stroke="#6D28D9"
                                    strokeWidth="3.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeDasharray="8 5"
                                    style={{ filter: 'drop-shadow(0 1px 2px rgba(109,40,217,0.25))' }}
                                />
                                {hourlyPoints.map((p, i) => {
                                    const count = Math.max(hourlyPoints.length - 1, 1);
                                    const cx = i === 0 ? PAD_X : PAD_X + (i / count) * chartW;
                                    const cy = PAD_TOP + chartH - (Math.min(p.value, maxValue) / maxValue) * chartH;
                                    const isPeak = p.value === Math.max(...hourlyPoints.map((hp) => hp.value));
                                    return (
                                        <g key={i}>
                                            <circle
                                                cx={cx}
                                                cy={cy}
                                                r={isPeak ? 7 : 5}
                                                fill={isPeak ? '#7C3AED' : '#8B5CF6'}
                                                stroke="#fff"
                                                strokeWidth="2.5"
                                            />
                                            {isPeak && (
                                                <circle cx={cx} cy={cy} r="10" fill="none" stroke="#7C3AED" strokeWidth="1.5" strokeOpacity="0.5" />
                                            )}
                                            <text x={cx} y={cy - 11} textAnchor="middle" fontSize="10" fontWeight="700" fill="#6D28D9">
                                                {p.value.toLocaleString()}
                                            </text>
                                            <title>{`${p.label}: ${p.value.toLocaleString()} votes`}</title>
                                        </g>
                                    );
                                })}
                            </g>
                        )}
                    </svg>

                    <div className="flex justify-between px-2 text-[9px] font-medium text-gray-400">
                        <span>{showDaily ? daily[0]?.label : ''}</span>
                        <span>{showHourly ? hourly[hourly.length - 1]?.label : ''}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| DONUT CHART
|--------------------------------------------------------------------------
*/

function DonutChart({ partylist, independent }: { partylist: number; independent: number }) {
    const total = partylist + independent;

    if (total === 0) {
        return (
            <div className="flex h-52 w-52 items-center justify-center rounded-full bg-gray-100">
                <span className="text-xs font-medium text-gray-400">No data</span>
            </div>
        );
    }

    const partylistPercent = (partylist / total) * 100;

    const independentPercent = (independent / total) * 100;

    const circumference = 2 * Math.PI * 80;

    const partylistLength = (partylistPercent / 100) * circumference;

    const independentLength = (independentPercent / 100) * circumference;

    return (
        <div className="relative flex h-52 w-52 items-center justify-center">
            <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
                <defs>
                    <linearGradient id="donutPartylist" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#1B4332" />
                        <stop offset="100%" stopColor="#40916C" />
                    </linearGradient>

                    <linearGradient id="donutIndependent" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#F59E0B" />
                        <stop offset="100%" stopColor="#FCD34D" />
                    </linearGradient>
                </defs>

                <circle cx="100" cy="100" r="80" fill="none" strokeWidth="22" className="stroke-gray-100" />

                <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    strokeWidth="22"
                    stroke="url(#donutPartylist)"
                    strokeDasharray={`${partylistLength} ${circumference}`}
                    style={{
                        transition: 'stroke-dasharray 700ms ease-out',
                    }}
                />

                <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    strokeWidth="22"
                    stroke="url(#donutIndependent)"
                    strokeDasharray={`${independentLength} ${circumference}`}
                    strokeDashoffset={`${-partylistLength}`}
                    style={{
                        transition: 'stroke-dasharray 700ms ease-out',
                    }}
                />
            </svg>

            <div className="absolute flex flex-col items-center">
                <p className="text-3xl font-bold tracking-tight text-gray-900">{total.toLocaleString()}</p>

                <p className="text-[11px] font-medium text-gray-400">Candidates</p>
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| LEGEND
|--------------------------------------------------------------------------
*/

function LegendItem({ color, label, value, total }: { color: string; label: string; value: number; total: number }) {
    const percent = total > 0 ? Math.round((value / total) * 100) : 0;

    return (
        <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3">
            <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${color}`} />

                <span className="text-xs font-medium text-gray-500">{label}</span>
            </div>

            <p className="mt-1.5 text-lg leading-none font-bold text-gray-900">{value.toLocaleString()}</p>

            <p className="mt-1 text-[11px] text-gray-400">{percent}% of candidates</p>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| EMPTY STATE
|--------------------------------------------------------------------------
*/

function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <Users className="h-7 w-7 text-gray-300" />

            <p className="text-sm font-medium text-gray-500">{message}</p>
        </div>
    );
}
