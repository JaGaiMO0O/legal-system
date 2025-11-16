import { Injectable, inject } from '@angular/core';
import { MockStorageService } from './mock-storage.service';

export interface AuditRecord {
  id: string;
  occurredAt: string;
  action: string;
  data?: unknown;
  user?: string;
}

const STORAGE_KEY = 'audit';

@Injectable({ providedIn: 'root' })
export class AuditService {
  private readonly storage = inject(MockStorageService);

  private generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 0x0f) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  record(action: string, data?: unknown): AuditRecord {
    const rec: AuditRecord = {
      id: this.generateId(),
      occurredAt: new Date().toISOString(),
      action,
      data,
      user: 'local',
    };
    this.storage.update<AuditRecord[]>(
      STORAGE_KEY,
      (current) => [rec, ...(current ?? [])].slice(0, 200),
      [],
    );
    return rec;
  }

  list(limit = 50): AuditRecord[] {
    return this.storage.get<AuditRecord[]>(STORAGE_KEY, []).slice(0, limit);
  }
}
