import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { CasesService, CaseItem } from '../../shared/services/cases.service';
import { UIButtonComponent } from '../../shared/components/ui/button.component';

@Component({
  standalone: true,
  selector: 'app-cases-list',
  imports: [RouterModule, CommonModule, TranslateModule, UIButtonComponent],
  template: `
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-[rgb(var(--text))]">Cases</h2>
        <p class="text-sm text-[rgb(var(--text-muted))] mt-1">
          {{ cases.length }} {{ cases.length === 1 ? 'case' : 'cases' }} total
        </p>
      </div>
      <ui-button variant="primary" routerLink="/cases/new">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        New Case
      </ui-button>
    </div>

    <div *ngIf="cases.length === 0" class="card p-12 text-center">
      <p class="text-[rgb(var(--text-muted))]">No cases yet</p>
    </div>

    <div class="grid grid-cols-1 gap-4" *ngIf="cases.length > 0">
      <a
        *ngFor="let case of cases"
        [routerLink]="['/cases', case.id]"
        class="card p-6 hover:shadow-lg transition-shadow cursor-pointer"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <h3 class="text-lg font-semibold text-[rgb(var(--text))]">{{ case.title }}</h3>
              <span
                class="px-2 py-1 rounded-full text-xs font-medium"
                [class.bg-green-100]="case.status === 'open'"
                [class.text-green-800]="case.status === 'open'"
                [class.bg-yellow-100]="case.status === 'pending'"
                [class.text-yellow-800]="case.status === 'pending'"
                [class.bg-gray-100]="case.status === 'closed'"
                [class.text-gray-800]="case.status === 'closed'"
              >
                {{ case.status | titlecase }}
              </span>
              <span
                class="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                *ngIf="case.stage"
              >
                {{ case.stage | titlecase }}
              </span>
            </div>
            <p class="text-sm text-[rgb(var(--text-muted))] mb-3">Client: {{ case.client }}</p>
            <div class="flex items-center gap-4 text-sm text-[rgb(var(--text-muted))]">
              <span *ngIf="case.tasks.length > 0">
                <svg
                  class="w-4 h-4 inline mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                {{ case.tasks.length }} tasks
              </span>
              <span *ngIf="case.deadlines.length > 0">
                <svg
                  class="w-4 h-4 inline mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {{ case.deadlines.length }} deadlines
              </span>
              <span *ngIf="case.rulings && case.rulings.length > 0">
                <svg
                  class="w-4 h-4 inline mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                {{ case.rulings.length }} rulings
              </span>
            </div>
          </div>
          <div class="text-right">
            <p class="text-xs text-[rgb(var(--text-muted))]">
              Updated {{ case.updatedAt | date: 'short' }}
            </p>
          </div>
        </div>
      </a>
    </div>
  `,
})
export class CasesListComponent {
  private readonly casesService = inject(CasesService);
  protected cases: CaseItem[] = this.casesService.list();
}
