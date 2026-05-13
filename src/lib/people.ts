import { AuthUser } from '@/context/AuthContext';
import { Person } from '@/types';

export function isSelfPerson(person: Person, user?: AuthUser | null): boolean {
  if (!user) return person.notes === '__self__';
  return person.id === user.id ||
    person.notes === '__self__' ||
    (!!user.email && person.email === user.email) ||
    (!!user.name && person.name === user.name);
}
