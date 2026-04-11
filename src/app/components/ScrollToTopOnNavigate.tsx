import { useEffect } from 'react';
import { useLocation } from 'react-router';

export function ScrollToTopOnNavigate() {
    const { pathname } = useLocation();

    useEffect(() => {
        // Scroll the window to top for pages using the window scroll
        window.scrollTo(0, 0);

        // Also look for the dashboard main scrollable container if it exists
        const mainContent = document.querySelector('main.overflow-y-auto');
        if (mainContent) {
            mainContent.scrollTo(0, 0);
        }
    }, [pathname]);

    return null;
}
