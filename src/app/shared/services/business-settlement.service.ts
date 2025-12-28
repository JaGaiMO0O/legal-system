import { Injectable, inject } from '@angular/core';
import { MockStorageService } from './mock-storage.service';

export interface BusinessSettlement {
  id: string;
  departmentAmount: number;
  legalDepartmentAmount: number;
  managementAmount: number;
  adversaryAmount: number;
  amountOfAmicableAgreement: number;
  linkedClaimId?: string;
  linkedCaseId?: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'businessSettlements';

@Injectable({ providedIn: 'root' })
export class BusinessSettlementService {
  private readonly storage = inject(MockStorageService);

  private generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 0x0f) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  list(): BusinessSettlement[] {
    const settlements = this.storage.get<BusinessSettlement[]>(STORAGE_KEY, []);
    if (settlements.length === 0) {
      this.seedData();
      return this.storage.get<BusinessSettlement[]>(STORAGE_KEY, []);
    }
    return settlements;
  }

  private seedData(): void {
    const now = new Date();
    const settlements: BusinessSettlement[] = [
      {
        id: 'settle-1',
        departmentAmount: 50000,
        legalDepartmentAmount: 30000,
        managementAmount: 20000,
        adversaryAmount: 40000,
        amountOfAmicableAgreement: 100000,
        linkedCaseId: 'case-5',
        createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    // Add more settlements to reach 10 total
    for (let i = 0; i < 9; i++) {
      const baseAmount = 50000 + i * 10000;
      const departmentAmount = baseAmount * 0.4;
      const legalDepartmentAmount = baseAmount * 0.3;
      const managementAmount = baseAmount * 0.2;
      const adversaryAmount = baseAmount * 0.5;
      const amountOfAmicableAgreement = baseAmount * 1.2;
      const daysAgo = 60 - i * 5;

      settlements.push({
        id: `settle-${2 + i}`,
        departmentAmount: Math.round(departmentAmount),
        legalDepartmentAmount: Math.round(legalDepartmentAmount),
        managementAmount: Math.round(managementAmount),
        adversaryAmount: Math.round(adversaryAmount),
        amountOfAmicableAgreement: Math.round(amountOfAmicableAgreement),
        linkedCaseId: i < 5 ? `case-${6 + i}` : undefined,
        createdAt: new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - (daysAgo - 3) * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    this.storage.set(STORAGE_KEY, settlements);
  }

  getById(id: string): BusinessSettlement | undefined {
    return this.list().find((s) => s.id === id);
  }

  getByClaimId(claimId: string): BusinessSettlement | undefined {
    return this.list().find((s) => s.linkedClaimId === claimId);
  }

  getByCaseId(caseId: string): BusinessSettlement | undefined {
    return this.list().find((s) => s.linkedCaseId === caseId);
  }

  create(input: {
    departmentAmount: number;
    legalDepartmentAmount: number;
    managementAmount: number;
    adversaryAmount: number;
    amountOfAmicableAgreement: number;
    linkedClaimId?: string;
    linkedCaseId?: string;
  }): BusinessSettlement {
    const now = new Date().toISOString();
    const item: BusinessSettlement = {
      id: this.generateId(),
      ...input,
      createdAt: now,
      updatedAt: now,
    };
    this.storage.update<BusinessSettlement[]>(
      STORAGE_KEY,
      (current) => [...(current ?? []), item],
      [],
    );
    return item;
  }

  update(
    id: string,
    patch: Partial<Omit<BusinessSettlement, 'id' | 'createdAt' | 'updatedAt'>>,
  ): void {
    this.mutate((settlements) =>
      settlements.map((s) =>
        s.id === id ? { ...s, ...patch, updatedAt: new Date().toISOString() } : s,
      ),
    );
  }

  delete(id: string): void {
    this.mutate((settlements) => settlements.filter((s) => s.id !== id));
  }

  private mutate(mutator: (settlements: BusinessSettlement[]) => BusinessSettlement[]): void {
    this.storage.update<BusinessSettlement[]>(STORAGE_KEY, (current) => mutator(current ?? []), []);
  }
}
