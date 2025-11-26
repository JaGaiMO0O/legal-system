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
      {
        id: 'case-5',
        title: 'Commercial Contract Dispute - Case #2025-015',
        client: 'Al-Rajhi Trading Company',
        status: 'open',
        stage: 'primary',
        tags: ['commercial', 'contract'],
        deadlines: [
          { id: 'dl-5', title: 'Submit contract documents', date: '2025-01-25' },
          { id: 'dl-6', title: 'Mediation session', date: '2025-02-05' },
        ],
        tasks: [
          { id: 'task-5', title: 'Review contract terms', done: true },
          { id: 'task-6', title: 'Contact witnesses', done: false },
          { id: 'task-7', title: 'Prepare financial analysis', done: false },
        ],
        developments: [
          {
            id: 'dev-6',
            date: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(),
            note: 'Case filed regarding breach of contract',
          },
        ],
        rulings: [],
        createdAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'case-6',
        title: 'Property Damage Claim - Case #2025-028',
        client: 'Noura Al-Mutairi',
        status: 'open',
        stage: 'primary',
        tags: ['property', 'damage'],
        deadlines: [
          { id: 'dl-7', title: 'Property inspection', date: '2025-01-18' },
          { id: 'dl-8', title: 'Expert report submission', date: '2025-01-30' },
        ],
        tasks: [
          { id: 'task-8', title: 'Schedule property inspection', done: false },
          { id: 'task-9', title: 'Collect damage photos', done: true },
        ],
        developments: [
          {
            id: 'dev-7',
            date: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000).toISOString(),
            note: 'Initial claim filed',
          },
        ],
        rulings: [],
        createdAt: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'case-7',
        title: 'Labor Dispute - Case #2024-189',
        client: 'Saudi Construction Group',
        status: 'pending',
        stage: 'appeal',
        tags: ['labor', 'employment'],
        deadlines: [{ id: 'dl-9', title: 'Appeal response deadline', date: '2025-01-22' }],
        tasks: [
          { id: 'task-10', title: 'Review labor law regulations', done: true },
          { id: 'task-11', title: 'Prepare counter-arguments', done: false },
        ],
        developments: [
          {
            id: 'dev-8',
            date: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString(),
            note: 'Primary court ruling received',
          },
          {
            id: 'dev-9',
            date: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(),
            note: 'Appeal filed at Appeal Court',
          },
        ],
        rulings: [
          {
            id: 'ruling-2',
            stage: 'primary',
            caseNo: '2024-189',
            caseType: 'Defendant',
            courtType: 'Labor Court',
            courtLevel: 'Primary',
            courtCity: 'Jeddah',
            caseDetails: 'Employment termination dispute',
            filingDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
            filingNo: 'FIL-2024-189',
            stageNo: 1,
            rulingInFavorOf: 'Adversary',
            rulingDate: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
            courtFees: 3000,
            legalExpenses: 10000,
            translationCourtFees: 1500,
            courtFeesInCash: 2000,
            expertFees: 5000,
            advocacyFees: 8000,
            otherExpenses: 1500,
            adversaryName: 'Hassan Al-Qahtani',
            indemnityByCourtAmount: 35000,
            date: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
        createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'case-8',
        title: 'Insurance Claim Dispute - Case #2025-042',
        client: 'Tawuniya Insurance',
        status: 'open',
        stage: 'primary',
        tags: ['insurance', 'claim'],
        deadlines: [
          { id: 'dl-10', title: 'Medical report review', date: '2025-01-28' },
          { id: 'dl-11', title: 'Settlement negotiation', date: '2025-02-15' },
        ],
        tasks: [
          { id: 'task-12', title: 'Review policy terms', done: true },
          { id: 'task-13', title: 'Analyze medical reports', done: false },
        ],
        developments: [
          {
            id: 'dev-10',
            date: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            note: 'Case filed at Primary Court',
          },
        ],
        rulings: [],
        createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'case-9',
        title: 'Cassation Court Review - Case #2023-456',
        client: 'Mohammed Al-Dosari',
        status: 'pending',
        stage: 'cassation',
        tags: ['cassation', 'review'],
        deadlines: [{ id: 'dl-12', title: 'Final submission', date: '2025-02-01' }],
        tasks: [
          { id: 'task-14', title: 'Prepare cassation brief', done: false },
          { id: 'task-15', title: 'Review legal precedents', done: true },
        ],
        developments: [
          {
            id: 'dev-11',
            date: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString(),
            note: 'Original case filed',
          },
          {
            id: 'dev-12',
            date: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
            note: 'Appeal court ruling received',
          },
          {
            id: 'dev-13',
            date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            note: 'Cassation review requested',
          },
        ],
        rulings: [
          {
            id: 'ruling-3',
            stage: 'primary',
            caseNo: '2023-456',
            caseType: 'Plaintiff',
            courtType: 'Civil Court',
            courtLevel: 'Primary',
            courtCity: 'Riyadh',
            caseDetails: 'Property ownership dispute',
            filingDate: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
            filingNo: 'FIL-2023-456',
            stageNo: 1,
            rulingInFavorOf: 'Company',
            rulingDate: new Date(now.getTime() - 150 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
            courtFees: 6000,
            legalExpenses: 18000,
            translationCourtFees: 2500,
            courtFeesInCash: 3500,
            expertFees: 10000,
            advocacyFees: 15000,
            otherExpenses: 3000,
            adversaryName: 'Khalid Al-Mutairi',
            indemnityByCourtAmount: 75000,
            date: new Date(now.getTime() - 150 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'ruling-4',
            stage: 'appeal',
            caseNo: '2023-456',
            caseType: 'Plaintiff',
            courtType: 'Appeal Court',
            courtLevel: 'Appeal',
            courtCity: 'Riyadh',
            caseDetails: 'Property ownership dispute - Appeal',
            filingDate: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
            filingNo: 'FIL-2023-456-AP',
            stageNo: 2,
            rulingInFavorOf: 'Adversary',
            rulingDate: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
            courtFees: 8000,
            legalExpenses: 20000,
            translationCourtFees: 3000,
            courtFeesInCash: 4000,
            expertFees: 12000,
            advocacyFees: 18000,
            otherExpenses: 4000,
            adversaryName: 'Khalid Al-Mutairi',
            indemnityByCourtAmount: 0,
            date: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
        createdAt: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'case-10',
        title: 'Medical Malpractice - Case #2025-067',
        client: 'Dr. Sarah Al-Harbi',
        status: 'open',
        stage: 'primary',
        tags: ['medical', 'malpractice'],
        deadlines: [
          { id: 'dl-13', title: 'Expert medical review', date: '2025-02-08' },
          { id: 'dl-14', title: 'Witness depositions', date: '2025-02-20' },
        ],
        tasks: [
          { id: 'task-16', title: 'Gather medical records', done: true },
          { id: 'task-17', title: 'Consult medical experts', done: false },
        ],
        developments: [
          {
            id: 'dev-14',
            date: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
            note: 'Case filed at Primary Court',
          },
        ],
        rulings: [],
        createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'case-11',
        title: 'Debt Collection - Case #2024-234',
        client: 'Al-Faisal Bank',
        status: 'closed',
        stage: 'settled',
        tags: ['debt', 'collection', 'settled'],
        deadlines: [],
        tasks: [],
        developments: [
          {
            id: 'dev-15',
            date: new Date(now.getTime() - 200 * 24 * 60 * 60 * 1000).toISOString(),
            note: 'Case filed for debt collection',
          },
          {
            id: 'dev-16',
            date: new Date(now.getTime() - 150 * 24 * 60 * 60 * 1000).toISOString(),
            note: 'Ruling in favor of company',
          },
          {
            id: 'dev-17',
            date: new Date(now.getTime() - 100 * 24 * 60 * 60 * 1000).toISOString(),
            note: 'Execution completed, debt collected',
          },
          {
            id: 'dev-18',
            date: new Date(now.getTime() - 80 * 24 * 60 * 60 * 1000).toISOString(),
            note: 'Case settled and closed',
          },
        ],
        rulings: [
          {
            id: 'ruling-5',
            stage: 'primary',
            caseNo: '2024-234',
            caseType: 'Plaintiff',
            courtType: 'Commercial Court',
            courtLevel: 'Primary',
            courtCity: 'Riyadh',
            caseDetails: 'Loan default and debt collection',
            filingDate: new Date(now.getTime() - 200 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
            filingNo: 'FIL-2024-234',
            stageNo: 1,
            rulingInFavorOf: 'Company',
            rulingDate: new Date(now.getTime() - 150 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
            courtFees: 4000,
            legalExpenses: 12000,
            translationCourtFees: 1800,
            courtFeesInCash: 2500,
            expertFees: 0,
            advocacyFees: 10000,
            otherExpenses: 1500,
            adversaryName: 'Omar Al-Shammari',
            indemnityByCourtAmount: 125000,
            date: new Date(now.getTime() - 150 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
        createdAt: new Date(now.getTime() - 200 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 80 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'case-12',
        title: 'Construction Dispute - Case #2025-089',
        client: 'Saudi Binladin Group',
        status: 'open',
        stage: 'primary',
        tags: ['construction', 'contract'],
        deadlines: [
          { id: 'dl-15', title: 'Site inspection', date: '2025-01-27' },
          { id: 'dl-16', title: 'Technical report submission', date: '2025-02-12' },
        ],
        tasks: [
          { id: 'task-18', title: 'Review construction contracts', done: true },
          { id: 'task-19', title: 'Schedule site visit', done: false },
          { id: 'task-20', title: 'Consult engineering experts', done: false },
        ],
        developments: [
          {
            id: 'dev-19',
            date: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(),
            note: 'Case filed regarding construction defects',
          },
        ],
        rulings: [],
        createdAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'case-13',
        title: 'Family Inheritance Dispute - Case #2024-312',
        client: 'Layla Al-Ghamdi',
        status: 'pending',
        stage: 'appeal',
        tags: ['family', 'inheritance'],
        deadlines: [{ id: 'dl-17', title: 'Appeal hearing', date: '2025-02-03' }],
        tasks: [
          { id: 'task-21', title: 'Review inheritance documents', done: true },
          { id: 'task-22', title: 'Prepare appeal arguments', done: false },
        ],
        developments: [
          {
            id: 'dev-20',
            date: new Date(now.getTime() - 100 * 24 * 60 * 60 * 1000).toISOString(),
            note: 'Primary court ruling received',
          },
          {
            id: 'dev-21',
            date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            note: 'Appeal filed at Appeal Court',
          },
        ],
        rulings: [
          {
            id: 'ruling-6',
            stage: 'primary',
            caseNo: '2024-312',
            caseType: 'Plaintiff',
            courtType: 'Family Court',
            courtLevel: 'Primary',
            courtCity: 'Jeddah',
            caseDetails: 'Inheritance distribution dispute',
            filingDate: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
            filingNo: 'FIL-2024-312',
            stageNo: 1,
            rulingInFavorOf: 'Adversary',
            rulingDate: new Date(now.getTime() - 100 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
            courtFees: 3500,
            legalExpenses: 11000,
            translationCourtFees: 1700,
            courtFeesInCash: 2200,
            expertFees: 6000,
            advocacyFees: 9000,
            otherExpenses: 1800,
            adversaryName: 'Ahmad Al-Ghamdi',
            indemnityByCourtAmount: 0,
            date: new Date(now.getTime() - 100 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
        createdAt: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'case-14',
        title: 'Execution Case - Case #2024-178',
        client: 'Abdulrahman Al-Otaibi',
        status: 'open',
        stage: 'execution',
        tags: ['execution', 'enforcement'],
        deadlines: [
          { id: 'dl-18', title: 'Asset seizure deadline', date: '2025-02-05' },
          { id: 'dl-19', title: 'Payment verification', date: '2025-02-18' },
        ],
        tasks: [
          { id: 'task-23', title: 'Locate debtor assets', done: false },
          { id: 'task-24', title: 'File execution request', done: true },
        ],
        developments: [
          {
            id: 'dev-22',
            date: new Date(now.getTime() - 140 * 24 * 60 * 60 * 1000).toISOString(),
            note: 'Original case filed',
          },
          {
            id: 'dev-23',
            date: new Date(now.getTime() - 80 * 24 * 60 * 60 * 1000).toISOString(),
            note: 'Ruling in favor of company',
          },
          {
            id: 'dev-24',
            date: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            note: 'Moved to Execution Court',
          },
        ],
        rulings: [
          {
            id: 'ruling-7',
            stage: 'primary',
            caseNo: '2024-178',
            caseType: 'Plaintiff',
            courtType: 'Civil Court',
            courtLevel: 'Primary',
            courtCity: 'Dammam',
            caseDetails: 'Contract breach and compensation',
            filingDate: new Date(now.getTime() - 140 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
            filingNo: 'FIL-2024-178',
            stageNo: 1,
            rulingInFavorOf: 'Company',
            rulingDate: new Date(now.getTime() - 80 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
            courtFees: 5500,
            legalExpenses: 16000,
            translationCourtFees: 2200,
            courtFeesInCash: 3200,
            expertFees: 9000,
            advocacyFees: 13000,
            otherExpenses: 2500,
            adversaryName: 'Yusuf Al-Mutairi',
            indemnityByCourtAmount: 95000,
            date: new Date(now.getTime() - 80 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
        createdAt: new Date(now.getTime() - 140 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'case-15',
        title: 'Intellectual Property - Case #2025-103',
        client: 'Tech Solutions Arabia',
        status: 'open',
        stage: 'primary',
        tags: ['IP', 'trademark'],
        deadlines: [
          { id: 'dl-20', title: 'Trademark registration review', date: '2025-02-07' },
          { id: 'dl-21', title: 'Expert opinion submission', date: '2025-02-25' },
        ],
        tasks: [
          { id: 'task-25', title: 'Review trademark documents', done: true },
          { id: 'task-26', title: 'Consult IP specialist', done: false },
        ],
        developments: [
          {
            id: 'dev-25',
            date: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
            note: 'Trademark infringement case filed',
          },
        ],
        rulings: [],
        createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
    this.storage.set(STORAGE_KEY, cases);
  }

  getById(id: string): CaseItem | undefined {
    return this.list().find((c) => c.id === id);
  }

  create(input: { title: string; client: string; tags?: string[] }): CaseItem {
    // Validate input
    if (!input.title || !input.title.trim()) {
      throw new Error('Case title is required');
    }
    if (!input.client || !input.client.trim()) {
      throw new Error('Client name is required');
    }

    const now = new Date().toISOString();
    const item: CaseItem = {
      id: this.generateId(),
      title: input.title.trim(),
      client: input.client.trim(),
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
    // Validate required fields
    if (!input.caseNo || !input.caseNo.trim()) {
      throw new Error('Case number is required');
    }
    if (!input.courtType || !input.courtType.trim()) {
      throw new Error('Court type is required');
    }
    // Check for duplicate case number in the same case
    const caseItem = this.getById(id);
    if (caseItem?.rulings) {
      const duplicate = caseItem.rulings.find(
        (r) => r.caseNo === input.caseNo.trim() && r.stage === input.stage,
      );
      if (duplicate) {
        throw new Error(
          `A ruling with case number "${input.caseNo}" already exists for ${input.stage} stage`,
        );
      }
    }
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
