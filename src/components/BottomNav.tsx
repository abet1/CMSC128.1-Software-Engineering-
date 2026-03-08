import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { navItems, isNavActive } from '@/lib/navItems';

export function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-sidebar border-t border-sidebar-border safe-bottom">
      <div className="flex items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isNavActive(item.path, pathname);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-2 transition-colors"
            >
              <Icon
                className={cn(
                  'w-5 h-5 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              />
              <span
                className={cn(
                  'text-[10px] font-medium transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
