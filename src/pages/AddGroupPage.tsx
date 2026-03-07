import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, X, Plus, ChevronDown } from 'lucide-react';

export default function AddGroupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/people';
  const field = searchParams.get('field') || 'group';

  const { persons, addGroup } = useApp();
  console.log("PERSONS IN ADD GROUP:", persons);
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get selected members from URL params if coming from contact selection
  useEffect(() => {
    const selected = searchParams.get('selected');
    if (selected === 'true') {
      const selectedIds = sessionStorage.getItem('selected_group_members');
      if (selectedIds) {
        try {
          const ids = JSON.parse(selectedIds);
          setSelectedMemberIds(ids);
          sessionStorage.removeItem('selected_group_members');
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
  }, [searchParams]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const availableContacts = persons.filter(
    p => p.id !== 'current' && !selectedMemberIds.includes(p.id)
  );

  const filteredContacts = search
    ? availableContacts.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase())
      )
    : availableContacts;

  const selectedMembers = persons.filter(p => selectedMemberIds.includes(p.id));

  const handleAddMember = (personId: string) => {
    setSelectedMemberIds([...selectedMemberIds, personId]);
  };

  const handleRemoveMember = (personId: string) => {
  setSelectedMemberIds(selectedMemberIds.filter(id => id !== personId));
};

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!name.trim()) {
    toast({
      title: 'Validation Error',
      description: 'Please enter a group name',
      variant: 'destructive',
    });
    return;
  }

  if (selectedMemberIds.length === 0) {
    toast({
      title: 'Validation Error',
      description: 'Please add at least one member to the group',
      variant: 'destructive',
    });
    return;
  }

  const memberObjects = persons.filter(p => selectedMemberIds.includes(p.id));

  try {
    const newGroup = await addGroup({
      name: name.trim(),
      members: memberObjects,
    });

    toast({
      title: 'Success',
      description: 'Group created successfully',
    });

    if (returnTo.includes('/expense') || returnTo.includes('/select')) {
      sessionStorage.setItem(`selected_${field}`, newGroup.id);
      navigate(returnTo + `?selected=true&field=${field}`);
    } else {
      navigate(`/groups/${newGroup.id}`);
    }
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Could not create group. Try again later.',
      variant: 'destructive',
    });
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
            <div>
              <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">Create Group</h1>
              <p className="text-sm text-muted-foreground mt-1">Add a new group for shared expenses</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Group Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Group Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Office Team, Family, Friends"
                className="h-12 text-base"
                required
              />
            </div>

            {/* Selected Members */}
            {selectedMembers.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Members ({selectedMembers.length})</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedMembers.map(member => (
                    <div
                      key={member.id}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 border border-primary/20"
                    >
                      <span className="text-sm font-medium text-foreground">{member.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member.id)}
                        className="p-0.5 rounded-md hover:bg-primary/20 transition-colors"
                      >
                        <X className="w-4 h-4 text-foreground" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Members */}
            <div className="space-y-2">
              <Label>Add Members *</Label>
              
              {/* Searchable Dropdown */}
              <div className="relative">
                <div className="relative">
                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder="Search contacts or click to browse..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    className="h-12 text-base pr-10"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearch('');
                        setIsDropdownOpen(false);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-muted transition-colors"
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  )}
                  {!search && (
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-muted transition-colors"
                    >
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>
                
                {/* Dropdown List */}
                {isDropdownOpen && (
                  <div ref={dropdownRef} className="absolute z-50 w-full mt-1 bg-card border border-border rounded-xl shadow-lg max-h-[300px] overflow-y-auto">
                    {filteredContacts.length > 0 ? (
                      <div className="p-1">
                        {filteredContacts.map(contact => (
                          <button
                            key={contact.id}
                            type="button"
                            onClick={() => {
                              handleAddMember(contact.id);
                              setSearch('');
                              setIsDropdownOpen(false);
                            }}
                            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
                          >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                              <span className="text-primary font-bold text-sm">
                                {contact.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                              </span>
                            </div>
                            <div className="flex flex-col flex-1 min-w-0">
                              <span className="font-medium text-sm text-foreground">{contact.name}</span>
                              {contact.phone && (
                                <span className="text-xs text-muted-foreground truncate">{contact.phone}</span>
                              )}
                            </div>
                            <Plus className="w-4 h-4 text-primary flex-shrink-0" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-sm text-muted-foreground text-center">
                        {search ? 'No contacts found' : 'No contacts available'}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {selectedMemberIds.length === 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Add at least one member to create the group
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-4 pb-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex-1 h-12"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1 h-12" disabled={selectedMemberIds.length === 0}>
                Create Group
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}