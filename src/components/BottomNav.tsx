import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { navItems, isNavActive } from '@/lib/navItems';

export function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="lg:hidden fixed left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-sm" style={{ bottom: 'max(20px, calc(env(safe-area-inset-bottom, 0px) + 8px))' }}>
      <div className="flex items-center justify-around bg-card border border-border/60 rounded-full px-3 py-3 shadow-2xl shadow-black/60">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isNavActive(item.path, pathname);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              aria-label={item.label}
              className={cn(
                'w-11 h-11 flex items-center justify-center rounded-full transition-all duration-150',
                isActive
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground/60 hover:text-muted-foreground hover:bg-white/5'
              )}
            >
              <Icon className="w-5 h-5" />
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
