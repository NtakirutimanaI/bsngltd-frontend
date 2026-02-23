import { Outlet } from 'react-router';
import { PublicHeader } from '@/app/components/PublicHeader';
import { Footer } from '@/app/components/Footer';
import { ScrollToTop } from '@/app/components/ScrollToTop';
import { Chatbot } from '@/app/components/Chatbot';

import { useEffect } from 'react';
import { useTracker } from '@/app/hooks/useTracker';

export function PublicLayout() {
  useTracker();
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('dark');
    root.classList.add('light');
    root.setAttribute('data-bs-theme', 'light');
  }, []);

  return (
    <>
      <PublicHeader />
      <Outlet />
      <Footer />
      <ScrollToTop />
      <Chatbot />
    </>
  );
}
