import { Head, router, usePage } from '@inertiajs/react';
import { Edit3, KeyRound, Plus, Search, ShieldCheck, Trash2, UserCheck, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';

import AdminLayout from '@/layouts/AdminLayout';

import CreateVoterModal from './CreateModal';
import CredentialDialog from './CredentialDialog';
import DeleteVoterModal from './DeleteModal';
import EditVoterModal from './EditModal';

interface Voter {
    id: number;
    name: string;
    username: string | null;
    created_at?: string | null;
}

interface Credentials {
    name?: string;
    username: string;
    password: string;
}

interface FlashData {
    voterCreated?: Credentials;
    passwordReset?: Credentials;
    voterUpdated?: string;
    voterDeleted?: string;
}

interface VotersPageProps {
    voters?: Voter[];
    flash?: FlashData;
}

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export default function Index() {
    const { props } = usePage();

    const pageProps = props as unknown as VotersPageProps;

    const voters = useMemo(() => pageProps.voters ?? [], [pageProps.voters]);

    const flash = pageProps.flash;

    /*
    |--------------------------------------------------------------------------
    | STATES
    |--------------------------------------------------------------------------
    */

    const [search, setSearch] = useState('');

    const [deleteOpen, setDeleteOpen] = useState(false);

    const [credentialOpen, setCredentialOpen] = useState(false);

    const [createOpen, setCreateOpen] = useState(false);

    const [editOpen, setEditOpen] = useState(false);

    const [selectedVoter, setSelectedVoter] = useState<Voter | null>(null);

    const [credentials, setCredentials] = useState<Credentials | null>(null);

    /*
    |--------------------------------------------------------------------------
    | CREATED CREDENTIALS
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (!flash?.voterCreated) {
            return;
        }

        setCredentials({
            name: flash.voterCreated.name,
            username: flash.voterCreated.username,
            password: flash.voterCreated.password,
        });

        setCredentialOpen(true);
    }, [flash?.voterCreated]);

    /*
    |--------------------------------------------------------------------------
    | RESET PASSWORD CREDENTIALS
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (!flash?.passwordReset) {
            return;
        }

        setCredentials({
            name: flash.passwordReset.name,
            username: flash.passwordReset.username,
            password: flash.passwordReset.password,
        });

        setCredentialOpen(true);
    }, [flash?.passwordReset]);

    /*
    |--------------------------------------------------------------------------
    | UPDATED
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (!flash?.voterUpdated) {
            return;
        }

        Swal.fire({
            icon: 'success',
            title: 'Voter Updated',
            text: `${flash.voterUpdated} has been updated successfully.`,
            confirmButtonColor: '#2D6A4F',
            confirmButtonText: 'OK',
            allowOutsideClick: false,
        });
    }, [flash?.voterUpdated]);

    /*
    |--------------------------------------------------------------------------
    | DELETED
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (!flash?.voterDeleted) {
            return;
        }

        Swal.fire({
            icon: 'success',
            title: 'Voter Deleted',
            text: `${flash.voterDeleted} has been removed successfully.`,
            confirmButtonColor: '#2D6A4F',
            confirmButtonText: 'OK',
            allowOutsideClick: false,
        });
    }, [flash?.voterDeleted]);

    /*
    |--------------------------------------------------------------------------
    | SEARCH
    |--------------------------------------------------------------------------
    */

    const filteredVoters = useMemo(() => {
        const searchValue = search.trim().toLowerCase();

        if (!searchValue) {
            return voters;
        }

        return voters.filter((voter) => {
            const name = voter.name?.toLowerCase() ?? '';
            const username = voter.username?.toLowerCase() ?? '';

            return name.includes(searchValue) || username.includes(searchValue);
        });
    }, [voters, search]);

    /*
    |--------------------------------------------------------------------------
    | COUNTS
    |--------------------------------------------------------------------------
    */

    const totalVoters = voters.length;

    const votersWithUsername = voters.filter((voter) => voter.username).length;

    const votersWithoutUsername = voters.filter((voter) => !voter.username).length;

    /*
    |--------------------------------------------------------------------------
    | MODALS
    |--------------------------------------------------------------------------
    */

    const openDelete = (voter: Voter) => {
        setSelectedVoter(voter);
        setDeleteOpen(true);
    };

    const closeDelete = () => {
        setDeleteOpen(false);
        setSelectedVoter(null);
    };

    const openEdit = (voter: Voter) => {
        setSelectedVoter(voter);
        setEditOpen(true);
    };

    const closeEdit = () => {
        setEditOpen(false);
        setSelectedVoter(null);
    };

    const openCreate = () => {
        setCreateOpen(true);
    };

    const closeCreate = () => {
        setCreateOpen(false);
    };

    /*
    |--------------------------------------------------------------------------
    | RESET PASSWORD
    |--------------------------------------------------------------------------
    */

    const resetPassword = (voter: Voter) => {
        Swal.fire({
            icon: 'warning',
            title: 'Reset Password?',
            html: `
                <div style="
                    text-align:center;
                    font-size:15px;
                    line-height:1.6;
                    color:#4b5563;
                ">
                    <p style="margin-bottom:8px;">
                        A new password will be generated for:
                    </p>

                    <strong style="
                        color:#1f2937;
                        font-size:17px;
                    ">
                        ${escapeHtml(voter.name)}
                    </strong>

                    <p style="
                        margin-top:12px;
                        font-size:13px;
                        color:#6b7280;
                    ">
                        The new credentials will be displayed after
                        the password has been reset.
                    </p>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Yes, Reset Password',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#2D6A4F',
            cancelButtonColor: '#6b7280',
            reverseButtons: true,
            allowOutsideClick: false,
            focusCancel: true,
        }).then((result) => {
            if (!result.isConfirmed) {
                return;
            }

            router.post(
                route('admin.voters.reset-password', voter.id),
                {},
                {
                    preserveScroll: true,
                },
            );
        });
    };

    /*
    |--------------------------------------------------------------------------
    | CLOSE CREDENTIALS
    |--------------------------------------------------------------------------
    */

    const closeCredentials = () => {
        setCredentialOpen(false);
        setCredentials(null);
    };

    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (
        <AdminLayout>
            <Head title="Voter Management" />

            <div className="space-y-6">
                {/* ==========================================================
                    PAGE HEADER
                ========================================================== */}

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <Users className="h-6 w-6 text-[#2D6A4F]" />

                            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Voter Management</h1>
                        </div>

                        <p className="mt-1 text-sm text-gray-500">Create and manage voter accounts and securely manage voter credentials.</p>
                    </div>

                    <button
                        type="button"
                        onClick={openCreate}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2D6A4F] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1B4332] focus:ring-4 focus:ring-[#2D6A4F]/20 focus:outline-none"
                    >
                        <Plus className="h-5 w-5" />
                        Add Voter
                    </button>
                </div>

                {/* ==========================================================
                    SUMMARY CARDS
                ========================================================== */}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {/* TOTAL */}

                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100 text-[#2D6A4F]">
                                <Users className="h-6 w-6" />
                            </div>

                            <div>
                                <p className="text-2xl font-bold text-gray-900">{totalVoters}</p>

                                <p className="text-sm text-gray-500">Total Voters</p>
                            </div>
                        </div>
                    </div>

                    {/* ACTIVE USERNAMES */}

                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                                <UserCheck className="h-6 w-6" />
                            </div>

                            <div>
                                <p className="text-2xl font-bold text-gray-900">{votersWithUsername}</p>

                                <p className="text-sm text-gray-500">Accounts With Username</p>
                            </div>
                        </div>
                    </div>

                    {/* WITHOUT USERNAME */}

                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                                <ShieldCheck className="h-6 w-6" />
                            </div>

                            <div>
                                <p className="text-2xl font-bold text-gray-900">{votersWithoutUsername}</p>

                                <p className="text-sm text-gray-500">Missing Username</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ==========================================================
                    SEARCH CARD
                ========================================================== */}

                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 p-4 sm:p-5">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h2 className="text-base font-bold text-gray-900">Voter List</h2>

                                <p className="mt-0.5 text-xs text-gray-500">{filteredVoters.length} voter(s) displayed</p>
                            </div>

                            <div className="relative w-full lg:w-96">
                                <Search className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search by name or username..."
                                    className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pr-4 pl-10 text-sm text-gray-900 transition outline-none placeholder:text-gray-400 focus:border-[#40916C] focus:ring-2 focus:ring-green-100"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ==========================================================
                    VOTER TABLE
                ========================================================== */}

                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-2 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-base font-bold text-gray-900">Registered Voters</h2>

                            <p className="mt-0.5 text-xs text-gray-500">Manage voter accounts and credentials.</p>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <ShieldCheck size={15} className="text-[#2D6A4F]" />
                            Secure voter account management
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    <th className="w-16 px-5 py-4 text-left text-xs font-bold tracking-wider text-gray-500 uppercase">#</th>

                                    <th className="min-w-[180px] px-5 py-4 text-left text-xs font-bold tracking-wider text-gray-500 uppercase">
                                        Username
                                    </th>

                                    <th className="min-w-[250px] px-5 py-4 text-left text-xs font-bold tracking-wider text-gray-500 uppercase">
                                        Voter
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-bold tracking-wider text-gray-500 uppercase">Created</th>

                                    <th className="px-5 py-4 text-right text-xs font-bold tracking-wider text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {filteredVoters.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-16">
                                            <div className="flex flex-col items-center justify-center text-center">
                                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                                                    <Users size={30} />
                                                </div>

                                                <h3 className="mt-4 text-base font-bold text-gray-900">No voters found</h3>

                                                <p className="mt-1 max-w-sm text-sm text-gray-500">
                                                    {search.trim()
                                                        ? 'Try searching with a different name or username.'
                                                        : 'No voter accounts have been registered yet.'}
                                                </p>

                                                {search.trim() && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setSearch('')}
                                                        className="mt-4 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                                                    >
                                                        Clear Search
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredVoters.map((voter, index) => (
                                        <tr key={voter.id} className="transition hover:bg-green-50/40">
                                            {/* NUMBER */}

                                            <td className="px-5 py-5 text-sm font-medium text-gray-400">{index + 1}</td>

                                            {/* USERNAME */}

                                            <td className="px-5 py-5">
                                                <div className="inline-flex items-center rounded-lg bg-gray-50 px-3 py-2">
                                                    <span className="font-mono text-sm font-semibold text-gray-800">{voter.username ?? '—'}</span>
                                                </div>
                                            </td>

                                            {/* VOTER */}

                                            <td className="px-5 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100 font-bold text-[#2D6A4F]">
                                                        {voter.name?.charAt(0).toUpperCase() ?? 'V'}
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="truncate font-bold text-gray-900">{voter.name}</p>

                                                        <p className="mt-0.5 text-xs text-gray-500">Voter ID #{voter.id}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* CREATED */}

                                            <td className="px-5 py-5 text-sm text-gray-500">{formatDate(voter.created_at)}</td>

                                            {/* ACTIONS */}

                                            <td className="px-5 py-5">
                                                <div className="flex justify-end gap-1">
                                                    {/* RESET */}

                                                    <button
                                                        type="button"
                                                        onClick={() => resetPassword(voter)}
                                                        title="Reset password"
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-green-50 hover:text-[#2D6A4F]"
                                                    >
                                                        <KeyRound size={17} />
                                                    </button>

                                                    {/* EDIT */}

                                                    <button
                                                        type="button"
                                                        onClick={() => openEdit(voter)}
                                                        title="Edit voter"
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-blue-50 hover:text-blue-600"
                                                    >
                                                        <Edit3 size={17} />
                                                    </button>

                                                    {/* DELETE */}

                                                    <button
                                                        type="button"
                                                        onClick={() => openDelete(voter)}
                                                        title="Delete voter"
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

            {/* ==========================================================
                MODALS
            ========================================================== */}

            <CreateVoterModal open={createOpen} onClose={closeCreate} />

            <EditVoterModal open={editOpen} voter={selectedVoter} onClose={closeEdit} />

            <DeleteVoterModal open={deleteOpen} voter={selectedVoter} onClose={closeDelete} />

            <CredentialDialog
                open={credentialOpen}
                name={credentials?.name}
                username={credentials?.username ?? ''}
                password={credentials?.password ?? ''}
                onClose={closeCredentials}
            />
        </AdminLayout>
    );
}

/*
|--------------------------------------------------------------------------
| FORMAT DATE
|--------------------------------------------------------------------------
*/

function formatDate(date?: string | null): string {
    if (!date) {
        return '—';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return '—';
    }

    return parsedDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

/*
|--------------------------------------------------------------------------
| ESCAPE HTML
|--------------------------------------------------------------------------
*/

function escapeHtml(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
