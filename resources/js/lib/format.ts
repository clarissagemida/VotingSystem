/**
 * Shared date/time formatters for the voter UI.
 * Controllers send dates as `Y-m-d H:i:s`; the space must be
 * replaced with `T` so `new Date()` parses reliably (Safari).
 */

export function formatDateTime(dateStr: string | null): string {
    if (!dateStr) return '—';
    return new Date(dateStr.replace(' ', 'T')).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

export function formatDateTimeLong(dateStr: string | null): string {
    if (!dateStr) return '—';
    return new Date(dateStr.replace(' ', 'T')).toLocaleString('en-US', {
        weekday: 'short',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

export function formatDate(dateStr: string | null): string {
    if (!dateStr) return '—';
    return new Date(dateStr.replace(' ', 'T')).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export function formatTime(dateStr: string | null): string {
    if (!dateStr) return '';
    return new Date(dateStr.replace(' ', 'T')).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}
