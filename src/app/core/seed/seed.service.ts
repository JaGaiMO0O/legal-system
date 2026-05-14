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
    const markKey = 'seeded-v3';
    const already = localStorage.getItem(markKey);
    if (already) return;

    // Force reset once so all users receive the new mock dataset.
    this.storage.clearAll();
    localStorage.removeItem('seeded-v1');
    localStorage.removeItem('seeded-v2');

    // Seed court types (Arabic labels for RTL QA)
    if (this.courts.list().length === 0) {
      this.courts.create('محكمة مدنية عامة');
      this.courts.create('محكمة تجارية');
    }

    // Seed cases via CasesService.seedData()
    this.cases.list();

    this.audit.record('seed.completed', { version: 'v3' });
    localStorage.setItem(markKey, '1');
  }
}
