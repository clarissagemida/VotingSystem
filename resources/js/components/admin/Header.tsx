import { router, usePage } from '@inertiajs/react';
import { ChevronDown, LogOut, Settings, ShieldCheck, UserCircle } from 'lucide-react';

import NotificationBell from '@/components/admin/NotificationBell';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AuthUser {
    id: number;
    name: string;
    email: string;
    role: string;
}

const pageTitles: Record<string, { title: string; subtitle: string }> = {
    '/admin': {
        title: 'Dashboard',
        subtitle: 'Voting & Elections Management System',
    },

    '/admin/voters': {
        title: 'Voter Management',
        subtitle: 'Manage registered voters',
    },

    '/admin/elections': {
        title: 'Election',
        subtitle: 'Manage elections and positions',
    },

    '/admin/organizations': {
        title: 'Organization',
        subtitle: 'Manage organizations',
    },

    '/admin/partylist': {
        title: 'Partylist',
        subtitle: 'Manage partylists and candidates',
    },

    '/admin/analytics': {
        title: 'Analytics',
        subtitle: 'Voting statistics and insights',
    },

    '/admin/reports': {
        title: 'Reports',
        subtitle: 'Generate and view reports',
    },

    '/admin/profile': {
        title: 'Profile',
        subtitle: 'Manage your account',
    },
};

export default function Header() {
    /*
    |--------------------------------------------------------------------------
    | Inertia Page
    |--------------------------------------------------------------------------
    */

    const { url, props } = usePage();

    /*
    |--------------------------------------------------------------------------
    | Authenticated User
    |--------------------------------------------------------------------------
    |
    | We do not use usePage<PageProps>() here because some versions of
    | @inertiajs/react have a generic constraint on PageProps.
    |
    */

    const auth = props.auth as {
        user?: AuthUser;
    };

    const user = auth?.user;

    /*
    |--------------------------------------------------------------------------
    | Current Page
    |--------------------------------------------------------------------------
    */

    const currentPath = url.split('?')[0].split('#')[0];

    const current = pageTitles[currentPath] ?? {
        title: 'Administrator',
        subtitle: 'Voting & Elections Management System',
    };

    /*
    |--------------------------------------------------------------------------
    | User Initials
    |--------------------------------------------------------------------------
    */

    const initials =
        user?.name
            ?.trim()
            .split(/\s+/)
            .map((part) => part.charAt(0))
            .slice(0, 2)
            .join('')
            .toUpperCase() || 'A';

    const handleLogout = () => {
        /*
    |--------------------------------------------------------------------------
    | MARK LOGGED OUT
    |
    | Set before the request so pressing the browser back
    | after logout can never restore this dashboard.
    |--------------------------------------------------------------------------
    */

        sessionStorage.setItem('voting_system_logged_out', 'true');

        window.history.replaceState(null, '', '/');

        router.post(
            '/logout',
            {},
            {
                onSuccess: () => {
                    window.location.replace('/');
                },
            },
        );
    };

    return (
        <header className="flex h-20 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 lg:px-8">
            {/* =========================================================
                LEFT SIDE
            ========================================================= */}

            <div className="min-w-0">
                {/* Breadcrumb */}

                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="font-medium text-gray-900">Admin</span>

                    <span className="text-gray-300">/</span>

                    <span className="truncate">{current.title}</span>
                </div>

                {/* Page Title */}

                <h1 className="truncate text-xl font-bold text-gray-900 lg:text-2xl">{current.title}</h1>

                {/* Subtitle */}

                <p className="hidden truncate text-xs text-gray-500 sm:block">{current.subtitle}</p>
            </div>

            {/* =========================================================
                RIGHT SIDE
            ========================================================= */}

            <div className="flex items-center gap-4">
                {/* =====================================================
                    NOTIFICATIONS
                ===================================================== */}

                <NotificationBell />

                {/* Divider */}

                <span className="hidden h-8 w-px bg-gray-200 sm:block" />

                {/* =====================================================
                    USER DROPDOWN
                ===================================================== */}

                <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-3 rounded-lg p-1.5 transition hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:outline-none">
                        {/* Avatar */}

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2D6A4F] font-semibold text-white shadow-sm">
                            {initials}
                        </div>

                        {/* User Information */}

                        <div className="hidden text-left lg:block">
                            <p className="max-w-40 truncate text-sm leading-tight font-semibold text-gray-900">{user?.name ?? 'Administrator'}</p>

                            <p className="flex items-center gap-1 text-xs text-gray-500">
                                <ShieldCheck className="h-3 w-3 text-green-600" />
                                Administrator
                            </p>
                        </div>

                        {/* Dropdown Arrow */}

                        <ChevronDown className="hidden h-4 w-4 text-gray-400 lg:block" />
                    </DropdownMenuTrigger>

                    {/* =================================================
                        DROPDOWN CONTENT
                    ================================================= */}

                    <DropdownMenuContent align="end" sideOffset={8} className="w-56">
                        {/* User Information */}

                        <DropdownMenuLabel className="space-y-1">
                            <p className="text-sm font-semibold text-gray-900">{user?.name ?? 'Administrator'}</p>

                            <p className="truncate text-xs font-normal text-gray-500">{user?.email ?? ''}</p>
                        </DropdownMenuLabel>

                        <DropdownMenuSeparator />

                        {/* Profile */}

                        <DropdownMenuItem className="cursor-pointer focus:bg-green-50 focus:text-[#2D6A4F]">
                            <UserCircle className="h-4 w-4 text-gray-500" />
                            Profile
                        </DropdownMenuItem>

                        {/* Settings */}

                        <DropdownMenuItem className="cursor-pointer focus:bg-green-50 focus:text-[#2D6A4F]">
                            <Settings className="h-4 w-4 text-gray-500" />
                            Settings
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {/* Logout */}

                        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600">
                            <LogOut className="h-4 w-4" />
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
