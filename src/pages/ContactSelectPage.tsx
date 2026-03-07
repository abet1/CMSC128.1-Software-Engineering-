import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/context/AppContext';
import { ArrowLeft, Plus, User, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

export default function ContactSelectPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/';
  const field = searchParams.get('field') || 'contact';
  
  const { persons } = useApp();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const LENDER_ID = '49e46789-d54e-4cb1-af9b-8af4e452a001';

const contacts = persons.filter(p => p.id !== LENDER_ID);

  
  const filteredContacts = contacts.filter(p =>
    p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    p.phone?.includes(debouncedSearch) ||
    p.email?.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const handleSelect = (contactId: string) => {
    // Store selected contact in sessionStorage to pass back
    sessionStorage.setItem(`selected_${field}`, contactId);
    navigate(returnTo + `?selected=true&field=${field}`);
  };

  const handleContinue = () => {
    if (selectedId) {
      handleSelect(selectedId);
    }
  };

  return (
    <AppLayout>
      <div className="px-4 lg:px-8 py-4 lg:py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-muted border border-border hover:bg-muted/80 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div className="flex-1">
              <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">Select Contact</h1>
              <p className="text-sm text-muted-foreground mt-1">Choose a contact from your list</p>
            </div>
            <Button
              onClick={() => navigate(`/contacts/add?returnTo=${encodeURIComponent(returnTo)}&field=${field}`)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add</span>
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-10 h-12 text-base"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-muted"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Contact List */}
          <div className="space-y-2 pb-24">
            {filteredContacts.map((person) => {
              const initials = person.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
              const isSelected = selectedId === person.id;
              
              return (
                <button
                  key={person.id}
                  onClick={() => setSelectedId(person.id)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left",
                    isSelected
                      ? "bg-primary/10 border-primary shadow-maya"
                      : "bg-card border-border hover:border-primary/30 hover:shadow-soft"
                  )}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-base">{initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "font-medium truncate",
                      isSelected ? "text-primary" : "text-foreground"
                    )}>
                      {person.name}
                    </p>
                    {person.phone && (
                      <p className="text-sm text-muted-foreground truncate">{person.phone}</p>
                    )}
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                    </div>
                  )}
                </button>
              );
            })}

            {filteredContacts.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <User className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-1">No contacts found</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {search ? 'Try a different search term' : 'Add your first contact'}
                </p>
                <Button
                  onClick={() => navigate(`/contacts/add?returnTo=${encodeURIComponent(returnTo)}&field=${field}`)}
                  variant="outline"
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Contact
                </Button>
              </div>
            )}
          </div>

          {/* Bottom Action Bar */}
          {selectedId && (
            <div className="fixed bottom-20 left-0 right-0 lg:bottom-8 lg:left-72 z-40 px-4 lg:px-8">
              <div className="max-w-2xl mx-auto">
                <Button
                  onClick={handleContinue}
                  className="w-full h-12 shadow-lg"
                >
                  Continue with {filteredContacts.find(p => p.id === selectedId)?.name}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

