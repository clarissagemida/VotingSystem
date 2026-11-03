import { Head } from '@inertiajs/react';
import { Activity, RefreshCw, Users, Vote } from 'lucide-react';
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

export default function LiveVoting({ elections, initialData }: Props) {
    const [electionId, setElectionId] = useState(initialData?.election.id ?? elections[0]?.id ?? 0);
    const [data, setData] = useState(initialData);
    const [connected, setConnected] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const requestNumber = useRef(0);

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
        void refresh();
        const timer = window.setInterval(() => void refresh(), 15000);
        return () => { window.clearInterval(timer); requestNumber.current++; };
    }, [refresh]);

    const landscapePositions = useMemo(() => {
        if (!data) return [];

        const positions = [...data.positions];
        const normalizePosition = (name: string) => name.toLowerCase().replace(/[^a-z]/g, '');
        const viceIndex = positions.findIndex((position) => normalizePosition(position.position).includes('vicepresident'));
        const presidentIndex = positions.findIndex((position) => normalizePosition(position.position) === 'president');

        // Place President in the first left card and Vice President in the first right card.
        if (viceIndex < 0 || presidentIndex < 0 || viceIndex === presidentIndex) return positions;

        const vice = positions[viceIndex];
        const president = positions[presidentIndex];

        return [president, vice, ...positions.filter((_, index) => index !== viceIndex && index !== presidentIndex)];
    }, [data]);

    return <AdminLayout>
        <Head title="Live Voting" />
        <div className="mx-auto max-w-screen-2xl space-y-5">
            <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-[#143728] to-[#2D6A4F] p-6 text-white shadow-lg">
                <div><div className="flex items-center gap-2 text-green-100"><Activity size={18} /><span className="text-xs font-bold uppercase tracking-widest">Election operations</span></div><h1 className="mt-2 text-2xl font-bold">Live Voting</h1><p className="mt-1 text-sm text-green-100">Monitor participation and candidate totals by position.</p></div>
                <div className="flex items-center gap-3"><label htmlFor="live-election" className="sr-only">Choose election</label><select id="live-election" value={electionId} onChange={(event) => setElectionId(Number(event.target.value))} className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white"><option className="text-gray-900" value={0}>Select election</option>{elections.map((election) => <option className="text-gray-900" key={election.id} value={election.id}>{election.title}</option>)}</select><button onClick={() => void refresh()} disabled={refreshing || !electionId} className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[#1B4332] disabled:opacity-60"><RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />Refresh</button></div>
            </header>
            {!data ? <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center text-sm text-gray-500">No elections have been created yet.</div> : <>
                <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5"><div><h2 className="text-lg font-bold text-gray-900">{data.election.title}</h2><p className="mt-1 text-sm text-gray-500">Scheduled {data.election.start_at ? new Date(data.election.start_at).toLocaleString() : '—'} – {data.election.end_at ? new Date(data.election.end_at).toLocaleString() : '—'}</p></div><div className="flex items-center gap-3"><span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-800">{data.election.status}</span><span className={`text-xs font-semibold ${connected ? 'text-green-700' : 'text-amber-700'}`}>{connected ? 'Connected · polling every 15s' : 'Reconnecting · retrying'}</span></div></section>
                <section className="grid grid-cols-2 gap-4">{[['Eligible voters', data.eligible, Users], ['Participated', data.participated, Vote], ['Turnout', `${data.turnout}%`, Activity]].map(([label, value, Icon]) => <div key={String(label)} className="rounded-xl border border-gray-200 bg-white p-5"><div className="flex items-center gap-2 text-sm text-gray-500"><Icon size={17} />{label}</div><p className="mt-3 text-3xl font-bold text-[#1B4332]">{value}</p></div>)}</section>
                <p className="text-right text-xs text-gray-500">Last successful update: {new Date(data.updated_at).toLocaleString()}</p>
                <section aria-label="Position results in two columns" className="grid grid-cols-1 items-start gap-5 md:grid-cols-2">
                    {landscapePositions.map((position, positionIndex) => <section key={`${position.organization_id}-${position.position}`} style={{ animationDelay: `${positionIndex * 180}ms` }} className="live-position-card overflow-hidden rounded-2xl border bg-white shadow-sm"><div className="flex flex-wrap items-center justify-between gap-2 border-b bg-gray-50 px-5 py-4"><div><p className="text-xs font-semibold uppercase tracking-wide text-[#40916C]">{position.organization}</p><h3 className="mt-1 text-lg font-bold text-gray-900">{position.position}</h3></div><span className="text-sm text-gray-500">{position.total_votes} votes</span></div><div className="divide-y divide-gray-100">{position.candidates.map((candidate) => <div key={candidate.id} className={`flex items-center gap-4 p-4 ${candidate.leading ? 'bg-green-50/70' : ''}`}><img src={photoUrl(candidate.photo)} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = '/images/logo-cpsu.png'; }} alt={candidate.name} className="h-14 w-14 rounded-full border border-gray-200 bg-white object-cover" /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="rounded-md bg-gray-100 px-2 py-1 text-[11px] font-bold text-gray-600">{candidate.label}</span><p className="font-semibold text-gray-900">{candidate.name}</p>{candidate.leading && <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-800">{candidate.tied ? 'Tied lead' : 'Leading'}</span>}</div><p className="mt-1 inline-flex rounded px-2 py-1 text-xs font-semibold text-white" style={{ backgroundColor: candidate.type === 'independent' ? '#64748b' : candidate.partylist_color || '#64748b' }}>{candidate.type === 'independent' ? 'Independent' : candidate.partylist || 'Partylist'}</p></div><div className="text-right"><p className="font-bold text-gray-900">{candidate.votes.toLocaleString()}</p><p className="text-xs text-gray-500">{candidate.percentage}%</p></div></div>)}</div></section>)}
                </section>
            </>}
        </div>
    </AdminLayout>;
}
