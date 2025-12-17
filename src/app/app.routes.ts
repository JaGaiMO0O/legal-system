import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'legal/dashboard', pathMatch: 'full' },
  {
    path: 'legal/dashboard',
    loadComponent: () =>
      import('./features/cases/cases-list.component').then((m) => m.CasesListComponent),
  },
  {
    path: 'legal/case/new',
    loadComponent: () =>
      import('./features/cases/case-detail.component').then((m) => m.CaseDetailComponent),
  },
  {
    path: 'legal/case/:id',
    loadComponent: () =>
      import('./features/cases/case-detail.component').then((m) => m.CaseDetailComponent),
  },
  // Legacy routes for backward compatibility
  { path: 'cases', redirectTo: 'legal/dashboard', pathMatch: 'full' },
  { path: 'cases/new', redirectTo: 'legal/case/new', pathMatch: 'full' },
  { path: 'cases/:id', redirectTo: 'legal/case/:id', pathMatch: 'prefix' },
  {
    path: 'claims',
    loadComponent: () =>
      import('./features/claims/claims-list.component').then((m) => m.ClaimsListComponent),
  },
  {
    path: 'claims/:id',
    loadComponent: () =>
      import('./features/claims/claim-detail.component').then((m) => m.ClaimDetailComponent),
  },
  {
    path: 'arbitrations',
    loadComponent: () =>
      import('./features/arbitrations/arbitrations-list.component').then(
        (m) => m.ArbitrationsListComponent,
      ),
  },
  {
    path: 'arbitrations/:id',
    loadComponent: () =>
      import('./features/arbitrations/arbitration-detail.component').then(
        (m) => m.ArbitrationDetailComponent,
      ),
  },
  {
    path: 'arbitrations/new',
    loadComponent: () =>
      import('./features/arbitrations/arbitration-detail.component').then(
        (m) => m.ArbitrationDetailComponent,
      ),
  },
  {
    path: 'execution',
    loadComponent: () =>
      import('./features/execution/execution-cases-list.component').then(
        (m) => m.ExecutionCasesListComponent,
      ),
  },
  {
    path: 'execution/:id',
    loadComponent: () =>
      import('./features/execution/execution-case-detail.component').then(
        (m) => m.ExecutionCaseDetailComponent,
      ),
  },
  {
    path: 'execution/new',
    loadComponent: () =>
      import('./features/execution/execution-case-detail.component').then(
        (m) => m.ExecutionCaseDetailComponent,
      ),
  },
  {
    path: 'courts',
    loadComponent: () =>
      import('./features/courts/courts-list.component').then((m) => m.CourtsListComponent),
  },
  {
    path: 'courts/new',
    loadComponent: () =>
      import('./features/courts/court-detail.component').then((m) => m.CourtDetailComponent),
  },
  {
    path: 'courts/:id',
    loadComponent: () =>
      import('./features/courts/court-detail.component').then((m) => m.CourtDetailComponent),
  },
  {
    path: 'lawyers',
    loadComponent: () =>
      import('./features/lawyers/lawyers-list.component').then((m) => m.LawyersListComponent),
  },
  {
    path: 'lawyers/new',
    loadComponent: () =>
      import('./features/lawyers/lawyer-detail.component').then((m) => m.LawyerDetailComponent),
  },
  {
    path: 'lawyers/:id',
    loadComponent: () =>
      import('./features/lawyers/lawyer-detail.component').then((m) => m.LawyerDetailComponent),
  },
  {
    path: 'settlements',
    loadComponent: () =>
      import('./features/settlements/business-settlements-list.component').then(
        (m) => m.BusinessSettlementsListComponent,
      ),
  },
  {
    path: 'settlements/:id',
    loadComponent: () =>
      import('./features/settlements/business-settlement-detail.component').then(
        (m) => m.BusinessSettlementDetailComponent,
      ),
  },
  {
    path: 'settlements/new',
    loadComponent: () =>
      import('./features/settlements/business-settlement-detail.component').then(
        (m) => m.BusinessSettlementDetailComponent,
      ),
  },
  {
    path: 'motor-liability/:id',
    loadComponent: () =>
      import('./features/cases/motor-liability-case-detail.component').then(
        (m) => m.MotorLiabilityCaseDetailComponent,
      ),
  },
  { path: '**', redirectTo: 'legal/dashboard' },
];
