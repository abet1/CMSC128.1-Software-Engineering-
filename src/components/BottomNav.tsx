import { useState } from 'react';
import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { Home, FileText, Users, Settings, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { QuickPaymentSheet } from '@/components/QuickPaymentSheet';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/records', label: 'Records', icon: FileText },
  { path: '/people', label: 'People', icon: Users },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function BottomNav() {
  const location = useLocation();
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);

  return (
    <>
      <nav className="fixed bottom-4 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] lg:w-auto lg:min-w-[600px] max-w-2xl bg-card border border-border rounded-2xl shadow-xl safe-bottom">
        <div className="flex items-center h-16 lg:h-18 relative px-4 lg:px-6">
          {/* Left side nav items */}
          {navItems.slice(0, 2).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <div key={item.path} className="flex-1 flex justify-center">
                <RouterNavLink
                  to={item.path}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 py-1.5 rounded-lg transition-colors duration-200",
                    isActive 
                      ? "text-primary" 
                      : "text-muted-foreground"
                  )}
                >
                  <div className={cn(
                    "flex items-center justify-center w-10 h-7 lg:w-12 lg:h-8 rounded-lg transition-colors",
                    isActive && "bg-primary/10"
                  )}>
                    <Icon className={cn(
                      "w-5 h-5 lg:w-6 lg:h-6",
                      isActive && "scale-110"
                    )} />
                  </div>
                  <span className={cn(
                    "text-[10px] lg:text-xs font-medium",
                    isActive && "font-semibold"
                  )}>
                    {item.label}
                  </span>
                </RouterNavLink>
              </div>
            );
          })}
          
          {/* Plus Button - Floating on mobile, circular inline on desktop */}
          <div className="flex-1 flex justify-center">
            <button
              onClick={() => setShowPaymentSheet(true)}
              className={cn(
                "absolute lg:relative left-1/2 lg:left-auto -translate-x-1/2 lg:translate-x-0 -top-6 lg:top-0",
                "w-14 h-14 lg:w-14 lg:h-14 rounded-full",
                "bg-primary text-primary-foreground flex items-center justify-center",
                "shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 z-10",
                "lg:shadow-md lg:hover:shadow-lg"
              )}
              aria-label="Record Payment"
            >
              <Plus className="w-6 h-6 lg:w-6 lg:h-6" />
            </button>
          </div>
          
          {/* Right side nav items */}
          {navItems.slice(2).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <div key={item.path} className="flex-1 flex justify-center">
                <RouterNavLink
                  to={item.path}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 py-1.5 rounded-lg transition-colors duration-200",
                    isActive 
                      ? "text-primary" 
                      : "text-muted-foreground"
                  )}
                >
                  <div className={cn(
                    "flex items-center justify-center w-10 h-7 lg:w-12 lg:h-8 rounded-lg transition-colors",
                    isActive && "bg-primary/10"
                  )}>
                    <Icon className={cn(
                      "w-5 h-5 lg:w-6 lg:h-6",
                      isActive && "scale-110"
                    )} />
                  </div>
                  <span className={cn(
                    "text-[10px] lg:text-xs font-medium",
                    isActive && "font-semibold"
                  )}>
                    {item.label}
                  </span>
                </RouterNavLink>
              </div>
            );
          })}
        </div>
      </nav>
      
      <QuickPaymentSheet open={showPaymentSheet} onOpenChange={setShowPaymentSheet} />
    </>
  );
}
