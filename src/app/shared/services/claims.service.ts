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
    return this.storage.get<Claim[]>(STORAGE_KEY, []);
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
