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
  requestNo?: string;
  requestDate?: string;
  executionApplicant?: string;
  executionRespondent?: string;
  requestClassification?: string;
  demandedSubject?: string;
  enforcementInstrument?: string;
  instrumentIssuingBody?: string;
  executionRequestStatus?: string;
  rulingReferenceNo?: string;
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
    const toIso = (daysOffset: number) =>
      new Date(now.getTime() + daysOffset * 24 * 60 * 60 * 1000).toISOString();

    const cases: ExecutionCase[] = [
      {
        id: 'exec-1',
        caseNumber: '2026301',
        executionCaseNo: 'EX-2026-301',
        fileNo: 'ملف-تنفيذ-٣٠١',
        fileDate: toIso(-28),
        courtRoom: 'قاعة التنفيذ ٣',
        companyLawyer: 'رنا العنزي',
        lastCourtType: 'محكمة مرور',
        lastCourtLevel: 'ابتدائي',
        amountRuled: 122000,
        amountPaid: 42000,
        linkedCaseId: 'case-1',
        unifiedCaseId: 'uc-1001',
        executionApplicant: 'شركة نور لللوجستيات',
        executionRespondent: 'مؤسسة النقل السريع',
        createdAt: toIso(-28),
        updatedAt: toIso(-2),
      },
      {
        id: 'exec-2',
        caseNumber: '2026302',
        executionCaseNo: 'EX-2026-302',
        fileNo: 'ملف-تنفيذ-٣٠٢',
        fileDate: toIso(-12),
        courtRoom: 'قاعة التنفيذ ١',
        companyLawyer: 'زياد البيشي',
        lastCourtType: 'محكمة تجارية',
        lastCourtLevel: 'ابتدائي',
        amountRuled: 75000,
        amountPaid: 25000,
        linkedCaseId: 'case-2',
        unifiedCaseId: 'uc-1002',
        createdAt: toIso(-12),
        updatedAt: toIso(-1),
      },
      {
        id: 'exec-3',
        caseNumber: '2026303',
        executionCaseNo: 'EX-2026-303',
        fileNo: 'ملف-تنفيذ-٣٠٣',
        fileDate: toIso(-45),
        courtRoom: 'قاعة التنفيذ ٢',
        companyLawyer: 'رنا العنزي',
        lastCourtType: 'محكمة مرور',
        lastCourtLevel: 'استئناف',
        amountRuled: 210000,
        amountPaid: 95000,
        linkedCaseId: 'case-7',
        unifiedCaseId: 'uc-1007',
        createdAt: toIso(-45),
        updatedAt: toIso(-4),
      },
      {
        id: 'exec-4',
        caseNumber: '2026304',
        executionCaseNo: 'EX-2026-304',
        fileNo: 'ملف-تنفيذ-٣٠٤',
        fileDate: toIso(-60),
        courtRoom: 'قاعة التنفيذ ٤',
        companyLawyer: 'نورة الشهري',
        lastCourtType: 'محكمة مدنية',
        lastCourtLevel: 'ابتدائي',
        amountRuled: 45000,
        amountPaid: 45000,
        linkedCaseId: 'case-6',
        unifiedCaseId: 'uc-1006',
        createdAt: toIso(-60),
        updatedAt: toIso(-10),
      },
    ];

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
    requestNo?: string;
    requestDate?: string;
    executionApplicant?: string;
    executionRespondent?: string;
    requestClassification?: string;
    demandedSubject?: string;
    enforcementInstrument?: string;
    instrumentIssuingBody?: string;
    executionRequestStatus?: string;
    rulingReferenceNo?: string;
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
