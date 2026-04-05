import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ExecutionCasesService } from '../../shared/services/execution-cases.service';

@Component({
  standalone: true,
  selector: 'app-execution-cases-list',
  imports: [CommonModule, RouterModule, TranslateModule, ButtonModule, CardModule],
  template: `
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-[rgb(var(--text))]">Execution Cases</h2>
        <p class="text-sm text-[rgb(var(--text-muted))] mt-1">
          {{ executionCases.length }} {{ executionCases.length === 1 ? 'case' : 'cases' }} total
        </p>
      </div>
      <p-button severity="primary" routerLink="/execution/new">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        Add Execution Case
      </p-button>
    </div>

    <div *ngIf="executionCases.length === 0" class="card p-12 text-center">
      <p class="text-[rgb(var(--text-muted))]">{{ 'execution.empty' | translate }}</p>
    </div>

    <div
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      *ngIf="executionCases.length > 0"
    >
      <p-card
        *ngFor="let executionCase of executionCases"
        class="cursor-pointer hover:shadow-lg transition-shadow"
        [routerLink]="['/execution', executionCase.id]"
      >
        <div class="mb-3">
          <h3 class="font-semibold text-lg mb-2">
            {{ executionCase.executionCaseNo || 'No case number' }}
          </h3>
          <div class="flex items-center gap-2 mb-2">
            <span
              *ngIf="executionCase.unifiedCaseId"
              class="px-2 py-1 bg-[rgb(var(--surface-muted))] text-[rgb(var(--text))] border border-[rgb(var(--border-light))] rounded text-xs font-mono"
              title="Unified Case ID"
            >
              UC: {{ executionCase.unifiedCaseId }}
            </span>
            <span
              class="px-2 py-1 bg-info-muted text-info-fg border border-info rounded text-xs font-medium"
            >
              {{ executionCase.courtRoom }}
            </span>
            <span
              class="px-2 py-1 bg-[rgb(var(--surface-muted))] text-[rgb(var(--text))] border border-[rgb(var(--border-light))] rounded text-xs"
            >
              {{ executionCase.lastCourtType }}
            </span>
          </div>
        </div>
        <div class="text-sm text-[rgb(var(--text-muted))] space-y-2">
          <div class="flex items-center justify-between">
            <span>File No:</span>
            <span class="font-mono text-xs">{{ executionCase.fileNo || '-' }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span>Linked Case:</span>
            <span class="font-mono text-xs">{{ executionCase.linkedCaseId || '-' }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span>File Date:</span>
            <span>{{ executionCase.fileDate | date: 'mediumDate' }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span>Company Lawyer:</span>
            <span class="text-xs">{{ executionCase.companyLawyer || '-' }}</span>
          </div>
          <div class="border-t border-[rgb(var(--border))] pt-2 mt-2">
            <div class="flex items-center justify-between font-semibold">
              <span>Amount Ruled:</span>
              <span class="text-[rgb(var(--primary))]"
                >{{ executionCase.amountRuled | number }} SAR</span
              >
            </div>
            <div class="flex items-center justify-between text-sm">
              <span>Amount Paid:</span>
              <span>{{ executionCase.amountPaid | number }} SAR</span>
            </div>
          </div>
        </div>
      </p-card>
    </div>
  `,
})
export class ExecutionCasesListComponent {
  private readonly executionCasesService = inject(ExecutionCasesService);
  protected executionCases = this.executionCasesService.list();
}
