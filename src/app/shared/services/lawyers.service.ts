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
    const now = Date.now();
    const lawyers: Lawyer[] = [
      {
        id: 'lawyer-1',
        lawyerNumber: 'LAW-001',
        name: 'رنا العنزي',
        phone: '+966501210001',
        email: 'rana.enezi@legal-portal.local',
        address: 'الرياض، شارع التخصصي، مكتب ١٤',
        createdAt: new Date(now - 120 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'lawyer-2',
        lawyerNumber: 'LAW-002',
        name: 'زياد البيشي',
        phone: '+966501210002',
        email: 'ziad.bishi@legal-portal.local',
        address: 'جدة، طريق الأمير محمد بن عبدالعزيز، جناح ٢٣',
        createdAt: new Date(now - 110 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'lawyer-3',
        lawyerNumber: 'LAW-003',
        name: 'نورة الشهري',
        phone: '+966501210003',
        email: 'noura.shehri@legal-portal.local',
        address: 'الدمام، الكورنيش، برج ٧',
        createdAt: new Date(now - 90 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    this.storage.set(STORAGE_KEY, lawyers);
  }
}
