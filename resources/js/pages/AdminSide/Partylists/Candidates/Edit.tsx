import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit3 } from 'lucide-react';

import AdminLayout from '@/layouts/AdminLayout';
import type { Candidate, Partylist, Position } from '@/lib/candidates';

import PartylistCandidateForm from './PartylistCandidateForm';

interface Props {
    partylist: Partylist;
    candidate: Candidate;
    positions: Position[];
}

export default function Edit({ partylist, candidate, positions }: Props) {
    return (
        <AdminLayout>
            <Head title={`Edit Candidate - ${partylist.partylist_name}`} />

            <div className="mx-auto max-w-3xl space-y-6">
                <div className="flex items-center gap-3">
                    <Link
                        href={`/admin/partylists/${partylist.id}/candidates`}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1B4332] text-white shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </Link>

                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Edit Candidate</h1>

                        <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-500">
                            <Edit3 size={13} />
                            {candidate.candidate_name}
                        </p>
                    </div>
                </div>

                <PartylistCandidateForm mode="edit" partylist={partylist} candidate={candidate} positions={positions} />
            </div>
        </AdminLayout>
    );
}
