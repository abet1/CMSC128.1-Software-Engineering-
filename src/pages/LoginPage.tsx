import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Users, Shield, ArrowRight } from 'lucide-react';

const features = [
  { icon: TrendingUp,  label: 'Track loans',         desc: 'Lend and borrow with full payment history'  },
  { icon: TrendingDown, label: 'Split expenses',      desc: 'Divide bills equally or by custom amounts'  },
  { icon: Users,        label: 'Manage groups',       desc: 'Housemates, trips, friends — all in one place' },
  { icon: Shield,       label: 'Always in sync',      desc: 'Your data follows you across all devices'   },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { signInAsGuest } = useAuth();

  const [guestName, setGuestName]   = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [showGuest, setShowGuest]   = useState(false);
  const [loading, setLoading]       = useState(false);

  const handleGuestSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;
    setLoading(true);
    setTimeout(() => {
      signInAsGuest(guestName.trim(), guestEmail.trim() || undefined);
      navigate('/');
    }, 400);
  };

  const initials = (name: string) =>
    name.trim().split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <div className="min-h-screen bg-background flex">

      {/* ── Left panel (desktop only) ── */}
      <div className="hidden lg:flex flex-col w-[55%] bg-gradient-to-br from-primary via-primary/85 to-primary/60 p-12 relative overflow-hidden">

        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-black/10" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-black/10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-black/5" />
        </div>

        {/* Brand */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-white tracking-tight">PayMamaya</span>
          </div>
          <p className="text-white/75 text-sm">Loans & Shared Expenses</p>
        </div>

        {/* Hero text */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-12">
          <h2 className="font-display text-4xl xl:text-5xl font-bold text-white leading-tight mb-4 drop-shadow-sm">
            Know exactly<br />who owes who.
          </h2>
          <p className="text-white/85 text-lg leading-relaxed max-w-sm drop-shadow-sm">
            Track shared expenses, split bills fairly, and manage loans — all in one clean dashboard.
          </p>
        </div>

        {/* Feature list */}
        <div className="relative z-10 grid grid-cols-2 gap-3">
          {features.map(f => {
            const Icon = f.icon;
            return (
              <div key={f.label} className="flex items-start gap-3 p-3 rounded-xl bg-black/15 backdrop-blur-sm border border-white/10">
                <div className="w-8 h-8 rounded-lg bg-black/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold leading-tight">{f.label}</p>
                  <p className="text-white/70 text-xs mt-0.5 leading-snug">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Right panel / Sign-in ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12">

        {/* Mobile brand */}
        <div className="lg:hidden flex flex-col items-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
            <TrendingUp className="w-7 h-7 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">PayMamaya</h1>
          <p className="text-sm text-muted-foreground mt-1">Loans & Shared Expenses</p>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="font-display text-2xl lg:text-3xl font-bold text-foreground">Welcome back</h2>
            <p className="text-muted-foreground mt-1.5">Sign in to access your dashboard.</p>
          </div>

          {/* Google sign-in */}
          <button
            disabled
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-card border border-border rounded-xl text-sm font-medium text-foreground/50 cursor-not-allowed relative overflow-hidden"
          >
            <svg className="w-4 h-4 opacity-50" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">
              Soon
            </span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground font-medium">or continue as guest</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Guest sign-in */}
          {!showGuest ? (
            <button
              onClick={() => setShowGuest(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border border-border bg-card hover:bg-muted/50 hover:border-primary/40 transition-all text-sm font-medium text-foreground active:scale-[0.98]"
            >
              Sign in as Guest
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ) : (
            <form onSubmit={handleGuestSignIn} className="space-y-3">
              {/* Avatar preview */}
              {guestName && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
                  <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                    <span className="text-primary font-bold text-sm">{initials(guestName)}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{guestName}</p>
                    {guestEmail && <p className="text-xs text-muted-foreground truncate">{guestEmail}</p>}
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="guest-name" className="text-xs font-medium">Your name *</Label>
                <Input
                  id="guest-name"
                  value={guestName}
                  onChange={e => setGuestName(e.target.value)}
                  placeholder="e.g. Juan dela Cruz"
                  className="h-11"
                  autoFocus
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="guest-email" className="text-xs font-medium">Email <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input
                  id="guest-email"
                  type="email"
                  value={guestEmail}
                  onChange={e => setGuestEmail(e.target.value)}
                  placeholder="juan@email.com"
                  className="h-11"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowGuest(false)}
                  className="flex-1 h-11"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-11"
                  disabled={!guestName.trim() || loading}
                >
                  {loading ? 'Signing in…' : 'Sign In'}
                </Button>
              </div>
            </form>
          )}

          <p className="text-xs text-muted-foreground text-center mt-6 leading-relaxed">
            Guest sessions are saved locally on this device.
            <br />Google sign-in coming soon via Supabase.
          </p>
        </div>
      </div>
    </div>
  );
}
