import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchApi } from '../api/client';

interface Role {
  id: string;
  name: string;
  description: string;
  level: number;
  isSystemRole: boolean;
  createdAt: string;
}

interface User {
  id: string;
  name?: string;
  fullName: string;
  email: string;
  role: Role | string;
  phone?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Wrapper that keeps localStorage in sync with React state
  const setUser = (updatedUser: User | null) => {
    setUserState(updatedUser);
    if (updatedUser) {
      localStorage.setItem('bsng_user', JSON.stringify(updatedUser));
    } else {
      localStorage.removeItem('bsng_user');
    }
  };

  // Re-fetches the latest user data from the API and syncs everywhere
  const refreshUser = async () => {
    const storedUser = localStorage.getItem('bsng_user');
    if (!storedUser) return;
    const localUser: User = JSON.parse(storedUser);
    if (!localUser?.id) return;
    try {
      const freshUser = await fetchApi<User>(`/users/${localUser.id}`);
      if (freshUser) setUser(freshUser);
    } catch {
      // Silently fail — keep existing user
    }
  };

  useEffect(() => {
    // Restore from localStorage, then immediately refresh from API
    const storedUser = localStorage.getItem('bsng_user');
    if (storedUser) {
      setUserState(JSON.parse(storedUser));
    }
    setIsLoading(false);
    // Refresh avatar/profile from backend in background
    if (storedUser) {
      const localUser: User = JSON.parse(storedUser);
      if (localUser?.id) {
        fetchApi<User>(`/users/${localUser.id}`)
          .then((freshUser) => { if (freshUser) setUser(freshUser); })
          .catch(() => {});
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetchApi<{ access_token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      const { user, access_token } = response;

      setUser(user);
      localStorage.setItem('bsng_user', JSON.stringify(user));
      localStorage.setItem('bsng_token', access_token);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    setUserState(null);
    localStorage.removeItem('bsng_user');
    localStorage.removeItem('bsng_token');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout,
      isLoading,
      setUser,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
