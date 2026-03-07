import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

export default function EditContactPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { persons, updatePerson } = useApp();
  const { toast } = useToast();
  
  const [person, setPerson] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
  if (!id) return;

  const fetchPerson = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/persons/${id}`);

      if (!res.ok) throw new Error('Not found');

      const data = await res.json();
      setPerson(data);

      setName(data.name);
      setPhone(data.phone || '');
      setEmail(data.email || '');
      setNotes(data.notes || '');

    } catch (error) {
      console.error(error);
      setPerson(null);
    } finally {
      setLoading(false);
    }
  };

  fetchPerson();
}, [id]);

  if (!person) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <h2 className="font-display font-semibold text-foreground mb-2">Contact not found</h2>
          <Button onClick={() => navigate('/people')}>Go back</Button>
        </div>
      </AppLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!name.trim()) {
    toast({
      title: 'Validation Error',
      description: 'Please enter a name',
      variant: 'destructive',
    });
    return;
  }

  const payload = {
    name: name.trim(),
    phone: phone.trim() || null,
    email: email.trim() || null,
    notes: notes.trim() || null,
  };

  try {
    const res = await fetch(`http://localhost:8080/api/persons/${person.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error('Update failed');

  const updatedPerson = await res.json();

    updatePerson(person.id, {
      name: updatedPerson.name,
      phone: updatedPerson.phone,
      email: updatedPerson.email,
      notes: updatedPerson.notes,
    });


    toast({
      title: 'Success',
      description: 'Contact updated successfully',
    });

    navigate(`/contacts/${person.id}`);
  } catch (error) {
    console.error(error);
    toast({
      title: 'Error',
      description: 'Could not update contact',
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
              <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">Edit Contact</h1>
              <p className="text-sm text-muted-foreground mt-1">Update contact information</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="h-12 text-base"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+63 912 345 6789"
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="h-12 text-base"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes about this contact..."
                rows={4}
                className="text-base"
              />
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
              <Button type="submit" className="flex-1 h-12">
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}

