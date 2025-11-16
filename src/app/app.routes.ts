import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'cases', pathMatch: 'full' },
  {
    path: 'cases',
    loadComponent: () =>
      import('./features/cases/cases-list.component').then((m) => m.CasesListComponent),
  },
  {
    path: 'cases/:id',
    loadComponent: () =>
      import('./features/cases/case-detail.component').then((m) => m.CaseDetailComponent),
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
    path: 'settings',
    loadComponent: () =>
      import('./features/settings/settings.component').then((m) => m.SettingsComponent),
  },
  { path: '**', redirectTo: 'cases' },
];
