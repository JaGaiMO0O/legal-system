Here is the complete, unified **Source of Truth** specification file. You can copy this entirely into `legal_system_spec.md`.

```markdown
# Legal System Portal Specification (Angular 18)

## 1. Project Overview
**System:** Optimiza Insurance Management - Legal Module
**Framework:** Angular 18 (Standalone Components, Signals, Typed Forms)
**Goal:** Manage the lifecycle of insurance claims escalating to litigation, tracking court hierarchies, financial rulings, and execution.

---

## 2. Core Domain Entities (TypeScript Interfaces)

### A. Legal Case Structure
The system distinguishes between the root case and its escalated stages using a specific ID suffix logic.

```typescript
export interface LegalCase {
  caseNo: string;           // Root ID (e.g., "2020205")
  currentCaseNo: string;    // Stage ID (e.g., "202020501" for Appeal)
  fileNo: string;           // e.g., "205/2020"
  filingDate: string;       // Date
  
  // Statuses
  legalStatus: LegalStatus;     // e.g., "IN COURT", "RULED", "IN EXECUTION"
  settledStatus: SettledStatus; // e.g., "UNDER SETTLEMENT", "LEGALLY SETTLED"
  
  // Relations
  courtType: CourtType;     [cite_start]// e.g., Criminal, Civil [cite: 23-31]
  courtLevel: CourtLevel;   [cite_start]// 1=Primary, 2=Appeal, 3=Cassation, 4=Execution [cite: 25-28]
  lawyerId: number;         // Linked to Lawyer Definition
  
  // Claim Data Inherited from Motor System
  claimId: string;
  claimantName: string;     //
  damageType: 'Fatal' | 'Disability'; //
  disabilityMetrics?: {
    moralPercent: number;   // % Moral
    physicalPercent: number; // Physical
  };
  claimantDemographics: {
    nationality: string;    //
    sex: string;            //
    maritalStatus: string;  //
    profession: string;     //
    age: number;            //
    dependents: number;     //
  };
}

export enum CourtLevel {
  Primary = 1,
  Appeal = 2,
  Cassation = 3,
  Execution = 4
}

```

### B. Court Ruling Transaction

Every court level requires a financial ruling record before escalation .

```typescript
export interface CourtRuling {
  caseNo: string;
  stageNo: number;          // 1, 2, or 3 matching the court level
  rulingDate: string;       //
  rulingInFavor: 'Company' | 'Adversary'; //
  
  // Financial Breakdown
  fees: {
    courtFees: number;      //
    courtFeesInCash: number;//
    legalExpenses: number;  //
    expertFees: number;     //
    translationFees: number;//
    advocacyFees: number;   //
    otherExpenses: number;  //
  };
  
  indemnityAmount: number;  // Amount to be paid to Adversary
  totalRuledOut: number;    // Auto-calculated sum
}

```

### C. Lawyer Definition

Users must register lawyers before assigning them to cases.

```typescript
export interface Lawyer {
  lawyerNo: number;         // Auto-generated ID
  fullName: string;         //
  contact: {
    tel: string;            //
    fax: string;            //
    mobile: string;         //
    email: string;          //
    address: string;        //
  };
}

```

---

## 3. Workflow Logic & State Transitions

### Phase 1: Initiation (The Trigger)

* **Trigger Point:** User updates a Motor Claim in the external system.
* **Action:** Flag `Legal Case` is changed to `1 - To Legal Department`.
* **Angular Implementation:**
* Create a `LegalIntakeComponent` that lists claims with this specific flag.
* On "Create Case", pre-fill `Claimant`, `Accident Date`, and `Policy Info` from the claim data.



### Phase 2: The Litigation Ladder (Next Court Logic)

The system enforces a strict hierarchy. The "Next Court" button triggers the creation of a child case record .

| Current Level | Action Button | New Level | New ID Logic |
| --- | --- | --- | --- |
| **Primary (1)** | `Next Court` | **Appeal (2)** | Append "01" (e.g., `2020205` -> `202020501`) |
| **Appeal (2)** | `Next Court` | **Cassation (3)** | Append "02" (e.g., `2020205` -> `202020502`) |
| **Cassation (3)** | `Execute Case` | **Execution (4)** | Append "03" (e.g., `2020205` -> `202020503`) |

**Validation Rule:** Users cannot proceed to the "Next Court" until a **Court Ruling** is saved for the current level.

### Phase 3: Execution & Closure

* **Transition:** Clicking "Execute Case" changes `Legal Status` to `3 - IN EXECUTION`.
* **Settlement:** The final step involves clicking "Execute Case" again in the Execution screen.
* Updates `Settled Status` to `2 - LEGALLY SETTLED`.
* Updates `Legal Status` to `4 - SETTLED` .




* **Validation:** `Amount Ruled` must equal `Amount Paid` before closing.

---

## 4. Angular 18 Implementation Strategy

### A. Services (`LegalService`)

Use Signals for reactive state management.

```typescript
// legal.service.ts mock signature
currCase = signal<LegalCase | null>(null);

// Methods
escalateCase(currentId: string): Observable<LegalCase> {
  // Logic: 
  // 1. Detect current level (e.g., Appeal).
  // 2. Generate new ID based on the "Next Court Logic" table above.
  // 3. Post to API to create new record.
}

saveRuling(ruling: CourtRuling): Observable<void> {
  // Logic: Save financial data and update Case Status to "RULED".
}

```

### B. Components

1. **`CaseHierarchyComponent`:** A visual stepper or tree view showing the relationship between Primary -> Appeal -> Cassation records.
2. **`RulingTransactionComponent`:** A Typed Reactive Form (`FormGroup`) for the fees.
* *Feature:* Auto-calculate `Total Ruled Out` whenever a fee input changes.


3. **`HistoryTableComponent`:** Displays the grid found in the "Case Hearings and Case Development" tab.
* *Columns:* Period, Court Type, Court Level, Filled By, Ruling Date.



### C. Routing

* `/legal/dashboard`: List of active cases.
* `/legal/case/:rootId`: The main view. The distinct levels (Appeal, Cassation) should be accessible as tabs or child routes derived from the `rootId`.

---

## 5. Arbitration Module (Alternative Route)

If the case is not in court, it may be in Arbitration.

* **Key Fields:**
* `Arbitration Room`
* `Maximum Period` (e.g., "24 Months")
* `Appealability` (Boolean)
* `Arbitration Fees`


* 
**Parties:** Two distinct lists for `Company Representatives` and `Opposition Representatives` .



---

## 6. Business Settlement

Allow for "out of court" settlements via the `Business Amicable Settlement` screen.

* 
**Comparison UI:** Three columns for suggested amounts from distinct stakeholders :


1. `Department`
2. `Management`
3. `Legal Department`


* **Final Output:** `Amount of Amicable Agreement`.

```

```