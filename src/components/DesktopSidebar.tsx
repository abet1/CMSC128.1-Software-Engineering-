import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { navItems, isNavActive } from '@/lib/navItems';
import { PlusCircle, TrendingUp, TrendingDown, Receipt } from 'lucide-react';

const quickActions = [
  { label: 'Lend',    path: '/lend',    icon: TrendingUp,   color: 'text-emerald-400' },
  { label: 'Borrow',  path: '/borrow',  icon: TrendingDown, color: 'text-red-400' },
  { label: 'Expense', path: '/expense', icon: Receipt,      color: 'text-amber-400' },
];

export function DesktopSidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="hidden lg:flex flex-col w-72 h-screen bg-sidebar fixed left-0 top-0 border-r border-sidebar-border">

      {/* Brand */}
      <div className="px-5 pt-6 pb-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div>
            <p className="font-display font-bold text-foreground text-[15px] tracking-tight leading-tight">PayMamaya</p>
            <p className="text-[10px] text-muted-foreground leading-tight mt-0.5 tracking-wide uppercase">Loans & Expenses</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-hide space-y-0.5">
        <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-[0.12em] px-3 mb-2 mt-1">
          Navigate
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isNavActive(item.path, pathname);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <Icon className={cn('w-4 h-4 shrink-0 transition-transform duration-150', isActive ? '' : 'group-hover:scale-110')} />
              <span className="flex-1">{item.label}</span>
              {!isActive && (
                <div className="w-1 h-1 rounded-full bg-sidebar-foreground/0 group-hover:bg-sidebar-foreground/30 transition-colors" />
              )}
            </NavLink>
          );
        })}

        {/* Quick Actions */}
        <div className="pt-4 mt-2 border-t border-sidebar-border">
          <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-[0.12em] px-3 mb-2">
            Quick Add
          </p>
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className="group w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-150"
              >
                <div className="w-6 h-6 rounded-lg bg-sidebar-accent flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Icon className={cn('w-3.5 h-3.5', action.color)} />
                </div>
                <span>{action.label}</span>
                <PlusCircle className="w-3.5 h-3.5 ml-auto text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
              </button>
            );
          })}
        </div>
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-sidebar-accent transition-colors cursor-default group">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
            <span className="text-primary text-xs font-bold font-display">A</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground truncate leading-tight">Admin</p>
            <p className="text-[10px] text-muted-foreground truncate leading-tight mt-0.5">Personal workspace</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-primary shrink-0" title="Online" />
        </div>
      </div>
    </aside>
  );
}
