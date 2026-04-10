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
        const track = async () => {
            try {
                // We no longer fetch Geo data on the client to avoid CORS and AdBlock errors.
                // The backend will handle this using the requester's IP.
                await fetchApi('/statistics/track', {
                    method: 'POST',
                    body: JSON.stringify({
                        url: location.pathname,
                        userId: user?.id,
                    }),
                });
            } catch (err) {
                // Background tracking failures should never affect the user
            }
        };

        track();
    }, [location.pathname, user?.id]);
}
