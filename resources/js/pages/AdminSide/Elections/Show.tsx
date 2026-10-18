import { Head, router } from '@inertiajs/react';
import { CalendarDays, Clock, FileText, Vote, X } from 'lucide-react';

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
}

export default function Show({ election }: Props) {
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
                <DialogContent className="max-h-[90vh] w-[95vw] max-w-3xl overflow-y-auto border-0 bg-white p-0 shadow-2xl sm:rounded-2xl">
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
