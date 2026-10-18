import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

import VoterLayout from '@/layouts/VoterLayout';
import PasswordForm from './PasswordForm';
import ProfileInformationForm from './ProfileInformationForm';

interface UserData {
    id: number;
    name: string;
    username: string;
    email: string;
    role: string;
}

interface Props {
    user: UserData;
}

export default function Profile({ user }: Props) {
    return (
        <VoterLayout>
            <Head title="Profile" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Link
                        href="/voter/dashboard"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-200 bg-white text-emerald-700 transition-colors hover:bg-emerald-50"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-emerald-900">My Profile</h1>
                        <p className="mt-0.5 text-sm text-emerald-600/70">Manage your account information</p>
                    </div>
                </div>

                {/* Profile Information */}
                <ProfileInformationForm user={user} />

                {/* Password */}
                <PasswordForm />
            </div>
        </VoterLayout>
    );
}
