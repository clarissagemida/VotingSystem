import { Clock, Flame, Timer } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface CountdownTimerProps {
    targetDate: string;
    label?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    variant?: 'default' | 'card' | 'pill' | 'banner' | 'subtle';
    expiredLabel?: string;
    showIcon?: boolean;
    onExpired?: () => void;
    countUpAfterExpiry?: boolean;
    countUpLabel?: string;
}

function parseTargetDate(dateStr: string): Date {
    if (!dateStr) return new Date(NaN);
    const cleanStr = dateStr.trim();
    const formatted = cleanStr.includes('T') ? cleanStr : cleanStr.replace(' ', 'T');
    const parsed = new Date(formatted);
    if (isNaN(parsed.getTime())) {
        const parts = cleanStr.split(/[- :]/);
        if (parts.length >= 6) {
            return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), Number(parts[3]), Number(parts[4]), Number(parts[5]));
        }
    }
    return parsed;
}

function getTimeLeft(target: Date) {
    const now = new Date().getTime();
    const diff = target.getTime() - now;

    if (isNaN(diff) || diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, expired: true };
    }

    const totalSeconds = Math.floor(diff / 1000);
    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        totalSeconds,
        expired: false,
    };
}

function getTimeUp(target: Date) {
    const now = new Date().getTime();
    const elapsed = now - target.getTime();

    if (isNaN(elapsed) || elapsed < 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };
    }

    const totalSeconds = Math.floor(elapsed / 1000);
    return {
        days: Math.floor(elapsed / (1000 * 60 * 60 * 24)),
        hours: Math.floor((elapsed / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((elapsed / (1000 * 60)) % 60),
        seconds: Math.floor((elapsed / 1000) % 60),
        totalSeconds,
    };
}

function pad(n: number): string {
    return String(n).padStart(2, '0');
}

export default function CountdownTimer({
    targetDate,
    label = 'Ends in',
    size = 'sm',
    variant = 'default',
    expiredLabel = 'Election Ended',
    showIcon = true,
    onExpired,
    countUpAfterExpiry = false,
    countUpLabel = 'Ended',
}: CountdownTimerProps) {
    const target = parseTargetDate(targetDate);
    const [time, setTime] = useState(() => getTimeLeft(target));
    const [elapsed, setElapsed] = useState(() => getTimeUp(target));

    useEffect(() => {
        const update = () => {
            const t = parseTargetDate(targetDate);
            const current = getTimeLeft(t);
            setTime(current);
            if (current.expired) {
                setElapsed(getTimeUp(t));
                if (onExpired) onExpired();
            }
        };

        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [targetDate, onExpired]);

    if (time.expired) {
        if (countUpAfterExpiry) {
            const upUnits = [
                { label: 'Days', value: elapsed.days },
                { label: 'Hours', value: elapsed.hours },
                { label: 'Mins', value: elapsed.minutes },
                { label: 'Secs', value: elapsed.seconds },
            ];
            if (variant === 'banner') {
                return (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-400/20 bg-rose-500/10 p-3.5 text-white backdrop-blur-md">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/20 text-rose-300">
                                <Clock className="h-4 w-4" />
                            </div>
                            <p className="text-xs font-medium text-rose-100">{countUpLabel}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                            {upUnits.map((u, i) => (
                                <div key={u.label} className="flex items-center gap-1.5">
                                    <div className="flex flex-col items-center">
                                        <span className="flex h-9 min-w-[38px] items-center justify-center rounded-lg bg-rose-600 px-2 text-base font-bold text-white tabular-nums shadow-sm">
                                            {pad(u.value)}
                                        </span>
                                        <span className="mt-0.5 text-[9px] font-semibold tracking-wider text-rose-200/80 uppercase">{u.label}</span>
                                    </div>
                                    {i < upUnits.length - 1 && <span className="-mt-3 text-sm font-bold text-white/50">:</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            }
            return (
                <div className="inline-flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 ring-1 ring-rose-200">
                    <Clock className="h-3.5 w-3.5 text-rose-500" />
                    <span>{countUpLabel}:</span>
                    <span className="font-bold tabular-nums">
                        {elapsed.days > 0 ? `${elapsed.days}d ` : ''}
                        {pad(elapsed.hours)}h {pad(elapsed.minutes)}m {pad(elapsed.seconds)}s
                    </span>
                </div>
            );
        }
        if (!expiredLabel) return null;
        return (
            <div className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600">
                <Clock className="h-3.5 w-3.5 text-gray-400" />
                <span>{expiredLabel}</span>
            </div>
        );
    }

    const isUrgent = time.totalSeconds < 3600; // Less than 1 hour
    const isWarning = time.totalSeconds < 86400 && !isUrgent; // Less than 24 hours

    const units = [
        { label: 'Days', value: time.days },
        { label: 'Hours', value: time.hours },
        { label: 'Mins', value: time.minutes },
        { label: 'Secs', value: time.seconds },
    ];

    // Banner Variant (Used prominently in Ballot Header or Hero section)
    if (variant === 'banner') {
        return (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/10 p-3.5 text-white backdrop-blur-md">
                <div className="flex items-center gap-2">
                    {showIcon && (
                        <div
                            className={`flex h-8 w-8 items-center justify-center rounded-lg ${isUrgent ? 'bg-red-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}`}
                        >
                            {isUrgent ? <Flame className="h-4 w-4 animate-bounce" /> : <Timer className="h-4 w-4" />}
                        </div>
                    )}
                    <div>
                        <p className="text-xs font-medium text-green-100">{label}</p>
                        <p className="text-[11px] text-green-200/70">Counting down in real-time</p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    {units.map((u, i) => (
                        <div key={u.label} className="flex items-center gap-1.5">
                            <div className="flex flex-col items-center">
                                <span
                                    className={`flex h-9 min-w-[38px] items-center justify-center rounded-lg px-2 text-base font-bold tabular-nums shadow-sm ${
                                        isUrgent ? 'animate-pulse bg-rose-600 text-white' : 'bg-black/30 text-white ring-1 ring-white/20'
                                    }`}
                                >
                                    {pad(u.value)}
                                </span>
                                <span className="mt-0.5 text-[9px] font-semibold tracking-wider text-green-200/80 uppercase">{u.label}</span>
                            </div>
                            {i < units.length - 1 && <span className="-mt-3 text-sm font-bold text-white/50">:</span>}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Card Variant (e.g., in Voter Dashboard Ongoing Election Card)
    if (variant === 'card') {
        return (
            <div
                className={`rounded-2xl border p-4 shadow-sm transition-all ${
                    isUrgent
                        ? 'border-rose-200 bg-gradient-to-br from-rose-50 to-orange-50/50'
                        : isWarning
                          ? 'border-amber-200 bg-gradient-to-br from-amber-50/60 to-yellow-50/40'
                          : 'border-emerald-200/80 bg-gradient-to-br from-emerald-50/70 to-teal-50/40'
                }`}
            >
                <div className="mb-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        {showIcon && (
                            <div
                                className={`flex h-6 w-6 items-center justify-center rounded-md ${
                                    isUrgent ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-[#2D6A4F]'
                                }`}
                            >
                                {isUrgent ? <Flame className="h-3.5 w-3.5 animate-pulse" /> : <Timer className="h-3.5 w-3.5" />}
                            </div>
                        )}
                        <span
                            className={`text-xs font-bold tracking-wider uppercase ${
                                isUrgent ? 'text-rose-700' : isWarning ? 'text-amber-800' : 'text-[#2D6A4F]'
                            }`}
                        >
                            {label}
                        </span>
                    </div>
                    {isUrgent && (
                        <span className="inline-flex animate-pulse items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                            Ending Soon
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-4 gap-2 text-center">
                    {units.map((u) => (
                        <div
                            key={u.label}
                            className={`rounded-xl border p-2 shadow-xs ${isUrgent ? 'border-rose-200 bg-white' : 'border-white/80 bg-white/90'}`}
                        >
                            <p className={`text-lg font-extrabold tabular-nums sm:text-xl ${isUrgent ? 'text-rose-600' : 'text-[#1B4332]'}`}>
                                {pad(u.value)}
                            </p>
                            <p className="mt-0.5 text-[10px] font-semibold tracking-wider text-gray-500 uppercase">{u.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Pill Variant (Compact badge)
    if (variant === 'pill') {
        return (
            <div
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
                    isUrgent ? 'animate-pulse bg-rose-50 text-rose-700 ring-1 ring-rose-200' : 'bg-emerald-50 text-[#2D6A4F] ring-1 ring-emerald-200'
                }`}
            >
                {showIcon && <Timer className="h-3.5 w-3.5" />}
                <span className="font-semibold">{label}:</span>
                <span className="font-bold tabular-nums">
                    {time.days > 0 ? `${time.days}d ` : ''}
                    {pad(time.hours)}h {pad(time.minutes)}m {pad(time.seconds)}s
                </span>
            </div>
        );
    }

    // Default & Subtle Variant (Clean modular unit blocks)
    const isLg = size === 'lg' || size === 'xl';
    const isXs = size === 'xs';

    return (
        <div className="space-y-1.5">
            <div
                className={`flex items-center gap-1.5 font-semibold ${
                    isUrgent ? 'text-rose-600' : isWarning ? 'text-amber-700' : 'text-[#2D6A4F]'
                } ${isLg ? 'text-sm' : isXs ? 'text-[10px]' : 'text-xs'}`}
            >
                {showIcon && <Timer className={isLg ? 'h-4 w-4' : isXs ? 'h-3 w-3' : 'h-3.5 w-3.5'} />}
                <span>{label}</span>
                {isUrgent && <span className="py-0.2 ml-1 rounded-full bg-rose-100 px-1.5 text-[10px] font-bold text-rose-700">Urgent</span>}
            </div>

            <div className={`flex items-center ${isLg ? 'gap-2' : 'gap-1.5'}`}>
                {units.map((u, i) => (
                    <div key={u.label} className="flex items-center gap-1">
                        <div className={`flex flex-col items-center ${isLg ? 'min-w-[48px]' : isXs ? 'min-w-[28px]' : 'min-w-[36px]'}`}>
                            <span
                                className={`font-bold tracking-tight text-white tabular-nums shadow-xs ${isUrgent ? 'bg-rose-600' : 'bg-[#2D6A4F]'} ${
                                    isLg
                                        ? 'rounded-lg px-2.5 py-1.5 text-base sm:text-lg'
                                        : isXs
                                          ? 'rounded px-1 py-0.5 text-[10px]'
                                          : 'rounded-md px-1.5 py-0.5 text-xs'
                                } `}
                            >
                                {pad(u.value)}
                            </span>
                            <span
                                className={`mt-0.5 font-medium ${
                                    isUrgent ? 'text-rose-600/80' : 'text-emerald-700/80'
                                } ${isLg ? 'text-[11px]' : isXs ? 'text-[8px]' : 'text-[9px]'}`}
                            >
                                {u.label}
                            </span>
                        </div>
                        {i < units.length - 1 && (
                            <span
                                className={`font-bold ${
                                    isUrgent ? 'text-rose-400' : 'text-emerald-500'
                                } ${isLg ? '-mt-3 text-base' : '-mt-2 text-xs'}`}
                            >
                                :
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
