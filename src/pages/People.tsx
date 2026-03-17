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
  const { persons, groups } = useApp();
  const [person, setPerson] = useState<Person[]>([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [tab, setTab] = useState<TabType>('contacts');

 useEffect(() => {
  fetch('http://localhost:8080/api/persons')
    .then(res => res.json())
    .then(data => {
      console.log('API RESPONSE:', data);
      setPerson(Array.isArray(data) ? data : data.data ?? []);
    })
    .catch(err => console.error('Error fetching contacts:', err));
}, []);


const contacts = person.filter(p => p.id !== currentUser.id);
  
  const filteredPersons = contacts.filter(p => 
    p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    p.phone?.includes(debouncedSearch) ||
    p.email?.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <AppLayout title="People">
      <div className="px-4 lg:px-8 py-4 lg:py-6">
        <div className="max-w-6xl mx-auto space-y-5 lg:space-y-6">

          {/* Header row — mobile: title + add; desktop: title + count + add */}
          <div className="flex items-center justify-between animate-fade-in">
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">People</h1>
              <p className="hidden lg:block text-sm text-muted-foreground mt-0.5">
                {tab === 'contacts' ? `${contacts.length} contact${contacts.length !== 1 ? 's' : ''}` : `${groups.length} group${groups.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            <button
              onClick={() => navigate(tab === 'contacts' ? '/contacts/add' : '/groups/add')}
              className="flex items-center gap-1.5 lg:gap-2 px-4 lg:px-5 py-2.5 lg:py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium transition-all active:scale-95 hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" />
              <span>{tab === 'contacts' ? 'Add Contact' : 'Create Group'}</span>
            </button>
          </div>

          {/* Tabs + Search — side by side on desktop */}
          <div className="lg:flex lg:items-center lg:gap-4 space-y-3 lg:space-y-0 animate-fade-in stagger-1">
          <div className="flex gap-1 p-1 bg-muted rounded-xl lg:w-64 lg:shrink-0">
            <button
              onClick={() => setTab('contacts')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 lg:py-3 rounded-lg lg:rounded-xl text-sm lg:text-base font-medium transition-all active:scale-95",
                tab === 'contacts' 
                  ? "bg-card text-foreground shadow-soft" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <User className="w-4 h-4 lg:w-5 lg:h-5" />
              Contacts ({contacts.length})
            </button>
            <button
              onClick={() => setTab('groups')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 lg:py-3 rounded-lg lg:rounded-xl text-sm lg:text-base font-medium transition-all active:scale-95",
                tab === 'groups' 
                  ? "bg-card text-foreground shadow-soft" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Users className="w-4 h-4 lg:w-5 lg:h-5" />
              Groups ({groups.length})
            </button>
          </div>

          {/* Search — desktop: grows to fill remaining tab row space */}
          <div className="relative lg:flex-1">
            <Search className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder={tab === 'contacts' ? "Search contacts..." : "Search groups..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary transition-all text-sm"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-3 lg:right-4 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
          </div>{/* end tabs+search row */}

          {/* Contacts List */}
          {tab === 'contacts' && (
            <div className="animate-fade-in stagger-3">
            <div className="grid gap-3 lg:gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {filteredPersons.map((person) => (
                <button 
                  key={person.id} 
                  onClick={() => navigate(`/contacts/${person.id}`)}
                  className="flex items-center gap-3 lg:gap-4 p-4 lg:p-5 rounded-xl lg:rounded-2xl bg-card border border-border hover:border-primary/40 hover:bg-muted/50 transition-all text-left active:scale-[0.99]"
                >
                  <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-sm lg:text-base">
                      {person.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground lg:text-base truncate">{person.name}</p>
                    <p className="text-sm lg:text-base text-muted-foreground truncate">{person.phone}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                </button>
                ))}
              </div>
              {filteredPersons.length === 0 && (
                <div className="text-center py-12 lg:py-16">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <User className="w-8 h-8 lg:w-10 lg:h-10 text-muted-foreground" />
                  </div>
                  <h3 className="font-display font-semibold text-lg lg:text-xl text-foreground mb-1">No contacts found</h3>
                  <p className="text-muted-foreground text-sm lg:text-base">Try a different search term</p>
                </div>
              )}
            </div>
          )}

          {/* Groups List */}
          {tab === 'groups' && (
            <div className="animate-fade-in stagger-3">
            <div className="grid gap-3 lg:gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {filteredGroups.map((group) => (
                <button 
                  key={group.id} 
                  onClick={() => navigate(`/groups/${group.id}`)}
                  className="flex items-center gap-3 lg:gap-4 p-4 lg:p-5 rounded-xl lg:rounded-2xl bg-card border border-border hover:border-primary/40 hover:bg-muted/50 transition-all text-left active:scale-[0.99]"
                >
                  <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground lg:text-base truncate">{group.name}</p>
                    <p className="text-sm lg:text-base text-muted-foreground">{group.members.length} members</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                </button>
                ))}
              </div>
              {filteredGroups.length === 0 && (
                <div className="text-center py-12 lg:py-16">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Users className="w-8 h-8 lg:w-10 lg:h-10 text-muted-foreground" />
                  </div>
                  <h3 className="font-display font-semibold text-lg lg:text-xl text-foreground mb-1">No groups found</h3>
                  <p className="text-muted-foreground text-sm lg:text-base">Create a group to share expenses</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

    </AppLayout>
  );
};

export default People;
