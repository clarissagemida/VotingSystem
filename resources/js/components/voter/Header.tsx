import { router, usePage } from '@inertiajs/react';
import { Bell, ChevronDown, LogOut, ShieldCheck } from 'lucide-react';

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
    username?: string;
    email?: string;
    role: string;
}

export default function Header() {
    const { props } = usePage();

    const auth = props.auth as {
        user?: AuthUser;
    };

    const user = auth?.user;
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
    const initials =
        user?.name
            ?.trim()
            .split(/\s+/)
            .map((part) => part.charAt(0))
            .slice(0, 2)
            .join('')
            .toUpperCase() || 'V';

    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200/80 bg-white/80 px-6 shadow-sm backdrop-blur-sm lg:px-8">
            {/* =========================================================
                LEFT SIDE
            ========================================================= */}

            <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="font-medium text-gray-500">Voter</span>

                    <span className="text-gray-300">/</span>

                    <span>Voting Portal</span>
                </div>

                <h1 className="mt-0.5 truncate text-lg font-bold tracking-tight text-gray-900 lg:text-xl">Voter Portal</h1>
            </div>

            {/* =========================================================
                RIGHT SIDE
            ========================================================= */}

            <div className="flex items-center gap-3">
                {/* Notification */}

                <button
                    type="button"
                    aria-label="Notifications"
                    className="relative rounded-full p-2.5 text-gray-400 transition-all duration-200 hover:bg-green-50 hover:text-[#2D6A4F] focus-visible:ring-2 focus-visible:ring-green-600/30 focus-visible:outline-none"
                >
                    <Bell className="h-[18px] w-[18px]" />

                    <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />

                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                    </span>
                </button>

                {/* Divider */}

                <span className="hidden h-8 w-px bg-gray-200/80 sm:block" />

                {/* User Dropdown */}

                <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-xl p-1.5 transition-all duration-200 hover:bg-gray-100/80 focus-visible:ring-2 focus-visible:ring-green-600/30 focus-visible:outline-none">
                        {/* Avatar */}

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2D6A4F] to-[#1B4332] text-xs font-bold text-white shadow-sm ring-2 ring-white">
                            {initials}
                        </div>

                        {/* User Information */}

                        <div className="hidden text-left lg:block">
                            <p className="max-w-32 truncate text-sm leading-tight font-semibold text-gray-900">{user?.name ?? 'Voter'}</p>

                            <p className="flex items-center gap-1 text-[11px] text-gray-400">
                                <ShieldCheck className="h-3 w-3 text-green-500" />
                                Voter
                            </p>
                        </div>

                        <ChevronDown className="hidden h-3.5 w-3.5 text-gray-400 transition-transform duration-200 group-data-[state=open]:rotate-180 lg:block" />
                    </DropdownMenuTrigger>

                    {/* Dropdown */}

                    <DropdownMenuContent align="end" sideOffset={8} className="w-56">
                        <DropdownMenuLabel className="space-y-1">
                            <p className="text-sm font-semibold text-gray-900">{user?.name ?? 'Voter'}</p>

                            <p className="truncate text-xs font-normal text-gray-500">{user?.username ? `@${user.username}` : (user?.email ?? '')}</p>
                        </DropdownMenuLabel>

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
