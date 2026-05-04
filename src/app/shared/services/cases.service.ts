import { Injectable, inject } from '@angular/core';
import { BusinessSettlementService } from './business-settlement.service';
import { CaseNumberService } from './case-number.service';
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

export type CaseMatterType =
  | 'MotorInsurance'
  | 'CommercialContract'
  | 'LaborEmployment'
  | 'RealEstate'
  | 'CriminalDefense'
  | 'GeneralCivil';

export const CASE_MATTER_TYPE_LABELS: Record<CaseMatterType, string> = {
  MotorInsurance: 'Motor / Insurance',
  CommercialContract: 'Commercial / Contract',
  LaborEmployment: 'Labor / Employment',
  RealEstate: 'Real estate',
  CriminalDefense: 'Criminal defense',
  GeneralCivil: 'General civil',
};

export const CASE_MATTER_TYPES: CaseMatterType[] = [
  'MotorInsurance',
  'CommercialContract',
  'LaborEmployment',
  'RealEstate',
  'CriminalDefense',
  'GeneralCivil',
];

export interface CaseItem {
  id: string;
  title: string;
  client: string;
  claimant?: string;
  beneficiary?: string;
  initialHearingDate?: string;
  status: CaseStatus;
  stage: CaseStage;
  caseNumber: string; // Required: Primary identifier (format: YYYYNNN, e.g., 2025001)
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
  /** Practice / matter category (distinct from court ruling Plaintiff/Defendant). */
  matterType?: CaseMatterType;
  // Matter-specific fields
  contractReference?: string;
  disputedAmount?: number;
  employerName?: string;
  employeeName?: string;
  employmentStartDate?: string;
  propertyAddress?: string;
  propertyType?: string;
  titleDeedNumber?: string;
  offenseType?: string;
  incidentDate?: string;
  policeReportNumber?: string;
  caseSummary?: string;
}

const STORAGE_KEY = 'cases';

@Injectable({ providedIn: 'root' })
export class CasesService {
  private readonly storage = inject(MockStorageService);
  private readonly businessSettlementService = inject(BusinessSettlementService);
  private readonly caseNumberService = inject(CaseNumberService);
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
    // Collect existing case numbers from cases
    const existingCases = this.list();
    const existingCaseNumbers: string[] = [];
    existingCases.forEach((c) => {
      if (c.caseNumber) existingCaseNumbers.push(c.caseNumber);
      if (c.baseCaseNumber) existingCaseNumbers.push(c.baseCaseNumber);
    });

    // Collect from arbitrations and execution cases from storage directly to avoid circular dependency
    const arbitrations = this.storage.get<any[]>('arbitrations', []);
    const executionCases = this.storage.get<any[]>('executionCases', []);

    const arbitrationNumbers: string[] = [];
    arbitrations.forEach((a: any) => {
      if (a?.caseNumber) arbitrationNumbers.push(a.caseNumber);
    });

    const executionNumbers: string[] = [];
    executionCases.forEach((e: any) => {
      if (e?.caseNumber) executionNumbers.push(e.caseNumber);
    });

    // Use CaseNumberService to generate case numbers across all entities
    return this.caseNumberService.generateCaseNumber(
      existingCaseNumbers,
      arbitrationNumbers,
      executionNumbers,
    );
  }

  getByCaseNumber(caseNumber: string): CaseItem | undefined {
    return this.list().find((c) => c.caseNumber === caseNumber || c.baseCaseNumber === caseNumber);
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
    const generateId = () => this.generateId();
    const isoDay = (daysOffset: number) =>
      new Date(now.getTime() + daysOffset * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const isoDate = (daysOffset: number) =>
      new Date(now.getTime() + daysOffset * 24 * 60 * 60 * 1000).toISOString();

    const cases: CaseItem[] = [
      {
        id: 'case-1',
        title: 'Fleet Collision Compensation - Q4/2025',
        client: 'Nour Logistics Co.',
        claimant: 'Nour Logistics Co.',
        status: 'open',
        stage: 'primary',
        caseNumber: '2026101',
        baseCaseNumber: '2026101',
        legalStatus: 1,
        unifiedCaseId: 'uc-1001',
        matterType: 'MotorInsurance',
        tags: ['motor', 'insurance'],
        damageType: 'Disability',
        disabilityMetrics: { moralPercent: 12, physicalPercent: 28 },
        claimantDemographics: {
          nationality: 'Saudi',
          sex: 'Male',
          maritalStatus: 'Married',
          profession: 'Fleet Supervisor',
          age: 39,
          dependents: 4,
        },
        deadlines: [
          { id: generateId(), title: 'Submit accident reconstruction report', date: isoDay(8) },
        ],
        tasks: [{ id: generateId(), title: 'Collect traffic camera records', done: false }],
        developments: [
          { id: generateId(), date: isoDate(-12), note: 'Primary claim bundle filed.' },
        ],
        rulings: [],
        createdAt: isoDate(-25),
        updatedAt: isoDate(-2),
      },
      {
        id: 'case-2',
        title: 'Software Licensing Breach',
        client: 'Atlas Digital Solutions',
        claimant: 'Atlas Digital Solutions',
        status: 'pending',
        stage: 'appeal',
        caseNumber: '2026102',
        baseCaseNumber: '2026102',
        legalStatus: 1,
        unifiedCaseId: 'uc-1002',
        matterType: 'CommercialContract',
        tags: ['commercial', 'contract'],
        contractReference: 'CTR-2026-014',
        disputedAmount: 420000,
        deadlines: [{ id: generateId(), title: 'Appeal memorandum filing', date: isoDay(14) }],
        tasks: [{ id: generateId(), title: 'Review indemnity clauses', done: false }],
        developments: [
          { id: generateId(), date: isoDate(-40), note: 'Primary judgment partially adverse.' },
        ],
        rulings: [
          {
            id: generateId(),
            stage: 'primary',
            caseNo: '2026102',
            caseType: 'Plaintiff',
            courtType: 'Commercial',
            courtLevel: 'Primary',
            courtCity: 'Riyadh',
            caseDetails: 'Dispute on licensing fee and support obligations.',
            filingDate: isoDay(-65),
            filingNo: 'F-2026-201',
            stageNo: 1,
            rulingInFavorOf: 'Adversary',
            rulingDate: isoDay(-40),
            courtFees: 8500,
            legalExpenses: 29000,
            translationCourtFees: 0,
            courtFeesInCash: 1200,
            expertFees: 14000,
            advocacyFees: 22000,
            otherExpenses: 5000,
            adversaryName: 'BlueOcean Systems',
            indemnityByCourtAmount: 75000,
            date: isoDate(-40),
          },
        ],
        createdAt: isoDate(-70),
        updatedAt: isoDate(-3),
      },
      {
        id: 'case-3',
        title: 'Warehouse Lease Termination Dispute',
        client: 'Harbor Import Group',
        claimant: 'Harbor Import Group',
        status: 'open',
        stage: 'primary',
        caseNumber: '2026103',
        baseCaseNumber: '2026103',
        legalStatus: 1,
        unifiedCaseId: 'uc-1003',
        matterType: 'RealEstate',
        tags: ['real-estate', 'lease'],
        propertyAddress: 'Eastern Ring Rd, Warehouse Block C, Riyadh',
        propertyType: 'Commercial',
        titleDeedNumber: 'DEED-RE-2026-055',
        deadlines: [{ id: generateId(), title: 'Submit valuation evidence', date: isoDay(10) }],
        tasks: [{ id: generateId(), title: 'Obtain notarized lease addendum', done: true }],
        developments: [
          { id: generateId(), date: isoDate(-18), note: 'Notice of termination challenged.' },
        ],
        rulings: [],
        createdAt: isoDate(-22),
        updatedAt: isoDate(-1),
      },
      {
        id: 'case-4',
        title: 'Unpaid Overtime and End-of-Service Claim',
        client: 'Safa Healthcare',
        claimant: 'Leena Al-Harthi',
        status: 'pending',
        stage: 'cassation',
        caseNumber: '2026104',
        baseCaseNumber: '2026104',
        legalStatus: 1,
        unifiedCaseId: 'uc-1004',
        matterType: 'LaborEmployment',
        tags: ['labor', 'employment'],
        employerName: 'Safa Healthcare',
        employeeName: 'Leena Al-Harthi',
        employmentStartDate: '2018-09-01',
        deadlines: [{ id: generateId(), title: 'Cassation brief deadline', date: isoDay(12) }],
        tasks: [{ id: generateId(), title: 'Reconcile payroll export', done: false }],
        developments: [
          { id: generateId(), date: isoDate(-55), note: 'Appeal court adjusted compensation.' },
        ],
        rulings: [
          {
            id: generateId(),
            stage: 'primary',
            caseNo: '2026104',
            caseType: 'Defendant',
            courtType: 'Labor',
            courtLevel: 'Primary',
            courtCity: 'Jeddah',
            caseDetails: 'Overtime compensation and leave balance dispute.',
            filingDate: isoDay(-120),
            filingNo: 'F-2026-178',
            stageNo: 1,
            rulingInFavorOf: 'Adversary',
            rulingDate: isoDay(-88),
            courtFees: 4100,
            legalExpenses: 14000,
            translationCourtFees: 0,
            courtFeesInCash: 600,
            expertFees: 6500,
            advocacyFees: 9700,
            otherExpenses: 2800,
            adversaryName: 'Leena Al-Harthi',
            indemnityByCourtAmount: 96000,
            date: isoDate(-88),
          },
          {
            id: generateId(),
            stage: 'appeal',
            caseNo: '202610401',
            caseType: 'Defendant',
            courtType: 'Labor',
            courtLevel: 'Appeal',
            courtCity: 'Jeddah',
            caseDetails: 'Appeal on overtime computation method.',
            filingDate: isoDay(-80),
            filingNo: 'F-2026-199',
            stageNo: 2,
            rulingInFavorOf: 'Adversary',
            rulingDate: isoDay(-55),
            courtFees: 5200,
            legalExpenses: 16800,
            translationCourtFees: 0,
            courtFeesInCash: 800,
            expertFees: 8400,
            advocacyFees: 11800,
            otherExpenses: 3200,
            adversaryName: 'Leena Al-Harthi',
            indemnityByCourtAmount: 122000,
            date: isoDate(-55),
          },
        ],
        createdAt: isoDate(-130),
        updatedAt: isoDate(-4),
      },
      {
        id: 'case-5',
        title: 'Financial Fraud Defense - Executive File',
        client: 'Salem Al-Faraj',
        claimant: 'Public Prosecution',
        status: 'open',
        stage: 'primary',
        caseNumber: '2026105',
        baseCaseNumber: '2026105',
        legalStatus: 1,
        unifiedCaseId: 'uc-1005',
        matterType: 'CriminalDefense',
        tags: ['criminal', 'defense'],
        offenseType: 'Financial Fraud Allegation',
        incidentDate: isoDay(-95),
        policeReportNumber: 'PR-2026-4401',
        deadlines: [
          { id: generateId(), title: 'Submit forensic accounting rebuttal', date: isoDay(6) },
        ],
        tasks: [{ id: generateId(), title: 'Review seizure warrant timeline', done: false }],
        developments: [{ id: generateId(), date: isoDate(-10), note: 'Charge sheet disclosed.' }],
        rulings: [],
        createdAt: isoDate(-36),
        updatedAt: isoDate(-1),
      },
      {
        id: 'case-6',
        title: 'General Civil Damages - Vendor Negligence',
        client: 'Al Noor Trading',
        claimant: 'Al Noor Trading',
        status: 'closed',
        stage: 'settled',
        caseNumber: '2026106',
        baseCaseNumber: '2026106',
        legalStatus: 4,
        settledStatus: 2,
        unifiedCaseId: 'uc-1006',
        matterType: 'GeneralCivil',
        tags: ['general-civil'],
        caseSummary: 'Claim for business interruption damages resolved by amicable settlement.',
        deadlines: [],
        tasks: [],
        developments: [
          { id: generateId(), date: isoDate(-20), note: 'Amicable settlement signed.' },
        ],
        rulings: [],
        createdAt: isoDate(-90),
        updatedAt: isoDate(-20),
      },
    ];

    const extraMatterTypes: CaseMatterType[] = [
      'MotorInsurance',
      'CommercialContract',
      'LaborEmployment',
      'RealEstate',
      'CriminalDefense',
      'GeneralCivil',
    ];
    const clients = [
      'Arabia Retail Group',
      'Horizon Freight',
      'Crescent Hospitality',
      'Najd Properties',
      'Falcon Manufacturing',
      'Bayan Tech',
    ];

    for (let i = 0; i < 10; i++) {
      const matterType = extraMatterTypes[i % extraMatterTypes.length];
      const seq = 107 + i;
      const stage: CaseStage = i % 4 === 0 ? 'appeal' : i % 5 === 0 ? 'execution' : 'primary';
      const legalStatus = stage === 'execution' ? 3 : 1;
      const base: CaseItem = {
        id: `case-${7 + i}`,
        title: `${CASE_MATTER_TYPE_LABELS[matterType]} Matter ${seq}`,
        client: clients[i % clients.length],
        claimant: clients[i % clients.length],
        status: i % 3 === 0 ? 'pending' : 'open',
        stage,
        caseNumber: `2026${seq}`,
        baseCaseNumber: `2026${seq}`,
        legalStatus,
        unifiedCaseId: `uc-11${i}`,
        matterType,
        tags: ['generated'],
        deadlines: [{ id: generateId(), title: 'Next procedural filing', date: isoDay(5 + i) }],
        tasks: [{ id: generateId(), title: 'Prepare hearing bundle', done: i % 2 === 0 }],
        developments: [
          { id: generateId(), date: isoDate(-(i + 3) * 4), note: 'Case activity logged.' },
        ],
        rulings: [],
        createdAt: isoDate(-(i + 8) * 7),
        updatedAt: isoDate(-(i + 1) * 2),
      };

      switch (matterType) {
        case 'MotorInsurance':
          base.tags = ['motor', 'insurance'];
          base.damageType = i % 2 === 0 ? 'Disability' : 'Fatal';
          base.disabilityMetrics =
            base.damageType === 'Disability'
              ? { moralPercent: 8 + i, physicalPercent: 14 + i }
              : undefined;
          base.claimantDemographics = {
            nationality: i % 2 === 0 ? 'Saudi' : 'Jordanian',
            sex: i % 2 === 0 ? 'Male' : 'Female',
            maritalStatus: i % 2 === 0 ? 'Married' : 'Single',
            profession: 'Driver',
            age: 29 + i,
            dependents: i % 4,
          };
          break;
        case 'CommercialContract':
          base.tags = ['commercial', 'contract'];
          base.contractReference = `CTR-2026-${String(300 + i)}`;
          base.disputedAmount = 90000 + i * 12000;
          break;
        case 'LaborEmployment':
          base.tags = ['labor', 'employment'];
          base.employerName = clients[i % clients.length];
          base.employeeName = `Employee ${i + 1}`;
          base.employmentStartDate = isoDay(-(1200 + i * 15));
          break;
        case 'RealEstate':
          base.tags = ['real-estate', 'property'];
          base.propertyAddress = `Block ${i + 2}, North District, Riyadh`;
          base.propertyType = i % 2 === 0 ? 'Residential' : 'Commercial';
          base.titleDeedNumber = `DEED-2026-${String(500 + i)}`;
          break;
        case 'CriminalDefense':
          base.tags = ['criminal', 'defense'];
          base.offenseType = i % 2 === 0 ? 'Embezzlement Allegation' : 'Forgery Allegation';
          base.incidentDate = isoDay(-(140 + i * 3));
          base.policeReportNumber = `PR-2026-${String(7000 + i)}`;
          break;
        case 'GeneralCivil':
        default:
          base.tags = ['general-civil'];
          base.caseSummary = `General civil compensation and liability dispute file ${seq}.`;
          break;
      }

      cases.push(base);
    }

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
    matterType?: CaseMatterType;
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
      matterType: input.matterType ?? 'GeneralCivil',
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
        | 'matterType'
        | 'contractReference'
        | 'disputedAmount'
        | 'employerName'
        | 'employeeName'
        | 'employmentStartDate'
        | 'propertyAddress'
        | 'propertyType'
        | 'titleDeedNumber'
        | 'offenseType'
        | 'incidentDate'
        | 'policeReportNumber'
        | 'caseSummary'
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
