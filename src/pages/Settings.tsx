import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { currentUser } from '@/data/user';
import { User, Bell, Shield, HelpCircle, LogOut, ChevronRight, Palette, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const [notifications, setNotifications] = useState(true);
  const { toast } = useToast();

  const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();

  const menuItems = [
    { icon: User, label: 'Account', description: 'Manage your profile', onClick: () => {} },
    { icon: Shield, label: 'Security', description: 'Password & privacy', onClick: () => {} },
    { icon: Palette, label: 'Appearance', description: 'Theme & display', onClick: () => {} },
    { icon: Globe, label: 'Language', description: 'English (PH)', onClick: () => {} },
    { icon: HelpCircle, label: 'Help & Support', description: 'FAQs and contact', onClick: () => {} },
  ];

  return (
    <AppLayout title="Settings">
      <div className="px-4 lg:px-8 py-4 lg:py-6">
        <div className="max-w-4xl mx-auto space-y-6 lg:space-y-8">
          {/* Mobile Title */}
          <h1 className="lg:hidden font-display text-2xl font-bold text-foreground animate-fade-in">Settings</h1>

          {/* Profile Card */}
          <div className="bg-card rounded-2xl p-5 lg:p-6 border border-border/50 shadow-soft animate-fade-in stagger-1">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold text-xl lg:text-2xl">{initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-display font-semibold text-lg lg:text-xl text-foreground">{currentUser.name}</h2>
                <p className="text-sm lg:text-base text-muted-foreground truncate">{currentUser.email}</p>
              </div>
              <button className="px-4 py-2 lg:px-5 lg:py-2.5 rounded-xl bg-muted text-sm lg:text-base font-medium text-foreground hover:bg-muted/80 transition-all active:scale-[0.98]">
                Edit
              </button>
            </div>
          </div>

          {/* Quick Settings */}
          <div className="bg-card rounded-2xl border border-border/50 shadow-soft divide-y divide-border animate-fade-in stagger-2">
            <div className="flex items-center justify-between p-4 lg:p-5">
              <div className="flex items-center gap-3 lg:gap-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bell className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground lg:text-base">Notifications</p>
                  <p className="text-sm lg:text-base text-muted-foreground">Payment reminders & alerts</p>
                </div>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>
            
          </div>

          {/* Menu Items */}
          <div className="bg-card rounded-2xl border border-border/50 shadow-soft divide-y divide-border animate-fade-in stagger-3">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button 
                  key={item.label} 
                  onClick={item.onClick}
                  className={cn(
                    "w-full flex items-center gap-3 lg:gap-4 p-4 lg:p-5 hover:bg-muted/50 transition-colors active:scale-[0.99]",
                    index === 0 && "rounded-t-2xl",
                    index === menuItems.length - 1 && "rounded-b-2xl"
                  )}
                >
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 lg:w-6 lg:h-6 text-foreground" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-medium text-foreground lg:text-base">{item.label}</p>
                    <p className="text-sm lg:text-base text-muted-foreground truncate">{item.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                </button>
              );
            })}
          </div>

          {/* App Info */}
          <div className="bg-card rounded-2xl p-4 lg:p-5 border border-border/50 shadow-soft animate-fade-in stagger-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 text-sm lg:text-base">
              <div>
                <span className="text-muted-foreground block mb-1">App Version</span>
                <p className="font-medium text-foreground">1.0.0</p>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Currency</span>
                <p className="font-medium text-foreground">PHP (₱)</p>
              </div>
              <div className="lg:col-span-2">
                <span className="text-muted-foreground block mb-1">Build</span>
                <p className="font-medium text-foreground">Production</p>
              </div>
            </div>
          </div>

          {/* Logout */}
          <button className="w-full flex items-center justify-center gap-2 p-4 lg:p-5 rounded-2xl border border-destructive/20 text-destructive font-medium hover:bg-destructive/5 transition-all active:scale-[0.98] animate-fade-in stagger-5">
            <LogOut className="w-5 h-5" />
            Log Out
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
