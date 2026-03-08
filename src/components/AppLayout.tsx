import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { DesktopSidebar } from './DesktopSidebar';
import { BottomNav } from './BottomNav';
import { activeNavLabel } from '@/lib/navItems';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <DesktopSidebar />

      {/* Main content */}
      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-20 bg-background border-b border-border px-4 py-3">
          <span className="font-display font-semibold text-foreground text-base tracking-tight">
            {activeNavLabel(pathname)}
          </span>
        </header>

        {/* Page content */}
        <main className="flex-1 pb-24 lg:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}
