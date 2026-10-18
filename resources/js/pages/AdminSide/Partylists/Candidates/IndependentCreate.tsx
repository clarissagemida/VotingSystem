import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, UserRound } from 'lucide-react';

import AdminLayout from '@/layouts/AdminLayout';
import type { Election, Organization } from '@/lib/candidates';

import IndependentCandidateForm from './IndependentCandidateForm';

interface Props {
    elections: Election[];
    organizations: Organization[];
}

export default function IndependentCreate({ elections, organizations }: Props) {
    return (
        <AdminLayout>
            <Head title="Add Independent Candidate" />

            <div className="mx-auto max-w-3xl space-y-6">
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/independent-candidates"
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1B4332] text-white shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </Link>

                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Add Independent Candidate</h1>

                        <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-500">
                            <UserRound size={13} />
                            Register a candidate without partylist affiliation.
                        </p>
                    </div>
                </div>

                <IndependentCandidateForm mode="create" elections={elections} organizations={organizations} />
            </div>
        </AdminLayout>
    );
}
