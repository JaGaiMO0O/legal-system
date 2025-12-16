import { Injectable, inject } from '@angular/core';
import { MockStorageService } from './mock-storage.service';
import { CasesService } from './cases.service';
import { MotorLiabilityService } from './motor-liability.service';
import { CaseTrackingService } from './case-tracking.service';

export interface Claim {
  id: string;
  kind: 'motor';
  reference: string;
  claimant: string;
  date: string; // ISO
  legalFlag: 0 | 1;
  linkedCaseId?: string;
  unifiedCaseId?: string; // Unified identifier that links this claim across all entities
  details?: string;
}

const STORAGE_KEY = 'claims';

@Injectable({ providedIn: 'root' })
export class ClaimsService {
  private readonly storage = inject(MockStorageService);
  private readonly cases = inject(CasesService);
  private readonly motorLiabilityService = inject(MotorLiabilityService);
  private readonly caseTracking = inject(CaseTrackingService);

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
        unifiedCaseId: 'uc-1', // Links to case-1, ml-1
        details: 'Traffic accident on King Fahd Road',
      },
      {
        id: 'claim-2',
        kind: 'motor',
        reference: 'MOT-2025-002',
        claimant: 'Sara Al-Otaibi',
        date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        legalFlag: 0,
        unifiedCaseId: 'uc-2', // Links to ml-2 (can be converted to legal)
        details: 'Vehicle collision at intersection',
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
    let createdCaseId: string | undefined;
    let createdMotorLiabilityCaseId: string | undefined;
    const claim = this.list().find((c) => c.id === claimId);

    if (!claim) return undefined;

    // Get or create unified case ID
    let unifiedCaseId = claim.unifiedCaseId;
    if (!unifiedCaseId) {
      unifiedCaseId = this.caseTracking.generateUnifiedCaseId();
    }

    this.storage.update<Claim[]>(
      STORAGE_KEY,
      (current) =>
        (current ?? []).map((c) => {
          if (c.id !== claimId) return c;

          // Create a Case (CaseItem) from the claim data if not already linked
          if (!c.linkedCaseId) {
            const createdCase = this.cases.create({
              title: `Claim ${c.reference} - ${c.details || 'Legal Case'}`,
              client: c.claimant,
              tags: ['motor', 'claim'],
            });
            createdCaseId = createdCase.id;

            // Set unifiedCaseId on the case directly
            this.cases.updateMeta(createdCase.id, { unifiedCaseId: unifiedCaseId });

            // Link the case to the unified case
            this.caseTracking.linkEntityToCase(unifiedCaseId, 'case', createdCase.id);
          } else {
            // If case already exists, use it
            createdCaseId = c.linkedCaseId;
          }

          // Create a motor liability case if motor claim and not already linked
          if (c.kind === 'motor' && !createdMotorLiabilityCaseId) {
            const now = new Date().toISOString();
            // Use legal case number for motor liability to keep numbering consistent
            const legalCase = createdCaseId ? this.cases.getById(createdCaseId) : undefined;
            const legalCaseNumber =
              legalCase?.caseNumber || legalCase?.baseCaseNumber || `ML-${c.reference}`;
            const created = this.motorLiabilityService.create({
              caseNo: legalCaseNumber,
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
              unifiedCaseId: unifiedCaseId,
            });
            createdMotorLiabilityCaseId = created.id;

            // Link entities to unified case
            this.caseTracking.linkEntityToCase(unifiedCaseId, 'motorLiability', created.id);
          }

          // Update unified case tracking with all linked entities
          this.caseTracking.linkEntityToCase(unifiedCaseId, 'claim', claimId);
          if (createdCaseId) {
            this.caseTracking.linkEntityToCase(unifiedCaseId, 'case', createdCaseId);
          }
          this.caseTracking.upsertUnifiedCase({
            unifiedCaseId,
            claimId: claimId,
            caseId: createdCaseId,
            motorLiabilityCaseId: createdMotorLiabilityCaseId,
            title: `Claim ${c.reference}`,
            client: c.claimant,
            reference: c.reference,
          });

          return {
            ...c,
            legalFlag: 1,
            linkedCaseId: createdCaseId ?? c.linkedCaseId,
            unifiedCaseId: unifiedCaseId,
          };
        }),
      [],
    );

    // Update the unified case tracking
    if (unifiedCaseId) {
      this.caseTracking.setCurrentCase(unifiedCaseId);
    }

    return this.list().find((x) => x.id === claimId);
  }
}
