import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { useApp } from '@/context/AppContext';
import { currentUser } from '@/data/user';
import { User, Users, Plus, ChevronRight, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import { Person } from '@/types';

type TabType = 'contacts' | 'groups';

const People = () => {
  const navigate = useNavigate();
  const { groups } = useApp();
  const [persons, setPersons] = useState<Person[]>([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [tab, setTab] = useState<TabType>('contacts');

  useEffect(() => {
    fetch('http://localhost:8080/api/persons')
      .then(res => res.json())
      .then(data => setPersons(Array.isArray(data) ? data : data.data ?? []))
      .catch(err => console.error('Error fetching contacts:', err));
  }, []);

  const contacts = persons.filter(p => p.id !== currentUser.id);

  const filteredPersons = contacts.filter(p =>
    (p.name ?? '').toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    (p.phone ?? '').includes(debouncedSearch) ||
    (p.email ?? '').toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const initials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <AppLayout>
      <div className="px-4 lg:px-8 py-4 lg:py-6">
        <div className="max-w-6xl mx-auto space-y-5 lg:space-y-6">

          {/* ── Header ── */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">People</h1>
              <p className="hidden lg:block text-sm text-muted-foreground mt-0.5">
                {tab === 'contacts'
                  ? `${contacts.length} contact${contacts.length !== 1 ? 's' : ''}`
                  : `${groups.length} group${groups.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            <button
              onClick={() => navigate(tab === 'contacts' ? '/contacts/add' : '/groups/add')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium transition-all active:scale-95 hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" />
              {tab === 'contacts' ? 'Add Contact' : 'Create Group'}
            </button>
          </div>

          {/* ── Tabs + Search ── */}
          <div className="lg:flex lg:items-center lg:gap-4 space-y-3 lg:space-y-0">
            <div className="flex gap-1 p-1 bg-muted rounded-xl lg:w-60 lg:shrink-0">
              {([
                { key: 'contacts' as TabType, label: 'Contacts', icon: User,  count: contacts.length },
                { key: 'groups'   as TabType, label: 'Groups',   icon: Users, count: groups.length  },
              ]).map(t => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.key}
                    onClick={() => { setTab(t.key); setSearch(''); }}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all',
                      tab === t.key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{t.label}</span>
                    <span className={cn('text-[11px] tabular-nums', tab === t.key ? 'text-muted-foreground' : 'text-muted-foreground/60')}>
                      ({t.count})
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="relative lg:flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder={tab === 'contacts' ? 'Search contacts…' : 'Search groups…'}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary text-sm"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* ── CONTACTS ── */}
          {tab === 'contacts' && (
            <>
              {/* Desktop table */}
              <div className="hidden lg:block rounded-xl border border-border overflow-hidden">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Name</th>
                      <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Phone</th>
                      <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Email</th>
                      <th className="w-10" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50 bg-card">
                    {filteredPersons.map(p => (
                      <tr
                        key={p.id}
                        onClick={() => navigate(`/contacts/${p.id}`)}
                        className="cursor-pointer hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <span className="text-primary font-bold text-xs">{initials(p.name ?? '?')}</span>
                            </div>
                            <span className="font-medium text-sm text-foreground">{p.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-muted-foreground">{p.phone || '—'}</td>
                        <td className="px-4 py-3.5 text-sm text-muted-foreground">{p.email || '—'}</td>
                        <td className="px-4 py-3.5 text-right">
                          <ChevronRight className="w-4 h-4 text-muted-foreground/50 ml-auto" />
                        </td>
                      </tr>
                    ))}
                    {filteredPersons.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-16 text-center">
                          <User className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                          <p className="text-sm font-medium text-foreground mb-1">No contacts found</p>
                          <p className="text-xs text-muted-foreground">Try a different search term</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="lg:hidden grid gap-3">
                {filteredPersons.map(p => (
                  <button
                    key={p.id}
                    onClick={() => navigate(`/contacts/${p.id}`)}
                    className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:border-primary/40 hover:bg-muted/50 transition-all text-left"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-primary font-bold text-sm">{initials(p.name ?? '?')}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{p.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{p.phone}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                  </button>
                ))}
                {filteredPersons.length === 0 && (
                  <div className="text-center py-12">
                    <User className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No contacts found</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── GROUPS ── */}
          {tab === 'groups' && (
            <>
              {/* Desktop table */}
              <div className="hidden lg:block rounded-xl border border-border overflow-hidden">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Group Name</th>
                      <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Members</th>
                      <th className="w-10" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50 bg-card">
                    {filteredGroups.map(g => (
                      <tr
                        key={g.id}
                        onClick={() => navigate(`/groups/${g.id}`)}
                        className="cursor-pointer hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <Users className="w-4 h-4 text-primary" />
                            </div>
                            <span className="font-medium text-sm text-foreground">{g.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-muted-foreground">{g.members.length} member{g.members.length !== 1 ? 's' : ''}</td>
                        <td className="px-4 py-3.5 text-right">
                          <ChevronRight className="w-4 h-4 text-muted-foreground/50 ml-auto" />
                        </td>
                      </tr>
                    ))}
                    {filteredGroups.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-16 text-center">
                          <Users className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                          <p className="text-sm font-medium text-foreground mb-1">No groups found</p>
                          <p className="text-xs text-muted-foreground">Create a group to share expenses</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="lg:hidden grid gap-3">
                {filteredGroups.map(g => (
                  <button
                    key={g.id}
                    onClick={() => navigate(`/groups/${g.id}`)}
                    className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:border-primary/40 hover:bg-muted/50 transition-all text-left"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{g.name}</p>
                      <p className="text-sm text-muted-foreground">{g.members.length} members</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                  </button>
                ))}
                {filteredGroups.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No groups found</p>
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </AppLayout>
  );
};

export default People;
