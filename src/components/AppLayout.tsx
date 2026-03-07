import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { NotificationBell } from './NotificationBell';
import { currentUser } from '@/data/user';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  showHeader?: boolean;
}

export function AppLayout({ children, title, showHeader = false }: AppLayoutProps) {
  const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Always visible on desktop, conditional on mobile */}
      <header className="sticky top-0 z-30 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 lg:px-8 py-3.5 lg:py-4">
          <div className="flex items-center gap-3">
            <Link 
              to="/"
              className="cursor-pointer hover:opacity-80 transition-opacity"
            >
              <img 
                src="/PayMamaLogo.png" 
                alt="PayMama" 
                className="w-14 h-14 object-contain"
              />
            </Link>
            <div className="hidden lg:block">
              {title && <h1 className="font-display text-2xl font-bold text-foreground">{title}</h1>}
            </div>
            {showHeader && (
              <div className="lg:hidden">
                <p className="text-xs text-muted-foreground leading-none mb-0.5">Hello</p>
                <p className="font-semibold text-foreground text-[15px] leading-tight">{currentUser.name.split(' ')[0]}</p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-bold text-sm">{initials}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="pb-24 lg:pb-24 min-h-screen">
        {children}
      </main>

      {/* Floating Bottom Navigation - Desktop & Mobile */}
      <BottomNav />
    </div>
  );
}
