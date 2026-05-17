import { Injectable, inject } from '@angular/core';
import { BusinessSettlementService } from './business-settlement.service';
import { CaseNumberService } from './case-number.service';
import { CaseTrackingService } from './case-tracking.service';
import { ExecutionCasesService } from './execution-cases.service';
import { resolveCompanySideFromRulings } from '../utils/case-side.util';
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

/** Optional extended tracker fields stored on a case. */
export interface PortalWorkbookFields {
  userNumber?: string;
  externalId?: string;
  plaintiff?: string;
  defendant?: string;
  claimType?: string;
  claimValue?: string;
  compensationType?: string;
  claimStatus?: string;
  requiredAction?: string;
  remarks?: string;
  subrogationFiledOn?: string;
  subrogationExpectedEnd?: string;
  courtSubject?: string;
  courtName?: string;
  courtCity?: string;
  nextHearingDate?: string;
  nextHearingTime?: string;
  decisionType?: string;
  doublePaymentAmount?: number;
}

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
  portalWorkbook?: PortalWorkbookFields;
  /** Company's procedural side (Plaintiff / Defendant). */
  companySide?: CaseType;
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
    let cases = this.storage.get<CaseItem[]>(STORAGE_KEY, []);
    if (cases.length === 0) {
      this.seedData();
      return this.storage.get<CaseItem[]>(STORAGE_KEY, []);
    }
    const migrated = this.migrateCompanySide(cases);
    if (migrated.changed) {
      this.storage.set(STORAGE_KEY, migrated.cases);
      cases = migrated.cases;
    }
    return cases;
  }

  private migrateCompanySide(cases: CaseItem[]): { cases: CaseItem[]; changed: boolean } {
    let changed = false;
    const next = cases.map((c) => {
      if (c.companySide) return c;
      const fromRuling = resolveCompanySideFromRulings(c.rulings);
      if (!fromRuling) return c;
      changed = true;
      return { ...c, companySide: fromRuling };
    });
    return { cases: next, changed };
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
        title: 'تعويض تصادم مركبات — أسطول نقل',
        client: 'شركة نور لللوجستيات',
        claimant: 'شركة نور لللوجستيات',
        status: 'open',
        stage: 'execution',
        caseNumber: '2026101',
        baseCaseNumber: '2026101',
        legalStatus: 3,
        unifiedCaseId: 'uc-1001',
        companyLawyerId: 'lawyer-1',
        companyLawyerName: 'رنا العنزي',
        matterType: 'MotorInsurance',
        companySide: 'Plaintiff',
        tags: ['مركبات', 'تأمين'],
        damageType: 'Disability',
        disabilityMetrics: { moralPercent: 12, physicalPercent: 28 },
        claimantDemographics: {
          nationality: 'سعودي',
          sex: 'Male',
          maritalStatus: 'Married',
          profession: 'مشرف أسطول',
          age: 39,
          dependents: 4,
        },
        deadlines: [{ id: generateId(), title: 'تقديم تقرير إعادة تمثيل الحادث', date: isoDay(8) }],
        tasks: [
          { id: generateId(), title: 'جمع تسجيلات كاميرات المرور', done: false },
          { id: generateId(), title: 'متابعة ملف التنفيذ', done: false },
        ],
        developments: [
          { id: generateId(), date: isoDate(-45), note: 'صدور حكم ابتدائي لصالح الشركة.' },
          { id: generateId(), date: isoDate(-12), note: 'تحويل الملف إلى إدارة التنفيذ.' },
        ],
        rulings: [
          {
            id: generateId(),
            stage: 'primary',
            caseNo: '2026101',
            caseType: 'Plaintiff',
            courtType: 'Traffic',
            courtLevel: 'Primary',
            courtCity: 'الرياض',
            caseDetails: 'مطالبة بتعويض أضرار تصادم مركبات أسطول.',
            filingDate: isoDay(-200),
            filingNo: 'F-2026-101',
            stageNo: 1,
            rulingInFavorOf: 'Company',
            rulingDate: isoDay(-45),
            courtFees: 5000,
            legalExpenses: 18000,
            translationCourtFees: 0,
            courtFeesInCash: 800,
            expertFees: 12000,
            advocacyFees: 15000,
            otherExpenses: 3000,
            adversaryName: 'مؤسسة النقل السريع',
            indemnityByCourtAmount: 122000,
            date: isoDate(-45),
          },
        ],
        createdAt: isoDate(-240),
        updatedAt: isoDate(-2),
      },
      {
        id: 'case-2',
        title: 'نزاع ترخيص برمجيات ودعم فني',
        client: 'أطلس الرقمية',
        claimant: 'أطلس الرقمية',
        status: 'pending',
        stage: 'appeal',
        caseNumber: '2026102',
        baseCaseNumber: '2026102',
        legalStatus: 1,
        unifiedCaseId: 'uc-1002',
        companyLawyerId: 'lawyer-2',
        companyLawyerName: 'زياد البيشي',
        matterType: 'CommercialContract',
        companySide: 'Plaintiff',
        tags: ['تجاري', 'عقد'],
        contractReference: 'CTR-2026-014',
        disputedAmount: 420000,
        deadlines: [{ id: generateId(), title: 'آخر موعد لمذكرة الاستئناف', date: isoDay(14) }],
        tasks: [{ id: generateId(), title: 'مراجعة بنود التعويض', done: false }],
        developments: [
          { id: generateId(), date: isoDate(-40), note: 'حكم ابتدائي جزئي لصالح الخصم.' },
        ],
        rulings: [
          {
            id: generateId(),
            stage: 'primary',
            caseNo: '2026102',
            caseType: 'Plaintiff',
            courtType: 'Commercial',
            courtLevel: 'Primary',
            courtCity: 'الرياض',
            caseDetails: 'خلاف حول رسوم الترخيص والتزامات الدعم الفني.',
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
            adversaryName: 'أنظمة المحيط الأزرق',
            indemnityByCourtAmount: 75000,
            date: isoDate(-40),
          },
        ],
        createdAt: isoDate(-200),
        updatedAt: isoDate(-3),
      },
      {
        id: 'case-3',
        title: 'مطالبة مستحقات عمالية — مستودعات الدمام',
        client: 'مجموعة الشرق للتخزين',
        claimant: 'عاملون سابقون (١٢)',
        status: 'open',
        stage: 'primary',
        caseNumber: '2026103',
        baseCaseNumber: '2026103',
        legalStatus: 1,
        unifiedCaseId: 'uc-1003',
        companyLawyerId: 'lawyer-3',
        companyLawyerName: 'نورة الشهري',
        matterType: 'LaborEmployment',
        companySide: 'Defendant',
        employerName: 'مجموعة الشرق للتخزين',
        employeeName: 'متعدد',
        disputedAmount: 186000,
        tags: ['عمالي', 'مستحقات'],
        deadlines: [{ id: generateId(), title: 'جلسة المرافعة الأولى', date: isoDay(21) }],
        tasks: [{ id: generateId(), title: 'تجميع سجلات الرواتب', done: true }],
        developments: [
          { id: generateId(), date: isoDate(-20), note: 'تقديم مذكرة دفاع حول نظام العمل.' },
        ],
        rulings: [],
        createdAt: isoDate(-320),
        updatedAt: isoDate(-8),
      },
      {
        id: 'case-4',
        title: 'نزاع ملكية عقارية — مجمع سكني',
        client: 'شركة الأفق العقارية',
        status: 'open',
        stage: 'cassation',
        caseNumber: '202610401',
        baseCaseNumber: '2026104',
        legalStatus: 1,
        unifiedCaseId: 'uc-1004',
        companyLawyerId: 'lawyer-1',
        companyLawyerName: 'رنا العنزي',
        matterType: 'RealEstate',
        companySide: 'Defendant',
        propertyAddress: 'حي الياسمين، الرياض',
        propertyType: 'مجمع سكني',
        titleDeedNumber: 'TD-441902',
        tags: ['عقاري', 'ملكية'],
        deadlines: [{ id: generateId(), title: 'مهلة الاعتراض على الحكم', date: isoDay(30) }],
        tasks: [{ id: generateId(), title: 'إعداد مذكرة النقض', done: false }],
        developments: [
          { id: generateId(), date: isoDate(-55), note: 'حكم استئناف يؤيد موقف الشركة.' },
        ],
        rulings: [
          {
            id: generateId(),
            stage: 'primary',
            caseNo: '2026104',
            caseType: 'Defendant',
            courtType: 'Real Estate',
            courtLevel: 'Primary',
            courtCity: 'الرياض',
            caseDetails: 'دعوى إثبات ملكية قطعة أرض ضمن المشروع.',
            filingDate: isoDay(-180),
            filingNo: 'F-2026-304',
            stageNo: 1,
            rulingInFavorOf: 'Adversary',
            rulingDate: isoDay(-120),
            courtFees: 12000,
            legalExpenses: 35000,
            translationCourtFees: 0,
            courtFeesInCash: 2000,
            expertFees: 22000,
            advocacyFees: 28000,
            otherExpenses: 8000,
            adversaryName: 'مستثمرون أفراد — جمعية الملاك',
            indemnityByCourtAmount: 0,
            date: isoDate(-120),
          },
          {
            id: generateId(),
            stage: 'appeal',
            caseNo: '202610401',
            caseType: 'Defendant',
            courtType: 'Real Estate',
            courtLevel: 'Appeal',
            courtCity: 'الرياض',
            caseDetails: 'استئناف الحكم الابتدائي.',
            filingDate: isoDay(-90),
            filingNo: 'F-2026-304-A',
            stageNo: 2,
            rulingInFavorOf: 'Company',
            rulingDate: isoDay(-55),
            courtFees: 6000,
            legalExpenses: 19000,
            translationCourtFees: 0,
            courtFeesInCash: 900,
            expertFees: 8000,
            advocacyFees: 16000,
            otherExpenses: 4000,
            adversaryName: 'مستثمرون أفراد — جمعية الملاك',
            indemnityByCourtAmount: 0,
            date: isoDate(-55),
          },
        ],
        createdAt: isoDate(-280),
        updatedAt: isoDate(-6),
      },
      {
        id: 'case-5',
        title: 'دفاع جنائي — مخالفات منشأة صناعية',
        client: 'مصانع الخليج للبلاستيك',
        status: 'open',
        stage: 'primary',
        caseNumber: '2026105',
        baseCaseNumber: '2026105',
        legalStatus: 1,
        unifiedCaseId: 'uc-1005',
        companyLawyerId: 'lawyer-2',
        companyLawyerName: 'زياد البيشي',
        matterType: 'CriminalDefense',
        companySide: 'Defendant',
        offenseType: 'مخالفة بيئية',
        incidentDate: isoDay(-80),
        policeReportNumber: 'PR-2026-8891',
        tags: ['جنائي', 'بيئة'],
        deadlines: [{ id: generateId(), title: 'جلسة تحقيق', date: isoDay(5) }],
        tasks: [{ id: generateId(), title: 'مراجعة تقرير الهيئة', done: false }],
        developments: [
          { id: generateId(), date: isoDate(-15), note: 'طلب تخفيف العقوبة الإدارية.' },
        ],
        rulings: [],
        createdAt: isoDate(-75),
        updatedAt: isoDate(-4),
      },
      {
        id: 'case-6',
        title: 'تسوية مدنية — تعويض توريد مواد',
        client: 'شركة الإمداد المتكامل',
        status: 'closed',
        stage: 'settled',
        caseNumber: '2026106',
        baseCaseNumber: '2026106',
        legalStatus: 4,
        settledStatus: 2,
        unifiedCaseId: 'uc-1006',
        companyLawyerId: 'lawyer-3',
        companyLawyerName: 'نورة الشهري',
        matterType: 'GeneralCivil',
        companySide: 'Plaintiff',
        tags: ['مدني', 'تسوية'],
        caseSummary: 'تمت التسوية الودية بعد وساطة إدارة الشؤون القانونية.',
        developments: [
          { id: generateId(), date: isoDate(-8), note: 'اعتماد اتفاق التسوية من الإدارة العليا.' },
        ],
        rulings: [
          {
            id: generateId(),
            stage: 'primary',
            caseNo: '2026106',
            caseType: 'Plaintiff',
            courtType: 'Civil',
            courtLevel: 'Primary',
            courtCity: 'جدة',
            caseDetails: 'مطالبة بتعويض تأخر توريد.',
            filingDate: isoDay(-400),
            filingNo: 'F-2025-906',
            stageNo: 1,
            rulingInFavorOf: 'Company',
            rulingDate: isoDay(-30),
            courtFees: 4000,
            legalExpenses: 11000,
            translationCourtFees: 0,
            courtFeesInCash: 500,
            expertFees: 0,
            advocacyFees: 9000,
            otherExpenses: 2000,
            adversaryName: 'مورد الخليج للحديد',
            indemnityByCourtAmount: 45000,
            date: isoDate(-30),
          },
        ],
        deadlines: [],
        tasks: [],
        createdAt: isoDate(-360),
        updatedAt: isoDate(-4),
      },
      {
        id: 'case-7',
        title: 'حادث مروري — مسؤولية طرف ثالث',
        client: 'التأمين التعاوني (فرع الشركة)',
        status: 'pending',
        stage: 'appeal',
        caseNumber: '202610701',
        baseCaseNumber: '2026107',
        legalStatus: 1,
        unifiedCaseId: 'uc-1007',
        companyLawyerId: 'lawyer-1',
        companyLawyerName: 'رنا العنزي',
        matterType: 'MotorInsurance',
        companySide: 'Defendant',
        tags: ['مركبات', 'مسؤولية'],
        damageType: 'Fatal',
        developments: [
          { id: generateId(), date: isoDate(-25), note: 'استئناف الحكم على مبلغ التعويض.' },
        ],
        rulings: [
          {
            id: generateId(),
            stage: 'primary',
            caseNo: '2026107',
            caseType: 'Defendant',
            courtType: 'Traffic',
            courtLevel: 'Primary',
            courtCity: 'مكة',
            caseDetails: 'دعوى تعويض من ورثة ضحية حادث.',
            filingDate: isoDay(-110),
            filingNo: 'F-2026-107',
            stageNo: 1,
            rulingInFavorOf: 'Adversary',
            rulingDate: isoDay(-60),
            courtFees: 7000,
            legalExpenses: 24000,
            translationCourtFees: 1500,
            courtFeesInCash: 1000,
            expertFees: 18000,
            advocacyFees: 20000,
            otherExpenses: 6000,
            adversaryName: 'ورثة المتوفى',
            indemnityByCourtAmount: 210000,
            date: isoDate(-60),
          },
        ],
        deadlines: [{ id: generateId(), title: 'تقديم مذكرة الاستئناف', date: isoDay(10) }],
        tasks: [{ id: generateId(), title: 'مراجعة تقرير الخبير', done: false }],
        createdAt: isoDate(-120),
        updatedAt: isoDate(-5),
      },
      {
        id: 'case-8',
        title: 'عقد توريد أجهزة طبية',
        client: 'مستشفى الرعاية الحديثة',
        claimant: 'مستشفى الرعاية الحديثة',
        status: 'open',
        stage: 'primary',
        caseNumber: '2026108',
        baseCaseNumber: '2026108',
        legalStatus: 1,
        unifiedCaseId: 'uc-1008',
        companyLawyerId: 'lawyer-2',
        companyLawyerName: 'زياد البيشي',
        matterType: 'CommercialContract',
        companySide: 'Plaintiff',
        contractReference: 'MED-2026-88',
        disputedAmount: 890000,
        tags: ['تجاري', 'توريد'],
        deadlines: [{ id: generateId(), title: 'تبادل المستندات', date: isoDay(18) }],
        tasks: [{ id: generateId(), title: 'إعداد لائحة الدعوى', done: true }],
        developments: [
          { id: generateId(), date: isoDate(-3), note: 'قيد الدعوى لدى المحكمة التجارية.' },
        ],
        rulings: [],
        createdAt: isoDate(-18),
        updatedAt: isoDate(-1),
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
        | 'portalWorkbook'
        | 'companySide'
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
