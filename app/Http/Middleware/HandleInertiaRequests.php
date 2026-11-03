<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(
            Inspiring::quotes()->random()
        )->explode('-');

        return [
            ...parent::share($request),

            /*
            |--------------------------------------------------------------------------
            | Application
            |--------------------------------------------------------------------------
            */

            'name' => config('app.name'),

            'quote' => [
                'message' => trim($message),
                'author' => trim($author),
            ],

            /*
            |--------------------------------------------------------------------------
            | Authentication
            |--------------------------------------------------------------------------
            */

            'auth' => [
                'user' => $request->user(),
            ],

            /*
            |--------------------------------------------------------------------------
            | Flash Messages
            |--------------------------------------------------------------------------
            |
            | These flash messages are shared with the React + Inertia
            | frontend and are used by different management modules.
            |
            */

            'flash' => [

                'adminAlert' => fn () => $request->session()->get('adminAlert'),

                // Generic admin form feedback used by candidate and partylist pages.
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),

                // Voter Management

                'voterCreated' => fn () => $request->session()->get('voterCreated'),

                'passwordReset' => fn () => $request->session()->get('passwordReset'),

                'voterUpdated' => fn () => $request->session()->get('voterUpdated'),

                'voterDeleted' => fn () => $request->session()->get('voterDeleted'),

                // Organization Management

                'organizationCreated' => fn () => $request->session()->get('organizationCreated'),

                'organizationUpdated' => fn () => $request->session()->get('organizationUpdated'),

                'organizationDeleted' => fn () => $request->session()->get('organizationDeleted'),

            ],
        ];
    }
}
