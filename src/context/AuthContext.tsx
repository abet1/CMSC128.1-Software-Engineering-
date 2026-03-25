import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  signInAsGuest: (name: string, email?: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'paymamaya_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Persist to localStorage whenever user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const signInAsGuest = (name: string, email?: string) => {
    const newUser: AuthUser = {
      id: `guest_${Date.now()}`,
      name: name.trim(),
      email: email?.trim() || undefined,
    };
    setUser(newUser);
  };

  const signOut = () => {
    setUser(null);
  };

  // TODO: wire Supabase here
  // const signInWithGoogle = () => supabase.auth.signInWithOAuth({ provider: 'google' })

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, signInAsGuest, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
