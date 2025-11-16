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
    path: 'settings',
    loadComponent: () =>
      import('./features/settings/settings.component').then((m) => m.SettingsComponent),
  },
  { path: '**', redirectTo: 'cases' },
];
