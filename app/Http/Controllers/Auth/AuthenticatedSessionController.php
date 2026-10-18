<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the voter login page.
     *
     * Voters use the credentials generated/provided
     * by the administrator through Voter Management.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
            'loginType' => 'voter',
        ]);
    }

    /**
     * Show the administrator login page.
     *
     * URL:
     * /admin/login
     */
    public function createAdmin(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
            'loginType' => 'admin',
        ]);
    }

    /**
     * Handle voter login.
     *
     * Voters must use the credentials generated/provided
     * by the administrator.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        /*
        |--------------------------------------------------------------------------
        | AUTHENTICATE USER
        |--------------------------------------------------------------------------
        |
        | LoginRequest handles the actual credential verification.
        | No new voter credentials are created here.
        |
        */

        $request->authenticate();

        /*
        |--------------------------------------------------------------------------
        | REGENERATE SESSION
        |--------------------------------------------------------------------------
        |
        | Prevent session fixation attacks.
        |
        */

        $request->session()->regenerate();

        /*
        |--------------------------------------------------------------------------
        | GET AUTHENTICATED USER
        |--------------------------------------------------------------------------
        */

        $user = $request->user();

        /*
        |--------------------------------------------------------------------------
        | VOTER ONLY
        |--------------------------------------------------------------------------
        |
        | The normal /login route is intended for voters.
        |
        */

        if ($user->role === 'voter') {
            return redirect()->intended(
                route('voter.dashboard', absolute: false)
            );
        }

        /*
        |--------------------------------------------------------------------------
        | ADMIN CANNOT USE VOTER LOGIN
        |--------------------------------------------------------------------------
        */

        if ($user->role === 'admin') {

            Auth::guard('web')->logout();

            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()
                ->route('home')
                ->withErrors([
                    'username' => 'Administrators must use the Admin Login page.',
                ]);
        }

        /*
        |--------------------------------------------------------------------------
        | INVALID USER ROLE
        |--------------------------------------------------------------------------
        */

        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()
            ->route('home')
            ->withErrors([
                'username' => 'Invalid user role.',
            ]);
    }

    /**
     * Handle administrator login.
     *
     * Only users with role = admin are allowed.
     */
    public function storeAdmin(LoginRequest $request): RedirectResponse
    {
        /*
        |--------------------------------------------------------------------------
        | AUTHENTICATE USER
        |--------------------------------------------------------------------------
        */

        $request->authenticate();

        /*
        |--------------------------------------------------------------------------
        | REGENERATE SESSION
        |--------------------------------------------------------------------------
        */

        $request->session()->regenerate();

        /*
        |--------------------------------------------------------------------------
        | GET AUTHENTICATED USER
        |--------------------------------------------------------------------------
        */

        $user = $request->user();

        /*
        |--------------------------------------------------------------------------
        | ADMIN ONLY
        |--------------------------------------------------------------------------
        |
        | Only the administrator account is allowed to continue
        | through /admin/login.
        |
        */

        if ($user->role === 'admin') {
            return redirect()->intended(
                route('admin.dashboard', absolute: false)
            );
        }

        /*
        |--------------------------------------------------------------------------
        | VOTER CANNOT USE ADMIN LOGIN
        |--------------------------------------------------------------------------
        */

        if ($user->role === 'voter') {

            Auth::guard('web')->logout();

            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()
                ->route('admin.login')
                ->withErrors([
                    'username' => 'Voters must use the Voter Login page.',
                ]);
        }

        /*
        |--------------------------------------------------------------------------
        | INVALID USER ROLE
        |--------------------------------------------------------------------------
        */

        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()
            ->route('admin.login')
            ->withErrors([
                'username' => 'Invalid user role.',
            ]);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        /*
        |--------------------------------------------------------------------------
        | LOGOUT USER
        |--------------------------------------------------------------------------
        */

        Auth::guard('web')->logout();

        /*
        |--------------------------------------------------------------------------
        | DESTROY SESSION
        |--------------------------------------------------------------------------
        */

        $request->session()->invalidate();

        /*
        |--------------------------------------------------------------------------
        | REGENERATE CSRF TOKEN
        |--------------------------------------------------------------------------
        */

        $request->session()->regenerateToken();

        /*
        |--------------------------------------------------------------------------
        | REDIRECT TO VOTER LOGIN
        |--------------------------------------------------------------------------
        |
        | Keep your existing logout behavior.
        |
        */

        return redirect()
            ->route('home')
            ->withHeaders([
                'Cache-Control' => 'no-cache, no-store, must-revalidate, max-age=0',
                'Pragma' => 'no-cache',
                'Expires' => 'Sat, 01 Jan 2000 00:00:00 GMT',
            ]);
    }
}
