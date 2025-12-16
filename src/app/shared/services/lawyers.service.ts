import { Injectable, inject } from '@angular/core';
import { MockStorageService } from './mock-storage.service';

export interface Lawyer {
  id: string;
  lawyerNumber: string; // Auto-generated (e.g., LAW-001, LAW-002)
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'lawyers';

@Injectable({ providedIn: 'root' })
export class LawyersService {
  private readonly storage = inject(MockStorageService);

  private generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 0x0f) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  private generateLawyerNumber(): string {
    const lawyers = this.list();
    const maxNumber = lawyers.reduce((max, lawyer) => {
      const match = lawyer.lawyerNumber.match(/LAW-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return Math.max(max, num);
      }
      return max;
    }, 0);
    const nextNumber = maxNumber + 1;
    return `LAW-${String(nextNumber).padStart(3, '0')}`;
  }

  list(): Lawyer[] {
    const existing = this.storage.get<Lawyer[]>(STORAGE_KEY, []);
    if ((existing ?? []).length === 0) {
      this.seedData();
      return this.storage.get<Lawyer[]>(STORAGE_KEY, []);
    }
    return existing;
  }

  getById(id: string): Lawyer | undefined {
    return this.list().find((l) => l.id === id);
  }

  getByLawyerNumber(lawyerNumber: string): Lawyer | undefined {
    return this.list().find((l) => l.lawyerNumber === lawyerNumber);
  }

  create(input: { name: string; phone?: string; email?: string; address?: string }): Lawyer {
    if (!input.name || !input.name.trim()) {
      throw new Error('Lawyer name is required');
    }

    const now = new Date().toISOString();
    const lawyer: Lawyer = {
      id: this.generateId(),
      lawyerNumber: this.generateLawyerNumber(),
      name: input.name.trim(),
      phone: input.phone?.trim(),
      email: input.email?.trim(),
      address: input.address?.trim(),
      createdAt: now,
      updatedAt: now,
    };

    this.storage.update<Lawyer[]>(STORAGE_KEY, (current) => [...(current ?? []), lawyer], []);
    return lawyer;
  }

  update(
    id: string,
    patch: Partial<Omit<Lawyer, 'id' | 'lawyerNumber' | 'createdAt' | 'updatedAt'>>,
  ): void {
    this.mutate((lawyers) =>
      lawyers.map((l) =>
        l.id === id
          ? {
              ...l,
              ...patch,
              name: patch.name?.trim() ?? l.name,
              phone: patch.phone?.trim(),
              email: patch.email?.trim(),
              address: patch.address?.trim(),
              updatedAt: new Date().toISOString(),
            }
          : l,
      ),
    );
  }

  delete(id: string): void {
    this.mutate((lawyers) => lawyers.filter((l) => l.id !== id));
  }

  private mutate(mutator: (lawyers: Lawyer[]) => Lawyer[]): void {
    this.storage.update<Lawyer[]>(STORAGE_KEY, (current) => mutator(current ?? []), []);
  }

  private seedData(): void {
    const now = new Date().toISOString();
    const initial: Lawyer[] = [
      {
        id: this.generateId(),
        lawyerNumber: 'LAW-001',
        name: 'Dr. Sarah Al-Qahtani',
        phone: '+966-500-111-111',
        email: 'sarah.qahtani@example.com',
        address: 'Riyadh, KSA',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: this.generateId(),
        lawyerNumber: 'LAW-002',
        name: 'Ahmed Al-Harbi',
        phone: '+966-500-222-222',
        email: 'ahmed.harbi@example.com',
        address: 'Jeddah, KSA',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: this.generateId(),
        lawyerNumber: 'LAW-003',
        name: 'Mona Al-Saleh',
        phone: '+966-500-333-333',
        email: 'mona.saleh@example.com',
        address: 'Dammam, KSA',
        createdAt: now,
        updatedAt: now,
      },
    ];
    this.storage.set(STORAGE_KEY, initial);
  }
}
