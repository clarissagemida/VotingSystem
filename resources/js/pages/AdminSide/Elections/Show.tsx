import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { CalendarDays, Clock, FileText, RefreshCw, Vote, X } from 'lucide-react';

import AdminLayout from '@/layouts/AdminLayout';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Election {
    id: number;
    title: string;
    description: string | null;
    start_at: string | null;
    end_at: string | null;
    status: 'Upcoming' | 'Ongoing' | 'Completed';
    created_at: string | null;
    updated_at: string | null;
}

interface Props {
    election: Election;
    eligibleVoterCount: number;
    votersWhoVoted: number;
    notYetParticipated: number;
    turnout: number;
    positions: Array<{ name: string; participating: number; eligible: number; progress: number; candidates: Array<{ name: string; designation: string | null; votes: number }> }>;
    resultsVisible: boolean;
    lastRefreshedAt: string;
}

export default function Show({ election, eligibleVoterCount, votersWhoVoted, notYetParticipated, turnout, positions, resultsVisible, lastRefreshedAt }: Props) {
    const [refreshedAt, setRefreshedAt] = useState(lastRefreshedAt);
    const [refreshing, setRefreshing] = useState(false);

    const refresh = () => {
        setRefreshing(true);
        router.reload({ only: ['election', 'eligibleVoterCount', 'votersWhoVoted', 'notYetParticipated', 'turnout', 'positions', 'resultsVisible', 'lastRefreshedAt'], onFinish: () => { setRefreshedAt(new Date().toISOString()); setRefreshing(false); } });
    };

    useEffect(() => {
        const timer = window.setInterval(refresh, 30000);
        return () => window.clearInterval(timer);
    }, []);
    /*
    |--------------------------------------------------------------------------
    | Close Modal
    |--------------------------------------------------------------------------
    */

    const handleClose = () => {
        router.visit('/admin/elections', {
            preserveScroll: true,
        });
    };

    /*
    |--------------------------------------------------------------------------
    | Format Date & Time
    |--------------------------------------------------------------------------
    */

    const formatDateTime = (date: string | null) => {
        if (!date) {
            return '—';
        }

        const normalizedDate = date.includes('T') ? date : date.replace(' ', 'T');

        const parsedDate = new Date(normalizedDate);

        if (Number.isNaN(parsedDate.getTime())) {
            return '—';
        }

        return parsedDate.toLocaleString('en-US', {
            weekday: 'short',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    /*
    |--------------------------------------------------------------------------
    | Status Style
    |--------------------------------------------------------------------------
    */

    const statusClass = () => {
        switch (election.status) {
            case 'Upcoming':
                return 'bg-blue-50 text-blue-700 ring-blue-200';

            case 'Ongoing':
                return 'bg-green-50 text-green-700 ring-green-200';

            case 'Completed':
                return 'bg-gray-100 text-gray-700 ring-gray-200';

            default:
                return 'bg-gray-100 text-gray-700 ring-gray-200';
        }
    };

    return (
        <AdminLayout>
            <Head title={`View Election - ${election.title}`} />

            <Dialog
                open={true}
                onOpenChange={(open) => {
                    if (!open) {
                        handleClose();
                    }
                }}
            >
                <DialogContent className="max-h-[90vh] w-[95vw] max-w-4xl overflow-y-auto border-0 bg-white p-0 shadow-2xl sm:rounded-2xl">
                    {/* =====================================================
                        MODAL HEADER
                    ===================================================== */}

                    <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-5 sm:px-7">
                        <DialogHeader className="text-left">
                            <div className="flex items-start gap-4 pr-8">
                                {/* Icon */}

                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100 text-[#2D6A4F]">
                                    <Vote className="h-6 w-6" />
                                </div>

                                {/* Title */}

                                <div className="min-w-0">
                                    <DialogTitle className="text-xl font-bold text-gray-900 sm:text-2xl">Election Details</DialogTitle>

                                    <DialogDescription className="mt-1 text-sm text-gray-500">
                                        View the complete information for this election.
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        {/* Custom close button */}

                        <button
                            type="button"
                            onClick={handleClose}
                            aria-label="Close"
                            className="absolute top-5 right-5 rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* =====================================================
                        MODAL BODY
                    ===================================================== */}

                    <div className="space-y-6 px-6 py-6 sm:px-7">
                        <section className="rounded-2xl border border-green-100 bg-gradient-to-br from-white to-green-50 p-5">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div><h3 className="font-bold text-gray-900">Live voting monitor</h3><p className="mt-1 text-xs text-gray-500">Database-backed figures · refreshed {formatDateTime(refreshedAt)}</p></div>
                                <button type="button" onClick={refresh} disabled={refreshing} className="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-white px-3 py-2 text-sm font-semibold text-[#1B4332] hover:bg-green-50 disabled:opacity-60"><RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh</button>
                            </div>
                            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {[['Eligible', eligibleVoterCount], ['Participated', votersWhoVoted], ['Not yet voted', notYetParticipated], ['Turnout', `${turnout}%`]].map(([label, value]) => <div key={label} className="rounded-xl border border-gray-100 bg-white p-3"><p className="text-xs font-medium text-gray-500">{label}</p><p className="mt-1 text-xl font-bold text-[#1B4332]">{value}</p></div>)}
                            </div>
                            <div className="mt-5 space-y-4">
                                {positions.length === 0 ? <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">No candidates or positions are configured for this election.</p> : positions.map(position => <div key={position.name} className="rounded-xl border border-gray-100 bg-white p-4">
                                    <div className="flex items-center justify-between gap-2"><h4 className="font-semibold text-gray-800">{position.name}</h4><span className="text-xs text-gray-500">{position.participating} / {position.eligible} selections</span></div>
                                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-[#40916C] transition-all" style={{ width: `${Math.min(position.progress, 100)}%` }} /></div>
                                    <p className="mt-1 text-right text-xs text-gray-500">{position.progress}% of eligible voters</p>
                                    {resultsVisible && <div className="mt-3 divide-y divide-gray-100">{position.candidates.map(candidate => <div key={candidate.name} className="flex justify-between gap-3 py-2 text-sm"><span className="text-gray-700">{candidate.name}<span className="ml-2 text-xs text-gray-400">{candidate.designation || 'Independent'}</span></span><span className="font-semibold text-gray-900">{candidate.votes} votes</span></div>)}</div>}
                                </div>)}
                            </div>
                            {!resultsVisible && <p className="mt-4 rounded-lg bg-blue-50 p-3 text-xs text-blue-800">Candidate totals are hidden until the scheduled election end time.</p>}
                        </section>
                        {/* =================================================
                            ELECTION INFORMATION
                        ================================================= */}

                        <div className="rounded-2xl border border-gray-200 bg-white">
                            {/* Green top section */}

                            <div className="rounded-t-2xl bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] p-6 text-white">
                                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                                    {/* Election */}

                                    <div className="flex items-start gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10">
                                            <Vote className="h-6 w-6 text-green-100" />
                                        </div>

                                        <div className="min-w-0">
                                            <h2 className="text-xl font-bold break-words sm:text-2xl">{election.title}</h2>

                                            <p className="mt-1 text-sm text-green-100">Election ID: #{election.id}</p>
                                        </div>
                                    </div>

                                    {/* Status */}

                                    <span
                                        className={`inline-flex w-fit shrink-0 rounded-full px-4 py-1.5 text-xs font-bold ring-1 ring-inset ${statusClass()} `}
                                    >
                                        {election.status}
                                    </span>
                                </div>
                            </div>

                            {/* =================================================
                                BASIC INFORMATION
                            ================================================= */}

                            <div className="space-y-6 p-6">
                                {/* Description */}

                                <div>
                                    <div className="mb-3 flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-[#40916C]" />

                                        <h3 className="text-sm font-bold text-gray-900">Description</h3>
                                    </div>

                                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                                        <p className="text-sm leading-6 whitespace-pre-line text-gray-600">
                                            {election.description || 'No description was provided for this election.'}
                                        </p>
                                    </div>
                                </div>

                                {/* =================================================
                                    SCHEDULE
                                ================================================= */}

                                <div>
                                    <div className="mb-4 flex items-center gap-2">
                                        <CalendarDays className="h-5 w-5 text-[#40916C]" />

                                        <h3 className="text-sm font-bold text-gray-900">Election Schedule</h3>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        {/* START */}

                                        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100 text-[#2D6A4F]">
                                                    <Clock className="h-5 w-5" />
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold tracking-wide text-green-700 uppercase">Start Date & Time</p>

                                                    <p className="mt-1 text-sm leading-6 font-semibold text-gray-900">
                                                        {formatDateTime(election.start_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* END */}

                                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                                                    <Clock className="h-5 w-5" />
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold tracking-wide text-gray-500 uppercase">End Date & Time</p>

                                                    <p className="mt-1 text-sm leading-6 font-semibold text-gray-900">
                                                        {formatDateTime(election.end_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* =================================================
                                    AUTOMATIC STATUS
                                ================================================= */}

                                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                                            <CalendarDays className="h-5 w-5" />
                                        </div>

                                        <div>
                                            <p className="text-sm font-bold text-blue-900">Automatic Election Status</p>

                                            <p className="mt-1 text-xs leading-5 text-blue-700">
                                                The election status is automatically determined using the start and end date and time.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* =================================================
                                    RECORD INFORMATION
                                ================================================= */}

                                <div className="grid grid-cols-1 gap-3 border-t border-gray-200 pt-5 sm:grid-cols-2">
                                    <div>
                                        <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Created</p>

                                        <p className="mt-1 text-sm text-gray-600">{formatDateTime(election.created_at)}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Last Updated</p>

                                        <p className="mt-1 text-sm text-gray-600">{formatDateTime(election.updated_at)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* =====================================================
                        MODAL FOOTER
                    ===================================================== */}

                    <div className="sticky bottom-0 border-t border-gray-200 bg-gray-50 px-6 py-4 sm:px-7">
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="inline-flex items-center justify-center rounded-xl bg-[#2D6A4F] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1B4332] focus:ring-2 focus:ring-[#2D6A4F] focus:ring-offset-2 focus:outline-none"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
