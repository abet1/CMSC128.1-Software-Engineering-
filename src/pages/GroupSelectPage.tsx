import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/context/AppContext';
import { ArrowLeft, Plus, Users, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

export default function GroupSelectPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/';
  const field = searchParams.get('field') || 'group';
  
  const { groups } = useApp();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const handleSelect = (groupId: string) => {
    sessionStorage.setItem(`selected_${field}`, groupId);
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
              <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">Select Group</h1>
              <p className="text-sm text-muted-foreground mt-1">Choose a group from your list</p>
            </div>
            <Button
              onClick={() => navigate(`/groups/add?returnTo=${encodeURIComponent(returnTo)}&field=${field}`)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Group</span>
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search groups..."
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

          {/* Group List */}
          <div className="space-y-2 pb-24">
            {filteredGroups.map((group) => {
              const isSelected = selectedId === group.id;
              
              return (
                <button
                  key={group.id}
                  onClick={() => setSelectedId(group.id)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left",
                    isSelected
                      ? "bg-primary/10 border-primary shadow-maya"
                      : "bg-card border-border hover:border-primary/30 hover:shadow-soft"
                  )}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "font-medium truncate",
                      isSelected ? "text-primary" : "text-foreground"
                    )}>
                      {group.name}
                    </p>
                    <p className="text-sm text-muted-foreground">{group.members.length} members</p>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                    </div>
                  )}
                </button>
              );
            })}

            {filteredGroups.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Users className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-1">No groups found</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {search ? 'Try a different search term' : 'Create your first group'}
                </p>
                <Button
                  onClick={() => navigate(`/groups/add?returnTo=${encodeURIComponent(returnTo)}&field=${field}`)}
                  variant="outline"
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Group
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
                  Continue with {filteredGroups.find(g => g.id === selectedId)?.name}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

