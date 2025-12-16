import { Injectable, inject } from '@angular/core';
import { MockStorageService } from '../../shared/services/mock-storage.service';
import { CourtsService } from '../../shared/services/courts.service';
import { CasesService } from '../../shared/services/cases.service';
import { AuditService } from '../../shared/services/audit.service';

@Injectable({ providedIn: 'root' })
export class SeedService {
  private readonly storage = inject(MockStorageService);
  private readonly courts = inject(CourtsService);
  private readonly cases = inject(CasesService);
  private readonly audit = inject(AuditService);

  run(): void {
    const markKey = 'seeded-v1';
    const already = localStorage.getItem(markKey);
    if (already) return;

    // Seed claims (write directly to storage to avoid circular deps)
    const claimsKey = 'claims';
    const existingClaims = this.storage.get<any[]>(claimsKey, []);
    if ((existingClaims ?? []).length === 0) {
      const today = new Date();
      const mkDate = (d: number) =>
        new Date(today.getTime() - d * 86400000).toISOString().slice(0, 10);
      const claims = [
        {
          id: crypto.randomUUID?.() ?? String(Math.random()),
          kind: 'motor',
          reference: 'MTR-2025-001',
          claimant: 'Adam Green',
          date: mkDate(2),
          legalFlag: 0,
          details: 'Minor collision on highway 1',
        },
      ];
      this.storage.set(claimsKey, claims);
    }

    // Seed court types
    if (this.courts.list().length === 0) {
      this.courts.create('Civil');
      this.courts.create('Criminal', ['primary', 'appeal', 'cassation']);
    }

    // Seed cases
    if (this.cases.list().length === 0) {
      const c1 = this.cases.create({
        title: 'Traffic accident claim',
        client: 'John Doe',
        tags: ['motor'],
      });
      this.cases.addTask(c1.id, 'Collect medical reports');
      this.cases.addDeadline(
        c1.id,
        'First hearing',
        new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      );
    }

    this.audit.record('seed.completed', { version: 'v1' });
    localStorage.setItem(markKey, '1');
  }
}
