import { Injectable, inject } from '@angular/core';
import { CaseNumberService } from './case-number.service';
import { MockStorageService } from './mock-storage.service';

export interface ExecutionCase {
  id: string;
  caseNumber: string; // Primary identifier (format: YYYYNNN)
  executionCaseNo: string; // Legacy field, kept for compatibility
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
  private readonly caseNumberService = inject(CaseNumberService);

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
        caseNumber: '2025002',
        executionCaseNo: 'EX-2025-001',
        fileNo: 'FILE-2025-001',
        fileDate: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        courtRoom: 'Room 15',
        companyLawyer: 'Dr. Mohammed Al-Sheikh',
        lastCourtType: 'Cassation Court',
        lastCourtLevel: 'Cassation',
        amountRuled: 150000,
        amountPaid: 75000,
        linkedCaseId: 'case-4',
        unifiedCaseId: 'uc-4',
        createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    // Add more execution cases to reach 10 total
    const courtRooms = ['Room 15', 'Room 16', 'Room 17', 'Room 18', 'Room 19'];
    const courtTypes = ['Cassation Court', 'Appeal Court', 'Primary Court'];
    const courtLevels = ['Cassation', 'Appeal', 'Primary'];
    const lawyers = [
      'Dr. Mohammed Al-Sheikh',
      'Ahmed Al-Rashid',
      'Sara Al-Otaibi',
      'Khalid Al-Mutairi',
      'Fatima Al-Zahra',
      'Omar Al-Harbi',
      'Layla Al-Ghamdi',
    ];

    for (let i = 0; i < 9; i++) {
      const caseNum = 2025040 + i; // Start from 2025040
      const daysAgo = 60 - i * 5;
      const amountRuled = 100000 + i * 25000;
      const amountPaid = amountRuled * (0.3 + i * 0.1); // Varying payment percentages
      cases.push({
        id: `exec-${2 + i}`,
        caseNumber: caseNum.toString(),
        executionCaseNo: `EX-2025-${String(2 + i).padStart(3, '0')}`,
        fileNo: `FILE-2025-${String(2 + i).padStart(3, '0')}`,
        fileDate: new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
        courtRoom: courtRooms[i % courtRooms.length],
        companyLawyer: lawyers[i % lawyers.length],
        lastCourtType: courtTypes[i % courtTypes.length],
        lastCourtLevel: courtLevels[i % courtLevels.length],
        amountRuled,
        amountPaid: Math.min(amountPaid, amountRuled),
        linkedCaseId: i < 5 ? `case-${5 + i}` : undefined,
        unifiedCaseId: i < 5 ? `uc-${10 + i}` : undefined,
        createdAt: new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - (daysAgo - 2) * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    this.storage.set(STORAGE_KEY, cases);
  }

  getByCaseNumber(caseNumber: string): ExecutionCase | undefined {
    return this.list().find((e) => e.caseNumber === caseNumber);
  }

  getById(id: string): ExecutionCase | undefined {
    return this.list().find((c) => c.id === id);
  }

  create(input: {
    caseNumber?: string; // Optional - will be auto-generated if not provided
    executionCaseNo?: string; // Optional - will use caseNumber if not provided
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
    let caseNumber = input.caseNumber;
    if (!caseNumber) {
      // Collect existing case numbers from storage directly to avoid circular dependency
      const cases = this.storage.get<any[]>('cases', []);
      const arbitrations = this.storage.get<any[]>('arbitrations', []);

      const existingCaseNumbers: string[] = [];
      cases.forEach((c: any) => {
        if (c?.caseNumber) existingCaseNumbers.push(c.caseNumber);
        if (c?.baseCaseNumber) existingCaseNumbers.push(c.baseCaseNumber);
      });

      const existingArbitrationNumbers: string[] = [];
      arbitrations.forEach((a: any) => {
        if (a?.caseNumber) existingArbitrationNumbers.push(a.caseNumber);
      });

      const existingExecutionNumbers: string[] = [];
      this.list().forEach((e) => {
        if (e.caseNumber) existingExecutionNumbers.push(e.caseNumber);
      });

      caseNumber = this.caseNumberService.generateCaseNumber(
        existingCaseNumbers,
        existingArbitrationNumbers,
        existingExecutionNumbers,
      );
    }
    const item: ExecutionCase = {
      id: this.generateId(),
      caseNumber,
      executionCaseNo: input.executionCaseNo || `EX-${caseNumber}`,
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
