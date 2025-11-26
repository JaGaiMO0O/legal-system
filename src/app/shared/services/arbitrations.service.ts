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
    const arbitrations = this.storage.get<Arbitration[]>(STORAGE_KEY, []);
    if (arbitrations.length === 0) {
      this.seedData();
      return this.storage.get<Arbitration[]>(STORAGE_KEY, []);
    }
    return arbitrations;
  }

  private seedData(): void {
    const now = new Date();
    const arbitrations: Arbitration[] = [
      {
        id: 'arb-1',
        appealability: 'Appealable',
        fillingDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
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
            id: 'hear-1',
            date: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString(),
            remarks: 'Initial hearing - case presentation',
          },
          {
            id: 'hear-2',
            date: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString(),
            remarks: 'Evidence review session',
          },
        ],
        createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'arb-2',
        appealability: 'Non-appealable',
        fillingDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        caseDescription: 'Insurance claim arbitration',
        arbitrationRoom: 'Room B-205',
        arbitrationFees: 18000,
        maximumPeriod: '4 months',
        companyRepresentative: {
          lawyerName: 'Fatima Al-Otaibi',
          position: 'Legal Director',
          address: 'Riyadh, Olaya Street, Tower 789',
        },
        oppositionRepresentative: {
          lawyerName: 'Khalid Al-Ghamdi',
          position: 'Attorney',
          address: 'Dammam, King Saud Street, Suite 321',
        },
        hearings: [
          {
            id: 'hear-3',
            date: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000).toISOString(),
            remarks: 'Preliminary hearing',
          },
        ],
        createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'arb-3',
        appealability: 'Appealable',
        fillingDate: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        caseDescription: 'Construction contract dispute - payment terms',
        arbitrationRoom: 'Room C-312',
        arbitrationFees: 35000,
        maximumPeriod: '8 months',
        companyRepresentative: {
          lawyerName: 'Dr. Mohammed Al-Sheikh',
          position: 'Senior Legal Counsel',
          address: 'Riyadh, King Fahd Road, Building 123',
        },
        oppositionRepresentative: {
          lawyerName: 'Nasser Al-Mutairi',
          position: 'Senior Attorney',
          address: 'Riyadh, Tahlia Street, Office 789',
        },
        hearings: [
          {
            id: 'hear-4',
            date: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
            remarks: 'First hearing - parties presentation',
          },
          {
            id: 'hear-5',
            date: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
            remarks: 'Technical expert testimony',
          },
          {
            id: 'hear-6',
            date: new Date(now.getTime() + 35 * 24 * 60 * 60 * 1000).toISOString(),
            remarks: 'Final arguments session',
          },
        ],
        createdAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'arb-4',
        appealability: 'Non-appealable',
        fillingDate: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        caseDescription: 'Employment termination dispute',
        arbitrationRoom: 'Room D-418',
        arbitrationFees: 15000,
        maximumPeriod: '3 months',
        companyRepresentative: {
          lawyerName: 'Fatima Al-Otaibi',
          position: 'Legal Director',
          address: 'Riyadh, Olaya Street, Tower 789',
        },
        oppositionRepresentative: {
          lawyerName: 'Salem Al-Qahtani',
          position: 'Labor Law Specialist',
          address: 'Jeddah, Palestine Street, Building 234',
        },
        hearings: [
          {
            id: 'hear-7',
            date: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000).toISOString(),
            remarks: 'Initial mediation session',
          },
        ],
        createdAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'arb-5',
        appealability: 'Appealable',
        fillingDate: new Date(now.getTime() - 80 * 24 * 60 * 60 * 1000).toISOString(),
        caseDescription: 'Partnership dissolution and asset distribution',
        arbitrationRoom: 'Room A-201',
        arbitrationFees: 42000,
        maximumPeriod: '10 months',
        companyRepresentative: {
          lawyerName: 'Dr. Mohammed Al-Sheikh',
          position: 'Senior Legal Counsel',
          address: 'Riyadh, King Fahd Road, Building 123',
        },
        oppositionRepresentative: {
          lawyerName: 'Majed Al-Shammari',
          position: 'Commercial Law Expert',
          address: 'Riyadh, King Abdullah Road, Suite 567',
        },
        hearings: [
          {
            id: 'hear-8',
            date: new Date(now.getTime() - 50 * 24 * 60 * 60 * 1000).toISOString(),
            remarks: 'Opening session - case overview',
          },
          {
            id: 'hear-9',
            date: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(),
            remarks: 'Financial documents review',
          },
          {
            id: 'hear-10',
            date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            remarks: 'Asset valuation discussion',
          },
        ],
        createdAt: new Date(now.getTime() - 80 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'arb-6',
        appealability: 'Non-appealable',
        fillingDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        caseDescription: 'Service agreement breach - delivery terms',
        arbitrationRoom: 'Room B-103',
        arbitrationFees: 20000,
        maximumPeriod: '5 months',
        companyRepresentative: {
          lawyerName: 'Fatima Al-Otaibi',
          position: 'Legal Director',
          address: 'Riyadh, Olaya Street, Tower 789',
        },
        oppositionRepresentative: {
          lawyerName: 'Faisal Al-Dosari',
          position: 'Contract Law Attorney',
          address: 'Dammam, Prince Mohammed Street, Office 890',
        },
        hearings: [
          {
            id: 'hear-11',
            date: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000).toISOString(),
            remarks: 'Preliminary hearing scheduled',
          },
        ],
        createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'arb-7',
        appealability: 'Appealable',
        fillingDate: new Date(now.getTime() - 70 * 24 * 60 * 60 * 1000).toISOString(),
        caseDescription: 'Intellectual property licensing dispute',
        arbitrationRoom: 'Room C-225',
        arbitrationFees: 30000,
        maximumPeriod: '7 months',
        companyRepresentative: {
          lawyerName: 'Dr. Mohammed Al-Sheikh',
          position: 'Senior Legal Counsel',
          address: 'Riyadh, King Fahd Road, Building 123',
        },
        oppositionRepresentative: {
          lawyerName: 'Khalid Al-Ghamdi',
          position: 'IP Law Specialist',
          address: 'Riyadh, King Fahd Road, Office 112',
        },
        hearings: [
          {
            id: 'hear-12',
            date: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000).toISOString(),
            remarks: 'Initial hearing - IP rights discussion',
          },
          {
            id: 'hear-13',
            date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            remarks: 'Technical expert consultation',
          },
        ],
        createdAt: new Date(now.getTime() - 70 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'arb-8',
        appealability: 'Non-appealable',
        fillingDate: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        caseDescription: 'Real estate lease agreement dispute',
        arbitrationRoom: 'Room D-305',
        arbitrationFees: 22000,
        maximumPeriod: '4 months',
        companyRepresentative: {
          lawyerName: 'Fatima Al-Otaibi',
          position: 'Legal Director',
          address: 'Riyadh, Olaya Street, Tower 789',
        },
        oppositionRepresentative: {
          lawyerName: 'Sultan Al-Rashid',
          position: 'Real Estate Attorney',
          address: 'Jeddah, Al-Malik Road, Building 445',
        },
        hearings: [
          {
            id: 'hear-14',
            date: new Date(now.getTime() + 22 * 24 * 60 * 60 * 1000).toISOString(),
            remarks: 'First hearing - lease terms review',
          },
        ],
        createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'arb-9',
        appealability: 'Appealable',
        fillingDate: new Date(now.getTime() - 55 * 24 * 60 * 60 * 1000).toISOString(),
        caseDescription: 'Supply chain contract - delivery delays',
        arbitrationRoom: 'Room A-305',
        arbitrationFees: 28000,
        maximumPeriod: '6 months',
        companyRepresentative: {
          lawyerName: 'Dr. Mohammed Al-Sheikh',
          position: 'Senior Legal Counsel',
          address: 'Riyadh, King Fahd Road, Building 123',
        },
        oppositionRepresentative: {
          lawyerName: 'Turki Al-Mutairi',
          position: 'Commercial Law Attorney',
          address: 'Riyadh, Olaya Street, Office 223',
        },
        hearings: [
          {
            id: 'hear-15',
            date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            remarks: 'Opening session',
          },
          {
            id: 'hear-16',
            date: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString(),
            remarks: 'Witness testimony session',
          },
        ],
        createdAt: new Date(now.getTime() - 55 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'arb-10',
        appealability: 'Non-appealable',
        fillingDate: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        caseDescription: 'Medical services billing dispute',
        arbitrationRoom: 'Room B-410',
        arbitrationFees: 16000,
        maximumPeriod: '3 months',
        companyRepresentative: {
          lawyerName: 'Fatima Al-Otaibi',
          position: 'Legal Director',
          address: 'Riyadh, Olaya Street, Tower 789',
        },
        oppositionRepresentative: {
          lawyerName: 'Adel Al-Qahtani',
          position: 'Healthcare Law Specialist',
          address: 'Riyadh, King Faisal Road, Clinic 334',
        },
        hearings: [
          {
            id: 'hear-17',
            date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            remarks: 'Preliminary hearing',
          },
        ],
        createdAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
    this.storage.set(STORAGE_KEY, arbitrations);
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
