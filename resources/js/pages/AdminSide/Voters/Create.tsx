import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Eye, EyeOff, RefreshCcw, UserPlus } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

import AdminLayout from '@/layouts/AdminLayout';

function generatePassword(length = 10): string {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$';

    let password = '';

    for (let i = 0; i < length; i++) {
        password += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return password;
}

function generateUsername(name: string): string {
    const cleanName = name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .trim()
        .replace(/\s+/g, '');

    if (!cleanName) {
        return 'voter' + Math.floor(1000 + Math.random() * 9000);
    }

    return `${cleanName}${Math.floor(10 + Math.random() * 90)}`;
}

interface Errors {
    name?: string;
    username?: string;
    password?: string;
}

export default function Create() {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState(() => generatePassword());
    const [showPassword, setShowPassword] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Errors>({});

    useEffect(() => {
        setUsername(name.trim() ? generateUsername(name) : '');
    }, [name]);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!name.trim() || !username.trim() || !password.trim() || processing) {
            return;
        }

        setProcessing(true);
        setErrors({});

        router.post(
            '/admin/voters',
            {
                name: name.trim(),
                username: username.trim(),
                password,
            },
            {
                preserveScroll: true,

                onError: (serverErrors) => {
                    setErrors({
                        name: typeof serverErrors.name === 'string' ? serverErrors.name : undefined,
                        username: typeof serverErrors.username === 'string' ? serverErrors.username : undefined,
                        password: typeof serverErrors.password === 'string' ? serverErrors.password : undefined,
                    });
                },

                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <AdminLayout>
            <Head title="Add Voter" />

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
                            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-green-200 bg-green-50">
                                <UserPlus className="h-6 w-6 text-[#2D6A4F]" />
                            </div>

                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Add New Voter</h1>
                                <p className="mt-1 max-w-md text-sm leading-6 text-gray-500">
                                    Credentials are auto-generated. You can regenerate them before saving.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* FORM */}
                    <form onSubmit={submit}>
                        <div className="space-y-7 px-7 py-7">
                            {/* NAME */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-600">
                                    Full Name
                                    <span className="ml-1 text-red-500">*</span>
                                </label>

                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Juan Dela Cruz"
                                    autoFocus
                                    disabled={processing}
                                    className="h-12 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-900 transition outline-none placeholder:text-gray-400 focus:border-[#2D6A4F] focus:ring-2 focus:ring-green-100 disabled:bg-gray-50"
                                />

                                {errors.name && <p className="mt-2 text-xs font-medium text-red-600">{errors.name}</p>}
                            </div>

                            {/* USERNAME */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-600">Username</label>

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        disabled={processing}
                                        className="h-12 flex-1 rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-900 transition outline-none focus:border-[#2D6A4F] focus:ring-2 focus:ring-green-100 disabled:bg-gray-50"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setUsername(generateUsername(name))}
                                        disabled={processing || !name.trim()}
                                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-900 text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                                        title="Generate username"
                                    >
                                        <RefreshCcw className="h-5 w-5" />
                                    </button>
                                </div>

                                {errors.username ? (
                                    <p className="mt-2 text-xs font-medium text-red-600">{errors.username}</p>
                                ) : (
                                    <p className="mt-2 text-xs text-gray-400">
                                        Auto-generated from the full name. Voters log in using this username.
                                    </p>
                                )}
                            </div>

                            {/* PASSWORD */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-600">Auto-Generated Password</label>

                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            readOnly
                                            className="h-12 w-full rounded-lg border border-gray-300 bg-white px-4 pr-12 font-mono text-sm text-gray-900 outline-none"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((v) => !v)}
                                            disabled={processing}
                                            className="absolute top-1/2 right-2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setPassword(generatePassword())}
                                        disabled={processing}
                                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-900 text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                                        title="Generate password"
                                    >
                                        <RefreshCcw className="h-5 w-5" />
                                    </button>
                                </div>

                                {errors.password ? (
                                    <p className="mt-2 text-xs font-medium text-red-600">{errors.password}</p>
                                ) : (
                                    <p className="mt-2 text-xs text-gray-400">
                                        This exact password will be saved securely and displayed to the admin after creation.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* FOOTER */}
                        <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-7 py-5">
                            <button
                                type="button"
                                onClick={() => router.visit('/admin/voters')}
                                disabled={processing}
                                className="h-11 rounded-lg px-5 text-sm font-semibold text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={!name.trim() || !username.trim() || !password.trim() || processing}
                                className="h-11 rounded-lg bg-[#2D6A4F] px-6 text-sm font-semibold text-white shadow-md transition hover:bg-[#1B4332] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {processing ? 'Creating...' : 'Create Voter'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
