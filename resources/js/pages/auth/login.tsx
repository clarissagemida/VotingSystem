import { Head, Link, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle, LockKeyhole, ShieldCheck, User } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import Swal from 'sweetalert2';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/*
|--------------------------------------------------------------------------
| LOGIN PROPS
|--------------------------------------------------------------------------
*/

interface LoginProps {
    status?: string;
    canResetPassword: boolean;

    /*
    |--------------------------------------------------------------------------
    | LOGIN TYPE
    |--------------------------------------------------------------------------
    |
    | voter -> /login
    | admin -> /admin/login
    |
    */

    loginType?: 'admin' | 'voter';
}

/*
|--------------------------------------------------------------------------
| LOGIN FORM
|--------------------------------------------------------------------------
*/

type LoginForm = {
    username: string;
    password: string;
    remember: boolean;
};

/*
|--------------------------------------------------------------------------
| LOGIN PAGE
|--------------------------------------------------------------------------
*/

export default function Login({ status, canResetPassword, loginType = 'voter' }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | LOGIN FORM
    |--------------------------------------------------------------------------
    */

    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        username: '',
        password: '',
        remember: false,
    });

    /*
    |--------------------------------------------------------------------------
    | SUBMIT LOGIN FORM
    |--------------------------------------------------------------------------
    */

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        /*
        |--------------------------------------------------------------------------
        | SELECT LOGIN ROUTE
        |--------------------------------------------------------------------------
        |
        | Voter:
        | /login
        |
        | Admin:
        | /admin/login
        |
        */

        const loginRoute = loginType === 'admin' ? 'admin.login.store' : 'login.store';

        /*
        |--------------------------------------------------------------------------
        | SEND LOGIN REQUEST
        |--------------------------------------------------------------------------
        */

        post(route(loginRoute), {
            preserveScroll: true,

            /*
            |--------------------------------------------------------------------------
            | LOGIN ERROR
            |--------------------------------------------------------------------------
            */

            onError: (formErrors) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Login Failed',
                    text: formErrors.username || formErrors.password || 'The email/username or password you entered is incorrect.',
                    confirmButtonColor: '#16a34a',
                    allowOutsideClick: false,
                });
            },

            /*
            |--------------------------------------------------------------------------
            | FINISH LOGIN
            |--------------------------------------------------------------------------
            */

            onFinish: () => {
                reset('password');
            },
        });
    };

    /*
    |--------------------------------------------------------------------------
    | PAGE
    |--------------------------------------------------------------------------
    */

    return (
        <>
            <Head title={loginType === 'admin' ? 'Administrator Login' : 'Voter Login'} />

            <div className="flex min-h-screen bg-gray-100">
                {/* =====================================================
                    LEFT SIDE
                ====================================================== */}

                <div className="relative hidden w-1/2 items-center justify-center overflow-hidden bg-green-700 lg:flex">
                    {/* Background */}

                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.18),transparent_32%),linear-gradient(145deg,rgba(22,101,52,0),rgba(20,83,45,0.8))]" />

                    <div className="relative mx-auto max-w-xl px-12 text-center">
                        {/* CPSU LOGO */}

                        <div className="mx-auto mb-8 flex h-36 w-36 items-center justify-center rounded-full bg-white/95 p-4 shadow-xl">
                            <img src="/images/logo-cpsu.png" className="h-full w-full object-contain" alt="CPSU logo" />
                        </div>

                        {/* SYSTEM TITLE */}

                        <h1 className="text-5xl leading-tight font-bold text-white">Voting & Elections</h1>

                        <h2 className="mt-2 text-5xl leading-tight font-bold text-white">Management System</h2>

                        {/* DESCRIPTION */}

                        <div className="mx-auto mt-8 flex max-w-md items-center justify-center gap-3 rounded-lg border border-white/20 bg-white/10 px-5 py-3 text-white shadow-lg backdrop-blur-sm">
                            <ShieldCheck className="h-5 w-5 shrink-0" />

                            <p className="text-base font-medium">Secure | Transparent | Efficient Voting Experience</p>
                        </div>
                    </div>
                </div>

                {/* =====================================================
                    RIGHT SIDE
                ====================================================== */}

                <div className="flex flex-1 items-center justify-center px-5 py-8 sm:px-8">
                    <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-7 shadow-2xl shadow-green-900/10 sm:p-10">
                        {/* =================================================
                            MOBILE LOGO
                        ================================================== */}

                        <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-lg border border-green-100 bg-green-50 p-3 shadow-sm lg:hidden">
                            <img src="/images/logo-cpsu.png" className="h-full w-full object-contain" alt="CPSU logo" />
                        </div>

                        {/* =================================================
                            DESKTOP LOGO
                        ================================================== */}

                        <img src="/images/logo-cpsu.png" className="mx-auto mb-4 hidden w-20 lg:block" alt="CPSU logo" />

                        {/* =================================================
                            TITLE
                        ================================================== */}

                        <h1 className="text-center text-3xl font-bold text-gray-950">
                            {loginType === 'admin' ? 'Administrator Login' : 'Login to System'}
                        </h1>

                        <p className="mt-2 mb-8 text-center text-sm text-gray-500">
                            {loginType === 'admin' ? 'Sign in to access the administration panel' : 'Use your email or username to continue'}
                        </p>

                        {/* =================================================
                            STATUS
                        ================================================== */}

                        {status && (
                            <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-center text-sm font-medium text-green-700">
                                {status}
                            </div>
                        )}

                        {/* =================================================
                            LOGIN FORM
                        ================================================== */}

                        <form onSubmit={submit} className="space-y-5">
                            {/* =================================================
                                EMAIL OR USERNAME
                            ================================================== */}

                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-sm font-semibold text-gray-700">
                                    Email or Username
                                </Label>

                                <div className="relative">
                                    <User className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />

                                    <Input
                                        id="username"
                                        type="text"
                                        value={data.username}
                                        autoFocus
                                        autoComplete="username"
                                        placeholder={loginType === 'admin' ? 'Enter your admin email or username' : 'Enter your email or username'}
                                        className="h-12 rounded-lg border-gray-300 bg-gray-50 pl-10 text-gray-950 transition focus-visible:ring-green-600"
                                        onChange={(e) => setData('username', e.target.value)}
                                    />
                                </div>

                                <InputError message={errors.username} className="mt-1" />
                            </div>

                            {/* =================================================
                                PASSWORD
                            ================================================== */}

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                                    Password
                                </Label>

                                <div className="relative">
                                    <LockKeyhole className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />

                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        autoComplete="current-password"
                                        placeholder="Enter your password"
                                        className="h-12 rounded-lg border-gray-300 bg-gray-50 px-10 text-gray-950 transition focus-visible:ring-green-600"
                                        onChange={(e) => setData('password', e.target.value)}
                                    />

                                    <button
                                        type="button"
                                        className="absolute top-1/2 right-2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
                                        onClick={() => setShowPassword((value) => !value)}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>

                                <InputError message={errors.password} className="mt-1" />
                            </div>

                            {/* =================================================
                                OPTIONS
                            ================================================== */}

                            <div className="flex flex-col gap-3 text-sm text-gray-700 sm:flex-row sm:items-center sm:justify-between">
                                {/* SHOW PASSWORD */}

                                <div className="flex items-center gap-3">
                                    <Checkbox
                                        id="show-password"
                                        checked={showPassword}
                                        className="border-gray-300 data-[state=checked]:border-green-600 data-[state=checked]:bg-green-600"
                                        onCheckedChange={(checked) => setShowPassword(Boolean(checked))}
                                    />

                                    <Label htmlFor="show-password" className="cursor-pointer font-normal">
                                        Show Password
                                    </Label>
                                </div>

                                {/* REMEMBER ME */}

                                <div className="flex items-center gap-3">
                                    <Checkbox
                                        id="remember"
                                        checked={data.remember}
                                        className="border-gray-300 data-[state=checked]:border-green-600 data-[state=checked]:bg-green-600"
                                        onCheckedChange={(checked) => setData('remember', Boolean(checked))}
                                    />

                                    <Label htmlFor="remember" className="cursor-pointer font-normal">
                                        Remember Me
                                    </Label>
                                </div>
                            </div>

                            {/* =================================================
                                FORGOT PASSWORD
                            ================================================== */}

                            <div className="flex min-h-6 justify-end">
                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-sm font-medium text-green-700 underline-offset-4 transition hover:text-green-800 hover:underline"
                                    >
                                        Forgot Password?
                                    </Link>
                                )}
                            </div>

                            {/* =================================================
                                LOGIN BUTTON
                            ================================================== */}

                            <Button
                                type="submit"
                                className="h-12 w-full rounded-lg bg-green-600 text-base font-semibold text-white shadow-lg shadow-green-700/20 transition hover:bg-green-700 focus-visible:ring-green-600"
                                disabled={processing}
                            >
                                {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}

                                {processing ? 'Logging in...' : loginType === 'admin' ? 'Login as Administrator' : 'Login'}
                            </Button>
                        </form>

                        {/* =================================================
                            LOGIN INFORMATION
                        ================================================== */}

                        <div className="mt-6 rounded-lg border border-green-100 bg-green-50 px-4 py-3">
                            <p className="text-center text-xs leading-relaxed text-green-700">
                                {loginType === 'admin' ? (
                                    <>
                                        <span className="font-semibold">Administrator:</span> Login using your registered administrator email or
                                        username and password.
                                    </>
                                ) : (
                                    <>
                                        <span className="font-semibold">Voter:</span> Login using the username and password provided by the
                                        administrator.
                                    </>
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
