import { useForm } from '@inertiajs/react';
import { CheckCircle2, Eye, EyeOff, KeyRound } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Transition } from '@headlessui/react';
import Swal from 'sweetalert2';

export default function PasswordForm() {
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, put, errors, processing, recentlySuccessful, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();

        const confirmation = await Swal.fire({
            title: 'Change your password?',
            html: `Once you change it, you will need to use your new password on your next login.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, change password',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#2D6A4F',
            cancelButtonColor: '#6b7280',
        });

        if (!confirmation.isConfirmed) return;

        put(route('voter.password.update'), {
            onFinish: () => reset(),
            onSuccess: () => {
                setShowPasswordForm(false);

                Swal.fire({
                    title: 'Password Changed',
                    text: 'Your password has been updated successfully. Please use your new password next time you sign in.',
                    icon: 'success',
                    confirmButtonColor: '#2D6A4F',
                });
            },
        });
    };

    return (
        <div className="rounded-2xl border border-emerald-100 bg-white shadow-sm">
            <button
                type="button"
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-emerald-50/50"
            >
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                        <KeyRound className="h-4 w-4 text-amber-700" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-emerald-900">Update Password</h2>
                        <p className="text-xs text-emerald-600/60">Ensure your account stays secure</p>
                    </div>
                </div>
                <svg
                    className={`h-5 w-5 text-emerald-400 transition-transform ${showPasswordForm ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {showPasswordForm && (
                <form onSubmit={submit} className="space-y-5 border-t border-emerald-100 p-6">
                    {/* Current Password */}
                    <div className="space-y-1.5">
                        <Label htmlFor="current_password" className="text-sm font-medium text-emerald-800">
                            Current Password
                        </Label>
                        <div className="relative">
                            <Input
                                id="current_password"
                                type={showCurrentPassword ? 'text' : 'password'}
                                className="block w-full rounded-xl border-emerald-200 bg-emerald-50/50 pr-10 text-sm text-emerald-900 shadow-sm transition-colors focus:border-emerald-500 focus:bg-white focus:ring-emerald-500/20"
                                value={data.current_password}
                                onChange={(e) => setData('current_password', e.target.value)}
                                autoComplete="current-password"
                                placeholder="Enter current password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-emerald-400 transition-colors hover:text-emerald-600 focus:outline-none"
                                tabIndex={-1}
                                aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                            >
                                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        <InputError className="mt-1" message={errors.current_password} />
                    </div>

                    {/* New Password */}
                    <div className="space-y-1.5">
                        <Label htmlFor="password" className="text-sm font-medium text-emerald-800">
                            New Password
                        </Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showNewPassword ? 'text' : 'password'}
                                className="block w-full rounded-xl border-emerald-200 bg-emerald-50/50 pr-10 text-sm text-emerald-900 shadow-sm transition-colors focus:border-emerald-500 focus:bg-white focus:ring-emerald-500/20"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                autoComplete="new-password"
                                placeholder="Enter new password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-emerald-400 transition-colors hover:text-emerald-600 focus:outline-none"
                                tabIndex={-1}
                                aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                            >
                                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        <InputError className="mt-1" message={errors.password} />
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1.5">
                        <Label htmlFor="password_confirmation" className="text-sm font-medium text-emerald-800">
                            Confirm Password
                        </Label>
                        <div className="relative">
                            <Input
                                id="password_confirmation"
                                type={showConfirmPassword ? 'text' : 'password'}
                                className="block w-full rounded-xl border-emerald-200 bg-emerald-50/50 pr-10 text-sm text-emerald-900 shadow-sm transition-colors focus:border-emerald-500 focus:bg-white focus:ring-emerald-500/20"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                autoComplete="new-password"
                                placeholder="Confirm new password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-emerald-400 transition-colors hover:text-emerald-600 focus:outline-none"
                                tabIndex={-1}
                                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                            >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        <InputError className="mt-1" message={errors.password_confirmation} />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-amber-900/20 transition-all hover:bg-amber-600 hover:shadow-lg"
                        >
                            <KeyRound className="mr-2 h-4 w-4" />
                            Update Password
                        </Button>

                        <Transition
                            show={recentlySuccessful}
                            enter="transition ease-in-out"
                            enterFrom="opacity-0"
                            leave="transition ease-in-out"
                            leaveTo="opacity-0"
                        >
                            <div className="flex items-center gap-1.5 text-sm text-emerald-600">
                                <CheckCircle2 className="h-4 w-4" />
                                Saved
                            </div>
                        </Transition>
                    </div>
                </form>
            )}
        </div>
    );
}
