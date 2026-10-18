import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
    interface Window {
        Echo: Echo<'reverb'>;
        Pusher: typeof Pusher;
    }
}

const reverbScheme = (import.meta.env.VITE_REVERB_SCHEME as string) || 'http';

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'reverb',
    key: (import.meta.env.VITE_REVERB_APP_KEY as string) || 'voter-system',
    wsHost: (import.meta.env.VITE_REVERB_HOST as string) || '127.0.0.1',
    wsPort: Number(import.meta.env.VITE_REVERB_PORT) || 8080,
    forceTLS: reverbScheme === 'https',
    enabledTransports: ['ws', 'wss'],
});

export default window.Echo;
