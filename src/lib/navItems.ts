import { LayoutDashboard, CalendarDays, Package, Users, CreditCard, BarChart3 } from 'lucide-react';

export const navItems = [
  { path: '/',          label: 'Dashboard', icon: LayoutDashboard },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 }, // <-- YOUR NEW TAB IS HERE
  { path: '/rentals',   label: 'Rentals',   icon: CalendarDays },
  { path: '/inventory', label: 'Inventory', icon: Package },
  { path: '/people',    label: 'People',    icon: Users },
  { path: '/payments',  label: 'Payments',  icon: CreditCard },
] as const;

export function isNavActive(itemPath: string, pathname: string): boolean {
  return itemPath === '/' ? pathname === '/' : pathname.startsWith(itemPath);
}

export function activeNavLabel(pathname: string): string {
  // Updated the fallback name from 'Rental Tracker' to your actual project name
  return navItems.find(item => isNavActive(item.path, pathname))?.label ?? 'PayMama'; 
}