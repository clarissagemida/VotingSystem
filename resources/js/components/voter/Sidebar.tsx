import { Link, usePage } from '@inertiajs/react';
import { ChevronRight, Clock3, LayoutDashboard, UserCircle, Vote } from 'lucide-react';

const menus = [
    {
        title: 'Dashboard',
        icon: LayoutDashboard,
        href: '/voter/dashboard',
    },
    {
        title: 'Election',
        icon: Vote,
        href: '/voter/elections',
    },
    {
        title: 'Vote History',
        icon: Clock3,
        href: '/voter/vote-history',
    },
    {
        title: 'Profile',
        icon: UserCircle,
        href: '/voter/profile',
    },
];

export default function Sidebar() {
    const { url } = usePage();

    const currentPath = url.split('?')[0].split('#')[0];

    const isActive = (href: string) => {
        return currentPath === href || currentPath.startsWith(`${href}/`);
    };

    return (
        <aside className="flex h-screen w-72 shrink-0 flex-col bg-gradient-to-b from-[#143728] via-[#1B4332] to-[#1B4332] text-white shadow-xl">
            {/* =========================================================
                LOGO / SYSTEM HEADER
            ========================================================= */}

            <div className="relative border-b border-white/10 px-5 py-5">
                {/* Decorative background circle */}
                <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-white/[0.03]" />

                <div className="relative flex items-center gap-3">
                    {/* Logo */}

                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-1 shadow-lg ring-2 ring-white/10">
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

                        <p className="mt-0.5 text-xs font-medium tracking-wide text-green-300/80">Voter Portal</p>
                    </div>
                </div>
            </div>

            {/* =========================================================
                NAVIGATION
            ========================================================= */}

            <nav className="flex-1 overflow-y-auto px-3 py-6">
                <p className="mb-3 px-3 text-[11px] font-bold tracking-[0.15em] text-green-400/70 uppercase">Voter Menu</p>

                <div className="space-y-1">
                    {menus.map((menu) => {
                        const active = isActive(menu.href);

                        return (
                            <Link
                                key={menu.title}
                                href={menu.href}
                                preserveScroll
                                className={[
                                    'group relative flex items-center gap-3 rounded-xl px-3.5 py-3',
                                    'text-sm font-medium transition-all duration-200 ease-out',

                                    active
                                        ? 'bg-white/10 text-white shadow-lg shadow-black/10'
                                        : 'text-green-100/80 hover:bg-white/[0.07] hover:text-white',
                                ].join(' ')}
                            >
                                {/* Active Indicator */}

                                {active && (
                                    <span className="absolute top-1/2 left-0 h-7 w-1 -translate-y-1/2 rounded-r-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]" />
                                )}

                                {/* Icon */}

                                <div
                                    className={[
                                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-200',

                                        active
                                            ? 'bg-amber-400/20 text-amber-300'
                                            : 'bg-white/5 text-green-300/70 group-hover:bg-white/10 group-hover:text-white',
                                    ].join(' ')}
                                >
                                    <menu.icon className="h-[18px] w-[18px]" />
                                </div>

                                {/* Title */}

                                <span className="truncate">{menu.title}</span>

                                {/* Arrow */}

                                <ChevronRight
                                    className={[
                                        'ml-auto h-4 w-4 shrink-0 transition-all duration-200',

                                        active
                                            ? 'translate-x-0 text-amber-300/60 opacity-100'
                                            : 'translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-50',
                                    ].join(' ')}
                                />
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* =========================================================
                FOOTER
            ========================================================= */}

            <div className="border-t border-white/10 px-5 py-4">
                <p className="text-center text-[10px] font-medium text-green-400/50">Voting &amp; Elections Management System</p>
            </div>
        </aside>
    );
}
