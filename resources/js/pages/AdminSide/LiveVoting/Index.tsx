import { Head } from '@inertiajs/react';
import { Activity, AlertCircle, BarChart3, Clock3, RefreshCw, Users, Vote } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import AdminLayout from '@/layouts/AdminLayout';
import { getCandidatePhotoUrl } from '@/lib/candidates';

interface Candidate {
    id: number;
    name: string;
    label: string;
    photo: string | null;
    type: string;
    partylist: string | null;
    partylist_color: string | null;
    votes: number;
    percentage: number;
    rank: number | null;
    tied: boolean;
    leading: boolean;
}

interface Position {
    organization_id: number;
    organization: string;
    position: string;
    position_order: number;
    total_votes: number;
    candidates: Candidate[];
}

interface LiveData {
    election: { id: number; title: string; status: string; start_at: string | null; end_at: string | null };
    eligible: number;
    participated: number;
    turnout: number;
    positions: Position[];
    updated_at: string;
}

interface Props {
    elections: Array<{ id: number; title: string; status: string }>;
    initialData: LiveData | null;
}

function photoUrl(path: string | null): string {
    return getCandidatePhotoUrl(path) ?? '/images/logo-cpsu.png';
}

function voterPoolProgress(votes: number, eligibleVoters: number): number {
    if (eligibleVoters <= 0) return 0;

    return Math.min(100, Math.max(0, (votes / eligibleVoters) * 100));
}

export default function LiveVoting({ elections, initialData }: Props) {
    const [electionId, setElectionId] = useState(initialData?.election.id ?? elections[0]?.id ?? 0);
    const [data, setData] = useState(initialData);
    const [connected, setConnected] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const requestNumber = useRef(0);
    const currentData = data?.election.id === electionId ? data : null;

    const refresh = useCallback(async () => {
        if (!electionId) return;
        const requestId = ++requestNumber.current;
        setRefreshing(true);
        try {
            const response = await fetch(`/admin/elections/${electionId}/live-data`, {
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                credentials: 'same-origin',
                cache: 'no-store',
            });
            if (!response.ok) throw new Error('Live data request failed');
            const current = await response.json() as LiveData;
            if (requestId === requestNumber.current) {
                setData(current);
                setConnected(true);
            }
        } catch {
            if (requestId === requestNumber.current) setConnected(false);
        } finally {
            if (requestId === requestNumber.current) setRefreshing(false);
        }
    }, [electionId]);

    useEffect(() => {
        const requestNumberRef = requestNumber;
        void refresh();
        const timer = window.setInterval(() => void refresh(), 15000);
        return () => { window.clearInterval(timer); requestNumberRef.current++; };
    }, [refresh]);

    const landscapePositions = useMemo(() => {
        if (!currentData) return [];

        const positions = [...currentData.positions];
        const normalizePosition = (name: string) => name.toLowerCase().replace(/[^a-z]/g, '');
        const viceIndex = positions.findIndex((position) => normalizePosition(position.position).includes('vicepresident'));
        const presidentIndex = positions.findIndex((position) => normalizePosition(position.position) === 'president');

        // Place President in the first left card and Vice President in the first right card.
        if (viceIndex < 0 || presidentIndex < 0 || viceIndex === presidentIndex) return positions;

        const vice = positions[viceIndex];
        const president = positions[presidentIndex];

        return [president, vice, ...positions.filter((_, index) => index !== viceIndex && index !== presidentIndex)];
    }, [currentData]);

    return (
        <AdminLayout>
            <Head title="Live Voting" />
            <div className="mx-auto max-w-screen-2xl space-y-6">
                <header className="flex flex-col gap-5 rounded-2xl bg-gradient-to-r from-[#143728] to-[#2D6A4F] p-6 text-white shadow-sm sm:p-8 xl:flex-row xl:items-end xl:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-100">
                            <Activity size={15} /> Election operations
                        </div>
                        <h1 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">Live Voting</h1>
                        <p className="mt-2 max-w-xl text-sm leading-6 text-emerald-50/80">Monitor voter participation and candidate totals as ballots are recorded.</p>
                    </div>
                    <div className="flex w-full flex-col gap-2 sm:flex-row xl:w-auto">
                        <label htmlFor="live-election" className="sr-only">Choose election</label>
                        <select
                            id="live-election"
                            value={electionId}
                            onChange={(event) => setElectionId(Number(event.target.value))}
                            className="min-h-11 min-w-0 flex-1 rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white outline-none transition focus:border-emerald-200 focus:ring-2 focus:ring-emerald-200/30 sm:min-w-64 xl:flex-none"
                        >
                            <option className="text-gray-900" value={0}>Select an election</option>
                            {elections.map((election) => (
                                <option className="text-gray-900" key={election.id} value={election.id}>{election.title}</option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={() => void refresh()}
                            disabled={refreshing || !electionId}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-[#1B4332] shadow-sm transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} /> Refresh data
                        </button>
                    </div>
                </header>

                {elections.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
                        <BarChart3 className="mx-auto h-8 w-8 text-gray-400" />
                        <h2 className="mt-4 font-bold text-gray-900">No elections to monitor</h2>
                        <p className="mt-1 text-sm text-gray-500">Create an election to view its live participation and results here.</p>
                    </div>
                ) : !currentData ? (
                    <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
                        {refreshing ? <RefreshCw className="mx-auto h-7 w-7 animate-spin text-emerald-700" /> : <AlertCircle className="mx-auto h-7 w-7 text-amber-600" />}
                        <h2 className="mt-4 font-bold text-gray-900">{refreshing ? 'Loading election data' : 'Election data unavailable'}</h2>
                        <p className="mt-1 text-sm text-gray-500">{refreshing ? 'Fetching the latest participation and candidate totals.' : 'Refresh the page data to try again.'}</p>
                    </div>
                ) : (
                    <>
                        <section className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 lg:flex-row lg:items-center lg:justify-between">
                            <div className="min-w-0">
                                <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Selected election</p>
                                <h2 className="mt-1 truncate text-xl font-extrabold tracking-tight text-gray-900">{currentData.election.title}</h2>
                                <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                                    <Clock3 size={14} />
                                    <span>{currentData.election.start_at ? new Date(currentData.election.start_at).toLocaleString() : 'Start not set'}</span>
                                    <span className="text-gray-300">to</span>
                                    <span>{currentData.election.end_at ? new Date(currentData.election.end_at).toLocaleString() : 'End not set'}</span>
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${currentData.election.status === 'Ongoing' ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200' : 'bg-gray-100 text-gray-700 ring-1 ring-gray-200'}`}>
                                    <span className={`h-2 w-2 rounded-full ${currentData.election.status === 'Ongoing' ? 'animate-pulse bg-emerald-500' : 'bg-gray-400'}`} />
                                    {currentData.election.status}
                                </span>
                                <span className={`inline-flex items-center gap-2 text-xs font-semibold ${connected ? 'text-emerald-700' : 'text-amber-700'}`}>
                                    <span className={`h-2 w-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                    {connected ? 'Live connection · refreshes every 15 seconds' : 'Reconnecting · retrying'}
                                </span>
                            </div>
                        </section>

                        <section aria-label="Election participation" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            {[
                                { label: 'Eligible voters', value: currentData.eligible.toLocaleString(), icon: Users, detail: 'Assigned to this election' },
                                { label: 'Participated', value: currentData.participated.toLocaleString(), icon: Vote, detail: 'Voters who submitted ballots' },
                                { label: 'Not yet voted', value: Math.max(0, currentData.eligible - currentData.participated).toLocaleString(), icon: Users, detail: 'Eligible voters remaining' },
                                { label: 'Turnout', value: `${currentData.turnout.toFixed(1)}%`, icon: Activity, detail: 'Participation rate' },
                            ].map(({ label, value, icon: Icon, detail }) => (
                                <article key={label} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-500">{label}</p>
                                            <p className="mt-2 text-3xl font-extrabold tracking-tight tabular-nums text-[#1B4332]">{value}</p>
                                        </div>
                                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800"><Icon size={18} /></span>
                                    </div>
                                    <p className="mt-3 text-xs text-gray-500">{detail}</p>
                                    {label === 'Turnout' && (
                                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100">
                                            <div className="h-full rounded-full bg-emerald-600 transition-[width]" style={{ width: `${Math.min(100, Math.max(0, currentData.turnout))}%` }} />
                                        </div>
                                    )}
                                </article>
                            ))}
                        </section>

                        <div className="flex flex-col gap-1 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
                            <h2 className="text-base font-bold text-gray-900">Results by position</h2>
                            <p>Last successful update: {new Date(currentData.updated_at).toLocaleString()}</p>
                        </div>

                        {landscapePositions.length > 0 ? (
                            <section aria-label="Position results" className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
                                {landscapePositions.map((position) => (
                                    <article key={`${position.organization_id}-${position.position}`} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                                        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/80 px-5 py-4">
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">{position.organization}</p>
                                                <h3 className="mt-1 text-lg font-extrabold text-gray-900">{position.position}</h3>
                                            </div>
                                            <span className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold tabular-nums text-gray-600">{position.total_votes.toLocaleString()} votes</span>
                                        </header>
                                        {position.candidates.length > 0 ? (
                                            <div className="divide-y divide-gray-100">
                                                {position.candidates.map((candidate) => (
                                                    <div key={candidate.id} className={`p-4 sm:p-5 ${candidate.leading ? 'bg-emerald-50/50' : ''}`}>
                                                        <div className="flex items-center gap-3 sm:gap-4">
                                                            <img
                                                                src={photoUrl(candidate.photo)}
                                                                onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = '/images/logo-cpsu.png'; }}
                                                                alt={candidate.name}
                                                                className="h-12 w-12 shrink-0 rounded-full border border-gray-200 bg-white object-cover sm:h-14 sm:w-14"
                                                            />
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <span className="rounded-md bg-gray-100 px-2 py-1 text-[10px] font-bold text-gray-600">{candidate.label}</span>
                                                                    <p className="truncate text-sm font-bold text-gray-900">{candidate.name}</p>
                                                                    {candidate.leading && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">{candidate.tied ? 'Tied lead' : 'Leading'}</span>}
                                                                </div>
                                                                <span className="mt-1.5 inline-flex max-w-full truncate rounded px-2 py-1 text-[10px] font-semibold text-white" style={{ backgroundColor: candidate.type === 'independent' ? '#64748b' : candidate.partylist_color || '#64748b' }}>
                                                                    {candidate.type === 'independent' ? 'Independent' : candidate.partylist || 'Partylist'}
                                                                </span>
                                                            </div>
                                                            <div className="shrink-0 text-right">
                                                                <p className="text-lg font-extrabold tabular-nums text-[#1B4332]">{candidate.votes.toLocaleString()}</p>
                                                                <p className="text-xs font-semibold tabular-nums text-gray-500">{candidate.percentage.toFixed(1)}% of votes cast</p>
                                                            </div>
                                                        </div>
                                                        <div className="mt-3 ml-[60px] h-2 overflow-hidden rounded-full bg-gray-100" role="progressbar" aria-label={`${candidate.name} votes compared with the eligible voter pool`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={voterPoolProgress(candidate.votes, currentData.eligible)} aria-valuetext={`${candidate.votes} of ${currentData.eligible} eligible voters`}>
                                                            <div className={`h-full rounded-full transition-[width] duration-700 ${candidate.leading ? 'bg-emerald-600' : 'bg-emerald-300'}`} style={{ width: `${voterPoolProgress(candidate.votes, currentData.eligible)}%` }} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="p-5 text-sm text-gray-500">No candidates are registered for this position.</p>
                                        )}
                                    </article>
                                ))}
                            </section>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
                                <Vote className="mx-auto h-8 w-8 text-gray-400" />
                                <h3 className="mt-3 font-bold text-gray-900">No position results yet</h3>
                                <p className="mt-1 text-sm text-gray-500">Candidate totals will appear here when positions and candidates are available.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </AdminLayout>
    );
}
