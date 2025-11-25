import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'cases', pathMatch: 'full' },
  {
    path: 'cases',
    loadComponent: () =>
      import('./features/cases/cases-list.component').then((m) => m.CasesListComponent),
  },
  {
    path: 'claims',
    loadComponent: () =>
      import('./features/claims/claims-list.component').then((m) => m.ClaimsListComponent),
  },
  {
    path: 'cases/:id',
    loadComponent: () =>
      import('./features/cases/case-detail.component').then((m) => m.CaseDetailComponent),
  },
  {
    path: 'documents',
    loadComponent: () =>
      import('./features/documents/documents-page.component').then((m) => m.DocumentsPageComponent),
  },
  {
    path: 'documents/:id',
    loadComponent: () =>
      import('./features/documents/document-detail.component').then(
        (m) => m.DocumentDetailComponent,
      ),
  },
  {
    path: 'search',
    loadComponent: () =>
      import('./features/search/search-page.component').then((m) => m.SearchPageComponent),
  },
  {
    path: 'activity',
    loadComponent: () =>
      import('./features/activity/activity-page.component').then((m) => m.ActivityPageComponent),
  },
  {
    path: 'lawyers',
    loadComponent: () =>
      import('./features/lawyers/lawyers-list.component').then((m) => m.LawyersListComponent),
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
    path: 'settings',
    loadComponent: () =>
      import('./features/settings/settings.component').then((m) => m.SettingsComponent),
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
  { path: '**', redirectTo: 'cases' },
];
