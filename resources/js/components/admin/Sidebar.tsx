import { Link, usePage } from '@inertiajs/react';
import { BarChart3, Building2, ChevronRight, FileText, Flag, LayoutDashboard, UserCircle, Users, Vote } from 'lucide-react';

const mainMenus = [
    {
        title: 'Dashboard',
        icon: LayoutDashboard,
        routeName: 'admin.dashboard',
        href: '/admin',
    },
    {
        title: 'Voter Management',
        icon: Users,
        routeName: 'admin.voters.index',
        href: '/admin/voters',
    },
    {
        title: 'Election',
        icon: Vote,
        routeName: 'admin.elections.index',
        href: '/admin/elections',
    },
    {
        title: 'Organization',
        icon: Building2,
        routeName: 'admin.organizations.index',
        href: '/admin/organizations',
    },
    {
        title: 'Partylist',
        icon: Flag,
        routeName: 'admin.partylists.index',
        href: '/admin/partylists',
    },
];

const systemMenus = [
    {
        title: 'Analytics',
        icon: BarChart3,
        routeName: 'admin.analytics.index',
        href: '/admin/analytics',
    },
    {
        title: 'Reports',
        icon: FileText,
        routeName: 'admin.reports.index',
        href: '/admin/reports',
    },
    {
        title: 'Profile',
        icon: UserCircle,
        routeName: 'admin.profile',
        href: '/admin/profile',
    },
];

export default function Sidebar() {
    const { url } = usePage();

    const isActive = (href: string) => {
        const currentPath = url.split('?')[0];

        if (href === '/admin') {
            return currentPath === '/admin' || currentPath === '/admin/';
        }

        return currentPath === href || currentPath.startsWith(`${href}/`);
    };

    const renderMenu = (menu: { title: string; icon: typeof LayoutDashboard; routeName: string; href: string }) => {
        const active = isActive(menu.href);

        return (
            <Link
                key={menu.title}
                href={menu.href}
                preserveScroll
                className={[
                    'group relative flex items-center gap-3 rounded-lg px-3 py-3',
                    'text-sm font-medium transition-all duration-200',
                    active ? 'bg-[#40916C] text-white shadow-md' : 'text-green-100 hover:bg-white/10 hover:text-white',
                ].join(' ')}
            >
                {/* Active Indicator */}
                {active && <span className="absolute top-1/2 left-0 h-7 w-1 -translate-y-1/2 rounded-r-full bg-amber-400" />}

                {/* Icon */}
                <menu.icon
                    className={['h-5 w-5 shrink-0 transition-colors', active ? 'text-amber-300' : 'text-green-300 group-hover:text-white'].join(' ')}
                />

                {/* Title */}
                <span className="truncate">{menu.title}</span>

                {/* Arrow */}
                <ChevronRight
                    className={[
                        'ml-auto h-4 w-4 shrink-0 transition-all duration-200',
                        active ? 'translate-x-0 opacity-100' : 'translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-60',
                    ].join(' ')}
                />
            </Link>
        );
    };

    return (
        <aside className="flex h-screen w-72 shrink-0 flex-col bg-[#1B4332] text-white">
            {/* =========================================================
                LOGO / HEADER
            ========================================================= */}

            <div className="border-b border-white/10 bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] px-5 py-5">
                <div className="flex items-center gap-3">
                    {/* Logo */}

                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-1 shadow-lg">
                        <img
                            src="/images/logo-cpsu.png"
                            alt="CPSU Logo"
                            className="h-full w-full object-contain"
                            onError={(event) => {
                                event.currentTarget.style.display = 'none';
                            }}
                        />
                    </div>

                    {/* System Name */}

                    <div className="min-w-0">
                        <h1 className="truncate text-base leading-tight font-bold text-white">Voting &amp; Elections</h1>

                        <p className="mt-0.5 text-xs font-medium tracking-wide text-green-200">Management System</p>
                    </div>
                </div>
            </div>

            {/* =========================================================
                NAVIGATION
            ========================================================= */}

            <nav className="flex-1 overflow-y-auto px-4 py-6">
                {/* =====================================================
                    MAIN MENU
                ===================================================== */}

                <div>
                    <p className="mb-3 px-3 text-[11px] font-bold tracking-[0.15em] text-green-400 uppercase">Main Menu</p>

                    <div className="space-y-1">{mainMenus.map(renderMenu)}</div>
                </div>

                {/* =====================================================
                    SYSTEM MENU
                ===================================================== */}

                <div className="mt-8">
                    <p className="mb-3 px-3 text-[11px] font-bold tracking-[0.15em] text-green-400 uppercase">System</p>

                    <div className="space-y-1">{systemMenus.map(renderMenu)}</div>
                </div>
            </nav>

            {/* =========================================================
                FOOTER
            ========================================================= */}

            <div className="border-t border-white/10 px-5 py-4">
                <p className="text-center text-[10px] text-green-300">Voting &amp; Elections Management System</p>
            </div>
        </aside>
    );
}
