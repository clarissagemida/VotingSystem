import Echo from 'laravel-echo';
import { Bell, CheckCheck, Inbox, KeyRound, Mail, UserCog, Vote } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import '@/echo';

interface AdminNotification {
    id: number;
    action: string;
    title: string;
    message: string;
    voter: string | null;
    election: string | null;
    read: boolean;
    created_at: string | null;
}

const actionIcons: Record<string, { icon: typeof Bell; className: string }> = {
    profile_updated: {
        icon: UserCog,
        className: 'bg-emerald-50 text-emerald-600',
    },
    password_changed: {
        icon: KeyRound,
        className: 'bg-amber-50 text-amber-600',
    },
    voted: {
        icon: Vote,
        className: 'bg-blue-50 text-blue-600',
    },
};

function formatTimestamp(value: string | null): string {
    if (!value) return '—';

    const date = new Date(value.replace(' ', 'T'));

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

export default function NotificationBell() {
    const [open, setOpen] = useState(false);
    const [unread, setUnread] = useState(0);
    const [notifications, setNotifications] = useState<AdminNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const dropdownRef = useRef<HTMLDivElement>(null);

    /*
    |--------------------------------------------------------------------------
    | Initial load + real-time subscription
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        let channel: ReturnType<Echo<'reverb'>['private']> | null = null;

        const loadInitial = async () => {
            try {
                const response = await fetch('/admin/notifications', {
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });

                const data = await response.json();

                setNotifications(data.notifications ?? []);
                setUnread(data.unread ?? 0);
            } catch {
                // ignore fetch errors
            } finally {
                setLoading(false);
            }
        };

        loadInitial();

        /*
         | Connect to the real-time admin channel and prepend
         | live voter-activity notifications as they arrive.
         */
        try {
            channel = window.Echo.private('admin.notifications').listen('.voter.activity', (event: { notification: AdminNotification }) => {
                const incoming = event.notification;

                setNotifications((prev) => [incoming, ...prev]);
                setUnread((prev) => prev + 1);
            });
        } catch {
            // broadcasting not available
        }

        return () => {
            if (channel) {
                try {
                    channel.stopListening('.voter.activity');
                } catch {
                    // ignore
                }
            }
        };
    }, []);

    /*
    |--------------------------------------------------------------------------
    | Click outside to close
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (!open) return;

        const handleClick = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClick);

        return () => document.removeEventListener('mousedown', handleClick);
    }, [open]);

    /*
    |--------------------------------------------------------------------------
    | Actions
    |--------------------------------------------------------------------------
    */

    const markAllRead = async () => {
        setUnread(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

        try {
            await fetch('/admin/notifications/mark-all-read', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
                    Accept: 'application/json',
                },
            });
        } catch {
            // ignore
        }
    };

    return (
        <div ref={dropdownRef} className="relative">
            {/* Bell Button */}

            <button
                type="button"
                aria-label="Notifications"
                onClick={() => setOpen((prev) => !prev)}
                className="relative rounded-full p-2 text-gray-500 transition hover:bg-green-50 hover:text-[#2D6A4F] focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:outline-none"
            >
                <Bell className="h-5 w-5" />

                {unread > 0 && (
                    <span className="absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] leading-none font-bold text-white ring-2 ring-white">
                        {unread > 99 ? '99+' : unread}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}

            {open && (
                <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl sm:w-96">
                    {/* Header */}

                    <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/70 px-4 py-3">
                        <div>
                            <p className="text-sm font-bold text-gray-900">Notifications</p>
                            <p className="text-xs text-gray-500">{unread} unread</p>
                        </div>

                        {unread > 0 && (
                            <button
                                type="button"
                                onClick={markAllRead}
                                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#2D6A4F] transition hover:bg-emerald-50"
                            >
                                <CheckCheck className="h-3.5 w-3.5" />
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* List */}

                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center gap-2 py-10">
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                                <p className="text-xs text-gray-400">Loading notifications...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                                <Inbox className="h-8 w-8 text-gray-300" />
                                <p className="text-sm font-medium text-gray-500">No notifications yet</p>
                                <p className="px-6 text-xs text-gray-400">Voter profile changes and ballot submissions will appear here.</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {notifications.map((notification) => {
                                    const meta = actionIcons[notification.action] ?? {
                                        icon: Mail,
                                        className: 'bg-gray-100 text-gray-500',
                                    };

                                    const Icon = meta.icon;

                                    return (
                                        <li
                                            key={notification.id}
                                            className={`relative flex gap-3 px-4 py-3 transition hover:bg-gray-50 ${notification.read ? '' : 'bg-emerald-50/40'} `}
                                        >
                                            {!notification.read && <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-emerald-500" />}

                                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${meta.className} `}>
                                                <Icon className="h-4 w-4" />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-bold text-gray-900">{notification.title}</p>
                                                <p className="mt-0.5 text-xs leading-5 text-gray-600">{notification.message}</p>
                                                <p className="mt-1 text-[11px] text-gray-400">{formatTimestamp(notification.created_at)}</p>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
