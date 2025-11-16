import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CasesTableComponent, CaseRow } from './cases-table.component';

@Component({
  standalone: true,
  selector: 'app-cases-list',
  imports: [RouterLink, TranslateModule, CasesTableComponent],
  template: `
    <h2 class="text-lg font-semibold mb-4">{{ 'nav.cases' | translate }}</h2>
    <app-cases-table [rows]="rows"></app-cases-table>
  `,
})
export class CasesListComponent {
  rows: CaseRow[] = [
    {
      id: '1',
      reference: 'PR-2025-001',
      title: 'Traffic accident claim',
      status: 'Open',
      nextHearing: '2025-12-05',
    },
    {
      id: '2',
      reference: 'AP-2025-014',
      title: 'Appeal of ruling 1234',
      status: 'Hearing',
      nextHearing: '2026-01-12',
    },
    {
      id: '3',
      reference: 'EX-2025-021',
      title: 'Execution order issuance',
      status: 'On Hold',
      nextHearing: undefined,
    },
    {
      id: '4',
      reference: 'CS-2024-877',
      title: 'Cassation review',
      status: 'Closed',
      nextHearing: undefined,
    },
  ];
}
