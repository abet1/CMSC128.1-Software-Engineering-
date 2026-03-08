import { LayoutDashboard, CalendarDays, Package, Users, CreditCard } from 'lucide-react';

export const navItems = [
  { path: '/',          label: 'Dashboard', icon: LayoutDashboard },
  { path: '/rentals',   label: 'Rentals',   icon: CalendarDays },
  { path: '/inventory', label: 'Inventory', icon: Package },
  { path: '/people',    label: 'People',    icon: Users },
  { path: '/payments',  label: 'Payments',  icon: CreditCard },
] as const;

export function isNavActive(itemPath: string, pathname: string): boolean {
  return itemPath === '/' ? pathname === '/' : pathname.startsWith(itemPath);
}

export function activeNavLabel(pathname: string): string {
  return navItems.find(item => isNavActive(item.path, pathname))?.label ?? 'Rental Tracker';
}
