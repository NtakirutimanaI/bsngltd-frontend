import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useAuth } from '@/app/context/AuthContext';
import { fetchApi } from '../api/client';

export function useTracker() {
    const location = useLocation();
    let auth: { user: any | null } | null = null;
    try {
        auth = useAuth();
    } catch {
        // useAuth might throw if not inside AuthProvider, which is fine for tracking
    }
    const user = auth?.user;

    useEffect(() => {
        // Only track in production or if needed.
        const track = async () => {
            try {
                // Simple geo detection mock or use a service like ipapi.co
                // For now, we just send the basics.
                await fetchApi('/statistics/track', {
                    method: 'POST',
                    body: JSON.stringify({
                        url: location.pathname,
                        userId: user?.id,
                        // You can integrate an IP geo service here
                    }),
                });
            } catch (err) {
                // Silently fail as tracking shouldn't break the UI
                console.debug('Tracking failed', err);
            }
        };

        track();
    }, [location.pathname, user?.id]);
}
