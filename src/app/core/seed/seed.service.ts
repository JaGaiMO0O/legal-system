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
    const markKey = 'seeded-v2';
    const already = localStorage.getItem(markKey);
    if (already) return;

    // Force reset once so all users receive the new mock dataset.
    this.storage.clearAll();
    localStorage.removeItem('seeded-v1');

    // Seed court types
    if (this.courts.list().length === 0) {
      this.courts.create('General Civil');
      this.courts.create('Commercial');
      this.courts.create('Labor');
      this.courts.create('Criminal', ['primary', 'appeal', 'cassation']);
      this.courts.create('Execution', ['execution']);
    }

    // Seed cases via CasesService.seedData()
    this.cases.list();

    this.audit.record('seed.completed', { version: 'v2' });
    localStorage.setItem(markKey, '1');
  }
}
