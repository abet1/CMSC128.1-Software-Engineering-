import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DesktopSidebar } from './DesktopSidebar';
import { BottomNav } from './BottomNav';
import { useAuth } from '@/context/AuthContext';
import { SETTINGS_EVENT, SETTINGS_KEY } from '@/lib/settings';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.name ?? 'Guest');

  useEffect(() => {
    const readDisplayName = () => {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (!saved) {
        setDisplayName(user?.name ?? 'Guest');
        return;
      }

      try {
        const parsed = JSON.parse(saved) as { displayName?: string };
        setDisplayName(parsed.displayName?.trim() || user?.name || 'Guest');
      } catch {
        setDisplayName(user?.name ?? 'Guest');
      }
    };

    readDisplayName();
    window.addEventListener(SETTINGS_EVENT, readDisplayName);
    window.addEventListener('storage', readDisplayName);

    return () => {
      window.removeEventListener(SETTINGS_EVENT, readDisplayName);
      window.removeEventListener('storage', readDisplayName);
    };
  }, [user?.name]);

  const initials = displayName
    ? displayName
        .trim()
        .split(/\s+/)
        .map(part => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '?';

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <DesktopSidebar />

      {/* Main content */}
      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="font-display text-lg font-bold tracking-tight text-foreground transition-colors active:scale-95"
            >
              PayMamaya
            </button>
            <button
              type="button"
              onClick={() => navigate('/settings')}
              aria-label="Open account settings"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 bg-primary/15 text-primary transition-colors active:scale-95"
            >
              <span className="font-display text-xs font-bold leading-none">{initials}</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 pb-32 lg:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}
