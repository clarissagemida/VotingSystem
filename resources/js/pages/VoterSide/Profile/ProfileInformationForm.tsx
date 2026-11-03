import { useForm } from '@inertiajs/react';
import { AtSign, CheckCircle2, Mail, Save, Shield, User } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Transition } from '@headlessui/react';
import Swal from 'sweetalert2';

interface UserData {
    id: number;
    name: string;
    username: string;
    email: string | null;
    role: string;
}

interface Props {
    user: UserData;
}

export default function ProfileInformationForm({ user }: Props) {
    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        username: user.username,
        email: user.email ?? '',
    });

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();

        const confirmation = await Swal.fire({
            title: 'Save profile changes?',
            html: `You are about to update your <strong>name</strong>, <strong>username</strong>, or <strong>email</strong>.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, save changes',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#2D6A4F',
            cancelButtonColor: '#6b7280',
        });

        if (!confirmation.isConfirmed) return;

        patch(route('voter.profile.update'), {
            onSuccess: () => {
                Swal.fire({
                    title: 'Profile Updated',
                    text: 'Your profile information has been updated successfully.',
                    icon: 'success',
                    confirmButtonColor: '#2D6A4F',
                });
            },
        });
    };

    return (
        <div className="rounded-2xl border border-emerald-100 bg-white shadow-sm">
            <div className="border-b border-emerald-100 px-6 py-4">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                        <User className="h-4 w-4 text-emerald-700" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-emerald-900">Profile Information</h2>
                        <p className="text-xs text-emerald-600/60">Update your name and username. Email is optional.</p>
                    </div>
                </div>
            </div>

            <form onSubmit={submit} className="space-y-5 p-6">
                {/* Name */}
                <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-sm font-medium text-emerald-800">
                        Full Name
                    </Label>
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <User className="h-4 w-4 text-emerald-400" />
                        </div>
                        <Input
                            id="name"
                            className="block w-full rounded-xl border-emerald-200 bg-emerald-50/50 pl-10 text-sm text-emerald-900 shadow-sm transition-colors focus:border-emerald-500 focus:bg-white focus:ring-emerald-500/20"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            autoComplete="name"
                            placeholder="Enter your full name"
                        />
                    </div>
                    <InputError className="mt-1" message={errors.name} />
                </div>

                {/* Username */}
                <div className="space-y-1.5">
                    <Label htmlFor="username" className="text-sm font-medium text-emerald-800">
                        Username
                    </Label>
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <AtSign className="h-4 w-4 text-emerald-400" />
                        </div>
                        <Input
                            id="username"
                            className="block w-full rounded-xl border-emerald-200 bg-emerald-50/50 pl-10 text-sm text-emerald-900 shadow-sm transition-colors focus:border-emerald-500 focus:bg-white focus:ring-emerald-500/20"
                            value={data.username}
                            onChange={(e) => setData('username', e.target.value)}
                            required
                            autoComplete="username"
                            placeholder="Enter your username"
                        />
                    </div>
                    <InputError className="mt-1" message={errors.username} />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm font-medium text-emerald-800">
                        Email Address
                    </Label>
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Mail className="h-4 w-4 text-emerald-400" />
                        </div>
                        <Input
                            id="email"
                            type="email"
                            className="block w-full rounded-xl border-emerald-200 bg-emerald-50/50 pl-10 text-sm text-emerald-900 shadow-sm transition-colors focus:border-emerald-500 focus:bg-white focus:ring-emerald-500/20"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            autoComplete="username"
                            placeholder="Optional email address"
                        />
                    </div>
                    <InputError className="mt-1" message={errors.email} />
                </div>

                {/* Role Badge */}
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3">
                    <Shield className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm text-emerald-700">
                        Role: <span className="font-semibold capitalize">{user.role}</span>
                    </span>
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <Button
                        type="submit"
                        disabled={processing}
                        className="rounded-xl bg-[#2D6A4F] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-900/20 transition-all hover:bg-[#1B4332] hover:shadow-lg"
                    >
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
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
        </div>
    );
}
