import { Injectable, inject } from '@angular/core';
import { MockStorageService } from '../../shared/services/mock-storage.service';
import { CourtsService } from '../../shared/services/courts.service';
import { CasesService } from '../../shared/services/cases.service';
import { DocumentsService } from '../../shared/services/documents.service';
import { AuditService } from '../../shared/services/audit.service';

@Injectable({ providedIn: 'root' })
export class SeedService {
  private readonly storage = inject(MockStorageService);
  private readonly courts = inject(CourtsService);
  private readonly cases = inject(CasesService);
  private readonly docs = inject(DocumentsService);
  private readonly audit = inject(AuditService);

  run(): void {
    const markKey = 'seeded-v1';
    const already = localStorage.getItem(markKey);
    if (already) return;

    // Seed court types
    if (this.courts.list().length === 0) {
      this.courts.create('Civil');
      this.courts.create('Criminal', ['primary', 'appeal', 'cassation']);
      this.courts.create('Execution', ['execution']);
    }

    // Seed cases
    if (this.cases.list().length === 0) {
      const c1 = this.cases.create({
        title: 'Traffic accident claim',
        client: 'John Doe',
        tags: ['motor', 'injury'],
      });
      const c2 = this.cases.create({
        title: 'Appeal of ruling 1234',
        client: 'Acme Co.',
        tags: ['appeal'],
      });
      const c3 = this.cases.create({
        title: 'Execution order issuance',
        client: 'Jane Smith',
        tags: ['execution'],
      });
      this.cases.addTask(c1.id, 'Collect medical reports');
      this.cases.addTask(
        c1.id,
        'Contact witness',
        new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      );
      this.cases.addDeadline(
        c1.id,
        'First hearing',
        new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      );
      this.cases.addDeadline(
        c2.id,
        'Appeal submission',
        new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
      );
    }

    // Seed documents
    if (this.docs.list().length === 0) {
      const d1 = this.docs.create('Accident Photos', ['motor', 'evidence']);
      const d2 = this.docs.create('Court Filing Draft', ['draft', 'court']);
      // Add small text "version" as base64
      const blob1 = new Blob(['Sample content: Accident photo list'], { type: 'text/plain' });
      const blob2 = new Blob(['Sample content: Filing draft v1'], { type: 'text/plain' });
      // Convert Blob to File-like for the helper
      const file1 = new File([blob1], 'photos.txt', { type: 'text/plain' });
      const file2 = new File([blob2], 'filing.txt', { type: 'text/plain' });
      this.docs.addVersion(d1.id, file1).then(() => {});
      this.docs.addVersion(d2.id, file2).then(() => {});
    }

    this.audit.record('seed.completed', { version: 'v1' });
    localStorage.setItem(markKey, '1');
  }
}
