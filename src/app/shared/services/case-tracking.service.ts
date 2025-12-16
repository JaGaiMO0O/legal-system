import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MockStorageService } from './mock-storage.service';

/**
 * Unified case identifier that tracks a case across different entities
 * (claims, cases, motor liability cases, arbitrations, etc.)
 */
export interface UnifiedCase {
  unifiedCaseId: string;
  // References to related entities
  claimId?: string;
  caseId?: string;
  motorLiabilityCaseId?: string;
  arbitrationId?: string;
  executionCaseId?: string;
  // Display information
  title?: string;
  client?: string;
  reference?: string;
  // Last updated timestamp
  lastViewedAt?: string;
}

const CURRENT_CASE_KEY = 'currentCaseId';
const UNIFIED_CASES_KEY = 'unifiedCases';

@Injectable({ providedIn: 'root' })
export class CaseTrackingService {
  private readonly storage = inject(MockStorageService);
  private currentCaseId$ = new BehaviorSubject<string | null>(
    this.storage.get<string | null>(CURRENT_CASE_KEY, null),
  );

  /**
   * Get the currently active unified case ID
   */
  getCurrentCaseId(): string | null {
    return this.currentCaseId$.value;
  }

  /**
   * Watch for changes to the current case ID
   */
  watchCurrentCaseId(): Observable<string | null> {
    return this.currentCaseId$.asObservable();
  }

  /**
   * Set the currently active case
   */
  setCurrentCase(unifiedCaseId: string | null): void {
    this.storage.set(CURRENT_CASE_KEY, unifiedCaseId);
    this.currentCaseId$.next(unifiedCaseId);
  }

  /**
   * Get all unified cases
   */
  getAllUnifiedCases(): UnifiedCase[] {
    return this.storage.get<UnifiedCase[]>(UNIFIED_CASES_KEY, []);
  }

  /**
   * Get a unified case by ID
   */
  getUnifiedCase(unifiedCaseId: string): UnifiedCase | undefined {
    const cases = this.getAllUnifiedCases();
    return cases.find((c) => c.unifiedCaseId === unifiedCaseId);
  }

  /**
   * Create or update a unified case
   */
  upsertUnifiedCase(caseData: UnifiedCase): void {
    const cases = this.getAllUnifiedCases();
    const existingIndex = cases.findIndex((c) => c.unifiedCaseId === caseData.unifiedCaseId);

    const updatedCase: UnifiedCase = {
      ...caseData,
      lastViewedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      cases[existingIndex] = { ...cases[existingIndex], ...updatedCase };
    } else {
      cases.push(updatedCase);
    }

    this.storage.set(UNIFIED_CASES_KEY, cases);
  }

  /**
   * Link an entity to a unified case
   */
  linkEntityToCase(
    unifiedCaseId: string,
    entityType: 'claim' | 'case' | 'motorLiability' | 'arbitration' | 'execution',
    entityId: string,
  ): void {
    const unifiedCase = this.getUnifiedCase(unifiedCaseId) || {
      unifiedCaseId,
      lastViewedAt: new Date().toISOString(),
    };

    switch (entityType) {
      case 'claim':
        unifiedCase.claimId = entityId;
        break;
      case 'case':
        unifiedCase.caseId = entityId;
        break;
      case 'motorLiability':
        unifiedCase.motorLiabilityCaseId = entityId;
        break;
      case 'arbitration':
        unifiedCase.arbitrationId = entityId;
        break;
      case 'execution':
        unifiedCase.executionCaseId = entityId;
        break;
    }

    this.upsertUnifiedCase(unifiedCase);
  }

  /**
   * Find unified case ID by entity ID
   */
  findUnifiedCaseIdByEntity(
    entityType: 'claim' | 'case' | 'motorLiability' | 'arbitration' | 'execution',
    entityId: string,
  ): string | undefined {
    const cases = this.getAllUnifiedCases();
    const found = cases.find((c) => {
      switch (entityType) {
        case 'claim':
          return c.claimId === entityId;
        case 'case':
          return c.caseId === entityId;
        case 'motorLiability':
          return c.motorLiabilityCaseId === entityId;
        case 'arbitration':
          return c.arbitrationId === entityId;
        case 'execution':
          return c.executionCaseId === entityId;
        default:
          return false;
      }
    });
    return found?.unifiedCaseId;
  }

  /**
   * Generate a new unified case ID
   */
  generateUnifiedCaseId(): string {
    return `uc-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}
