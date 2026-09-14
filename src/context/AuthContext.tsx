import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, UserRole } from '../models/auth';
import { AuthService, DemoAccount } from '../services/auth/authService';
import { isSupabaseConfigured, supabase } from '../services/supabase/client';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isBackendConfigured: boolean;
  setUser: (user: UserProfile | null) => void;
  setRole: (role: UserRole) => Promise<boolean>;
  signInWithEmail: (email: string, pass: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (email: string, pass: string, fullName: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  loginDemoAccount: (demo: DemoAccount) => Promise<UserProfile>;
  sendOtp: (phone: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (phone: string, token: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Restore session from Supabase or AsyncStorage
    AuthService.getCurrentUser()
      .then(profile => {
        if (profile) setUser(profile);
      })
      .finally(() => {
        setIsLoading(false);
      });

    // Listen to Supabase auth state changes if configured
    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const profile = await AuthService.getCurrentUser();
          setUser(profile);
        } else {
          setUser(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const signInWithEmail = async (email: string, pass: string, role?: UserRole) => {
    setIsLoading(true);
    try {
      const res = await AuthService.signInWithEmail(email, pass, role);
      if (res.success && res.user) {
        setUser(res.user);
        return { success: true };
      }
      return { success: false, error: res.errorMessage || 'Invalid email or password' };
    } finally {
      setIsLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, fullName: string, role: UserRole) => {
    setIsLoading(true);
    try {
      const res = await AuthService.signUpWithEmail(email, pass, fullName, role);
      if (res.success && res.user) {
        setUser(res.user);
        return { success: true };
      }
      return { success: false, error: res.errorMessage || 'Registration failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const loginDemoAccount = async (demo: DemoAccount) => {
    setIsLoading(true);
    try {
      const profile = await AuthService.loginDemoAccount(demo);
      setUser(profile);
      return profile;
    } finally {
      setIsLoading(false);
    }
  };

  const sendOtp = async (phone: string) => {
    const res = await AuthService.sendPhoneOtp(phone);
    return { success: res.success, error: res.errorMessage };
  };

  const verifyOtp = async (phone: string, token: string, role: UserRole = 'artisan') => {
    setIsLoading(true);
    try {
      const res = await AuthService.verifyPhoneOtp(phone, token, role);
      if (res.success && res.user) {
        setUser(res.user);
        return { success: true };
      }
      return { success: false, error: res.errorMessage || 'Invalid OTP' };
    } finally {
      setIsLoading(false);
    }
  };

  const setRole = async (role: UserRole) => {
    if (!user) return false;
    const ok = await AuthService.updateRole(user.id, role);
    if (ok) {
      setUser(prev => (prev ? { ...prev, role } : null));
    }
    return ok;
  };

  const logout = async () => {
    await AuthService.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: Boolean(user),
        isBackendConfigured: isSupabaseConfigured,
        setUser,
        setRole,
        signInWithEmail,
        signUpWithEmail,
        loginDemoAccount,
        sendOtp,
        verifyOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
