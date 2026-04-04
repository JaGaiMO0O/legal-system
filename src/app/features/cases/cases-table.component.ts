import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
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
  imports: [CommonModule, TableModule, TagModule],
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
          <th style="width: 8rem">ID</th>
          <th style="min-width: 12rem">Reference</th>
          <th style="min-width: 16rem">Title</th>
          <th style="width: 10rem">Status</th>
          <th style="width: 12rem">Next hearing</th>
        </tr>
      </ng-template>
      <ng-template pTemplate="body" let-row>
        <tr>
          <td class="font-mono text-xs">{{ row.id }}</td>
          <td>{{ row.reference }}</td>
          <td class="truncate">{{ row.title }}</td>
          <td>
            <p-tag [value]="row.status" [severity]="getStatusSeverity(row.status)"></p-tag>
          </td>
          <td>{{ row.nextHearing || '—' }}</td>
        </tr>
      </ng-template>
    </p-table>
  `,
})
export class CasesTableComponent {
  @Input() rows: CaseRow[] = [];

  trackById = (_: number, r: CaseRow) => r.id;

  getStatusSeverity(status: string): string {
    switch ((status || '').toLowerCase()) {
      case 'open':
        return 'info';
      case 'hearing':
        return 'primary';
      case 'closed':
        return 'success';
      case 'on hold':
        return 'warning';
      default:
        return '';
    }
  }
}
