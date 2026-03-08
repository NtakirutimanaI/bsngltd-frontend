import { Outlet, Link } from 'react-router';
import { PublicHeader } from '@/app/components/PublicHeader';
import { Footer } from '@/app/components/Footer';
import { ScrollToTop } from '@/app/components/ScrollToTop';
import { ScrollToTopOnNavigate } from '@/app/components/ScrollToTopOnNavigate';
import { Chatbot } from '@/app/components/Chatbot';

import { useEffect, useState } from 'react';
import { useTracker } from '@/app/hooks/useTracker';
import { useAuth } from '@/app/context/AuthContext';
import { fetchApi } from '@/app/api/client';
import { Lock, Settings, Loader2 } from 'lucide-react';

export function PublicLayout() {
  useTracker();
  const { user } = useAuth();
  const [status, setStatus] = useState<string>('active');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('dark');
    root.classList.add('light');
    root.setAttribute('data-bs-theme', 'light');

    fetchApi<any[]>(`/settings/public?t=${Date.now()}`)
      .then(settings => {
        const statusSetting = settings.find(s => s.key === 'website_status');
        if (statusSetting) {
          setStatus(statusSetting.value);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const roleName = ((typeof user?.role === 'object' && user.role !== null) ? user.role.name : user?.role || 'guest').toLowerCase();
  const isAdminLike = ['super_admin', 'admin', 'manager', 'site_manager'].includes(roleName);

  if (loading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center bg-white">
        <Loader2 className="animate-spin text-primary" size={48} style={{ color: '#16a085' }} />
      </div>
    );
  }

  // If website is not active and user isn't an admin, show blocking page
  if (status !== 'active' && !isAdminLike) {
    const isMaintenance = status === 'maintenance';
    return (
      <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center bg-light text-center px-4">
        {isMaintenance ? (
          <Settings className="text-primary mb-4 animate-spin" size={80} style={{ color: '#16a085', animationDuration: '3s' }} />
        ) : (
          <Lock className="text-secondary mb-4" size={80} />
        )}
        <h1 className="display-4 fw-bold text-dark mb-3">
          {isMaintenance ? "Under Maintenance" : "Website Disabled"}
        </h1>
        <p className="lead text-muted mb-5" style={{ maxWidth: '600px' }}>
          {isMaintenance
            ? "We're currently performing some scheduled maintenance. We'll be back online shortly. Thank you for your patience."
            : "This website is currently inactive and not accepting public visitors. Please check back later."}
        </p>
        <Link to="/login" className="btn btn-outline-dark px-4 py-2 rounded-pill">
          Admin Login
        </Link>
      </div>
    );
  }

  return (
    <>
      <ScrollToTopOnNavigate />
      {/* If it's a blocked status but admin is viewing, show a warning banner */}
      {status !== 'active' && isAdminLike && (
        <div className="bg-warning text-dark text-center py-2 px-4 shadow-sm position-fixed top-0 w-100 z-50 fw-bold" style={{ zIndex: 9999 }}>
          ⚠️ You are viewing the site in {status.toUpperCase()} mode. This is hidden from the public.
        </div>
      )}
      <div style={{ paddingTop: status !== 'active' && isAdminLike ? '40px' : '0' }}>
        <PublicHeader />
        <Outlet />
        <Footer />
        <ScrollToTop />
        <Chatbot />
      </div>
    </>
  );
}
