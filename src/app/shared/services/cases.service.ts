import { Injectable, inject } from '@angular/core';
import { BusinessSettlementService } from './business-settlement.service';
import { CaseTrackingService } from './case-tracking.service';
import { ExecutionCasesService } from './execution-cases.service';
import { MockStorageService } from './mock-storage.service';

export type CaseStage = 'primary' | 'appeal' | 'cassation' | 'execution' | 'settled';
export type CaseStatus = 'open' | 'pending' | 'closed';
export type CaseType = 'Plaintiff' | 'Defendant';
export type RulingInFavorOf = 'Company' | 'Adversary';

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

export interface CaseDevelopment {
  id: string;
  date: string;
  note: string;
}

export interface CaseRuling {
  id: string;
  // Main Info
  stage: CaseStage;
  caseNo: string;
  caseType: CaseType;
  courtType: string;
  courtLevel: string;
  courtCity: string;
  caseDetails: string;
  filingDate: string;
  filingNo: string;
  // Stage Info
  stageNo: number;
  rulingInFavorOf: RulingInFavorOf;
  rulingDate: string;
  // Financial Info
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
  // Legacy fields for backward compatibility
  fees?: number;
  adversary?: string;
  indemnity?: number;
  date: string;
}

export interface ClaimantDemographics {
  nationality: string;
  sex: string;
  maritalStatus: string;
  profession: string;
  age: number;
  dependents: number;
}

export interface DisabilityMetrics {
  moralPercent: number;
  physicalPercent: number;
}

export type DamageType = 'Fatal' | 'Disability';

export interface CaseItem {
  id: string;
  title: string;
  client: string;
  claimant?: string;
  beneficiary?: string;
  initialHearingDate?: string;
  status: CaseStatus;
  stage: CaseStage;
  caseNumber?: string; // Auto-generated case number (e.g., 2020205)
  baseCaseNumber?: string; // Original case number before stage appending
  legalStatus?: number; // 0: Normal, 1: To Legal Dept, 3: In Execution, 4: Settled
  settledStatus?: number; // 2: Legally Settled
  companyLawyerId?: string;
  companyLawyerName?: string;
  unifiedCaseId?: string;
  tags: string[];
  deadlines: CaseDeadline[];
  tasks: CaseTask[];
  developments: CaseDevelopment[];
  rulings: CaseRuling[];
  createdAt: string;
  updatedAt: string;
  // Claimant demographics from Motor system
  claimantDemographics?: ClaimantDemographics;
  // Damage type and disability metrics
  damageType?: DamageType;
  disabilityMetrics?: DisabilityMetrics;
}

const STORAGE_KEY = 'cases';

@Injectable({ providedIn: 'root' })
export class CasesService {
  private readonly storage = inject(MockStorageService);
  private readonly businessSettlementService = inject(BusinessSettlementService);
  private readonly executionCasesService = inject(ExecutionCasesService);
  private readonly caseTracking = inject(CaseTrackingService);

  private generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 0x0f) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  private generateCaseNumber(): string {
    const cases = this.list();
    const year = new Date().getFullYear();
    const yearCases = cases.filter((c) => {
      const caseYear = c.baseCaseNumber
        ? parseInt(c.baseCaseNumber.substring(0, 4), 10)
        : c.caseNumber
          ? parseInt(c.caseNumber.substring(0, 4), 10)
          : 0;
      return caseYear === year;
    });

    // Find the highest sequential number for this year
    let maxSeq = 0;
    yearCases.forEach((c) => {
      const baseNum = c.baseCaseNumber || c.caseNumber || '';
      if (baseNum.length >= 7) {
        const seq = parseInt(baseNum.substring(4), 10);
        if (!isNaN(seq) && seq > maxSeq) {
          maxSeq = seq;
        }
      }
    });

    const nextSeq = maxSeq + 1;
    return `${year}${String(nextSeq).padStart(3, '0')}`;
  }

  private appendStageSuffix(baseCaseNumber: string, stage: CaseStage): string {
    if (!baseCaseNumber) return baseCaseNumber;

    // Remove any existing suffix (01, 02, 03) to get the base
    const base = baseCaseNumber.replace(/\d{2}$/, '');

    switch (stage) {
      case 'primary':
        return base;
      case 'appeal':
        return `${base}01`;
      case 'cassation':
        return `${base}02`;
      case 'execution':
        return `${base}03`;
      case 'settled':
        return baseCaseNumber; // Keep current number when settled
      default:
        return baseCaseNumber;
    }
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
        unifiedCaseId: 'uc-1', // Links to claim-1, ml-1
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
        rulings: [],
        createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
    this.storage.set(STORAGE_KEY, cases);
  }

  getById(id: string): CaseItem | undefined {
    return this.list().find((c) => c.id === id);
  }

  create(input: {
    title: string;
    client: string;
    claimant?: string;
    beneficiary?: string;
    initialHearingDate?: string;
    tags?: string[];
    legalStatus?: number;
    companyLawyerId?: string;
    companyLawyerName?: string;
  }): CaseItem {
    // Validate input
    if (!input.title || !input.title.trim()) {
      throw new Error('Case title is required');
    }
    if (!input.client || !input.client.trim()) {
      throw new Error('Client name is required');
    }

    const now = new Date().toISOString();
    const caseNumber = this.generateCaseNumber();
    const item: CaseItem = {
      id: this.generateId(),
      title: input.title.trim(),
      client: input.client.trim(),
      claimant: input.claimant?.trim(),
      beneficiary: input.beneficiary?.trim(),
      initialHearingDate: input.initialHearingDate,
      status: 'open',
      stage: 'primary',
      caseNumber: caseNumber,
      baseCaseNumber: caseNumber,
      legalStatus: input.legalStatus ?? 1, // Default to 1 (To Legal Department) when created from claim
      companyLawyerId: input.companyLawyerId,
      companyLawyerName: input.companyLawyerName,
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
    meta: Partial<
      Pick<
        CaseItem,
        | 'title'
        | 'client'
        | 'status'
        | 'tags'
        | 'unifiedCaseId'
        | 'companyLawyerId'
        | 'companyLawyerName'
        | 'claimant'
        | 'beneficiary'
        | 'initialHearingDate'
        | 'claimantDemographics'
        | 'damageType'
        | 'disabilityMetrics'
      >
    >,
  ): void {
    this.mutate((cases) =>
      cases.map((c) =>
        c.id === id
          ? { ...c, ...meta, tags: meta.tags ?? c.tags, updatedAt: new Date().toISOString() }
          : c,
      ),
    );
  }

  addTask(id: string, title: string, due?: string): CaseTask | undefined {
    // Validate input
    if (!title || !title.trim()) {
      throw new Error('Task title is required');
    }
    const task: CaseTask = {
      id: this.generateId(),
      title: title.trim(),
      due,
      done: false,
    };
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
    // Validate input
    if (!title || !title.trim()) {
      throw new Error('Deadline title is required');
    }
    if (!date) {
      throw new Error('Deadline date is required');
    }
    // Validate date is in the future
    const deadlineDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (deadlineDate < today) {
      throw new Error('Deadline date must be in the future');
    }
    const dl: CaseDeadline = { id: this.generateId(), title: title.trim(), date };
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
    // Validate input
    if (!note || !note.trim()) {
      throw new Error('Development note is required');
    }
    const dev: CaseDevelopment = {
      id: this.generateId(),
      date: new Date().toISOString(),
      note: note.trim(),
    };
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
      caseNo?: string;
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
    const caseItem = this.getById(id);
    if (!caseItem) {
      throw new Error('Case not found');
    }

    // Default case number to current case number/base
    const caseNumber =
      (input.caseNo && input.caseNo.trim()) || caseItem.caseNumber || caseItem.baseCaseNumber;
    if (!caseNumber) {
      throw new Error('Case number is required');
    }
    if (!input.courtType || !input.courtType.trim()) {
      throw new Error('Court type is required');
    }
    // Stage validation: cannot add ruling ahead of current stage
    const stageOrder: CaseStage[] = ['primary', 'appeal', 'cassation', 'execution', 'settled'];
    const currentStageIndex = stageOrder.indexOf(caseItem.stage ?? 'primary');
    const rulingStageIndex = stageOrder.indexOf(input.stage);
    if (rulingStageIndex > currentStageIndex) {
      throw new Error(`Cannot add ruling for ${input.stage} before case reaches that stage`);
    }
    // Check for duplicate case number in the same case
    if (caseItem?.rulings) {
      const duplicate = caseItem.rulings.find(
        (r) => r.caseNo === caseNumber && r.stage === input.stage,
      );
      if (duplicate) {
        throw new Error(
          `A ruling with case number "${caseNumber}" already exists for ${input.stage} stage`,
        );
      }
    }
    const ruling: CaseRuling = {
      id: this.generateId(),
      // Main Info
      caseNo: caseNumber,
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

  updateRuling(caseId: string, rulingId: string, input: Partial<Omit<CaseRuling, 'id'>>): void {
    this.mutate((cases) =>
      cases.map((c) =>
        c.id === caseId
          ? {
              ...c,
              rulings: (c.rulings ?? []).map((r) =>
                r.id === rulingId
                  ? {
                      ...r,
                      ...input,
                    }
                  : r,
              ),
              updatedAt: new Date().toISOString(),
            }
          : c,
      ),
    );
  }

  deleteRuling(caseId: string, rulingId: string): void {
    this.mutate((cases) =>
      cases.map((c) =>
        c.id === caseId
          ? {
              ...c,
              rulings: (c.rulings ?? []).filter((r) => r.id !== rulingId),
              updatedAt: new Date().toISOString(),
            }
          : c,
      ),
    );
  }

  moveToNextStage(id: string): void {
    const order: CaseStage[] = ['primary', 'appeal', 'cassation', 'execution', 'settled'];
    const caseItem = this.getById(id);
    if (!caseItem) {
      throw new Error('Case not found');
    }
    // Validate ruling exists for current stage before advancing (except from execution)
    if (caseItem.stage !== 'execution' && caseItem.stage !== 'settled') {
      const hasRulingForCurrentStage = caseItem.rulings?.some((r) => r.stage === caseItem.stage);
      if (!hasRulingForCurrentStage) {
        throw new Error(
          `Cannot advance: No court ruling recorded for ${caseItem.stage || 'primary'} stage`,
        );
      }
    }
    this.mutate((cases) =>
      cases.map((c) => {
        if (c.id !== id) return c;
        // Prevent advancing from settled stage
        if (c.stage === 'settled') {
          return c;
        }
        const currentStage = c.stage ?? 'primary';
        const idx = order.indexOf(currentStage);
        const next = order[Math.min(idx + 1, order.length - 1)];

        // Get base case number (use baseCaseNumber if available, otherwise caseNumber)
        const baseCaseNumber = c.baseCaseNumber || c.caseNumber || '';
        const updatedCaseNumber = baseCaseNumber
          ? this.appendStageSuffix(baseCaseNumber, next)
          : c.caseNumber;

        // Update legal status based on stage
        let legalStatus = c.legalStatus ?? 1;
        if (next === 'execution') {
          legalStatus = 3; // In Execution
        } else if (next === 'settled') {
          legalStatus = 4; // Settled
        }

        const note =
          next === 'settled'
            ? 'Case settled after execution'
            : `Moved to ${next.charAt(0).toUpperCase() + next.slice(1)} Court`;
        return {
          ...c,
          stage: next,
          status: next === 'settled' ? 'closed' : c.status,
          caseNumber: updatedCaseNumber,
          legalStatus: legalStatus,
          developments: [
            { id: this.generateId(), date: new Date().toISOString(), note },
            ...(c.developments ?? []),
          ],
          updatedAt: new Date().toISOString(),
        };
      }),
    );
  }

  advanceStage(id: string): void {
    this.moveToNextStage(id);
  }

  executeCase(id: string): void {
    const caseItem = this.getById(id);
    if (!caseItem) return;

    // Get the case number for execution stage (append 03)
    const baseCaseNumber = caseItem.baseCaseNumber || caseItem.caseNumber || '';
    const executionCaseNumber = baseCaseNumber
      ? this.appendStageSuffix(baseCaseNumber, 'execution')
      : '';

    // Create execution case record
    if (executionCaseNumber && caseItem.unifiedCaseId) {
      // Get the last ruling to extract court information
      const lastRuling =
        caseItem.rulings && caseItem.rulings.length > 0
          ? caseItem.rulings[caseItem.rulings.length - 1]
          : null;

      const createdExec = this.executionCasesService.create({
        executionCaseNo: executionCaseNumber,
        fileNo: `FILE-${executionCaseNumber}`,
        fileDate: new Date().toISOString(),
        courtRoom: lastRuling?.courtCity || '',
        companyLawyer: '',
        lastCourtType: lastRuling?.courtType || '',
        lastCourtLevel: lastRuling?.courtLevel || '',
        amountRuled: lastRuling?.indemnityByCourtAmount || 0,
        amountPaid: 0,
        linkedCaseId: id,
        unifiedCaseId: caseItem.unifiedCaseId,
      });

      // Link execution case to unified case
      this.caseTracking.linkEntityToCase(caseItem.unifiedCaseId, 'execution', createdExec.id);
    }

    // Move case to execution stage and update status
    this.mutate((cases) =>
      cases.map((c) =>
        c.id === id
          ? {
              ...c,
              stage: 'execution',
              legalStatus: 3, // In Execution
              caseNumber: executionCaseNumber || c.caseNumber,
              developments: [
                {
                  id: this.generateId(),
                  date: new Date().toISOString(),
                  note: 'Case moved to Execution Court',
                },
                ...(c.developments ?? []),
              ],
              updatedAt: new Date().toISOString(),
            }
          : c,
      ),
    );
  }

  settleCase(id: string, stage: CaseStage): void {
    const stageLabels: Record<CaseStage, string> = {
      primary: 'Primary Court',
      appeal: 'Appeal Court',
      cassation: 'Cassation Court',
      execution: 'Execution Court',
      settled: 'Settled',
    };

    const caseItem = this.getById(id);
    if (!caseItem) return;

    // Check if business settlement already exists for this case
    const existingSettlement = this.businessSettlementService.getByCaseId(id);

    // Create business settlement if it doesn't exist
    if (!existingSettlement) {
      this.businessSettlementService.create({
        departmentAmount: 0,
        legalDepartmentAmount: 0,
        managementAmount: 0,
        adversaryAmount: 0,
        amountOfAmicableAgreement: 0,
        linkedCaseId: id,
      });
    }

    // If settling from execution stage, create execution case if not exists
    if (stage === 'execution' && caseItem.stage === 'execution') {
      const baseCaseNumber = caseItem.baseCaseNumber || caseItem.caseNumber || '';
      const executionCaseNumber = baseCaseNumber
        ? this.appendStageSuffix(baseCaseNumber, 'execution')
        : '';

      if (executionCaseNumber && caseItem.unifiedCaseId) {
        const existingExecutionCase = this.executionCasesService
          .list()
          .find((ec) => ec.executionCaseNo === executionCaseNumber || ec.linkedCaseId === id);

        if (!existingExecutionCase) {
          const lastRuling =
            caseItem.rulings && caseItem.rulings.length > 0
              ? caseItem.rulings[caseItem.rulings.length - 1]
              : null;

          const createdExec = this.executionCasesService.create({
            executionCaseNo: executionCaseNumber,
            fileNo: `FILE-${executionCaseNumber}`,
            fileDate: new Date().toISOString(),
            courtRoom: lastRuling?.courtCity || '',
            companyLawyer: '',
            lastCourtType: lastRuling?.courtType || '',
            lastCourtLevel: lastRuling?.courtLevel || '',
            amountRuled: lastRuling?.indemnityByCourtAmount || 0,
            amountPaid: 0,
            linkedCaseId: id,
            unifiedCaseId: caseItem.unifiedCaseId,
          });
          this.caseTracking.linkEntityToCase(caseItem.unifiedCaseId, 'execution', createdExec.id);
        }
      }
    }

    this.mutate((cases) =>
      cases.map((c) =>
        c.id === id
          ? {
              ...c,
              stage: 'settled',
              status: 'closed',
              legalStatus: 4, // Settled
              settledStatus: 2, // Legally Settled
              developments: [
                {
                  id: this.generateId(),
                  date: new Date().toISOString(),
                  note: `Case settled at ${stageLabels[stage]}`,
                },
                ...(c.developments ?? []),
              ],
              updatedAt: new Date().toISOString(),
            }
          : c,
      ),
    );
  }

  markAsSettled(id: string): void {
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

  delete(id: string): void {
    this.mutate((cases) => cases.filter((c) => c.id !== id));
  }

  private mutate(mutator: (cases: CaseItem[]) => CaseItem[]): void {
    this.storage.update<CaseItem[]>(STORAGE_KEY, (current) => mutator(current ?? []), []);
  }
}
