import { Head, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

import AdminLayout from '@/layouts/AdminLayout';
import type { Election, Organization } from '@/lib/partylists';

import PartylistForm from './PartylistForm';

interface Props {
    elections: Election[];
    organizations: Organization[];
}

export default function Create({ elections, organizations }: Props) {
    return (
        <AdminLayout>
            <Head title="Add Partylist" />

            <div className="mx-auto max-w-2xl space-y-6">
                <button
                    type="button"
                    onClick={() => router.visit('/admin/partylists')}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-gray-800"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Partylists
                </button>

                <PartylistForm mode="create" elections={elections} organizations={organizations} />
            </div>
        </AdminLayout>
    );
}
