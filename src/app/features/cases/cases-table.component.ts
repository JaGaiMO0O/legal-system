import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@ngx-translate/core';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

export interface CaseRow {
  id: string;
  reference: string;
  title: string;
  status: string;
  nextHearing?: string;
}

@Component({
  standalone: true,
  selector: 'app-cases-table',
  imports: [CommonModule, TableModule, TagModule, TranslateModule],
  template: `
    <p-table
      [value]="rows"
      [stripedRows]="true"
      [size]="'small'"
      styleClass="p-datatable-striped p-datatable-sm"
      [trackBy]="trackById"
    >
      <ng-template pTemplate="header">
        <tr>
          <th style="width: 8rem">{{ 'casesTable.id' | translate }}</th>
          <th style="min-width: 12rem">{{ 'casesTable.reference' | translate }}</th>
          <th style="min-width: 16rem">{{ 'casesTable.title' | translate }}</th>
          <th style="width: 10rem">{{ 'casesTable.status' | translate }}</th>
          <th style="width: 12rem">{{ 'casesTable.nextHearing' | translate }}</th>
        </tr>
      </ng-template>
      <ng-template pTemplate="body" let-row>
        <tr>
          <td class="font-mono text-xs">{{ row.id }}</td>
          <td>{{ row.reference }}</td>
          <td class="truncate">{{ row.title }}</td>
          <td>
            <p-tag
              [value]="statusLabel(row.status)"
              [severity]="getStatusSeverity(row.status)"
            ></p-tag>
          </td>
          <td>{{ row.nextHearing || ('common.notSet' | translate) }}</td>
        </tr>
      </ng-template>
    </p-table>
  `,
})
export class CasesTableComponent {
  private readonly translate = inject(TranslateService);

  @Input() rows: CaseRow[] = [];

  trackById = (_: number, r: CaseRow) => r.id;

  statusLabel(status: string): string {
    const s = (status || '').toLowerCase().replace(/\s+/g, '');
    const map: Record<string, string> = {
      open: 'cases.caseStatus.open',
      pending: 'cases.caseStatus.pending',
      closed: 'cases.caseStatus.closed',
      hearing: 'cases.caseStatus.open',
      onhold: 'cases.caseStatus.onHold',
    };
    const key = map[s];
    return key ? this.translate.instant(key) : status;
  }

  getStatusSeverity(status: string): string {
    switch ((status || '').toLowerCase()) {
      case 'open':
        return 'info';
      case 'hearing':
        return 'primary';
      case 'closed':
        return 'success';
      case 'on hold':
      case 'onhold':
        return 'warning';
      default:
        return '';
    }
  }
}
