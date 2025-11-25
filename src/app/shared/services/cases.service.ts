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

export type CaseStage = 'primary' | 'appeal' | 'cassation' | 'execution' | 'settled';

export interface CaseDevelopment {
  id: string;
  date: string; // ISO
  note: string;
}

export type CaseType = 'Plaintiff' | 'Defendant';
export type RulingInFavorOf = 'Company' | 'Adversary';

export interface CaseRuling {
  id: string;
  stage: Exclude<CaseStage, 'settled'>;
  // Main Info
  caseNo: string;
  caseType: CaseType;
  courtType: string;
  courtLevel: string;
  courtCity: string;
  caseDetails: string;
  filingDate: string; // ISO date
  filingNo: string;
  // Stage Info
  stageNo: number;
  rulingInFavorOf: RulingInFavorOf;
  rulingDate: string; // ISO date
  courtFees: number;
  legalExpenses: number;
  translationCourtFees: number;
  courtFeesInCash: number;
  expertFees: number;
  advocacyFees: number;
  otherExpenses: number;
  // Adversary Info
  adversaryName: string;
  indemnityByCourtAmount: number;
  // Legacy fields (for backward compatibility)
  fees?: number;
  adversary?: string;
  indemnity?: number;
  date: string; // ISO (legacy, use rulingDate)
}

export interface CaseItem {
  id: string;
  title: string;
  client: string;
  status: 'open' | 'pending' | 'closed';
  stage?: CaseStage;
  tags: string[];
  deadlines: CaseDeadline[];
  tasks: CaseTask[];
  developments?: CaseDevelopment[];
  rulings?: CaseRuling[];
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
    const cases = this.storage.get<CaseItem[]>(STORAGE_KEY, []);
    if (cases.length === 0) {
      this.seedData();
      return this.storage.get<CaseItem[]>(STORAGE_KEY, []);
    }
    return cases;
  }

  private seedData(): void {
    const now = new Date();
    const cases: CaseItem[] = [
      {
        id: 'case-1',
        title: 'Traffic Accident Claim - Case #2025-001',
        client: 'Ahmed Al-Mansouri',
        status: 'open',
        stage: 'primary',
        tags: ['motor', 'accident'],
        deadlines: [
          { id: 'dl-1', title: 'Submit evidence', date: '2025-01-15' },
          { id: 'dl-2', title: 'Court hearing', date: '2025-02-10' },
        ],
        tasks: [
          { id: 'task-1', title: 'Review medical reports', done: false },
          { id: 'task-2', title: 'Prepare witness statements', done: true },
        ],
        developments: [
          {
            id: 'dev-1',
            date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            note: 'Case filed at Primary Court',
          },
          {
            id: 'dev-2',
            date: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            note: 'Initial hearing scheduled',
          },
        ],
        rulings: [
          {
            id: 'ruling-1',
            stage: 'primary',
            caseNo: '2025-001',
            caseType: 'Plaintiff',
            courtType: 'Civil Court',
            courtLevel: 'Primary',
            courtCity: 'Riyadh',
            caseDetails: 'Motor vehicle accident claim',
            filingDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
            filingNo: 'FIL-2025-001',
            stageNo: 1,
            rulingInFavorOf: 'Company',
            rulingDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
            courtFees: 5000,
            legalExpenses: 15000,
            translationCourtFees: 2000,
            courtFeesInCash: 3000,
            expertFees: 8000,
            advocacyFees: 12000,
            otherExpenses: 2000,
            adversaryName: 'Mohammed Al-Rashid',
            indemnityByCourtAmount: 50000,
            date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
        createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'case-2',
        title: 'Appeal of Ruling #1234',
        client: 'Salama Insurance Co.',
        status: 'pending',
        stage: 'appeal',
        tags: ['appeal', 'insurance'],
        deadlines: [{ id: 'dl-3', title: 'Appeal submission deadline', date: '2025-01-20' }],
        tasks: [{ id: 'task-3', title: 'Prepare appeal documents', done: false }],
        developments: [
          {
            id: 'dev-3',
            date: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
            note: 'Appeal filed',
          },
        ],
        rulings: [],
        createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'case-3',
        title: 'Execution Order Issuance',
        client: 'Abdullah Al-Saud',
        status: 'open',
        stage: 'execution',
        tags: ['execution'],
        deadlines: [],
        tasks: [],
        developments: [
          {
            id: 'dev-4',
            date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            note: 'Moved to Execution Court',
          },
        ],
        rulings: [],
        createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'case-4',
        title: 'Cassation Review',
        client: 'Fatima Al-Zahra',
        status: 'closed',
        stage: 'settled',
        tags: ['cassation', 'settled'],
        deadlines: [],
        tasks: [],
        developments: [
          {
            id: 'dev-5',
            date: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
            note: 'Case settled after execution',
          },
        ],
        rulings: [],
        createdAt: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
    this.storage.set(STORAGE_KEY, cases);
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
      stage: 'primary',
      tags: input.tags ?? [],
      deadlines: [],
      tasks: [],
      developments: [{ id: this.generateId(), date: now, note: 'Case created at Primary Court' }],
      rulings: [],
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

  addDevelopment(id: string, note: string): void {
    const dev: CaseDevelopment = { id: this.generateId(), date: new Date().toISOString(), note };
    this.mutate((cases) =>
      cases.map((c) =>
        c.id === id
          ? {
              ...c,
              developments: [dev, ...(c.developments ?? [])],
              updatedAt: new Date().toISOString(),
            }
          : c,
      ),
    );
  }

  addRuling(
    id: string,
    input: Partial<Omit<CaseRuling, 'id'>> & {
      stage: Exclude<CaseStage, 'settled'>;
      caseNo: string;
      caseType: CaseType;
      courtType: string;
      courtLevel: string;
      courtCity: string;
      caseDetails: string;
      filingDate: string;
      filingNo: string;
      stageNo: number;
      rulingInFavorOf: RulingInFavorOf;
      rulingDate: string;
      adversaryName: string;
    },
  ): void {
    const ruling: CaseRuling = {
      id: this.generateId(),
      // Main Info
      caseNo: input.caseNo,
      caseType: input.caseType,
      courtType: input.courtType,
      courtLevel: input.courtLevel,
      courtCity: input.courtCity,
      caseDetails: input.caseDetails,
      filingDate: input.filingDate,
      filingNo: input.filingNo,
      // Stage Info
      stage: input.stage,
      stageNo: input.stageNo,
      rulingInFavorOf: input.rulingInFavorOf,
      rulingDate: input.rulingDate,
      courtFees: input.courtFees ?? 0,
      legalExpenses: input.legalExpenses ?? 0,
      translationCourtFees: input.translationCourtFees ?? 0,
      courtFeesInCash: input.courtFeesInCash ?? 0,
      expertFees: input.expertFees ?? 0,
      advocacyFees: input.advocacyFees ?? 0,
      otherExpenses: input.otherExpenses ?? 0,
      // Adversary Info
      adversaryName: input.adversaryName,
      indemnityByCourtAmount: input.indemnityByCourtAmount ?? 0,
      // Legacy fields for backward compatibility
      fees: input.courtFees ?? input.fees,
      adversary: input.adversaryName ?? input.adversary,
      indemnity: input.indemnityByCourtAmount ?? input.indemnity,
      date: input.rulingDate ?? input.date ?? new Date().toISOString(),
    };
    this.mutate((cases) =>
      cases.map((c) =>
        c.id === id
          ? {
              ...c,
              rulings: [ruling, ...(c.rulings ?? [])],
              updatedAt: new Date().toISOString(),
            }
          : c,
      ),
    );
  }

  advanceStage(id: string): void {
    const order: CaseStage[] = ['primary', 'appeal', 'cassation', 'execution', 'settled'];
    this.mutate((cases) =>
      cases.map((c) => {
        if (c.id !== id) return c;
        const currentStage = c.stage ?? 'primary';
        const idx = order.indexOf(currentStage);
        const next = order[Math.min(idx + 1, order.length - 1)];
        const note =
          next === 'settled'
            ? 'Case settled after execution'
            : `Moved to ${next.charAt(0).toUpperCase() + next.slice(1)} Court`;
        return {
          ...c,
          stage: next,
          status: next === 'settled' ? 'closed' : c.status,
          developments: [
            { id: this.generateId(), date: new Date().toISOString(), note },
            ...(c.developments ?? []),
          ],
          updatedAt: new Date().toISOString(),
        };
      }),
    );
  }

  executeCase(id: string): void {
    this.mutate((cases) =>
      cases.map((c) =>
        c.id === id
          ? {
              ...c,
              stage: 'settled',
              status: 'closed',
              developments: [
                {
                  id: this.generateId(),
                  date: new Date().toISOString(),
                  note: 'Case executed and settled',
                },
                ...(c.developments ?? []),
              ],
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
