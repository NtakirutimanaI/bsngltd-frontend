import { RouterProvider } from 'react-router';
import { router } from './routes.tsx';
import { AuthProvider } from '@/app/context/AuthContext';
import { LanguageProvider } from '@/app/context/LanguageContext';
import { CurrencyProvider } from '@/app/context/CurrencyContext';
import { ThemeProvider } from '@/app/context/ThemeContext';
import { SettingsProvider } from '@/app/context/SettingsContext';
import { NotificationProvider } from '@/app/context/NotificationContext';

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LanguageProvider>
          <SettingsProvider>
            <CurrencyProvider>
              <NotificationProvider>
                <RouterProvider router={router} />
              </NotificationProvider>
            </CurrencyProvider>
          </SettingsProvider>
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
