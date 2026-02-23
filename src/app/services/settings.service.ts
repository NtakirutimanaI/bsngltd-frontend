import { fetchApi } from '@/app/api/client';

export interface Setting {
    key: string;
    value: string;
    description?: string;
    group: string;
}

export const SettingsService = {
    getPublicSettings: async (): Promise<Setting[]> => {
        return fetchApi<Setting[]>('/settings/public');
    },
};
