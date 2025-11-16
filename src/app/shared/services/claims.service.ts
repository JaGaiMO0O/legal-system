import { Injectable, inject } from '@angular/core';
import { MockStorageService } from './mock-storage.service';
import { CasesService } from './cases.service';

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
    let createdCaseId: string | undefined;
    this.storage.update<Claim[]>(
      STORAGE_KEY,
      (current) =>
        (current ?? []).map((c) => {
          if (c.id !== claimId) return c;
          // create a case if not linked
          if (!c.linkedCaseId) {
            const created = this.cases.create({
              title: `Case for claim ${c.reference}`,
              client: c.claimant,
              tags: ['motor'],
            });
            createdCaseId = created.id;
          }
          return { ...c, legalFlag: 1, linkedCaseId: createdCaseId ?? c.linkedCaseId };
        }),
      [],
    );
    return this.list().find((x) => x.id === claimId);
  }
}
