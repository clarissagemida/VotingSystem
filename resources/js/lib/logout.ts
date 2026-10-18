import { router } from '@inertiajs/react';

export function logout() {
    /*
    |--------------------------------------------------------------------------
    | MARK LOGGED OUT
    |
    | Set before the request so any cached/bfcache restore of
    | a protected page is bounced straight to the login page.
    |--------------------------------------------------------------------------
    */

    sessionStorage.setItem('voting_system_logged_out', 'true');

    router.post('/logout');
}
