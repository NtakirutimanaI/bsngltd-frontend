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
                let geoData = { country_name: '', city: '' };
                try {
                    // Fetch geo location
                    const geoRes = await fetch('https://ipapi.co/json/');
                    if (geoRes.ok) {
                        geoData = await geoRes.json();
                    }
                } catch (e) {
                    console.debug('Geo fetch failed', e);
                }

                await fetchApi('/statistics/track', {
                    method: 'POST',
                    body: JSON.stringify({
                        url: location.pathname,
                        userId: user?.id,
                        country: geoData.country_name || 'Unknown',
                        city: geoData.city || 'Unknown',
                    }),
                });
            } catch (err) {
                console.debug('Tracking failed', err);
            }
        };

        track();
    }, [location.pathname, user?.id]);
}
