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
    const arbitrations: Arbitration[] = [
      {
        id: 'arb-1',
        caseNumber: '2025001',
        appealability: 'Appealable',
        fillingDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        caseDescription: 'Commercial dispute regarding contract terms',
        arbitrationRoom: 'Room A-101',
        arbitrationFees: 25000,
        maximumPeriod: '6 months',
        companyRepresentative: {
          lawyerName: 'Dr. Mohammed Al-Sheikh',
          position: 'Senior Legal Counsel',
          address: 'Riyadh, King Fahd Road, Building 123',
        },
        oppositionRepresentative: {
          lawyerName: 'Ahmed Al-Rashid',
          position: 'Legal Advisor',
          address: 'Jeddah, Corniche Road, Office 456',
        },
        hearings: [
          {
            id: generateId(),
            date: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString(),
            remarks: 'Initial hearing - case presentation',
          },
        ],
        createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    // Add more arbitrations to reach 15 total
    const rooms = ['Room A-101', 'Room A-102', 'Room B-201', 'Room B-202', 'Room C-301'];
    const periods = ['6 months', '12 months', '18 months', '24 months'];
    const appealabilities = ['Appealable', 'Non-Appealable'];
    const companyLawyers = [
      'Dr. Mohammed Al-Sheikh',
      'Ahmed Al-Rashid',
      'Sara Al-Otaibi',
      'Khalid Al-Mutairi',
      'Fatima Al-Zahra',
      'Omar Al-Harbi',
      'Layla Al-Ghamdi',
    ];
    const oppositionLawyers = [
      'Yousef Al-Shehri',
      'Noura Al-Qahtani',
      'Faisal Al-Dosari',
      'Hanan Al-Mazrouei',
      'Sultan Al-Otaibi',
      'Reem Al-Shammari',
      'Bandar Al-Mutlaq',
    ];
    const positions = ['Senior Legal Counsel', 'Legal Advisor', 'Associate Lawyer', 'Partner'];

    for (let i = 0; i < 14; i++) {
      const caseNum = 2025030 + i; // Start from 2025030 to avoid conflicts
      const daysAgo = 120 - i * 5;
      arbitrations.push({
        id: `arb-${2 + i}`,
        caseNumber: caseNum.toString(),
        appealability: appealabilities[i % appealabilities.length],
        fillingDate: new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
        caseDescription: `Arbitration case ${caseNum} - ${['Commercial dispute', 'Contract breach', 'Payment dispute', 'Service agreement', 'Partnership dispute'][i % 5]}`,
        arbitrationRoom: rooms[i % rooms.length],
        arbitrationFees: 20000 + i * 2000,
        maximumPeriod: periods[i % periods.length],
        companyRepresentative: {
          lawyerName: companyLawyers[i % companyLawyers.length],
          position: positions[i % positions.length],
          address: `Riyadh, Building ${100 + i}`,
        },
        oppositionRepresentative: {
          lawyerName: oppositionLawyers[i % oppositionLawyers.length],
          position: positions[(i + 1) % positions.length],
          address: `Jeddah, Office ${200 + i}`,
        },
        hearings: [
          {
            id: generateId(),
            date: new Date(now.getTime() + (i + 1) * 7 * 24 * 60 * 60 * 1000).toISOString(),
            remarks: `Hearing ${i + 1} - ${['Initial presentation', 'Evidence review', 'Witness testimony', 'Final arguments'][i % 4]}`,
          },
          ...(i % 2 === 0
            ? [
                {
                  id: generateId(),
                  date: new Date(now.getTime() + (i + 2) * 7 * 24 * 60 * 60 * 1000).toISOString(),
                  remarks: `Follow-up hearing ${i + 1}`,
                },
              ]
            : []),
        ],
        unifiedCaseId: i < 5 ? `uc-arb-${i + 1}` : undefined,
        createdAt: new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - (daysAgo - 3) * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

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
