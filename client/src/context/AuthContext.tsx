import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, Kitchen, KitchenMembership } from '../types';
import { api, setActiveKitchenId, getActiveKitchenId } from '../services/api';

interface AuthContextType {
  user: User | null;
  activeKitchen: Kitchen | null;
  memberships: KitchenMembership[];
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  switchKitchen: (kitchenId: string) => void;
  refreshUser: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activeKitchen, setActiveKitchen] = useState<Kitchen | null>(null);
  const [memberships, setMemberships] = useState<KitchenMembership[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.success && res.user) {
        setUser(res.user);
        setMemberships(res.memberships || []);
        if (res.activeKitchen) {
          setActiveKitchen(res.activeKitchen);
          setActiveKitchenId(res.activeKitchen.id);
        }
      } else {
        setUser(null);
        setActiveKitchen(null);
        setActiveKitchenId(null);
      }
    } catch (err) {
      setUser(null);
      setActiveKitchen(null);
      setActiveKitchenId(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success) {
      setUser(res.user);
      setMemberships(res.memberships || []);
      if (res.activeKitchen) {
        setActiveKitchen(res.activeKitchen);
        setActiveKitchenId(res.activeKitchen.id);
      } else {
        setActiveKitchen(null);
        setActiveKitchenId(null);
      }
      return res;
    }
    return res;
  };

  const register = async (data: any) => {
    const res = await api.post('/auth/register', data);
    if (res.success) {
      setUser(res.user);
      if (res.activeKitchen) {
        setActiveKitchen(res.activeKitchen);
        setActiveKitchenId(res.activeKitchen.id);
      }
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
      setActiveKitchen(null);
      setMemberships([]);
      setActiveKitchenId(null);
    }
  };

  const switchKitchen = (kitchenId: string) => {
    setActiveKitchenId(kitchenId);
    fetchCurrentUser();
  };

  const completeOnboarding = async () => {
    const res = await api.post('/kitchens/onboarding/complete');
    if (res.success && activeKitchen) {
      setActiveKitchen({ ...activeKitchen, onboardingCompleted: true });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeKitchen,
        memberships,
        loading,
        login,
        register,
        logout,
        switchKitchen,
        refreshUser: fetchCurrentUser,
        completeOnboarding
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
