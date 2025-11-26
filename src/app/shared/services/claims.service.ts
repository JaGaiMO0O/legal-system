import { Injectable, inject } from '@angular/core';
import { MockStorageService } from './mock-storage.service';
import { CasesService } from './cases.service';
import { MotorLiabilityService } from './motor-liability.service';

export interface Claim {
  id: string;
  kind: 'motor';
  reference: string;
  claimant: string;
  date: string; // ISO
  legalFlag: 0 | 1;
  linkedCaseId?: string;
  details?: string;
}

const STORAGE_KEY = 'claims';

@Injectable({ providedIn: 'root' })
export class ClaimsService {
  private readonly storage = inject(MockStorageService);
  private readonly cases = inject(CasesService);
  private readonly motorLiabilityService = inject(MotorLiabilityService);

  private generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 0x0f) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  list(): Claim[] {
    const claims = this.storage.get<Claim[]>(STORAGE_KEY, []);
    if (claims.length === 0) {
      this.seedData();
      return this.storage.get<Claim[]>(STORAGE_KEY, []);
    }
    return claims;
  }

  private seedData(): void {
    const now = new Date();
    const claims: Claim[] = [
      {
        id: 'claim-1',
        kind: 'motor',
        reference: 'MOT-2025-001',
        claimant: 'Ahmed Al-Mansouri',
        date: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        legalFlag: 1,
        linkedCaseId: 'case-1',
        details: 'Traffic accident on King Fahd Road',
      },
      {
        id: 'claim-2',
        kind: 'motor',
        reference: 'MOT-2025-002',
        claimant: 'Sara Al-Otaibi',
        date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        legalFlag: 0,
        details: 'Vehicle collision at intersection',
      },
      {
        id: 'claim-3',
        kind: 'motor',
        reference: 'MOT-2025-003',
        claimant: 'Khalid Al-Ghamdi',
        date: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        legalFlag: 0,
        details: 'Rear-end collision',
      },
      {
        id: 'claim-4',
        kind: 'motor',
        reference: 'MOT-2024-156',
        claimant: 'Fatima Al-Zahra',
        date: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        legalFlag: 1,
        linkedCaseId: 'case-4',
        details: 'Highway accident case',
      },
      {
        id: 'claim-5',
        kind: 'motor',
        reference: 'MOT-2025-004',
        claimant: 'Omar Al-Shammari',
        date: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        legalFlag: 0,
        details: 'Side impact collision at traffic light',
      },
      {
        id: 'claim-6',
        kind: 'motor',
        reference: 'MOT-2025-005',
        claimant: 'Noura Al-Mutairi',
        date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        legalFlag: 0,
        details: 'Parking lot accident',
      },
      {
        id: 'claim-7',
        kind: 'motor',
        reference: 'MOT-2024-201',
        claimant: 'Yusuf Al-Qahtani',
        date: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        legalFlag: 1,
        details: 'Multi-vehicle accident on highway',
      },
      {
        id: 'claim-8',
        kind: 'motor',
        reference: 'MOT-2025-006',
        claimant: 'Layla Al-Ghamdi',
        date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        legalFlag: 0,
        details: 'Hit and run incident',
      },
      {
        id: 'claim-9',
        kind: 'motor',
        reference: 'MOT-2025-007',
        claimant: 'Hassan Al-Rashid',
        date: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        legalFlag: 0,
        details: 'Vehicle damage from falling object',
      },
      {
        id: 'claim-10',
        kind: 'motor',
        reference: 'MOT-2024-278',
        claimant: 'Maha Al-Sheikh',
        date: new Date(now.getTime() - 75 * 24 * 60 * 60 * 1000).toISOString(),
        legalFlag: 1,
        details: 'Head-on collision on rural road',
      },
      {
        id: 'claim-11',
        kind: 'motor',
        reference: 'MOT-2025-008',
        claimant: 'Fahad Al-Dosari',
        date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        legalFlag: 0,
        details: 'Minor fender bender',
      },
      {
        id: 'claim-12',
        kind: 'motor',
        reference: 'MOT-2025-009',
        claimant: 'Reem Al-Otaibi',
        date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        legalFlag: 0,
        details: 'Vehicle theft and damage claim',
      },
    ];
    this.storage.set(STORAGE_KEY, claims);
  }

  create(
    input: Omit<Claim, 'id' | 'legalFlag' | 'linkedCaseId'> & Partial<Pick<Claim, 'legalFlag'>>,
  ): Claim {
    const item: Claim = {
      id: this.generateId(),
      legalFlag: 0,
      ...input,
    };
    this.storage.update<Claim[]>(STORAGE_KEY, (current) => [...(current ?? []), item], []);
    return item;
  }

  markToLegal(claimId: string): Claim | undefined {
    let createdMotorLiabilityCaseId: string | undefined;
    const claim = this.list().find((c) => c.id === claimId);

    if (!claim) return undefined;

    this.storage.update<Claim[]>(
      STORAGE_KEY,
      (current) =>
        (current ?? []).map((c) => {
          if (c.id !== claimId) return c;
          // create a motor liability case if not linked
          if (!c.linkedCaseId && c.kind === 'motor') {
            const now = new Date().toISOString();
            const created = this.motorLiabilityService.create({
              caseNo: `ML-${c.reference}`,
              courtType: '',
              courtLevel: '',
              courtCity: '',
              caseDescription: c.details || `Motor liability case for claim ${c.reference}`,
              claimantName: c.claimant,
              nationality: '',
              gender: 'Male',
              age: 0,
              maritalStatus: 'Single',
              profession: '',
              damageType: 'Fatal',
              percentMoralPhysical: '',
              totalClaimedAmount: 0,
              totalPaidAmount: 0,
              dateOfInsertion: now,
              periodFrom: now,
              periodTo: now,
              hearingsCourtType: '',
              hearingsCourtLevel: '',
              courtRoom: '',
              rulingDate: '',
              linkedClaimId: claimId,
            });
            createdMotorLiabilityCaseId = created.id;
          }
          return {
            ...c,
            legalFlag: 1,
            linkedCaseId: createdMotorLiabilityCaseId ?? c.linkedCaseId,
          };
        }),
      [],
    );
    return this.list().find((x) => x.id === claimId);
  }
}
