import { Injectable, inject } from '@angular/core';
import { MockStorageService } from './mock-storage.service';

export interface ArbitrationHearing {
  id: string;
  date: string; // ISO date
  remarks: string;
}

export interface CompanyRepresentative {
  lawyerName: string;
  position: string;
  address: string;
}

export interface OppositionRepresentative {
  lawyerName: string;
  position: string;
  address: string;
}

export interface Arbitration {
  id: string;
  // Arbitration Info
  appealability: string;
  fillingDate: string; // ISO date
  caseDescription: string;
  arbitrationRoom: string;
  arbitrationFees: number;
  maximumPeriod: string;
  // Company Representative
  companyRepresentative: CompanyRepresentative;
  // Opposition Representative
  oppositionRepresentative: OppositionRepresentative;
  // Hearings
  hearings: ArbitrationHearing[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'arbitrations';

@Injectable({ providedIn: 'root' })
export class ArbitrationsService {
  private readonly storage = inject(MockStorageService);

  private generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 0x0f) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  list(): Arbitration[] {
    return this.storage.get<Arbitration[]>(STORAGE_KEY, []);
  }

  getById(id: string): Arbitration | undefined {
    return this.list().find((a) => a.id === id);
  }

  create(input: {
    appealability: string;
    fillingDate: string;
    caseDescription: string;
    arbitrationRoom: string;
    arbitrationFees: number;
    maximumPeriod: string;
    companyRepresentative: CompanyRepresentative;
    oppositionRepresentative: OppositionRepresentative;
  }): Arbitration {
    const now = new Date().toISOString();
    const item: Arbitration = {
      id: this.generateId(),
      ...input,
      hearings: [],
      createdAt: now,
      updatedAt: now,
    };
    this.storage.update<Arbitration[]>(STORAGE_KEY, (current) => [...(current ?? []), item], []);
    return item;
  }

  update(id: string, patch: Partial<Omit<Arbitration, 'id' | 'createdAt' | 'updatedAt'>>): void {
    this.mutate((arbitrations) =>
      arbitrations.map((a) =>
        a.id === id ? { ...a, ...patch, updatedAt: new Date().toISOString() } : a,
      ),
    );
  }

  delete(id: string): void {
    this.mutate((arbitrations) => arbitrations.filter((a) => a.id !== id));
  }

  addHearing(id: string, hearing: Omit<ArbitrationHearing, 'id'>): ArbitrationHearing {
    const hearingWithId: ArbitrationHearing = { id: this.generateId(), ...hearing };
    this.mutate((arbitrations) =>
      arbitrations.map((a) =>
        a.id === id
          ? {
              ...a,
              hearings: [...a.hearings, hearingWithId],
              updatedAt: new Date().toISOString(),
            }
          : a,
      ),
    );
    return hearingWithId;
  }

  removeHearing(id: string, hearingId: string): void {
    this.mutate((arbitrations) =>
      arbitrations.map((a) =>
        a.id === id
          ? {
              ...a,
              hearings: a.hearings.filter((h) => h.id !== hearingId),
              updatedAt: new Date().toISOString(),
            }
          : a,
      ),
    );
  }

  private mutate(mutator: (arbitrations: Arbitration[]) => Arbitration[]): void {
    this.storage.update<Arbitration[]>(STORAGE_KEY, (current) => mutator(current ?? []), []);
  }
}
