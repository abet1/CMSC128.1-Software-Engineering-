import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signInAsGuest: (name: string, email?: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const toAuthUser = (id: string, email?: string, name?: string): AuthUser => ({
    id,
    email: email ?? undefined,
    name: name?.trim() || email?.split('@')[0] || 'Guest',
  });

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error || !data.session?.user) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const sessionUser = data.session.user;
      setUser(
        toAuthUser(
          sessionUser.id,
          sessionUser.email,
          (sessionUser.user_metadata?.full_name as string | undefined) ??
            (sessionUser.user_metadata?.name as string | undefined)
        )
      );
      setIsLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (!session?.user) {
        setUser(null);
        return;
      }
      const sessionUser = session.user;
      setUser(
        toAuthUser(
          sessionUser.id,
          sessionUser.email,
          (sessionUser.user_metadata?.full_name as string | undefined) ??
            (sessionUser.user_metadata?.name as string | undefined)
        )
      );
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signInAsGuest = async (name: string, email?: string) => {
    const displayName = name.trim();
    if (!displayName) return;

    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured');
    }

    const { data, error } = await supabase.auth.signInAnonymously({
      options: {
        data: {
          full_name: displayName,
          email: email?.trim() || undefined,
        },
      },
    });
    if (error) throw error;

    const anonUser = data.user;
    if (!anonUser) throw new Error('Anonymous sign in did not return a user');
    setUser(toAuthUser(anonUser.id, email?.trim() || undefined, displayName));
  };

  const signOut = () => {
    if (!isSupabaseConfigured) {
      setUser(null);
      return;
    }
    void supabase.auth.signOut().finally(() => setUser(null));
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      signInAsGuest,
      signOut,
    }),
    [user, isLoading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
