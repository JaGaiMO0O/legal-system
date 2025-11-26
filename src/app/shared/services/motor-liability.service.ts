import { Injectable, inject } from '@angular/core';
import { MockStorageService } from './mock-storage.service';

export type DamageType = 'Fatal' | 'Disability';
export type Gender = 'Male' | 'Female';
export type MaritalStatus = 'Single' | 'Married' | 'Divorced' | 'Widowed';

export interface MotorLiabilityCase {
  id: string;
  // Case section
  caseNo: string;
  courtType: string;
  courtLevel: string;
  courtCity: string;
  caseDescription: string;
  // Claimant Info section
  claimantName: string;
  nationality: string;
  gender: Gender;
  age: number;
  maritalStatus: MaritalStatus;
  profession: string;
  damageType: DamageType;
  percentMoralPhysical: string; // e.g., "50% Moral, 30% Physical"
  totalClaimedAmount: number;
  totalPaidAmount: number;
  dateOfInsertion: string; // ISO date
  // Hearings and Case Development section
  periodFrom: string; // ISO date
  periodTo: string; // ISO date
  hearingsCourtType: string;
  hearingsCourtLevel: string;
  courtRoom: string;
  rulingDate: string; // ISO date
  // Metadata
  linkedClaimId?: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'motorLiabilityCases';

@Injectable({ providedIn: 'root' })
export class MotorLiabilityService {
  private readonly storage = inject(MockStorageService);

  private generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 0x0f) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  list(): MotorLiabilityCase[] {
    const cases = this.storage.get<MotorLiabilityCase[]>(STORAGE_KEY, []);
    if (cases.length === 0) {
      this.seedData();
      return this.storage.get<MotorLiabilityCase[]>(STORAGE_KEY, []);
    }
    return cases;
  }

  private seedData(): void {
    const now = new Date();
    const cases: MotorLiabilityCase[] = [
      {
        id: 'ml-1',
        caseNo: 'ML-2025-001',
        courtType: 'Civil Court',
        courtLevel: 'Primary',
        courtCity: 'Riyadh',
        caseDescription: 'Motor vehicle accident - rear-end collision',
        claimantName: 'Ahmed Al-Mansouri',
        nationality: 'Saudi',
        gender: 'Male',
        age: 35,
        maritalStatus: 'Married',
        profession: 'Engineer',
        damageType: 'Disability',
        percentMoralPhysical: '40% Moral, 25% Physical',
        totalClaimedAmount: 150000,
        totalPaidAmount: 75000,
        dateOfInsertion: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        periodFrom: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        periodTo: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        hearingsCourtType: 'Civil Court',
        hearingsCourtLevel: 'Primary',
        courtRoom: 'Room 12',
        rulingDate: '',
        linkedClaimId: 'claim-1',
        createdAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'ml-2',
        caseNo: 'ML-2025-002',
        courtType: 'Civil Court',
        courtLevel: 'Primary',
        courtCity: 'Jeddah',
        caseDescription: 'Highway accident - side impact',
        claimantName: 'Sara Al-Otaibi',
        nationality: 'Saudi',
        gender: 'Female',
        age: 28,
        maritalStatus: 'Single',
        profession: 'Teacher',
        damageType: 'Disability',
        percentMoralPhysical: '30% Moral, 20% Physical',
        totalClaimedAmount: 120000,
        totalPaidAmount: 60000,
        dateOfInsertion: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        periodFrom: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        periodTo: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        hearingsCourtType: 'Civil Court',
        hearingsCourtLevel: 'Primary',
        courtRoom: 'Room 8',
        rulingDate: '',
        linkedClaimId: 'claim-2',
        createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'ml-3',
        caseNo: 'ML-2025-003',
        courtType: 'Civil Court',
        courtLevel: 'Primary',
        courtCity: 'Dammam',
        caseDescription: 'Traffic accident - head-on collision',
        claimantName: 'Khalid Al-Ghamdi',
        nationality: 'Saudi',
        gender: 'Male',
        age: 42,
        maritalStatus: 'Married',
        profession: 'Business Owner',
        damageType: 'Fatal',
        percentMoralPhysical: '100% Fatal',
        totalClaimedAmount: 500000,
        totalPaidAmount: 250000,
        dateOfInsertion: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        periodFrom: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        periodTo: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        hearingsCourtType: 'Civil Court',
        hearingsCourtLevel: 'Primary',
        courtRoom: 'Room 15',
        rulingDate: '',
        linkedClaimId: 'claim-3',
        createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'ml-4',
        caseNo: 'ML-2024-189',
        courtType: 'Civil Court',
        courtLevel: 'Appeal',
        courtCity: 'Riyadh',
        caseDescription: 'Multi-vehicle accident on highway',
        claimantName: 'Fatima Al-Zahra',
        nationality: 'Saudi',
        gender: 'Female',
        age: 31,
        maritalStatus: 'Married',
        profession: 'Doctor',
        damageType: 'Disability',
        percentMoralPhysical: '50% Moral, 35% Physical',
        totalClaimedAmount: 200000,
        totalPaidAmount: 100000,
        dateOfInsertion: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        periodFrom: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        periodTo: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        hearingsCourtType: 'Appeal Court',
        hearingsCourtLevel: 'Appeal',
        courtRoom: 'Room 22',
        rulingDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        linkedClaimId: 'claim-4',
        createdAt: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'ml-5',
        caseNo: 'ML-2025-004',
        courtType: 'Civil Court',
        courtLevel: 'Primary',
        courtCity: 'Riyadh',
        caseDescription: 'Parking lot collision - vehicle damage',
        claimantName: 'Omar Al-Shammari',
        nationality: 'Saudi',
        gender: 'Male',
        age: 26,
        maritalStatus: 'Single',
        profession: 'Student',
        damageType: 'Disability',
        percentMoralPhysical: '15% Moral, 10% Physical',
        totalClaimedAmount: 45000,
        totalPaidAmount: 0,
        dateOfInsertion: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        periodFrom: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        periodTo: new Date(now.getTime() + 50 * 24 * 60 * 60 * 1000).toISOString(),
        hearingsCourtType: 'Civil Court',
        hearingsCourtLevel: 'Primary',
        courtRoom: 'Room 5',
        rulingDate: '',
        linkedClaimId: 'claim-5',
        createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'ml-6',
        caseNo: 'ML-2025-005',
        courtType: 'Civil Court',
        courtLevel: 'Primary',
        courtCity: 'Jeddah',
        caseDescription: 'Hit and run incident - pedestrian injury',
        claimantName: 'Noura Al-Mutairi',
        nationality: 'Saudi',
        gender: 'Female',
        age: 33,
        maritalStatus: 'Married',
        profession: 'Nurse',
        damageType: 'Disability',
        percentMoralPhysical: '35% Moral, 25% Physical',
        totalClaimedAmount: 95000,
        totalPaidAmount: 0,
        dateOfInsertion: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        periodFrom: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        periodTo: new Date(now.getTime() + 55 * 24 * 60 * 60 * 1000).toISOString(),
        hearingsCourtType: 'Civil Court',
        hearingsCourtLevel: 'Primary',
        courtRoom: 'Room 11',
        rulingDate: '',
        linkedClaimId: 'claim-6',
        createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'ml-7',
        caseNo: 'ML-2024-201',
        courtType: 'Civil Court',
        courtLevel: 'Appeal',
        courtCity: 'Riyadh',
        caseDescription: 'Multi-vehicle highway accident',
        claimantName: 'Yusuf Al-Qahtani',
        nationality: 'Saudi',
        gender: 'Male',
        age: 38,
        maritalStatus: 'Married',
        profession: 'Accountant',
        damageType: 'Disability',
        percentMoralPhysical: '45% Moral, 30% Physical',
        totalClaimedAmount: 180000,
        totalPaidAmount: 90000,
        dateOfInsertion: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        periodFrom: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        periodTo: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        hearingsCourtType: 'Appeal Court',
        hearingsCourtLevel: 'Appeal',
        courtRoom: 'Room 18',
        rulingDate: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        linkedClaimId: 'claim-7',
        createdAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'ml-8',
        caseNo: 'ML-2025-006',
        courtType: 'Civil Court',
        courtLevel: 'Primary',
        courtCity: 'Dammam',
        caseDescription: 'Vehicle damage from falling debris',
        claimantName: 'Hassan Al-Rashid',
        nationality: 'Saudi',
        gender: 'Male',
        age: 29,
        maritalStatus: 'Single',
        profession: 'Sales Manager',
        damageType: 'Disability',
        percentMoralPhysical: '20% Moral, 15% Physical',
        totalClaimedAmount: 65000,
        totalPaidAmount: 0,
        dateOfInsertion: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        periodFrom: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        periodTo: new Date(now.getTime() + 40 * 24 * 60 * 60 * 1000).toISOString(),
        hearingsCourtType: 'Civil Court',
        hearingsCourtLevel: 'Primary',
        courtRoom: 'Room 7',
        rulingDate: '',
        linkedClaimId: 'claim-9',
        createdAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'ml-9',
        caseNo: 'ML-2024-278',
        courtType: 'Civil Court',
        courtLevel: 'Primary',
        courtCity: 'Riyadh',
        caseDescription: 'Rural road head-on collision',
        claimantName: 'Maha Al-Sheikh',
        nationality: 'Saudi',
        gender: 'Female',
        age: 36,
        maritalStatus: 'Married',
        profession: 'Lawyer',
        damageType: 'Disability',
        percentMoralPhysical: '55% Moral, 40% Physical',
        totalClaimedAmount: 220000,
        totalPaidAmount: 110000,
        dateOfInsertion: new Date(now.getTime() - 75 * 24 * 60 * 60 * 1000).toISOString(),
        periodFrom: new Date(now.getTime() - 75 * 24 * 60 * 60 * 1000).toISOString(),
        periodTo: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        hearingsCourtType: 'Civil Court',
        hearingsCourtLevel: 'Primary',
        courtRoom: 'Room 20',
        rulingDate: '',
        linkedClaimId: 'claim-10',
        createdAt: new Date(now.getTime() - 75 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'ml-10',
        caseNo: 'ML-2025-007',
        courtType: 'Civil Court',
        courtLevel: 'Primary',
        courtCity: 'Jeddah',
        caseDescription: 'Minor fender bender - property damage',
        claimantName: 'Fahad Al-Dosari',
        nationality: 'Saudi',
        gender: 'Male',
        age: 24,
        maritalStatus: 'Single',
        profession: 'Engineer',
        damageType: 'Disability',
        percentMoralPhysical: '10% Moral, 5% Physical',
        totalClaimedAmount: 28000,
        totalPaidAmount: 0,
        dateOfInsertion: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        periodFrom: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        periodTo: new Date(now.getTime() + 62 * 24 * 60 * 60 * 1000).toISOString(),
        hearingsCourtType: 'Civil Court',
        hearingsCourtLevel: 'Primary',
        courtRoom: 'Room 3',
        rulingDate: '',
        linkedClaimId: 'claim-11',
        createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
    this.storage.set(STORAGE_KEY, cases);
  }

  getById(id: string): MotorLiabilityCase | undefined {
    return this.list().find((c) => c.id === id);
  }

  getByClaimId(claimId: string): MotorLiabilityCase | undefined {
    return this.list().find((c) => c.linkedClaimId === claimId);
  }

  create(input: {
    caseNo: string;
    courtType: string;
    courtLevel: string;
    courtCity: string;
    caseDescription: string;
    claimantName: string;
    nationality: string;
    gender: Gender;
    age: number;
    maritalStatus: MaritalStatus;
    profession: string;
    damageType: DamageType;
    percentMoralPhysical: string;
    totalClaimedAmount: number;
    totalPaidAmount: number;
    dateOfInsertion: string;
    periodFrom: string;
    periodTo: string;
    hearingsCourtType: string;
    hearingsCourtLevel: string;
    courtRoom: string;
    rulingDate: string;
    linkedClaimId?: string;
  }): MotorLiabilityCase {
    const now = new Date().toISOString();
    const item: MotorLiabilityCase = {
      id: this.generateId(),
      ...input,
      createdAt: now,
      updatedAt: now,
    };
    this.storage.update<MotorLiabilityCase[]>(
      STORAGE_KEY,
      (current) => [...(current ?? []), item],
      [],
    );
    return item;
  }

  update(
    id: string,
    patch: Partial<Omit<MotorLiabilityCase, 'id' | 'createdAt' | 'updatedAt'>>,
  ): void {
    this.mutate((cases) =>
      cases.map((c) => (c.id === id ? { ...c, ...patch, updatedAt: new Date().toISOString() } : c)),
    );
  }

  delete(id: string): void {
    this.mutate((cases) => cases.filter((c) => c.id !== id));
  }

  private mutate(mutator: (cases: MotorLiabilityCase[]) => MotorLiabilityCase[]): void {
    this.storage.update<MotorLiabilityCase[]>(STORAGE_KEY, (current) => mutator(current ?? []), []);
  }
}
