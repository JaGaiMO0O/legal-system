import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule],
  template: `
    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="table">
          <thead class="sticky top-0">
            <tr>
              <th class="w-32">ID</th>
              <th class="min-w-48">Reference</th>
              <th class="min-w-64">Title</th>
              <th class="w-40">Status</th>
              <th class="w-48">Next hearing</th>
            </tr>
          </thead>
          <tbody>
            <tr
              *ngFor="let row of rows; trackBy: trackById"
              class="hover:bg-[rgb(var(--surface-muted))]"
            >
              <td class="font-mono text-xs">{{ row.id }}</td>
              <td>{{ row.reference }}</td>
              <td class="truncate">{{ row.title }}</td>
              <td>
                <span
                  class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border"
                  [ngClass]="statusClass(row.status)"
                >
                  {{ row.status }}
                </span>
              </td>
              <td>{{ row.nextHearing || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class CasesTableComponent {
  @Input() rows: CaseRow[] = [];

  trackById = (_: number, r: CaseRow) => r.id;

  statusClass(status: string) {
    switch ((status || '').toLowerCase()) {
      case 'open':
        return 'border-[rgb(var(--border))] text-[rgb(var(--text))] bg-[rgb(var(--surface-muted))]';
      case 'hearing':
        return 'border-transparent text-[rgb(var(--text-inverse))] bg-[rgb(var(--primary))]';
      case 'closed':
        return 'border-transparent text-white bg-emerald-600';
      case 'on hold':
        return 'border-transparent text-white bg-amber-600';
      default:
        return 'border-[rgb(var(--border))] text-[rgb(var(--text))]';
    }
  }
}
