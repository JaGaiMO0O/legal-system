import { Routes } from '@angular/router';
import { adminGuard } from './core/auth/admin.guard';
import { authGuard } from './core/auth/auth.guard';

const protectedChildRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'legal/dashboard' },
  {
    path: 'legal/dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'legal/analytics',
    loadComponent: () =>
      import('./features/analytics/analytics.component').then((m) => m.AnalyticsComponent),
  },
  {
    path: 'legal/documents',
    loadComponent: () =>
      import('./features/documents/documents-list.component').then((m) => m.DocumentsListComponent),
  },
  {
    path: 'legal/cases',
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
  { path: 'cases', redirectTo: 'legal/dashboard', pathMatch: 'full' },
  { path: 'cases/new', redirectTo: 'legal/case/new', pathMatch: 'full' },
  { path: 'cases/:id', redirectTo: 'legal/case/:id', pathMatch: 'prefix' },
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
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./features/courts/courts-list.component').then((m) => m.CourtsListComponent),
  },
  {
    path: 'courts/new',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./features/courts/court-detail.component').then((m) => m.CourtDetailComponent),
  },
  {
    path: 'courts/:id',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./features/courts/court-detail.component').then((m) => m.CourtDetailComponent),
  },
  {
    path: 'lawyers',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./features/lawyers/lawyers-list.component').then((m) => m.LawyersListComponent),
  },
  {
    path: 'lawyers/new',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./features/lawyers/lawyer-detail.component').then((m) => m.LawyerDetailComponent),
  },
  {
    path: 'lawyers/:id',
    canActivate: [adminGuard],
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

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/main-layout.component').then((m) => m.MainLayoutComponent),
    children: protectedChildRoutes,
  },
];
