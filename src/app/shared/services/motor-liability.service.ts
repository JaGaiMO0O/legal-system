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
    return this.storage.get<MotorLiabilityCase[]>(STORAGE_KEY, []);
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
