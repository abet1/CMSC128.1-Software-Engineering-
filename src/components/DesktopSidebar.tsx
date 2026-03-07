import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, FileText, Users, Settings, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { QuickPaymentSheet } from '@/components/QuickPaymentSheet';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/records', label: 'Records', icon: FileText },
  { path: '/people', label: 'People', icon: Users },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function DesktopSidebar() {
  const location = useLocation();
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);

  return (
    <>
      <aside className="hidden lg:flex flex-col w-72 h-screen bg-card fixed left-0 top-0 border-r border-border shadow-sm">
        {/* Logo Section */}
        <div className="flex items-center justify-center p-6 border-b border-border">
          <img 
            src="/PayMama.png" 
            alt="PayMama" 
            className="w-full max-w-[200px] h-auto object-contain"
          />
        </div>

        {/* Record Payment Button */}
        <div className="p-4">
          <button
            onClick={() => setShowPaymentSheet(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-sm hover:shadow-md"
          >
            <CreditCard className="w-5 h-5" />
            <span>Record Payment</span>
          </button>
        </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors duration-200",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-bold text-sm">JC</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">Josh Cimanes</p>
            <p className="text-xs text-muted-foreground truncate">josh@email.com</p>
          </div>
        </div>
      </div>
    </aside>
    <QuickPaymentSheet open={showPaymentSheet} onOpenChange={setShowPaymentSheet} />
    </>
  );
}
