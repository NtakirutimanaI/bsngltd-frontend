import React, { createContext, useContext, useEffect, useState } from 'react';
import { SettingsService, Setting } from '../services/settings.service';

interface SettingsContextType {
    settings: Record<string, string>;
    isLoading: boolean;
    getSetting: (key: string, defaultValue?: string) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchSettings() {
            try {
                const data = await SettingsService.getPublicSettings();
                const settingsMap: Record<string, string> = {};
                data.forEach((s) => {
                    settingsMap[s.key] = s.value;
                });
                setSettings(settingsMap);
            } catch (error) {
                console.error('Failed to fetch settings:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchSettings();
    }, []);

    const getSetting = (key: string, defaultValue: string = '') => {
        return settings[key] || defaultValue;
    };

    return (
        <SettingsContext.Provider value={{ settings, isLoading, getSetting }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
