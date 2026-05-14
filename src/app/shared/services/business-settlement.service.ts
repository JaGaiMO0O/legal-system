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
    const toIso = (daysOffset: number) =>
      new Date(now.getTime() + daysOffset * 24 * 60 * 60 * 1000).toISOString();
    const settlements: BusinessSettlement[] = [
      {
        id: 'settle-1',
        departmentAmount: 28000,
        legalDepartmentAmount: 19000,
        managementAmount: 15000,
        adversaryAmount: 54000,
        amountOfAmicableAgreement: 98000,
        linkedCaseId: 'case-1',
        createdAt: toIso(-24),
        updatedAt: toIso(-5),
      },
      {
        id: 'settle-2',
        departmentAmount: 35000,
        legalDepartmentAmount: 21000,
        managementAmount: 11000,
        adversaryAmount: 87000,
        amountOfAmicableAgreement: 124000,
        linkedCaseId: 'case-2',
        createdAt: toIso(-13),
        updatedAt: toIso(-2),
      },
    ];

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
