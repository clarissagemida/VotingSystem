<?php

use App\Http\Middleware\AdminMiddleware;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\PreventBackHistory;
use App\Http\Middleware\VoterMiddleware;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {

        // middleware aliases

        $middleware->alias([
            'admin' => AdminMiddleware::class,
            'voter' => VoterMiddleware::class,
        ]);

        // web middleware

        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,

            // Prevent authenticated pages from being cached
            // after logout.
            PreventBackHistory::class,
        ]);

        /*
        |--------------------------------------------------------------------------
        | AUTHENTICATED USERS OPENING GUEST-ONLY PAGES
        |
        | Without this, Laravel's default redirect points at "home"
        | which is itself guest-only, causing an infinite
        | redirect loop on /login and /admin/login.
        |
        | Now admins are sent to their dashboard and voters
        | to theirs.
        |--------------------------------------------------------------------------
        */

        $middleware->redirectUsersTo(
            function (Request $request) {
                return $request->user()?->role === 'admin'
                    ? route('admin.dashboard', absolute: false)
                    : route('voter.dashboard', absolute: false);
            }
        );

        /*
        |--------------------------------------------------------------------------
        | GUESTS OPENING PROTECTED PAGES
        |
        | Guests who open any /admin/* URL are dropped on the
        | Admin Login page; everyone else on the Voter Login page.
        |--------------------------------------------------------------------------
        */

        $middleware->redirectGuestsTo(
            function (Request $request) {
                if ($request->is('admin') || $request->is('admin/*')) {
                    return route('admin.login');
                }

                return route('login');
            }
        );
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })
    ->create();
