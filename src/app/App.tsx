import { RouterProvider } from 'react-router';
import { router } from './routes.tsx';
import { AuthProvider } from '@/app/context/AuthContext';
import { LanguageProvider } from '@/app/context/LanguageContext';
import { CurrencyProvider } from '@/app/context/CurrencyContext';
import { ThemeProvider } from '@/app/context/ThemeContext';
import { SettingsProvider } from '@/app/context/SettingsContext';
import { NotificationProvider } from '@/app/context/NotificationContext';

import { SiteProvider } from './context/SiteContext';
import { Toaster } from "@/app/components/ui/sonner";

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LanguageProvider>
          <SettingsProvider>
            <CurrencyProvider>
              <NotificationProvider>
                <SiteProvider>
                  <RouterProvider router={router} />
                  <Toaster position="top-center" richColors closeButton />
                </SiteProvider>
              </NotificationProvider>
            </CurrencyProvider>
          </SettingsProvider>
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
