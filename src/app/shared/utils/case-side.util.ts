import { CaseItem, CaseRuling, CaseStage, CaseType } from '../services/cases.service';

const STAGE_ORDER: Record<CaseStage, number> = {
  primary: 1,
  appeal: 2,
  cassation: 3,
  execution: 4,
  settled: 5,
};

export type CompanySideBucket = CaseType | 'unknown';

export function resolveCompanySideFromRulings(rulings: CaseRuling[]): CaseType | undefined {
  if (!rulings?.length) return undefined;
  const sorted = [...rulings].sort((a, b) => {
    const dateA = new Date(a.rulingDate || a.date).getTime();
    const dateB = new Date(b.rulingDate || b.date).getTime();
    if (dateB !== dateA) return dateB - dateA;
    return (STAGE_ORDER[b.stage] ?? 0) - (STAGE_ORDER[a.stage] ?? 0);
  });
  return sorted[0]?.caseType;
}

export function effectiveCompanySide(caseItem: CaseItem): CompanySideBucket {
  if (caseItem.companySide) return caseItem.companySide;
  return resolveCompanySideFromRulings(caseItem.rulings) ?? 'unknown';
}
