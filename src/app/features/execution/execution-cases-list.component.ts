import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { LanguageService } from '../../core/i18n/language.service';
import {
  ExecutionCase,
  ExecutionCasesService,
} from '../../shared/services/execution-cases.service';

@Component({
  standalone: true,
  selector: 'app-execution-cases-list',
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule, ButtonModule, CardModule],
  template: `
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-[rgb(var(--text))]">
          {{ 'nav.execution' | translate }}
        </h2>
        <p class="text-sm text-[rgb(var(--text-muted))] mt-1">
          {{
            'execution.list.countOf'
              | translate: { filtered: filteredCases().length, total: executionCases.length }
          }}
          {{
            executionCases.length === 1
              ? ('execution.list.caseOne' | translate)
              : ('execution.list.casesMany' | translate)
          }}
          <span *ngIf="searchQuery.trim()">{{ 'execution.list.filtered' | translate }}</span>
        </p>
      </div>
      <div class="flex flex-col sm:flex-row gap-3 w-full md:flex-1 md:min-w-0 lg:max-w-4xl">
        <div class="relative w-full flex-1 min-w-0 min-h-[2.5rem]">
          <input
            type="text"
            inputmode="search"
            autocomplete="off"
            class="w-full min-w-0 rounded-input border border-[rgb(var(--border))] py-2 pe-3 text-sm bg-[rgb(var(--surface))] text-[rgb(var(--text))] search-input-with-icon--compact"
            [(ngModel)]="searchQuery"
            [placeholder]="'lists.searchExecutionPlaceholder' | translate"
          />
          <span class="search-input-icon search-input-icon--tight" aria-hidden="true">
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
        </div>
        <p-button severity="primary" routerLink="/execution/new" styleClass="shrink-0">
          <svg class="w-4 h-4 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          {{ 'actions.add' | translate }}
        </p-button>
      </div>
    </div>

    <div *ngIf="executionCases.length === 0" class="card p-12 text-center">
      <p class="text-[rgb(var(--text-muted))]">{{ 'execution.empty' | translate }}</p>
    </div>

    <div
      *ngIf="executionCases.length > 0 && filteredCases().length === 0"
      class="card p-12 text-center"
    >
      <p class="text-[rgb(var(--text-muted))]">{{ 'lists.noExecutionMatch' | translate }}</p>
    </div>

    <div
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      *ngIf="filteredCases().length > 0"
    >
      <p-card
        *ngFor="let executionCase of filteredCases()"
        class="cursor-pointer hover:shadow-lg transition-shadow"
        [routerLink]="['/execution', executionCase.id]"
      >
        <div class="mb-3">
          <h3 class="font-semibold text-lg mb-2 line-clamp-2">
            {{ executionCase.executionCaseNo || ('execution.noCaseNo' | translate) }}
          </h3>
          <div class="flex flex-wrap items-center gap-2 mb-2">
            <span
              *ngIf="executionCase.unifiedCaseId"
              class="px-2 py-1 bg-[rgb(var(--surface-muted))] text-[rgb(var(--text))] border border-[rgb(var(--border-light))] rounded text-xs font-mono max-w-full truncate"
              [attr.title]="'execution.fields.unifiedCaseId' | translate"
            >
              {{ 'execution.list.unifiedBadge' | translate: { id: executionCase.unifiedCaseId } }}
            </span>
            <span
              class="px-2 py-1 bg-info-muted text-info-fg border border-info rounded text-xs font-medium max-w-full truncate"
            >
              {{ executionCase.courtRoom }}
            </span>
            <span
              class="px-2 py-1 bg-[rgb(var(--surface-muted))] text-[rgb(var(--text))] border border-[rgb(var(--border-light))] rounded text-xs max-w-full truncate"
            >
              {{ executionCase.lastCourtType }}
            </span>
          </div>
        </div>
        <div class="text-sm text-[rgb(var(--text-muted))] space-y-2">
          <div class="flex items-center justify-between gap-2 min-h-[1.25rem]">
            <span class="shrink-0">{{ 'execution.fields.fileNo' | translate }}</span>
            <span class="font-mono text-xs text-end truncate">{{
              executionCase.fileNo || '—'
            }}</span>
          </div>
          <div class="flex items-center justify-between gap-2 min-h-[1.25rem]">
            <span class="shrink-0">{{ 'execution.fields.linkedCaseId' | translate }}</span>
            <span class="font-mono text-xs text-end truncate">{{
              executionCase.linkedCaseId || '—'
            }}</span>
          </div>
          <div class="flex items-center justify-between gap-2 min-h-[1.25rem]">
            <span class="shrink-0">{{ 'execution.fields.fileDate' | translate }}</span>
            <span class="text-end truncate">{{
              executionCase.fileDate | date: 'mediumDate' : '' : ngLocale()
            }}</span>
          </div>
          <div class="flex items-center justify-between gap-2 min-h-[1.25rem]">
            <span class="shrink-0">{{ 'execution.fields.companyLawyer' | translate }}</span>
            <span class="text-xs text-end truncate">{{ executionCase.companyLawyer || '—' }}</span>
          </div>
          <div class="border-t border-[rgb(var(--border))] pt-2 mt-2">
            <div class="flex items-center justify-between font-semibold gap-2">
              <span class="shrink-0">{{ 'execution.fields.amountRuled' | translate }}</span>
              <span class="text-[rgb(var(--primary))] tabular-nums text-end truncate"
                >{{ executionCase.amountRuled | number: '1.2-2' : ngLocale() }}
                {{ 'common.sar' | translate }}</span
              >
            </div>
            <div class="flex items-center justify-between text-sm gap-2 mt-1">
              <span class="shrink-0">{{ 'execution.fields.amountPaid' | translate }}</span>
              <span class="tabular-nums text-end truncate"
                >{{ executionCase.amountPaid | number: '1.2-2' : ngLocale() }}
                {{ 'common.sar' | translate }}</span
              >
            </div>
          </div>
        </div>
      </p-card>
    </div>
  `,
})
export class ExecutionCasesListComponent {
  private readonly executionCasesService = inject(ExecutionCasesService);
  private readonly language = inject(LanguageService);

  protected readonly ngLocale = computed(() =>
    this.language.currentLang() === 'ar' ? 'ar-SA' : 'en-US',
  );

  protected executionCases = this.executionCasesService.list();
  protected searchQuery = '';

  filteredCases(): ExecutionCase[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.executionCases;
    return this.executionCases.filter((c) => {
      const blob = [
        c.executionCaseNo,
        c.caseNumber,
        c.fileNo,
        c.courtRoom,
        c.companyLawyer,
        c.lastCourtType,
        c.lastCourtLevel,
        c.linkedCaseId,
        c.unifiedCaseId,
        String(c.amountRuled),
        String(c.amountPaid),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return blob.includes(q);
    });
  }
}
