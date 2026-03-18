import { Home, FileText, Users, CreditCard, BarChart3 } from 'lucide-react';

export const navItems = [
  { path: '/',          label: 'Home',     icon: Home },
  { path: '/records',   label: 'Loans',    icon: FileText },
  { path: '/people',    label: 'People',   icon: Users },
  { path: '/payments',  label: 'Payments', icon: CreditCard },
  { path: '/analytics', label: 'Analytics',icon: BarChart3 },
] as const;

export function isNavActive(itemPath: string, pathname: string): boolean {
  return itemPath === '/' ? pathname === '/' : pathname.startsWith(itemPath);
}

export function activeNavLabel(pathname: string): string {
  return navItems.find(item => isNavActive(item.path, pathname))?.label ?? 'PayMamaya';
}
