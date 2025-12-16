import { Injectable, inject } from '@angular/core';
import { MockStorageService } from './mock-storage.service';

export interface ExecutionCase {
  id: string;
  executionCaseNo: string;
  fileNo: string;
  fileDate: string; // ISO date
  courtRoom: string;
  companyLawyer: string;
  lastCourtType: string;
  lastCourtLevel: string;
  amountRuled: number;
  amountPaid: number;
  linkedCaseId?: string;
  unifiedCaseId?: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'executionCases';

@Injectable({ providedIn: 'root' })
export class ExecutionCasesService {
  private readonly storage = inject(MockStorageService);

  private generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 0x0f) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  list(): ExecutionCase[] {
    const cases = this.storage.get<ExecutionCase[]>(STORAGE_KEY, []);
    if (cases.length === 0) {
      this.seedData();
      return this.storage.get<ExecutionCase[]>(STORAGE_KEY, []);
    }
    return cases;
  }

  private seedData(): void {
    const now = new Date();
    const cases: ExecutionCase[] = [
      {
        id: 'exec-1',
        executionCaseNo: 'EX-2025-001',
        fileNo: 'FILE-2025-001',
        fileDate: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        courtRoom: 'Room 15',
        companyLawyer: 'Dr. Mohammed Al-Sheikh',
        lastCourtType: 'Cassation Court',
        lastCourtLevel: 'Cassation',
        amountRuled: 150000,
        amountPaid: 75000,
        createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
    this.storage.set(STORAGE_KEY, cases);
  }

  getById(id: string): ExecutionCase | undefined {
    return this.list().find((c) => c.id === id);
  }

  create(input: {
    executionCaseNo: string;
    fileNo: string;
    fileDate: string;
    courtRoom: string;
    companyLawyer: string;
    lastCourtType: string;
    lastCourtLevel: string;
    amountRuled: number;
    amountPaid: number;
    linkedCaseId?: string;
    unifiedCaseId?: string;
  }): ExecutionCase {
    const now = new Date().toISOString();
    const item: ExecutionCase = {
      id: this.generateId(),
      ...input,
      createdAt: now,
      updatedAt: now,
    };
    this.storage.update<ExecutionCase[]>(STORAGE_KEY, (current) => [...(current ?? []), item], []);
    return item;
  }

  update(id: string, patch: Partial<Omit<ExecutionCase, 'id' | 'createdAt' | 'updatedAt'>>): void {
    this.mutate((cases) =>
      cases.map((c) => (c.id === id ? { ...c, ...patch, updatedAt: new Date().toISOString() } : c)),
    );
  }

  delete(id: string): void {
    this.mutate((cases) => cases.filter((c) => c.id !== id));
  }

  private mutate(mutator: (cases: ExecutionCase[]) => ExecutionCase[]): void {
    this.storage.update<ExecutionCase[]>(STORAGE_KEY, (current) => mutator(current ?? []), []);
  }
}
