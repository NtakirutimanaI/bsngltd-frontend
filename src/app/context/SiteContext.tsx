import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchApi } from '../api/client';

interface Site {
  id: string;
  code: string;
  name: string;
  location: string;
  status: string;
}

interface SiteContextType {
  selectedSite: Site | null;
  setSelectedSite: (site: Site | null) => void;
  sites: Site[];
  loading: boolean;
  refreshSites: () => Promise<void>;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedSite, setSelectedSiteState] = useState<Site | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshSites = async () => {
    try {
      const res = await fetchApi<any>('/sites?limit=100'); // Get enough sites for switcher
      const data = Array.isArray(res) ? res : (res.data || []);
      setSites(data);
      
      // If there's a saved site ID, try to restore it
      const savedSiteId = localStorage.getItem('selectedSiteId');
      if (savedSiteId && data.length > 0) {
        const found = data.find((s: Site) => s.id === savedSiteId);
        if (found) {
          setSelectedSiteState(found);
        }
      }
    } catch (error) {
      console.error("Failed to load sites in context", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSites();
  }, []);

  const setSelectedSite = (site: Site | null) => {
    setSelectedSiteState(site);
    if (site) {
      localStorage.setItem('selectedSiteId', site.id);
    } else {
      localStorage.removeItem('selectedSiteId');
    }
  };

  return (
    <SiteContext.Provider value={{ selectedSite, setSelectedSite, sites, loading, refreshSites }}>
      {children}
    </SiteContext.Provider>
  );
};

export const useSite = () => {
  const context = useContext(SiteContext);
  if (context === undefined) {
    throw new Error('useSite must be used within a SiteProvider');
  }
  return context;
};
