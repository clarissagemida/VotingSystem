import { Head, router } from '@inertiajs/react';
import { ArrowLeft, AtSign, CheckCircle2, UserCog, UserRound } from 'lucide-react';
import { FormEvent, useState } from 'react';

import AdminLayout from '@/layouts/AdminLayout';

interface Voter {
    id: number;
    name: string;
    username: string | null;
}

interface Props {
    voter: Voter;
}

interface ValidationErrors {
    name?: string;
    username?: string;
}

export default function Edit({ voter }: Props) {
    const [name, setName] = useState(voter.name ?? '');
    const [username, setUsername] = useState(voter.username ?? '');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<ValidationErrors>({});

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (processing) {
            return;
        }

        const trimmedName = name.trim();
        const trimmedUsername = username.trim();

        const clientErrors: ValidationErrors = {};

        if (!trimmedName) {
            clientErrors.name = 'Full name is required.';
        }

        if (!trimmedUsername) {
            clientErrors.username = 'Username is required.';
        } else if (!/^[a-zA-Z0-9_-]+$/.test(trimmedUsername)) {
            clientErrors.username = 'Username may only contain letters, numbers, underscores, and hyphens.';
        }

        if (Object.keys(clientErrors).length > 0) {
            setErrors(clientErrors);
            return;
        }

        setErrors({});
        setProcessing(true);

        router.patch(
            `/admin/voters/${voter.id}`,
            {
                name: trimmedName,
                username: trimmedUsername,
            },
            {
                preserveScroll: true,

                onError: (serverErrors) => {
                    setErrors({
                        name: typeof serverErrors.name === 'string' ? serverErrors.name : undefined,
                        username: typeof serverErrors.username === 'string' ? serverErrors.username : undefined,
                    });
                },

                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <AdminLayout>
            <Head title="Edit Voter" />

            <div className="mx-auto max-w-2xl space-y-6">
                <button
                    type="button"
                    onClick={() => router.visit('/admin/voters')}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-gray-800"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Voters
                </button>

                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    {/* HEADER */}
                    <div className="border-b border-gray-100 px-7 py-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-[#2D6A4F]">
                                <UserCog className="h-6 w-6" />
                            </div>

                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Edit Voter Account</h1>
                                <p className="mt-1 text-sm text-gray-500">Update the voter's name and login username.</p>
                            </div>
                        </div>
                    </div>

                    {/* FORM */}
                    <form onSubmit={submit}>
                        <div className="space-y-6 px-7 py-7">
                            <div className="rounded-xl border border-green-100 bg-green-50/60 p-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#2D6A4F] shadow-sm">
                                        <CheckCircle2 className="h-5 w-5" />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-800">Voter Account Information</p>
                                        <p className="mt-1 text-xs leading-5 text-gray-500">
                                            You can update the voter's full name and username. The password remains unchanged and can be regenerated
                                            using the Reset Password action.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* NAME */}
                            <div>
                                <label htmlFor="edit-voter-name" className="mb-2 block text-sm font-semibold text-gray-700">
                                    Full Name
                                    <span className="ml-1 text-red-500">*</span>
                                </label>

                                <div className="relative">
                                    <UserRound className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />

                                    <input
                                        id="edit-voter-name"
                                        type="text"
                                        value={name}
                                        onChange={(event) => {
                                            setName(event.target.value);
                                            if (errors.name) {
                                                setErrors((prev) => ({
                                                    ...prev,
                                                    name: undefined,
                                                }));
                                            }
                                        }}
                                        autoFocus
                                        disabled={processing}
                                        placeholder="Enter voter's full name"
                                        className={`h-12 w-full rounded-xl border bg-white pr-4 pl-11 text-sm text-gray-900 transition outline-none placeholder:text-gray-400 disabled:bg-gray-50 ${
                                            errors.name
                                                ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                                                : 'border-gray-300 focus:border-[#40916C] focus:ring-2 focus:ring-green-100'
                                        }`}
                                    />
                                </div>

                                {errors.name && <p className="mt-2 text-xs font-medium text-red-600">{errors.name}</p>}
                            </div>

                            {/* USERNAME */}
                            <div>
                                <label htmlFor="edit-voter-username" className="mb-2 block text-sm font-semibold text-gray-700">
                                    Username
                                    <span className="ml-1 text-red-500">*</span>
                                </label>

                                <div className="relative">
                                    <AtSign className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />

                                    <input
                                        id="edit-voter-username"
                                        type="text"
                                        value={username}
                                        onChange={(event) => {
                                            setUsername(event.target.value);
                                            if (errors.username) {
                                                setErrors((prev) => ({
                                                    ...prev,
                                                    username: undefined,
                                                }));
                                            }
                                        }}
                                        disabled={processing}
                                        placeholder="Enter voter username"
                                        className={`h-12 w-full rounded-xl border bg-white pr-4 pl-11 font-mono text-sm text-gray-900 transition outline-none placeholder:font-sans placeholder:text-gray-400 disabled:bg-gray-50 ${
                                            errors.username
                                                ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                                                : 'border-gray-300 focus:border-[#40916C] focus:ring-2 focus:ring-green-100'
                                        }`}
                                    />
                                </div>

                                {errors.username ? (
                                    <p className="mt-2 text-xs font-medium text-red-600">{errors.username}</p>
                                ) : (
                                    <p className="mt-2 text-xs text-gray-400">This username is used by the voter when logging in.</p>
                                )}
                            </div>
                        </div>

                        {/* FOOTER */}
                        <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/70 px-7 py-4">
                            <button
                                type="button"
                                onClick={() => router.visit('/admin/voters')}
                                disabled={processing}
                                className="h-11 rounded-xl border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={processing || !name.trim() || !username.trim()}
                                className="inline-flex h-11 items-center justify-center rounded-xl bg-[#2D6A4F] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1B4332] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {processing ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
