import { Head, Link, router } from '@inertiajs/react';
import { CalendarDays, CheckCircle2, Clock, Edit3, Eye, FileText, Plus, Search, Trash2, Vote } from 'lucide-react';
import { useMemo, useState } from 'react';
import Swal from 'sweetalert2';

import AdminLayout from '@/layouts/AdminLayout';
import { confirmDelete } from '@/lib/confirm';

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

interface Election {
    id: number;
    title: string;
    description: string | null;
    start_at: string;
    end_at: string;
    status: 'Upcoming' | 'Ongoing' | 'Completed';
    created_at: string | null;
    updated_at: string | null;
}

interface Props {
    elections: Election[];
}

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function formatDateTime(date: string | null): string {
    if (!date) {
        return '—';
    }

    return new Date(date.replace(' ', 'T')).toLocaleString('en-US', {
        weekday: 'short',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

function statusClass(status: Election['status']): string {
    switch (status) {
        case 'Upcoming':
            return 'bg-blue-50 text-blue-700 ring-blue-200';

        case 'Ongoing':
            return 'bg-green-50 text-green-700 ring-green-200';

        case 'Completed':
            return 'bg-gray-100 text-gray-700 ring-gray-200';

        default:
            return 'bg-gray-100 text-gray-700 ring-gray-200';
    }
}

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export default function Index({ elections }: Props) {
    const [search, setSearch] = useState('');

    const filteredElections = useMemo(() => {
        const keyword = search.toLowerCase().trim();

        if (!keyword) {
            return elections;
        }

        return elections.filter(
            (election) =>
                election.title.toLowerCase().includes(keyword) ||
                election.description?.toLowerCase().includes(keyword) ||
                election.status.toLowerCase().includes(keyword),
        );
    }, [elections, search]);

    const totalElections = elections.length;
    const ongoingCount = elections.filter((e) => e.status === 'Ongoing').length;
    const upcomingCount = elections.filter((e) => e.status === 'Upcoming').length;
    const completedCount = elections.filter((e) => e.status === 'Completed').length;

    const handleDelete = async (election: Election) => {
        const confirmed = await confirmDelete({
            title: 'Delete Election?',
            itemName: election.title,
        });

        if (!confirmed) {
            return;
        }

        router.delete(`/admin/elections/${election.id}`, {
            preserveScroll: true,

            onSuccess: () => {
                Swal.fire({
                    title: 'Deleted!',
                    text: 'Election has been deleted successfully.',
                    icon: 'success',
                    confirmButtonColor: '#2D6A4F',
                });
            },

            onError: () => {
                Swal.fire({
                    title: 'Error',
                    text: 'Unable to delete the election.',
                    icon: 'error',
                    confirmButtonColor: '#2D6A4F',
                });
            },
        });
    };

    return (
        <AdminLayout>
            <Head title="Election Management" />

            <div className="space-y-6">
                {/* PAGE HEADER */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <Vote className="h-6 w-6 text-[#2D6A4F]" />
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Elections</h1>
                        </div>

                        <p className="mt-1 text-sm text-gray-500">Create and manage voting elections and their schedules.</p>
                    </div>

                    <Link
                        href="/admin/elections/create"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2D6A4F] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1B4332] focus:ring-4 focus:ring-[#2D6A4F]/20 focus:outline-none"
                    >
                        <Plus className="h-5 w-5" />
                        Add Election
                    </Link>
                </div>

                {/* SUMMARY CARDS */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard icon={CalendarDays} label="Total Elections" value={totalElections} />
                    <SummaryCard icon={Clock} label="Ongoing Elections" value={ongoingCount} />
                    <SummaryCard icon={FileText} label="Upcoming Elections" value={upcomingCount} />
                    <SummaryCard icon={CheckCircle2} label="Completed Elections" value={completedCount} />
                </div>

                {/* SEARCH */}
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 p-4 sm:p-5">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div className="relative flex-1">
                                <Search className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search elections..."
                                    className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pr-4 pl-10 text-sm text-gray-900 transition outline-none placeholder:text-gray-400 focus:border-[#40916C] focus:ring-2 focus:ring-green-100"
                                />
                            </div>

                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <CheckCircle2 size={15} className="text-[#2D6A4F]" />
                                Election status is automatically managed
                            </div>
                        </div>
                    </div>
                </div>

                {/* ELECTION TABLE */}
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-2 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-base font-bold text-gray-900">Election List</h2>
                            <p className="mt-0.5 text-xs text-gray-500">{filteredElections.length} election(s) displayed</p>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <CalendarDays size={15} className="text-[#2D6A4F]" />
                            Elections are scheduled automatically
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-[1050px]">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    <th className="w-16 px-5 py-4 text-left text-xs font-bold tracking-wider text-gray-500 uppercase">#</th>
                                    <th className="min-w-[300px] px-5 py-4 text-left text-xs font-bold tracking-wider text-gray-500 uppercase">
                                        Election
                                    </th>
                                    <th className="min-w-[220px] px-5 py-4 text-left text-xs font-bold tracking-wider text-gray-500 uppercase">
                                        Start
                                    </th>
                                    <th className="min-w-[220px] px-5 py-4 text-left text-xs font-bold tracking-wider text-gray-500 uppercase">
                                        End
                                    </th>
                                    <th className="px-5 py-4 text-left text-xs font-bold tracking-wider text-gray-500 uppercase">Status</th>
                                    <th className="px-5 py-4 text-right text-xs font-bold tracking-wider text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {filteredElections.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-16">
                                            <div className="flex flex-col items-center justify-center text-center">
                                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                                                    <Vote size={30} />
                                                </div>

                                                <h3 className="mt-4 text-base font-bold text-gray-900">No elections found</h3>

                                                <p className="mt-1 max-w-sm text-sm text-gray-500">
                                                    {search ? 'Try changing your search keywords.' : 'Create your first election to get started.'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredElections.map((election, index) => (
                                        <tr key={election.id} className="transition hover:bg-green-50/40">
                                            <td className="px-5 py-5 text-sm font-medium text-gray-400">{index + 1}</td>

                                            <td className="px-5 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100 text-[#2D6A4F]">
                                                        <Vote size={21} />
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="truncate font-bold text-gray-900">{election.title}</p>
                                                        <p className="mt-0.5 max-w-[320px] truncate text-xs text-gray-500">
                                                            {election.description || 'No description provided.'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-5">
                                                <div className="flex items-start gap-2">
                                                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-50 text-[#2D6A4F]">
                                                        <CalendarDays size={15} />
                                                    </div>

                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-800">{formatDateTime(election.start_at)}</p>
                                                        <p className="mt-0.5 text-[11px] text-gray-400">Election start</p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-5">
                                                <div className="flex items-start gap-2">
                                                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                                                        <Clock size={15} />
                                                    </div>

                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-800">{formatDateTime(election.end_at)}</p>
                                                        <p className="mt-0.5 text-[11px] text-gray-400">Election end</p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-5">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold ring-1 ring-inset ${statusClass(
                                                        election.status,
                                                    )}`}
                                                >
                                                    {election.status}
                                                </span>
                                            </td>

                                            <td className="px-5 py-5">
                                                <div className="flex justify-end gap-1">
                                                    <Link
                                                        href={`/admin/elections/${election.id}`}
                                                        title="View election"
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-green-50 hover:text-[#2D6A4F]"
                                                    >
                                                        <Eye size={17} />
                                                    </Link>

                                                    <Link
                                                        href={`/admin/elections/${election.id}/edit`}
                                                        title="Edit election"
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-blue-50 hover:text-blue-600"
                                                    >
                                                        <Edit3 size={17} />
                                                    </Link>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(election)}
                                                        title="Delete election"
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                                                    >
                                                        <Trash2 size={17} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

/*
|--------------------------------------------------------------------------
| SUMMARY CARD
|--------------------------------------------------------------------------
*/

interface SummaryCardProps {
    icon: typeof CalendarDays;
    label: string;
    value: number;
}

function SummaryCard({ icon: Icon, label, value }: SummaryCardProps) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100 text-[#2D6A4F]">
                    <Icon className="h-6 w-6" />
                </div>

                <div>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    <p className="text-sm text-gray-500">{label}</p>
                </div>
            </div>
        </div>
    );
}
