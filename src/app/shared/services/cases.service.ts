import { Injectable, inject } from '@angular/core';
import { MockStorageService } from './mock-storage.service';

export interface CaseTask {
  id: string;
  title: string;
  due?: string;
  done: boolean;
}

export interface CaseDeadline {
  id: string;
  title: string;
  date: string;
}

export interface CaseItem {
  id: string;
  title: string;
  client: string;
  status: 'open' | 'pending' | 'closed';
  tags: string[];
  deadlines: CaseDeadline[];
  tasks: CaseTask[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'cases';

@Injectable({ providedIn: 'root' })
export class CasesService {
  private readonly storage = inject(MockStorageService);

  private generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 0x0f) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  list(): CaseItem[] {
    return this.storage.get<CaseItem[]>(STORAGE_KEY, []);
  }

  getById(id: string): CaseItem | undefined {
    return this.list().find((c) => c.id === id);
  }

  create(input: { title: string; client: string; tags?: string[] }): CaseItem {
    const now = new Date().toISOString();
    const item: CaseItem = {
      id: this.generateId(),
      title: input.title,
      client: input.client,
      status: 'open',
      tags: input.tags ?? [],
      deadlines: [],
      tasks: [],
      createdAt: now,
      updatedAt: now,
    };
    this.storage.update<CaseItem[]>(STORAGE_KEY, (current) => [...(current ?? []), item], []);
    return item;
  }

  updateMeta(
    id: string,
    meta: Partial<Pick<CaseItem, 'title' | 'client' | 'status' | 'tags'>>,
  ): void {
    this.mutate((cases) =>
      cases.map((c) =>
        c.id === id
          ? { ...c, ...meta, tags: meta.tags ?? c.tags, updatedAt: new Date().toISOString() }
          : c,
      ),
    );
  }

  delete(id: string): void {
    this.mutate((cases) => cases.filter((c) => c.id !== id));
  }

  addTask(id: string, title: string, due?: string): CaseTask | undefined {
    const task: CaseTask = { id: this.generateId(), title, due, done: false };
    this.mutate((cases) =>
      cases.map((c) =>
        c.id === id ? { ...c, tasks: [...c.tasks, task], updatedAt: new Date().toISOString() } : c,
      ),
    );
    return task;
  }

  toggleTask(id: string, taskId: string): void {
    this.mutate((cases) =>
      cases.map((c) =>
        c.id === id
          ? {
              ...c,
              tasks: c.tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)),
              updatedAt: new Date().toISOString(),
            }
          : c,
      ),
    );
  }

  removeTask(id: string, taskId: string): void {
    this.mutate((cases) =>
      cases.map((c) =>
        c.id === id
          ? {
              ...c,
              tasks: c.tasks.filter((t) => t.id !== taskId),
              updatedAt: new Date().toISOString(),
            }
          : c,
      ),
    );
  }

  addDeadline(id: string, title: string, date: string): CaseDeadline | undefined {
    const dl: CaseDeadline = { id: this.generateId(), title, date };
    this.mutate((cases) =>
      cases.map((c) =>
        c.id === id
          ? { ...c, deadlines: [...c.deadlines, dl], updatedAt: new Date().toISOString() }
          : c,
      ),
    );
    return dl;
  }

  removeDeadline(id: string, deadlineId: string): void {
    this.mutate((cases) =>
      cases.map((c) =>
        c.id === id
          ? {
              ...c,
              deadlines: c.deadlines.filter((d) => d.id !== deadlineId),
              updatedAt: new Date().toISOString(),
            }
          : c,
      ),
    );
  }

  private mutate(mutator: (cases: CaseItem[]) => CaseItem[]): void {
    this.storage.update<CaseItem[]>(STORAGE_KEY, (current) => mutator(current ?? []), []);
  }
}
