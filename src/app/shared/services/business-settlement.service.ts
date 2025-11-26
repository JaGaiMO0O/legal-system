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
        linkedClaimId: 'claim-2',
        createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'settle-2',
        departmentAmount: 75000,
        legalDepartmentAmount: 45000,
        managementAmount: 30000,
        adversaryAmount: 60000,
        amountOfAmicableAgreement: 150000,
        linkedClaimId: 'claim-3',
        createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'settle-3',
        departmentAmount: 60000,
        legalDepartmentAmount: 35000,
        managementAmount: 25000,
        adversaryAmount: 50000,
        amountOfAmicableAgreement: 120000,
        linkedClaimId: 'claim-5',
        createdAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'settle-4',
        departmentAmount: 85000,
        legalDepartmentAmount: 50000,
        managementAmount: 35000,
        adversaryAmount: 70000,
        amountOfAmicableAgreement: 170000,
        linkedClaimId: 'claim-6',
        createdAt: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'settle-5',
        departmentAmount: 40000,
        legalDepartmentAmount: 25000,
        managementAmount: 15000,
        adversaryAmount: 30000,
        amountOfAmicableAgreement: 80000,
        linkedClaimId: 'claim-8',
        createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'settle-6',
        departmentAmount: 95000,
        legalDepartmentAmount: 55000,
        managementAmount: 40000,
        adversaryAmount: 80000,
        amountOfAmicableAgreement: 190000,
        linkedClaimId: 'claim-9',
        createdAt: new Date(now.getTime() - 22 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'settle-7',
        departmentAmount: 110000,
        legalDepartmentAmount: 65000,
        managementAmount: 45000,
        adversaryAmount: 90000,
        amountOfAmicableAgreement: 220000,
        linkedClaimId: 'claim-10',
        createdAt: new Date(now.getTime() - 70 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'settle-8',
        departmentAmount: 30000,
        legalDepartmentAmount: 18000,
        managementAmount: 12000,
        adversaryAmount: 25000,
        amountOfAmicableAgreement: 60000,
        linkedClaimId: 'claim-11',
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
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

  create(input: {
    departmentAmount: number;
    legalDepartmentAmount: number;
    managementAmount: number;
    adversaryAmount: number;
    amountOfAmicableAgreement: number;
    linkedClaimId?: string;
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
