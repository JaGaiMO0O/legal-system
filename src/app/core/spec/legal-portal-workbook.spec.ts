/** Eight logical tracker sheet identifiers used by the portal data model. */
export const LEGAL_PORTAL_WORKBOOK_SHEETS = [
  'الدعاوى المنظورة أمام اللجان ',
  'الدعاوى الصادر بها قرارات من ا ',
  'دعاوى الاقساط التأمينية',
  'الدعاوى المنظورة أمام المحكمة',
  'طلبات التنفيذ',
  'حق الرجوع',
  'الدعاوى المنظورة امام اللجان ال',
  'دعاوى الدفع المزدوج',
] as const;

export type LegalPortalWorkbookSheet = (typeof LEGAL_PORTAL_WORKBOOK_SHEETS)[number];

/**
 * Insurance committee — pending (and similar rows): user no, case no, ID, plaintiff,
 * defendant, claim type, claim value, compensation type, claim status, required action, notes.
 */
export const SHEET_INSURANCE_COMMITTEE_PENDING = LEGAL_PORTAL_WORKBOOK_SHEETS[0];

/** Committee — with decisions: adds decision type column. */
export const SHEET_INSURANCE_COMMITTEE_DECIDED = LEGAL_PORTAL_WORKBOOK_SHEETS[1];

/** Premium installments claims (company as claimant). */
export const SHEET_PREMIUM_INSTALLMENTS = LEGAL_PORTAL_WORKBOOK_SHEETS[2];

/** Court matters: subject, claim value, court, city, date, time, action, notes. */
export const SHEET_COURT_PENDING = LEGAL_PORTAL_WORKBOOK_SHEETS[3];

/** Execution requests — maps to ExecutionCase + extended portal fields. */
export const SHEET_EXECUTION_REQUESTS = LEGAL_PORTAL_WORKBOOK_SHEETS[4];

/** Subrogation / recourse: filing date, expected end, same party/claim columns. */
export const SHEET_SUBROGATION = LEGAL_PORTAL_WORKBOOK_SHEETS[5];

/** Tax committee: next hearing date/time, subject. */
export const SHEET_TAX_COMMITTEE = LEGAL_PORTAL_WORKBOOK_SHEETS[6];

/** Double payment (general courts): claim amount, next hearing, action, notes. */
export const SHEET_DOUBLE_PAYMENT = LEGAL_PORTAL_WORKBOOK_SHEETS[7];
