import { Injectable, inject } from '@angular/core';
import { MockStorageService } from './mock-storage.service';

export type PremiumClaimStatus = 'open' | 'pending' | 'closed';
export type PremiumCompanyRole = 'claimant' | 'respondent';

export interface PremiumClaim {
  id: string;
  caseId?: string;
  claimNumber: string;
  companyRole: PremiumCompanyRole;
  claimValue: number;
  status: PremiumClaimStatus;
  createdAt: string;
}

const STORAGE_KEY = 'premiumClaims';

@Injectable({ providedIn: 'root' })
export class PremiumClaimsService {
  private readonly storage = inject(MockStorageService);

  private generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 0x0f) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  list(): PremiumClaim[] {
    const rows = this.storage.get<PremiumClaim[]>(STORAGE_KEY, []);
    if (rows.length === 0) {
      this.seedData();
      return this.storage.get<PremiumClaim[]>(STORAGE_KEY, []);
    }
    return rows;
  }

  seedData(): void {
    const now = new Date();
    const toIso = (daysOffset: number) =>
      new Date(now.getTime() + daysOffset * 24 * 60 * 60 * 1000).toISOString();

    const claims: PremiumClaim[] = [
      {
        id: 'prem-1',
        caseId: 'case-1',
        claimNumber: 'PI-2026-001',
        companyRole: 'claimant',
        claimValue: 185000,
        status: 'open',
        createdAt: toIso(-220),
      },
      {
        id: 'prem-2',
        caseId: 'case-1',
        claimNumber: 'PI-2026-002',
        companyRole: 'respondent',
        claimValue: 42000,
        status: 'pending',
        createdAt: toIso(-195),
      },
      {
        id: 'prem-3',
        caseId: 'case-2',
        claimNumber: 'PI-2026-003',
        companyRole: 'respondent',
        claimValue: 96000,
        status: 'open',
        createdAt: toIso(-170),
      },
      {
        id: 'prem-4',
        caseId: 'case-7',
        claimNumber: 'PI-2026-004',
        companyRole: 'respondent',
        claimValue: 210000,
        status: 'pending',
        createdAt: toIso(-110),
      },
      {
        id: 'prem-5',
        claimNumber: 'PI-2026-005',
        companyRole: 'claimant',
        claimValue: 310000,
        status: 'closed',
        createdAt: toIso(-300),
      },
      {
        id: 'prem-6',
        claimNumber: 'PI-2026-006',
        companyRole: 'claimant',
        claimValue: 128000,
        status: 'pending',
        createdAt: toIso(-85),
      },
      {
        id: 'prem-7',
        caseId: 'case-3',
        claimNumber: 'PI-2026-007',
        companyRole: 'respondent',
        claimValue: 186000,
        status: 'open',
        createdAt: toIso(-250),
      },
      {
        id: 'prem-8',
        caseId: 'case-8',
        claimNumber: 'PI-2026-008',
        companyRole: 'claimant',
        claimValue: 890000,
        status: 'open',
        createdAt: toIso(-15),
      },
      {
        id: 'prem-9',
        claimNumber: 'PI-2026-009',
        companyRole: 'respondent',
        claimValue: 54000,
        status: 'closed',
        createdAt: toIso(-140),
      },
      {
        id: 'prem-10',
        caseId: 'case-5',
        claimNumber: 'PI-2026-010',
        companyRole: 'respondent',
        claimValue: 72000,
        status: 'open',
        createdAt: toIso(-70),
      },
      {
        id: 'prem-11',
        companyRole: 'claimant',
        claimNumber: 'PI-2026-011',
        claimValue: 156000,
        status: 'pending',
        createdAt: toIso(-45),
      },
      {
        id: 'prem-12',
        caseId: 'case-6',
        claimNumber: 'PI-2026-012',
        companyRole: 'claimant',
        claimValue: 45000,
        status: 'closed',
        createdAt: toIso(-320),
      },
    ];

    this.storage.set(STORAGE_KEY, claims);
  }

  getById(id: string): PremiumClaim | undefined {
    return this.list().find((c) => c.id === id);
  }
}
