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
  unifiedCaseId?: string; // Unified identifier that links this case across all entities
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
    const toIso = (daysOffset: number) =>
      new Date(now.getTime() + daysOffset * 24 * 60 * 60 * 1000).toISOString();
    const cases: MotorLiabilityCase[] = [
      {
        id: 'ml-1',
        caseNo: 'ML-2026-101',
        courtType: 'محكمة مدنية عامة',
        courtLevel: 'ابتدائي',
        courtCity: 'الرياض',
        caseDescription: 'تصادم سلسلي بين ثلاث مركبات مع إصابات وتقدير خسارة المركبة.',
        claimantName: 'فهد العنزي',
        nationality: 'سعودي',
        gender: 'Male',
        age: 34,
        maritalStatus: 'Married',
        profession: 'مدير عمليات',
        damageType: 'Disability',
        percentMoralPhysical: '١٥٪ أدبية، ٣٠٪ جسمانية',
        totalClaimedAmount: 185000,
        totalPaidAmount: 60000,
        dateOfInsertion: toIso(-40),
        periodFrom: toIso(-40),
        periodTo: toIso(35),
        hearingsCourtType: 'محكمة مدنية عامة',
        hearingsCourtLevel: 'ابتدائي',
        courtRoom: 'قاعة ٩',
        rulingDate: '',
        unifiedCaseId: 'uc-1001',
        createdAt: toIso(-40),
        updatedAt: toIso(-2),
      },
      {
        id: 'ml-2',
        caseNo: 'ML-2026-102',
        courtType: 'محكمة مدنية عامة',
        courtLevel: 'استئناف',
        courtCity: 'جدة',
        caseDescription: 'مطالبة بإصابة راكب أثناء عبور ممر مشاة عند تقاطع إشارات.',
        claimantName: 'رغد الصبحي',
        nationality: 'سعودية',
        gender: 'Female',
        age: 28,
        maritalStatus: 'Single',
        profession: 'معلمة',
        damageType: 'Fatal',
        percentMoralPhysical: '١٠٠٪ أدبية، ٠٪ جسمانية',
        totalClaimedAmount: 420000,
        totalPaidAmount: 210000,
        dateOfInsertion: toIso(-120),
        periodFrom: toIso(-120),
        periodTo: toIso(20),
        hearingsCourtType: 'محكمة مدنية عامة',
        hearingsCourtLevel: 'استئناف',
        courtRoom: 'قاعة ٥',
        rulingDate: toIso(-12),
        unifiedCaseId: 'uc-ml-102',
        createdAt: toIso(-120),
        updatedAt: toIso(-10),
      },
    ];
    this.storage.set(STORAGE_KEY, cases);
  }

  getById(id: string): MotorLiabilityCase | undefined {
    return this.list().find((c) => c.id === id);
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
    unifiedCaseId?: string;
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
