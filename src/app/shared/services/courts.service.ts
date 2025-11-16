import { Injectable, inject } from '@angular/core';
import { MockStorageService } from './mock-storage.service';

export type CourtLevel = 'primary' | 'appeal' | 'cassation' | 'execution';

export interface CourtType {
  id: string;
  name: string;
  levels: CourtLevel[]; // in order of escalation
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'courts.types';

@Injectable({ providedIn: 'root' })
export class CourtsService {
  private readonly storage = inject(MockStorageService);

  private generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 0x0f) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  list(): CourtType[] {
    return this.storage.get<CourtType[]>(STORAGE_KEY, []);
  }

  create(
    name: string,
    levels: CourtLevel[] = ['primary', 'appeal', 'cassation', 'execution'],
  ): CourtType {
    const now = new Date().toISOString();
    const ct: CourtType = {
      id: this.generateId(),
      name,
      levels: [...levels],
      createdAt: now,
      updatedAt: now,
    };
    this.storage.update<CourtType[]>(STORAGE_KEY, (current) => [...(current ?? []), ct], []);
    return ct;
  }

  update(id: string, patch: Partial<Pick<CourtType, 'name' | 'levels'>>): void {
    this.storage.update<CourtType[]>(
      STORAGE_KEY,
      (current) =>
        (current ?? []).map((c) =>
          c.id === id ? { ...c, ...patch, updatedAt: new Date().toISOString() } : c,
        ),
      [],
    );
  }

  remove(id: string): void {
    this.storage.update<CourtType[]>(
      STORAGE_KEY,
      (current) => (current ?? []).filter((c) => c.id !== id),
      [],
    );
  }
}
