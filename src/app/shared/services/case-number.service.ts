import { Injectable } from '@angular/core';
import type { Arbitration } from './arbitrations.service';
import type { CaseItem } from './cases.service';
import type { ExecutionCase } from './execution-cases.service';

export interface CaseNumberResult {
  type: 'arbitration' | 'case' | 'execution';
  id: string;
  entity: any;
}

export interface CaseNumberEntities {
  case?: CaseItem;
  arbitration?: any;
  execution?: ExecutionCase;
}

@Injectable({ providedIn: 'root' })
export class CaseNumberService {
  /**
   * Generate a new case number in format YYYYNNN (e.g., 2025001)
   * Accepts existing case numbers from all entities to avoid circular dependency
   */
  generateCaseNumber(
    existingCaseNumbers: string[] = [],
    existingArbitrationNumbers: string[] = [],
    existingExecutionNumbers: string[] = [],
  ): string {
    const year = new Date().getFullYear();
    const allCaseNumbers: string[] = [
      ...existingCaseNumbers,
      ...existingArbitrationNumbers,
      ...existingExecutionNumbers,
    ];

    // Filter to current year and extract sequence numbers
    let maxSeq = 0;
    allCaseNumbers.forEach((num) => {
      // Handle format YYYYNNN (7 digits)
      if (num.length >= 7) {
        const numYear = parseInt(num.substring(0, 4), 10);
        if (numYear === year) {
          const seq = parseInt(num.substring(4), 10);
          if (!isNaN(seq) && seq > maxSeq) {
            maxSeq = seq;
          }
        }
      }
    });

    const nextSeq = maxSeq + 1;
    return `${year}${String(nextSeq).padStart(3, '0')}`;
  }

  /**
   * Find an entity by case number
   * Searches in order: Cases → Arbitrations → Execution
   * Returns the first match found
   * Accepts all entity arrays as parameters to avoid circular dependency
   */
  findByCaseNumber(
    caseNumber: string,
    cases: CaseItem[] = [],
    arbitrations: Arbitration[] = [],
    executionCases: ExecutionCase[] = [],
  ): CaseNumberResult | null {
    // Search in Cases first
    const foundCase = cases.find(
      (c) => c.caseNumber === caseNumber || c.baseCaseNumber === caseNumber,
    );
    if (foundCase) {
      return {
        type: 'case',
        id: foundCase.id,
        entity: foundCase,
      };
    }

    // Search in Arbitrations
    const foundArbitration = arbitrations.find((a) => a.caseNumber === caseNumber);
    if (foundArbitration) {
      return {
        type: 'arbitration',
        id: foundArbitration.id,
        entity: foundArbitration,
      };
    }

    // Search in Execution Cases
    const foundExecution = executionCases.find((e) => e.caseNumber === caseNumber);
    if (foundExecution) {
      return {
        type: 'execution',
        id: foundExecution.id,
        entity: foundExecution,
      };
    }

    return null;
  }

  /**
   * Get all entities associated with a case number
   * Returns all matches across all entity types
   * Accepts all entity arrays as parameters to avoid circular dependency
   */
  getAllEntitiesByCaseNumber(
    caseNumber: string,
    cases: CaseItem[] = [],
    arbitrations: Arbitration[] = [],
    executionCases: ExecutionCase[] = [],
  ): CaseNumberEntities {
    const result: CaseNumberEntities = {};

    // Search in Cases
    const foundCase = cases.find(
      (c) => c.caseNumber === caseNumber || c.baseCaseNumber === caseNumber,
    );
    if (foundCase) {
      result.case = foundCase;
    }

    // Search in Arbitrations
    const foundArbitration = arbitrations.find((a) => a.caseNumber === caseNumber);
    if (foundArbitration) {
      result.arbitration = foundArbitration;
    }

    // Search in Execution Cases
    const foundExecution = executionCases.find((e) => e.caseNumber === caseNumber);
    if (foundExecution) {
      result.execution = foundExecution;
    }

    return result;
  }

  /**
   * Validate case number format (YYYYNNN)
   */
  isValidFormat(caseNumber: string): boolean {
    if (!caseNumber || caseNumber.length !== 7) return false;
    const year = parseInt(caseNumber.substring(0, 4), 10);
    const seq = parseInt(caseNumber.substring(4), 10);
    const currentYear = new Date().getFullYear();
    return !isNaN(year) && !isNaN(seq) && year >= 2020 && year <= currentYear + 1 && seq > 0;
  }
}
