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
        linkedCaseId: 'case-3',
        createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'exec-2',
        executionCaseNo: 'EX-2025-002',
        fileNo: 'FILE-2025-045',
        fileDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        courtRoom: 'Room 22',
        companyLawyer: 'Fatima Al-Otaibi',
        lastCourtType: 'Appeal Court',
        lastCourtLevel: 'Appeal',
        amountRuled: 85000,
        amountPaid: 0,
        createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'exec-3',
        executionCaseNo: 'EX-2025-003',
        fileNo: 'FILE-2025-078',
        fileDate: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000).toISOString(),
        courtRoom: 'Room 8',
        companyLawyer: 'Dr. Mohammed Al-Sheikh',
        lastCourtType: 'Primary Court',
        lastCourtLevel: 'Primary',
        amountRuled: 125000,
        amountPaid: 125000,
        linkedCaseId: 'case-11',
        createdAt: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'exec-4',
        executionCaseNo: 'EX-2024-234',
        fileNo: 'FILE-2024-234',
        fileDate: new Date(now.getTime() - 100 * 24 * 60 * 60 * 1000).toISOString(),
        courtRoom: 'Room 19',
        companyLawyer: 'Fatima Al-Otaibi',
        lastCourtType: 'Commercial Court',
        lastCourtLevel: 'Primary',
        amountRuled: 95000,
        amountPaid: 95000,
        linkedCaseId: 'case-14',
        createdAt: new Date(now.getTime() - 100 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'exec-5',
        executionCaseNo: 'EX-2025-004',
        fileNo: 'FILE-2025-112',
        fileDate: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000).toISOString(),
        courtRoom: 'Room 25',
        companyLawyer: 'Dr. Mohammed Al-Sheikh',
        lastCourtType: 'Appeal Court',
        lastCourtLevel: 'Appeal',
        amountRuled: 200000,
        amountPaid: 50000,
        createdAt: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'exec-6',
        executionCaseNo: 'EX-2024-189',
        fileNo: 'FILE-2024-189',
        fileDate: new Date(now.getTime() - 80 * 24 * 60 * 60 * 1000).toISOString(),
        courtRoom: 'Room 14',
        companyLawyer: 'Fatima Al-Otaibi',
        lastCourtType: 'Labor Court',
        lastCourtLevel: 'Primary',
        amountRuled: 35000,
        amountPaid: 35000,
        createdAt: new Date(now.getTime() - 80 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 50 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'exec-7',
        executionCaseNo: 'EX-2025-005',
        fileNo: 'FILE-2025-145',
        fileDate: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        courtRoom: 'Room 31',
        companyLawyer: 'Dr. Mohammed Al-Sheikh',
        lastCourtType: 'Civil Court',
        lastCourtLevel: 'Primary',
        amountRuled: 175000,
        amountPaid: 0,
        createdAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'exec-8',
        executionCaseNo: 'EX-2024-312',
        fileNo: 'FILE-2024-312',
        fileDate: new Date(now.getTime() - 95 * 24 * 60 * 60 * 1000).toISOString(),
        courtRoom: 'Room 6',
        companyLawyer: 'Fatima Al-Otaibi',
        lastCourtType: 'Family Court',
        lastCourtLevel: 'Primary',
        amountRuled: 0,
        amountPaid: 0,
        linkedCaseId: 'case-13',
        createdAt: new Date(now.getTime() - 95 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'exec-9',
        executionCaseNo: 'EX-2025-006',
        fileNo: 'FILE-2025-167',
        fileDate: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        courtRoom: 'Room 28',
        companyLawyer: 'Dr. Mohammed Al-Sheikh',
        lastCourtType: 'Commercial Court',
        lastCourtLevel: 'Primary',
        amountRuled: 280000,
        amountPaid: 0,
        createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'exec-10',
        executionCaseNo: 'EX-2024-456',
        fileNo: 'FILE-2024-456',
        fileDate: new Date(now.getTime() - 150 * 24 * 60 * 60 * 1000).toISOString(),
        courtRoom: 'Room 11',
        companyLawyer: 'Fatima Al-Otaibi',
        lastCourtType: 'Civil Court',
        lastCourtLevel: 'Primary',
        amountRuled: 110000,
        amountPaid: 110000,
        createdAt: new Date(now.getTime() - 150 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
    this.storage.set(STORAGE_KEY, cases);
  }

  getById(id: string): ExecutionCase | undefined {
    return this.list().find((e) => e.id === id);
  }

  getByCaseId(caseId: string): ExecutionCase | undefined {
    return this.list().find((e) => e.linkedCaseId === caseId);
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
