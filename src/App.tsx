import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './app/routes.tsx';
import { AuthProvider } from './app/context/AuthContext';
import { LanguageProvider } from './app/context/LanguageContext';
import { CurrencyProvider } from './app/context/CurrencyContext';
import { ThemeProvider } from './app/context/ThemeContext';
import { SettingsProvider } from './app/context/SettingsContext';
import { NotificationProvider } from './app/context/NotificationContext';
import { CartProvider } from './app/context/CartContext';
import { SiteProvider } from './app/context/SiteContext';
import { Toaster } from "./app/components/ui/sonner";

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LanguageProvider>
          <SettingsProvider>
            <CurrencyProvider>
              <NotificationProvider>
                <CartProvider>
                  <SiteProvider>
                    <RouterProvider router={router} />
                    <Toaster position="top-center" richColors closeButton />
                  </SiteProvider>
                </CartProvider>
              </NotificationProvider>
            </CurrencyProvider>
          </SettingsProvider>
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
