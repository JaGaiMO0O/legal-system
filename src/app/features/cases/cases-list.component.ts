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
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-3xl font-bold text-[rgb(var(--text))] mb-2">Cases</h2>
        <p class="text-sm text-[rgb(var(--text-muted))]">
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

    <div *ngIf="cases.length === 0" class="card p-16 text-center">
      <div class="max-w-md mx-auto">
        <div
          class="w-20 h-20 mx-auto mb-6 bg-[rgb(var(--surface-muted))] rounded-full flex items-center justify-center"
        >
          <svg
            class="w-10 h-10 text-[rgb(var(--text-muted))]"
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
        </div>
        <h3 class="text-lg font-semibold text-[rgb(var(--text))] mb-2">No cases yet</h3>
        <p class="text-sm text-[rgb(var(--text-muted))] mb-6">
          Get started by creating your first case
        </p>
        <ui-button variant="primary" routerLink="/cases/new">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create First Case
        </ui-button>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-6" *ngIf="cases.length > 0">
      <a
        *ngFor="let case of cases"
        [routerLink]="['/cases', case.id]"
        class="card p-6 cursor-pointer group relative overflow-hidden"
      >
        <div
          class="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[rgb(var(--primary))] to-[rgb(var(--primary-dark))] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        ></div>
        <div class="flex items-start justify-between relative z-10">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-3">
              <h3
                class="text-xl font-bold text-[rgb(var(--text))] group-hover:text-[rgb(var(--primary))] transition-colors"
              >
                {{ case.title }}
              </h3>
              <span
                class="px-3 py-1 rounded-full text-xs font-semibold shadow-sm"
                [class.bg-emerald-50]="case.status === 'open'"
                [class.text-emerald-700]="case.status === 'open'"
                [class.border]="case.status === 'open'"
                [class.border-emerald-200]="case.status === 'open'"
                [class.bg-amber-50]="case.status === 'pending'"
                [class.text-amber-700]="case.status === 'pending'"
                [class.border]="case.status === 'pending'"
                [class.border-amber-200]="case.status === 'pending'"
                [class.bg-slate-50]="case.status === 'closed'"
                [class.text-slate-700]="case.status === 'closed'"
                [class.border]="case.status === 'closed'"
                [class.border-slate-200]="case.status === 'closed'"
              >
                {{ case.status | titlecase }}
              </span>
              <span
                class="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                *ngIf="case.stage"
              >
                {{ case.stage | titlecase }}
              </span>
            </div>
            <p class="text-sm text-[rgb(var(--text-muted))] mb-4 font-medium">
              Client: <span class="text-[rgb(var(--text))]">{{ case.client }}</span>
            </p>
            <div class="flex items-center gap-6 text-sm text-[rgb(var(--text-muted))]">
              <span *ngIf="case.tasks.length > 0" class="flex items-center gap-1.5">
                <svg
                  class="w-4 h-4 text-[rgb(var(--primary))]"
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
                <span class="font-medium">{{ case.tasks.length }} tasks</span>
              </span>
              <span *ngIf="case.deadlines.length > 0" class="flex items-center gap-1.5">
                <svg
                  class="w-4 h-4 text-[rgb(var(--primary))]"
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
                <span class="font-medium">{{ case.deadlines.length }} deadlines</span>
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
