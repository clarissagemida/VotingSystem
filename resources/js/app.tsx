import '../css/app.css';

import { createInertiaApp, router } from '@inertiajs/react';

import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { route as routeFn } from 'ziggy-js';

import { initializeTheme } from './hooks/use-appearance';

declare global {
    const route: typeof routeFn;
}

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

/*
|--------------------------------------------------------------------------
| Protected Pages
|--------------------------------------------------------------------------
*/

const isProtectedPageUrl = (path: string) => {
    /*
    |--------------------------------------------------------------------------
    | LOGIN PAGES ARE NEVER PROTECTED
    |
    | /admin/login is under the /admin prefix but it is a
    | guest-only page. It must stay open so admins can
    | reach their separate login URL.
    |--------------------------------------------------------------------------
    */

    if (path === '/admin/login') {
        return false;
    }

    return path === '/admin' || path.startsWith('/admin/') || path === '/voter' || path.startsWith('/voter/');
};

const isProtectedPage = () => isProtectedPageUrl(window.location.pathname);

//check authentication on initial load

const checkAuthentication = async () => {
    if (!isProtectedPage()) {
        return;
    }

    //check if the user has logged out in this session

    const loggedOut = sessionStorage.getItem('voting_system_logged_out');

    if (loggedOut === 'true') {
        window.location.replace('/');
        return;
    }

    //check if the user is authenticated on the server
    try {
        const response = await fetch('/auth/check', {
            method: 'GET',
            credentials: 'same-origin',
            cache: 'no-store',
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
        });

        if (!response.ok) {
            window.location.replace('/');
            return;
        }

        const data = await response.json();

        if (!data.authenticated) {
            sessionStorage.setItem('voting_system_logged_out', 'true');

            window.location.replace('/');
        }
    } catch (error) {
        console.error('Authentication check failed:', error);
    }
};

//check authentication on initial load AND every time
//the page is shown again (browser back button,
//bfcache restore, memory cache restore).

window.addEventListener('pageshow', () => {
    checkAuthentication();
});

//browser back button navigation

window.addEventListener('popstate', () => {
    checkAuthentication();
});

//inertia navigation event listener to clear the logout marker when
//navigating to protected pages (login pages never clear it,
//so the marker keeps guarding cached dashboards)

router.on('navigate', (event) => {
    const url = event.detail.page.url;

    const path = url.split('?')[0].split('#')[0];

    if (isProtectedPageUrl(path)) {
        sessionStorage.removeItem('voting_system_logged_out');
    }
});

createInertiaApp({
    title: (title) => `${title} - ${appName}`,

    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),

    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },

    progress: {
        color: '#4B5563',
    },
});

/*
|--------------------------------------------------------------------------
| Theme
|--------------------------------------------------------------------------
*/

initializeTheme();
