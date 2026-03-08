import { useState } from 'react';
import { User, Plus, X, Pencil, Trash2, Search } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { ConfirmDeleteModal } from '@/components/ConfirmDeleteModal';
import { mockPersons } from '@/api/mock';
import { personFullName, personInitials } from '@/types';
import type { Person } from '@/types';
import { cn } from '@/lib/utils';

// ── Shared form styles ────────────────────────────────────────────────────────

const INPUT_CLASS =
  'w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors';
const LABEL_CLASS = 'text-xs font-medium text-muted-foreground uppercase tracking-wide';

// ── Edit Person Modal ─────────────────────────────────────────────────────────

interface EditPersonModalProps {
  person: Person;
  onSave: (updated: Partial<Person>) => void;
  onClose: () => void;
}

function EditPersonModal({ person, onSave, onClose }: EditPersonModalProps) {
  const [form, setForm] = useState({
    first_name: person.first_name,
    last_name: person.last_name,
    middle_name: person.middle_name ?? '',
    nickname: person.nickname ?? '',
    phone: person.phone ?? '',
    email: person.email ?? '',
  });

  function set(field: keyof typeof form, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function handleSave() {
    onSave({
      first_name: form.first_name.trim() || person.first_name,
      last_name: form.last_name.trim() || person.last_name,
      middle_name: form.middle_name.trim() || undefined,
      nickname: form.nickname.trim() || undefined,
      phone: form.phone.trim() || undefined,
      email: form.email.trim() || undefined,
    });
    onClose();
  }

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-card border border-border rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Mobile drag handle */}
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-2 sm:hidden" />

        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Edit Person</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 -mr-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className={LABEL_CLASS}>First Name</label>
              <input
                value={form.first_name}
                onChange={e => set('first_name', e.target.value)}
                placeholder="First name"
                className={INPUT_CLASS}
              />
            </div>
            <div className="space-y-1.5">
              <label className={LABEL_CLASS}>Last Name</label>
              <input
                value={form.last_name}
                onChange={e => set('last_name', e.target.value)}
                placeholder="Last name"
                className={INPUT_CLASS}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={LABEL_CLASS}>Middle Name <span className="normal-case text-muted-foreground/60">(optional)</span></label>
            <input
              value={form.middle_name}
              onChange={e => set('middle_name', e.target.value)}
              placeholder="Middle name"
              className={INPUT_CLASS}
            />
          </div>

          <div className="space-y-1.5">
            <label className={LABEL_CLASS}>Nickname <span className="normal-case text-muted-foreground/60">(optional)</span></label>
            <input
              value={form.nickname}
              onChange={e => set('nickname', e.target.value)}
              placeholder="Nickname"
              className={INPUT_CLASS}
            />
          </div>

          <div className="space-y-1.5">
            <label className={LABEL_CLASS}>Phone <span className="normal-case text-muted-foreground/60">(optional)</span></label>
            <input
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
              placeholder="+63 9XX XXX XXXX"
              className={INPUT_CLASS}
            />
          </div>

          <div className="space-y-1.5">
            <label className={LABEL_CLASS}>Email <span className="normal-case text-muted-foreground/60">(optional)</span></label>
            <input
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="email@example.com"
              className={INPUT_CLASS}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-border text-muted-foreground hover:bg-background hover:text-foreground rounded-lg px-4 py-2.5 sm:py-2 text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2.5 sm:py-2 text-sm font-medium transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Person card ───────────────────────────────────────────────────────────────

interface PersonCardProps {
  person: Person;
  onEdit: (person: Person) => void;
  onDelete: (person: Person) => void;
}

function PersonCard({ person, onEdit, onDelete }: PersonCardProps) {
  const initials = personInitials(person);
  const name = personFullName(person);

  return (
    <div className="bg-card border border-border rounded-xl p-3 sm:p-4 flex items-center gap-3">
      {/* Avatar */}
      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center shrink-0 ring-2 ring-primary/20">
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{name}</p>
          {person.nickname && (
            <span className="text-xs text-muted-foreground shrink-0">"{person.nickname}"</span>
          )}
        </div>
        <div className="mt-0.5 space-y-0.5">
          {person.phone && (
            <p className="text-xs text-muted-foreground">{person.phone}</p>
          )}
          {person.email && (
            <p className="text-xs text-muted-foreground truncate hidden sm:block">{person.email}</p>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          onClick={() => onEdit(person)}
          className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
          aria-label="Edit person"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(person)}
          className="p-2 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
          aria-label="Delete person"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PeoplePage() {
  const [persons, setPersons] = useState(mockPersons);
  const [search, setSearch] = useState('');

  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [deletingPerson, setDeletingPerson] = useState<Person | null>(null);

  const filteredPersons = persons.filter(p => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      personFullName(p).toLowerCase().includes(q) ||
      (p.phone?.toLowerCase().includes(q) ?? false) ||
      (p.email?.toLowerCase().includes(q) ?? false) ||
      (p.nickname?.toLowerCase().includes(q) ?? false)
    );
  });

  function handleSavePerson(updated: Partial<Person>) {
    if (!editingPerson) return;
    setPersons(prev => prev.map(p => p.id === editingPerson.id ? { ...p, ...updated } : p));
  }

  function handleConfirmDeletePerson() {
    if (!deletingPerson) return;
    setPersons(prev => prev.filter(p => p.id !== deletingPerson.id));
  }

  return (
    <AppLayout>
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 max-w-3xl mx-auto">

        {/* Desktop header */}
        <div className="hidden lg:flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">People</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{persons.length} persons</p>
          </div>
          <button
            onClick={() => alert('Add Person — coming soon')}
            className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Person
          </button>
        </div>

        {/* Mobile add button */}
        <div className="flex items-center justify-between lg:hidden">
          <p className="text-xs text-muted-foreground">{persons.length} persons</p>
          <button
            onClick={() => alert('Add Person — coming soon')}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Person
          </button>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search persons…"
            className="w-full bg-card border border-border rounded-xl pl-9 pr-9 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Person list */}
        {filteredPersons.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <User className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No persons found.</p>
          </div>
        ) : (
          <div className={cn('space-y-2.5')}>
            {filteredPersons.map(p => (
              <PersonCard
                key={p.id}
                person={p}
                onEdit={setEditingPerson}
                onDelete={setDeletingPerson}
              />
            ))}
          </div>
        )}

      </div>

      {/* Edit Person modal */}
      {editingPerson && (
        <EditPersonModal
          person={editingPerson}
          onSave={handleSavePerson}
          onClose={() => setEditingPerson(null)}
        />
      )}

      {/* Delete Person confirm */}
      <ConfirmDeleteModal
        open={!!deletingPerson}
        title={`Delete ${deletingPerson ? personFullName(deletingPerson) : ''}?`}
        description="This action cannot be undone."
        onClose={() => setDeletingPerson(null)}
        onConfirm={handleConfirmDeletePerson}
      />
    </AppLayout>
  );
}
