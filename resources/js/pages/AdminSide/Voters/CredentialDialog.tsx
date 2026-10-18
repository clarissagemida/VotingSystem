import { Check, Copy, Eye, EyeOff, KeyRound, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CredentialDialogProps {
    open: boolean;
    name?: string;
    username: string;
    password: string;
    onClose: () => void;
}

export default function CredentialDialog({ open, name, username, password, onClose }: CredentialDialogProps) {
    const [showPassword, setShowPassword] = useState(true);
    const [copiedUsername, setCopiedUsername] = useState(false);
    const [copiedPassword, setCopiedPassword] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | Reset State When Dialog Opens
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (!open) {
            return;
        }

        setShowPassword(true);
        setCopiedUsername(false);
        setCopiedPassword(false);
    }, [open, username, password]);

    /*
    |--------------------------------------------------------------------------
    | Escape Key
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (!open) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [open, onClose]);

    /*
    |--------------------------------------------------------------------------
    | Copy Username
    |--------------------------------------------------------------------------
    */

    const copyUsername = async () => {
        try {
            await navigator.clipboard.writeText(username);

            setCopiedUsername(true);

            setTimeout(() => {
                setCopiedUsername(false);
            }, 1500);
        } catch {
            setCopiedUsername(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Copy Password
    |--------------------------------------------------------------------------
    */

    const copyPassword = async () => {
        try {
            await navigator.clipboard.writeText(password);

            setCopiedPassword(true);

            setTimeout(() => {
                setCopiedPassword(false);
            }, 1500);
        } catch {
            setCopiedPassword(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Do Not Render
    |--------------------------------------------------------------------------
    */

    if (!open) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="credential-dialog-title"
        >
            <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                {/* HEADER */}

                <div className="relative overflow-hidden bg-gradient-to-br from-[#1B4332] via-[#2D6A4F] to-[#40916C] px-7 py-6 text-white">
                    {/* Decorative circles */}

                    <div className="absolute -top-16 -right-12 h-44 w-44 rounded-full bg-white/10" />

                    <div className="absolute -bottom-20 left-32 h-40 w-40 rounded-full bg-white/10" />

                    {/* CLOSE BUTTON */}

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close credentials"
                        className="absolute top-5 right-5 z-10 flex h-9 w-9 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/15 hover:text-white focus:ring-2 focus:ring-white/50 focus:outline-none"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    <div className="relative flex items-center gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm">
                            <KeyRound className="h-7 w-7" />
                        </div>

                        <div className="pr-10">
                            <h2 id="credential-dialog-title" className="text-xl font-bold">
                                Voter Credentials
                            </h2>

                            <p className="mt-1 text-sm leading-5 text-green-50">
                                {name ? `Share these credentials with ${name}.` : 'Share these credentials with the voter.'}
                            </p>

                            <p className="text-sm text-green-100">The password is shown only once.</p>
                        </div>
                    </div>
                </div>

                {/* CONTENT */}

                <div className="space-y-4 bg-[#fafafa] p-7">
                    {/* USERNAME */}

                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-xs font-bold tracking-wider text-gray-400 uppercase">Username</span>

                            <button
                                type="button"
                                onClick={copyUsername}
                                aria-label="Copy username"
                                className="rounded-lg p-2 text-gray-500 transition hover:bg-green-50 hover:text-green-700"
                                title="Copy username"
                            >
                                {copiedUsername ? <Check className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5" />}
                            </button>
                        </div>

                        <p className="font-mono text-lg font-bold break-all text-gray-900">{username}</p>
                    </div>

                    {/* PASSWORD */}

                    <div className="rounded-xl border border-green-200 bg-green-50 p-5 shadow-sm">
                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-xs font-bold tracking-wider text-green-600 uppercase">Password</span>

                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((value) => !value)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    className="rounded-lg p-2 text-green-700 transition hover:bg-green-100"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>

                                <button
                                    type="button"
                                    onClick={copyPassword}
                                    aria-label="Copy password"
                                    className="rounded-lg p-2 text-green-700 transition hover:bg-green-100"
                                    title="Copy password"
                                >
                                    {copiedPassword ? <Check className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <p className="font-mono text-lg font-bold tracking-wide break-all text-gray-900">
                            {showPassword ? password : '••••••••••••'}
                        </p>
                    </div>

                    {/* WARNING */}

                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                        <p className="text-xs leading-5 text-amber-800">
                            <strong>Important:</strong> Save or copy these credentials now. The password is securely hashed in the database and cannot
                            be retrieved later.
                        </p>
                    </div>
                </div>

                {/* FOOTER */}

                <div className="border-t border-gray-200 bg-white p-5">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-11 w-full items-center justify-center rounded-lg bg-[#2D6A4F] text-sm font-semibold text-white shadow-sm transition hover:bg-[#1B4332] focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
