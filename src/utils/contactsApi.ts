// Type declarations for Web Contacts API (not in default TS lib)
interface ContactInfo {
  name?: string[];
  email?: string[];
  tel?: string[];
}

interface ContactsManager {
  select(properties: string[], options?: { multiple?: boolean }): Promise<ContactInfo[]>;
  getProperties(): Promise<string[]>;
}

declare global {
  interface Navigator {
    contacts?: ContactsManager;
  }
}

export interface ImportedContact {
  name: string;
  email?: string;
  phone?: string;
}

export function isContactsApiSupported(): boolean {
  return typeof navigator !== 'undefined' &&
    'contacts' in navigator &&
    typeof (navigator as any).contacts?.select === 'function';
}

export async function pickContacts(): Promise<ContactInfo[]> {
  if (!isContactsApiSupported()) {
    throw new Error('Contacts API not supported on this device/browser');
  }
  return navigator.contacts!.select(['name', 'email', 'tel'], { multiple: true });
}

export function normalizeContacts(rawContacts: ContactInfo[]): ImportedContact[] {
  return rawContacts
    .map(c => ({
      name: (c.name?.[0] ?? '').trim(),
      email: c.email?.[0]?.trim() || undefined,
      phone: c.tel?.[0]?.trim() || undefined,
    }))
    .filter(c => c.name.length > 0);
}
