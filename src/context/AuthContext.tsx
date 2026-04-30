import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../lib/api';

interface User {
  id: string;
  email: string;
  name: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string) => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('auth_token');
        const storedCustomer = localStorage.getItem('customer');

        if (storedToken && storedCustomer) {
          setToken(storedToken);

          // Try to parse stored customer data
          try {
            const customer = JSON.parse(storedCustomer);
            setUser(customer);
          } catch (e) {
            console.error('Failed to parse stored customer data');
          }

          // Refresh user profile in background to ensure token is still valid
          await refreshUser(storedToken);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const refreshUser = async (authToken?: string) => {
    const currentToken = authToken || token;
    if (!currentToken) return;

    try {
      const customer = await authApi.getProfile();
      setUser(customer);
      // Update localStorage with fresh customer data
      localStorage.setItem('customer', JSON.stringify(customer));
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // Token invalid or expired, clear all auth data
      setToken(null);
      setUser(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('customer');
    }
  };

  const login = async (email: string) => {
    await authApi.sendOTP(email);
  };

  const verifyOTP = async (email: string, otp: string) => {
    const data = await authApi.verifyOTP(email, otp);

    // authApi.verifyOTP already stores token and customer in localStorage
    setToken(data.token);
    setUser(data.customer);

    // Emit custom event for cart sync
    window.dispatchEvent(new CustomEvent('auth:login', { detail: { token: data.token } }));
  };

  const logout = () => {
    // Clear all auth data
    authApi.logout();
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('customer');

    // Emit logout event
    window.dispatchEvent(new Event('auth:logout'));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        verifyOTP,
        logout,
        refreshUser: () => refreshUser(),
      }}
    >
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
