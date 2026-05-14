import { Injectable, inject } from '@angular/core';
import { CaseNumberService } from './case-number.service';
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
  caseNumber: string; // Primary identifier (format: YYYYNNN)
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
  unifiedCaseId?: string; // Unified identifier that links this arbitration across all entities
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'arbitrations';

@Injectable({ providedIn: 'root' })
export class ArbitrationsService {
  private readonly storage = inject(MockStorageService);
  private readonly caseNumberService = inject(CaseNumberService);

  private generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 0x0f) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  list(): Arbitration[] {
    const arbitrations = this.storage.get<Arbitration[]>(STORAGE_KEY, []);
    if (arbitrations.length === 0) {
      this.seedData();
      return this.storage.get<Arbitration[]>(STORAGE_KEY, []);
    }
    return arbitrations;
  }

  private seedData(): void {
    const now = new Date();
    const generateId = () => this.generateId();
    const toIso = (daysOffset: number) =>
      new Date(now.getTime() + daysOffset * 24 * 60 * 60 * 1000).toISOString();

    const arbitrations: Arbitration[] = [
      {
        id: 'arb-1',
        caseNumber: '2026201',
        appealability: 'قابل للطعن',
        fillingDate: toIso(-35),
        caseDescription: 'نزاع حول غرامات تأخير التوريد في عقد إسناد لوجستي.',
        arbitrationRoom: 'قاعة ب — ١١',
        arbitrationFees: 38000,
        maximumPeriod: '٩ أشهر',
        companyRepresentative: {
          lawyerName: 'رنا العنزي',
          position: 'مستشار قانوني أول',
          address: 'الرياض، شارع التخصصي',
        },
        oppositionRepresentative: {
          lawyerName: 'محامٍ خارجي — عمر حداد',
          position: 'ممثل المدعى عليه',
          address: 'جدة، حي الروضة',
        },
        hearings: [
          { id: generateId(), date: toIso(6), remarks: 'جلسة الاختصاص والجدول الزمني' },
          { id: generateId(), date: toIso(21), remarks: 'جلسة تبادل المستندات' },
        ],
        unifiedCaseId: 'uc-arb-201',
        createdAt: toIso(-35),
        updatedAt: toIso(-2),
      },
      {
        id: 'arb-2',
        caseNumber: '2026202',
        appealability: 'غير قابل للطعن',
        fillingDate: toIso(-60),
        caseDescription: 'نزاع مستحقات مقاول من الباطن بسبب أوامر تغيير في أعمال إنشائية.',
        arbitrationRoom: 'قاعة أ — ٠٤',
        arbitrationFees: 52000,
        maximumPeriod: '١٢ شهرًا',
        companyRepresentative: {
          lawyerName: 'زياد البيشي',
          position: 'محامٍ شراكة',
          address: 'الخبر، برج ٢',
        },
        oppositionRepresentative: {
          lawyerName: 'محامٍ خارجي — ياسمين قاضي',
          position: 'محامي المدعي',
          address: 'الرياض، العليا',
        },
        hearings: [{ id: generateId(), date: toIso(12), remarks: 'قائمة الشهود ونطاق الخبير' }],
        unifiedCaseId: 'uc-arb-202',
        createdAt: toIso(-60),
        updatedAt: toIso(-5),
      },
    ];

    this.storage.set(STORAGE_KEY, arbitrations);
  }

  getByCaseNumber(caseNumber: string): Arbitration | undefined {
    return this.list().find((a) => a.caseNumber === caseNumber);
  }

  getById(id: string): Arbitration | undefined {
    return this.list().find((a) => a.id === id);
  }

  create(input: {
    caseNumber?: string; // Optional - will be auto-generated if not provided
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
    let caseNumber = input.caseNumber;
    if (!caseNumber) {
      // Collect existing case numbers from storage directly to avoid circular dependency
      const cases = this.storage.get<any[]>('cases', []);
      const executionCases = this.storage.get<any[]>('executionCases', []);

      const existingCaseNumbers: string[] = [];
      cases.forEach((c: any) => {
        if (c?.caseNumber) existingCaseNumbers.push(c.caseNumber);
        if (c?.baseCaseNumber) existingCaseNumbers.push(c.baseCaseNumber);
      });

      const existingArbitrationNumbers: string[] = [];
      this.list().forEach((a) => {
        if (a.caseNumber) existingArbitrationNumbers.push(a.caseNumber);
      });

      const existingExecutionNumbers: string[] = [];
      executionCases.forEach((e: any) => {
        if (e?.caseNumber) existingExecutionNumbers.push(e.caseNumber);
      });

      caseNumber = this.caseNumberService.generateCaseNumber(
        existingCaseNumbers,
        existingArbitrationNumbers,
        existingExecutionNumbers,
      );
    }
    const item: Arbitration = {
      id: this.generateId(),
      caseNumber,
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
