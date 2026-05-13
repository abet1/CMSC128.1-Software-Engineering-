import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, ChevronRight, HelpCircle, LogOut, Palette, Shield } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { isSelfPerson } from '@/lib/people';
import { SETTINGS_EVENT, SETTINGS_KEY } from '@/lib/settings';

type PreferenceState = {
  displayName: string;
  notifications: boolean;
  compactRecords: boolean;
};

const defaultPreferences = (name: string): PreferenceState => ({
  displayName: name,
  notifications: true,
  compactRecords: false,
});

const Settings = () => {
  const navigate = useNavigate();
  const { user, signOut, updateProfileName } = useAuth();
  const { persons, updatePerson } = useApp();
  const { toast } = useToast();
  const fallbackName = user?.name ?? 'Guest';
  const [preferences, setPreferences] = useState<PreferenceState>(() => defaultPreferences(fallbackName));
  const [isSaving, setIsSaving] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saved'>('idle');

  useEffect(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (!saved) {
      setPreferences(defaultPreferences(fallbackName));
      return;
    }

    try {
      const parsed = JSON.parse(saved) as Partial<PreferenceState>;
      setPreferences({
        ...defaultPreferences(fallbackName),
        ...parsed,
        displayName: parsed.displayName?.trim() || fallbackName,
      });
    } catch {
      localStorage.removeItem(SETTINGS_KEY);
      setPreferences(defaultPreferences(fallbackName));
    }
  }, [fallbackName]);

  const initials = useMemo(() => {
    return preferences.displayName
      .trim()
      .split(/\s+/)
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?';
  }, [preferences.displayName]);

  const handleSave = async () => {
    const nextPreferences = {
      ...preferences,
      displayName: preferences.displayName.trim() || fallbackName,
    };

    setIsSaving(true);
    setSaveState('idle');

    try {
      const updatedUser = await updateProfileName(nextPreferences.displayName);
      persons
        .filter(person => isSelfPerson(person, updatedUser))
        .forEach(person => updatePerson(person.id, { name: nextPreferences.displayName }));
      setPreferences(nextPreferences);
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(nextPreferences));
      window.dispatchEvent(new CustomEvent(SETTINGS_EVENT, { detail: nextPreferences }));
      setSaveState('saved');
      toast({
        title: 'Changes saved',
        description: 'Your profile name was updated in Supabase.',
      });
      window.setTimeout(() => setSaveState('idle'), 2500);
    } catch (error: any) {
      toast({
        title: 'Could not save settings',
        description: error.message ?? 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = () => {
    signOut();
    navigate('/login');
  };

  return (
    <AppLayout>
      <div className="px-4 py-4 lg:px-8 lg:py-6">
        <div className="mx-auto max-w-4xl space-y-4 pb-6 lg:space-y-6 lg:pb-0">
          <div className="hidden lg:block">
            <h1 className="font-display text-3xl font-bold text-foreground">Settings</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage your account view and app preferences.</p>
          </div>

          <section className="rounded-2xl border border-border bg-card p-4 lg:p-6">
            <div className="flex items-start gap-3 lg:gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/15 text-primary lg:h-20 lg:w-20">
                <span className="font-display text-lg font-bold lg:text-2xl">{initials}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Account</p>
                <h2 className="mt-1 truncate font-display text-xl font-bold leading-7 text-foreground lg:text-2xl">{preferences.displayName}</h2>
                <p className="mt-1 truncate text-sm text-muted-foreground">{user?.email ?? 'Guest session'}</p>
              </div>
            </div>

            <div className="mt-6">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={preferences.displayName}
                  onChange={event => setPreferences(prev => ({ ...prev, displayName: event.target.value }))}
                  className="h-11"
                />
                <p className="text-xs leading-5 text-muted-foreground">
                  Updates your Supabase profile name and app previews.
                </p>
              </div>
            </div>

            <Button onClick={handleSave} disabled={isSaving} className="mt-5 h-11 w-full gap-2 lg:w-auto">
              <Check className="h-4 w-4" />
              {isSaving ? 'Saving...' : saveState === 'saved' ? 'Changes Saved' : 'Save Changes'}
            </Button>
          </section>

          <section className="rounded-2xl border border-border bg-card divide-y divide-border">
            <SettingToggle
              icon={Bell}
              title="Notifications"
              description="Payment reminders and due-date alerts"
              checked={preferences.notifications}
              onCheckedChange={checked => setPreferences(prev => ({ ...prev, notifications: checked }))}
            />
            <SettingToggle
              icon={Palette}
              title="Compact Records"
              description="Prefer denser previews when reviewing history"
              checked={preferences.compactRecords}
              onCheckedChange={checked => setPreferences(prev => ({ ...prev, compactRecords: checked }))}
            />
          </section>

          <section className="rounded-2xl border border-border bg-card divide-y divide-border">
            <SettingRow icon={Shield} title="Security" description="Password and session options" disabled />
            <SettingRow icon={HelpCircle} title="Help & Support" description="Guides and contact options" disabled />
          </section>

          <section className="rounded-2xl border border-border bg-card p-4 lg:p-5">
            <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
              <Info label="Version" value="1.0.0" />
              <Info label="Currency" value="PHP (PHP)" />
              <Info label="Mode" value="Production" />
              <Info label="Account" value={user?.email ? 'Signed in' : 'Guest'} />
            </div>
          </section>

          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/25 p-4 font-medium text-destructive transition-colors hover:bg-destructive/5 active:scale-[0.98]"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

type SettingToggleProps = {
  icon: React.ElementType;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

function SettingToggle({ icon: Icon, title, description, checked, onCheckedChange }: SettingToggleProps) {
  return (
    <div className="flex items-center justify-between gap-3 p-4 lg:gap-4 lg:p-5">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
          <Icon className="h-5 w-5 text-foreground" />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-foreground">{title}</p>
          <p className="text-sm leading-5 text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} className="shrink-0" />
    </div>
  );
}

type SettingRowProps = {
  icon: React.ElementType;
  title: string;
  description: string;
  disabled?: boolean;
};

function SettingRow({ icon: Icon, title, description, disabled }: SettingRowProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className="flex w-full items-center gap-3 p-4 text-left transition-colors enabled:hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-60 lg:p-5"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
        <Icon className="h-5 w-5 text-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-foreground">{title}</p>
        <p className="text-sm leading-5 text-muted-foreground">{description}</p>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </button>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/30 px-3 py-2 lg:bg-transparent lg:p-0">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 truncate font-medium text-foreground">{value}</p>
    </div>
  );
}

export default Settings;
