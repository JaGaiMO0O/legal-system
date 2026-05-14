import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CaseWorkflowComponent } from '../../shared/components/case-workflow/case-workflow.component';
import { RelativeDatePipe } from '../../shared/pipes/relative-date.pipe';
import {
  CASE_MATTER_TYPE_LABELS,
  CASE_MATTER_TYPES,
  CaseItem,
  CaseMatterType,
  CasesService,
} from '../../shared/services/cases.service';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';
import { ExportService } from '../../shared/services/export.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  standalone: true,
  selector: 'app-cases-list',
  imports: [
    RouterModule,
    CommonModule,
    TranslateModule,
    ButtonModule,
    TagModule,
    FormsModule,
    RelativeDatePipe,
    CaseWorkflowComponent,
  ],
  template: `
    <div class="flex items-center justify-between mb-6 flex-wrap gap-4">
      <div>
        <h2 class="text-2xl md:text-3xl font-semibold text-[rgb(var(--text))] mb-2 tracking-tight">
          {{ 'cases.title' | translate }}
        </h2>
        <p class="text-sm text-[rgb(var(--text-muted))]">
          {{ filteredCases.length }}
          {{
            filteredCases.length === 1
              ? ('cases.list.subtitleCase' | translate)
              : ('cases.list.subtitleCases' | translate)
          }}
          <span *ngIf="searchQuery || statusFilter || stageFilter || matterFilter">
            ({{ allCases.length }} {{ 'cases.list.totalSuffix' | translate }})
          </span>
        </p>
      </div>
      <div class="flex items-center gap-3">
        <p-button [outlined]="true" (click)="exportCases()">
          <svg class="w-4 h-4 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          {{ 'cases.list.export' | translate }}
        </p-button>
        <p-button severity="primary" routerLink="/legal/case/new">
          <svg class="w-4 h-4 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          {{ 'cases.list.newCase' | translate }}
        </p-button>
      </div>
    </div>

    <div class="flex flex-col gap-8">
      <!-- Bulk Actions Bar -->
      <div
        *ngIf="showBulkActions"
        class="card p-4 flex flex-wrap items-center justify-between gap-4 bg-info-muted border border-info"
      >
        <div class="flex flex-wrap items-center gap-4">
          <span class="text-sm font-medium text-info-fg">
            {{ selectedCases.size }}
            {{
              selectedCases.size === 1
                ? ('cases.list.selectedCase' | translate)
                : ('cases.list.selectedCases' | translate)
            }}
          </span>
          <div class="flex flex-wrap items-center gap-2">
            <select
              [(ngModel)]="bulkStatusAction"
              class="text-sm border border-info rounded-input px-3 py-1 bg-[rgb(var(--surface))] text-[rgb(var(--text))]"
            >
              <option value="">{{ 'cases.list.changeStatus' | translate }}</option>
              <option value="open">{{ 'cases.list.setOpen' | translate }}</option>
              <option value="pending">{{ 'cases.list.setPending' | translate }}</option>
              <option value="closed">{{ 'cases.list.setClosed' | translate }}</option>
            </select>
            <p-button severity="primary" (click)="applyBulkStatus()" class="text-sm">
              {{ 'cases.list.apply' | translate }}
            </p-button>
            <p-button
              [outlined]="true"
              (click)="bulkExport()"
              class="text-sm"
              [label]="'cases.list.exportSelected' | translate"
            ></p-button>
            <p-button [outlined]="true" (click)="bulkDelete()" class="text-sm" severity="danger">
              {{ 'cases.list.deleteSelected' | translate }}
            </p-button>
          </div>
        </div>
        <button
          type="button"
          (click)="clearSelection()"
          class="text-sm text-[rgb(var(--primary))] hover:underline font-medium"
        >
          {{ 'cases.list.clearSelectionLabel' | translate }}
        </button>
      </div>

      <!-- Search and Filters -->
      <div class="card p-4" id="cases-filters-anchor">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div class="md:col-span-2">
            <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
              'cases.list.filtersSearch' | translate
            }}</label>
            <div class="relative">
              <input
                type="text"
                inputmode="search"
                [(ngModel)]="searchQuery"
                (ngModelChange)="onSearchChange()"
                class="w-full py-2.5 pe-4 search-input-with-icon"
                [placeholder]="'cases.list.filtersPlaceholder' | translate"
              />
              <span class="search-input-icon" aria-hidden="true">
                <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </span>
            </div>
          </div>
          <div>
            <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
              'lists.status' | translate
            }}</label>
            <select [(ngModel)]="statusFilter" (ngModelChange)="applyFilters()" class="w-full">
              <option value="">{{ 'lists.allStatuses' | translate }}</option>
              <option value="open">{{ 'cases.caseStatus.open' | translate }}</option>
              <option value="pending">{{ 'cases.caseStatus.pending' | translate }}</option>
              <option value="closed">{{ 'cases.caseStatus.closed' | translate }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
              'lists.stage' | translate
            }}</label>
            <select [(ngModel)]="stageFilter" (ngModelChange)="applyFilters()" class="w-full">
              <option value="">{{ 'lists.allStages' | translate }}</option>
              <option value="primary">{{ 'cases.stage.primary' | translate }}</option>
              <option value="appeal">{{ 'cases.stage.appeal' | translate }}</option>
              <option value="cassation">{{ 'cases.stage.cassation' | translate }}</option>
              <option value="execution">{{ 'cases.stage.execution' | translate }}</option>
              <option value="settled">{{ 'cases.stage.settled' | translate }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
              'lists.legalStatus' | translate
            }}</label>
            <select [(ngModel)]="legalStatusFilter" (ngModelChange)="applyFilters()" class="w-full">
              <option value="">{{ 'lists.allLegalStatuses' | translate }}</option>
              <option value="0">{{ 'cases.legalStatus.0' | translate }}</option>
              <option value="1">{{ 'cases.legalStatus.1' | translate }}</option>
              <option value="3">{{ 'cases.legalStatus.3' | translate }}</option>
              <option value="4">{{ 'cases.legalStatus.4' | translate }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
              'lists.matterType' | translate
            }}</label>
            <select [(ngModel)]="matterFilter" (ngModelChange)="applyFilters()" class="w-full">
              <option value="">{{ 'lists.allTypes' | translate }}</option>
              <option *ngFor="let mt of matterTypeOptions" [value]="mt">
                {{ 'cases.matterType.' + mt | translate }}
              </option>
            </select>
          </div>
        </div>
        <div class="mt-4 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div>
              <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                'lists.sortBy' | translate
              }}</label>
              <select [(ngModel)]="sortBy" (ngModelChange)="applySorting()" class="w-full">
                <option value="newest">{{ 'lists.sortNewest' | translate }}</option>
                <option value="oldest">{{ 'lists.sortOldest' | translate }}</option>
                <option value="title">{{ 'lists.sortTitle' | translate }}</option>
                <option value="client">{{ 'lists.sortClient' | translate }}</option>
                <option value="status">{{ 'lists.sortStatus' | translate }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                'lists.perPage' | translate
              }}</label>
              <select [(ngModel)]="itemsPerPage" (ngModelChange)="applyPagination()" class="w-full">
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
        </div>
        <div
          *ngIf="searchQuery || statusFilter || stageFilter || legalStatusFilter || matterFilter"
          class="mt-4 flex items-center gap-2 flex-wrap"
        >
          <span class="text-sm text-[rgb(var(--text-muted))]">{{
            'lists.activeFiltersPrefix' | translate
          }}</span>
          <span
            *ngIf="searchQuery"
            class="inline-flex items-center gap-1 px-3 py-1 bg-info-muted text-[rgb(var(--text))] border border-info rounded-full text-xs font-medium"
          >
            {{ 'lists.chipSearch' | translate }}: "{{ searchQuery }}"
            <button type="button" (click)="clearSearch()" class="hover:opacity-80">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </span>
          <span
            *ngIf="statusFilter"
            class="inline-flex items-center gap-1 px-3 py-1 bg-info-muted text-[rgb(var(--text))] border border-info rounded-full text-xs font-medium"
          >
            {{ 'lists.chipStatus' | translate }}:
            {{ 'cases.caseStatus.' + statusFilter | translate }}
            <button type="button" (click)="clearStatusFilter()" class="hover:opacity-80">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </span>
          <span
            *ngIf="stageFilter"
            class="inline-flex items-center gap-1 px-3 py-1 bg-info-muted text-[rgb(var(--text))] border border-info rounded-full text-xs font-medium"
          >
            {{ 'lists.chipStage' | translate }}:
            {{ 'cases.stage.' + stageFilter | translate }}
            <button type="button" (click)="clearStageFilter()" class="hover:opacity-80">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </span>
          <span
            *ngIf="legalStatusFilter"
            class="inline-flex items-center gap-1 px-3 py-1 bg-info-muted text-[rgb(var(--text))] border border-info rounded-full text-xs font-medium"
          >
            {{ 'cases.list.legalStatusChip' | translate }}:
            {{ legalStatusTranslationKey(+legalStatusFilter) | translate }}
            <button type="button" (click)="clearLegalStatusFilter()" class="hover:opacity-80">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </span>
          <span
            *ngIf="matterFilter"
            class="inline-flex items-center gap-1 px-3 py-1 bg-info-muted text-[rgb(var(--text))] border border-info rounded-full text-xs font-medium"
          >
            {{ 'cases.list.matterLabel' | translate }}:
            {{ 'cases.matterType.' + matterFilter | translate }}
            <button type="button" (click)="clearMatterFilter()" class="hover:opacity-80">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </span>
          <button
            (click)="clearAllFilters()"
            class="text-sm text-[rgb(var(--primary))] hover:underline font-medium"
          >
            {{ 'actions.clearAll' | translate }}
          </button>
        </div>
      </div>

      <div *ngIf="filteredCases.length === 0 && allCases.length > 0" class="card p-16 text-center">
        <h3 class="text-lg font-semibold text-[rgb(var(--text))] mb-2">
          {{ 'lists.noMatchFilters' | translate }}
        </h3>
        <p class="text-sm text-[rgb(var(--text-muted))] mb-6">
          {{ 'lists.noMatchFiltersHint' | translate }}
        </p>
        <p-button
          [outlined]="true"
          (click)="clearAllFilters()"
          [label]="'actions.clearFilters' | translate"
        ></p-button>
      </div>

      <div *ngIf="allCases.length === 0" class="card p-16 text-center">
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
          <h3 class="text-lg font-semibold text-[rgb(var(--text))] mb-2">
            {{ 'lists.noCasesYet' | translate }}
          </h3>
          <p class="text-sm text-[rgb(var(--text-muted))] mb-6">
            {{ 'lists.getStartedCases' | translate }}
          </p>
          <p-button severity="primary" routerLink="/legal/case/new">
            <svg class="w-4 h-4 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            {{ 'actions.createFirstCase' | translate }}
          </p-button>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6" *ngIf="paginatedCases.length > 0">
        <div
          *ngFor="let case of paginatedCases; trackBy: trackByCaseId"
          class="card p-6 group relative overflow-hidden"
          [class.cursor-pointer]="!showBulkActions"
          [class.cursor-default]="showBulkActions"
        >
          <div class="flex items-start gap-4">
            <input
              *ngIf="showBulkActions"
              type="checkbox"
              [checked]="selectedCases.has(case.id)"
              (change)="toggleCaseSelection(case.id)"
              class="mt-1 w-4 h-4"
              (click)="$event.stopPropagation()"
            />
            <div class="flex-1 relative">
              <a
                [routerLink]="['/legal/case', case.id]"
                class="block"
                (click)="showBulkActions ? $event.preventDefault() : null"
              >
                <div class="flex items-start justify-between relative z-10">
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-3">
                      <h3
                        class="text-xl font-bold text-[rgb(var(--text))] group-hover:text-[rgb(var(--primary))] transition-colors"
                      >
                        {{ case.title }}
                      </h3>
                      <span
                        *ngIf="case.caseNumber || case.baseCaseNumber"
                        class="px-3 py-1 rounded-full text-xs font-semibold bg-[rgb(var(--surface-muted))] text-[rgb(var(--text))] border border-[rgb(var(--border))] font-mono"
                        [attr.title]="'cases.list.caseNumberTitle' | translate"
                      >
                        #{{ case.caseNumber || case.baseCaseNumber }}
                      </span>
                      <span
                        class="px-3 py-1 rounded-full text-xs font-semibold border"
                        [class.bg-[rgb(var(--tint-success-bg))]]="case.status === 'open'"
                        [class.text-[rgb(var(--tint-success-fg))]]="case.status === 'open'"
                        [class.border-[rgb(var(--success))]]="case.status === 'open'"
                        [class.bg-[rgb(var(--tint-warning-bg))]]="case.status === 'pending'"
                        [class.text-[rgb(var(--tint-warning-fg))]]="case.status === 'pending'"
                        [class.border-[rgb(var(--warning))]]="case.status === 'pending'"
                        [class.bg-[rgb(var(--surface-muted))]]="case.status === 'closed'"
                        [class.text-[rgb(var(--text-muted))]]="case.status === 'closed'"
                        [class.border-[rgb(var(--border))]]="case.status === 'closed'"
                      >
                        {{ 'cases.caseStatus.' + case.status | translate }}
                      </span>
                      <span
                        class="px-3 py-1 rounded-full text-xs font-semibold bg-info-muted text-[rgb(var(--primary))] border border-info"
                        *ngIf="case.stage"
                      >
                        {{ 'cases.stage.' + case.stage | translate }}
                      </span>
                      <span
                        class="px-3 py-1 rounded-full text-xs font-semibold bg-[rgb(var(--surface-muted))] text-[rgb(var(--text))] border border-[rgb(var(--border-light))]"
                        [attr.title]="'cases.list.matterTypeTitle' | translate"
                      >
                        {{ 'cases.matterType.' + caseMatterType(case) | translate }}
                      </span>
                      <span
                        class="px-3 py-1 rounded-full text-xs font-semibold border"
                        *ngIf="case.legalStatus !== undefined"
                        [class.bg-[rgb(var(--tint-neutral-bg))]]="case.legalStatus === 0"
                        [class.text-[rgb(var(--tint-neutral-fg))]]="case.legalStatus === 0"
                        [class.border-[rgb(var(--border))]]="case.legalStatus === 0"
                        [class.bg-info-muted]="case.legalStatus === 1"
                        [class.text-info-fg]="case.legalStatus === 1"
                        [class.border-info]="case.legalStatus === 1"
                        [class.bg-[rgb(var(--tint-warning-bg))]]="case.legalStatus === 3"
                        [class.text-[rgb(var(--tint-warning-fg))]]="case.legalStatus === 3"
                        [class.border-[rgb(var(--warning))]]="case.legalStatus === 3"
                        [class.bg-[rgb(var(--tint-success-bg))]]="case.legalStatus === 4"
                        [class.text-[rgb(var(--tint-success-fg))]]="case.legalStatus === 4"
                        [class.border-[rgb(var(--success))]]="case.legalStatus === 4"
                        [attr.title]="'cases.list.legalStatusTitle' | translate"
                      >
                        {{ legalStatusTranslationKey(case.legalStatus) | translate }}
                      </span>
                      <span
                        *ngIf="case.settledStatus === 2"
                        class="px-3 py-1 rounded-full text-xs font-semibold bg-[rgb(var(--tint-accent-bg))] text-[rgb(var(--tint-accent-fg))] border border-info"
                      >
                        {{ 'cases.list.legallySettled' | translate }}
                      </span>
                    </div>
                    <div class="mb-3">
                      <app-case-workflow
                        [currentStage]="case.stage || 'primary'"
                        mode="compact"
                      ></app-case-workflow>
                    </div>
                    <p class="text-sm text-[rgb(var(--text-muted))] mb-4 font-medium">
                      {{ 'common.clientLabel' | translate }}:
                      <span class="text-[rgb(var(--text))]">{{ case.client }}</span>
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
                        <span class="font-medium">{{
                          'cases.list.taskCount' | translate: { count: case.tasks.length }
                        }}</span>
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
                        <span class="font-medium">{{
                          'cases.list.deadlineCount' | translate: { count: case.deadlines.length }
                        }}</span>
                      </span>
                      <span *ngIf="case.rulings && case.rulings.length > 0">
                        <svg
                          class="w-4 h-4 inline me-1"
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
                        {{ 'cases.list.rulingCount' | translate: { count: case.rulings.length } }}
                      </span>
                    </div>
                  </div>
                  <div class="text-end">
                    <p class="text-xs text-[rgb(var(--text-muted))]">
                      {{ 'cases.list.updatedPrefix' | translate }}
                      {{ case.updatedAt | relativeDate }}
                    </p>
                    <p class="text-xs text-[rgb(var(--text-muted))] mt-1">
                      {{ case.updatedAt | date: 'shortDate' }}
                    </p>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div *ngIf="totalPages > 1" class="flex items-center justify-between">
        <div class="text-sm text-[rgb(var(--text-muted))]">
          {{
            'cases.list.paginationShowing'
              | translate
                : {
                    from: (currentPage - 1) * itemsPerPage + 1,
                    to: Math.min(currentPage * itemsPerPage, filteredCases.length),
                    total: filteredCases.length,
                  }
          }}
        </div>
        <div class="flex items-center gap-2">
          <p-button
            [outlined]="true"
            (click)="goToPage(currentPage - 1)"
            [disabled]="currentPage === 1"
          >
            {{ 'common.previous' | translate }}
          </p-button>
          <div class="flex items-center gap-1">
            <button
              *ngFor="let page of getPageNumbers(); trackBy: trackByPage"
              (click)="goToPage(page)"
              class="px-3 py-1 rounded text-sm font-medium transition-colors"
              [class.bg-[rgb(var(--primary))]]="page === currentPage"
              [class.text-[rgb(var(--text-inverse))]]="page === currentPage"
              [class.text-[rgb(var(--text))]]="page !== currentPage"
              [class.hover:bg-[rgb(var(--surface-muted))]]="page !== currentPage"
            >
              {{ page }}
            </button>
          </div>
          <p-button
            [outlined]="true"
            (click)="goToPage(currentPage + 1)"
            [disabled]="currentPage === totalPages"
          >
            {{ 'common.next' | translate }}
          </p-button>
        </div>
      </div>
    </div>
  `,
})
export class CasesListComponent {
  protected readonly matterTypeOptions = CASE_MATTER_TYPES;

  caseMatterType(c: CaseItem): CaseMatterType {
    return c.matterType ?? 'GeneralCivil';
  }

  legalStatusTranslationKey(legalStatus?: number): string {
    const s = legalStatus ?? 1;
    if (s === 0 || s === 1 || s === 3 || s === 4) return `cases.legalStatus.${s}`;
    return 'cases.legalStatus.unknown';
  }
  private readonly casesService = inject(CasesService);
  private readonly exportService = inject(ExportService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);
  private readonly route = inject(ActivatedRoute);
  protected allCases: CaseItem[] = this.casesService.list();
  protected filteredCases: CaseItem[] = this.allCases;
  protected paginatedCases: CaseItem[] = this.filteredCases;
  protected searchQuery = '';
  protected statusFilter = '';
  protected stageFilter = '';
  protected legalStatusFilter = '';
  protected matterFilter = '';
  protected sortBy = 'newest';
  protected itemsPerPage = 20;
  protected currentPage = 1;
  protected totalPages = 1;
  protected Math = Math;
  protected selectedCases = new Set<string>();
  protected selectAll = false;
  protected showBulkActions = false;
  private readonly searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(() => this.applyFilters());

    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      if (params.get('focus') === 'deadlines') {
        setTimeout(() => {
          document
            .getElementById('cases-filters-anchor')
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 0);
      }
    });
  }

  trackByCaseId(_index: number, c: CaseItem): string {
    return c.id;
  }

  trackByPage(_index: number, page: number): number {
    return page;
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchQuery);
  }

  applyFilters(): void {
    let filtered = [...this.allCases];

    // Search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter((c) => {
        const matter = c.matterType ?? 'GeneralCivil';
        const matterLabel = CASE_MATTER_TYPE_LABELS[matter].toLowerCase();
        return (
          c.title.toLowerCase().includes(query) ||
          c.client.toLowerCase().includes(query) ||
          matterLabel.includes(query) ||
          matter.toLowerCase().includes(query)
        );
      });
    }

    // Status filter
    if (this.statusFilter) {
      filtered = filtered.filter((c) => c.status === this.statusFilter);
    }

    // Stage filter
    if (this.stageFilter) {
      filtered = filtered.filter((c) => c.stage === this.stageFilter);
    }

    // Legal status filter
    if (this.legalStatusFilter) {
      const filterVal = Number(this.legalStatusFilter);
      filtered = filtered.filter((c) => (c.legalStatus ?? 1) === filterVal);
    }

    if (this.matterFilter) {
      filtered = filtered.filter((c) => (c.matterType ?? 'GeneralCivil') === this.matterFilter);
    }

    this.filteredCases = filtered;
    this.applySorting();
  }

  applySorting(): void {
    let sorted = [...this.filteredCases];

    switch (this.sortBy) {
      case 'newest':
        sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
      case 'oldest':
        sorted.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
        break;
      case 'title':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'client':
        sorted.sort((a, b) => a.client.localeCompare(b.client));
        break;
      case 'status':
        sorted.sort((a, b) => a.status.localeCompare(b.status));
        break;
    }

    this.filteredCases = sorted;
    this.applyPagination();
  }

  applyPagination(): void {
    this.totalPages = Math.ceil(this.filteredCases.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = Math.max(1, this.totalPages);
    }
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedCases = this.filteredCases.slice(start, end);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyPagination();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.applyFilters();
  }

  clearStatusFilter(): void {
    this.statusFilter = '';
    this.applyFilters();
  }

  clearStageFilter(): void {
    this.stageFilter = '';
    this.applyFilters();
  }

  clearLegalStatusFilter(): void {
    this.legalStatusFilter = '';
    this.applyFilters();
  }

  clearMatterFilter(): void {
    this.matterFilter = '';
    this.applyFilters();
  }

  clearAllFilters(): void {
    this.searchQuery = '';
    this.statusFilter = '';
    this.stageFilter = '';
    this.legalStatusFilter = '';
    this.matterFilter = '';
    this.currentPage = 1;
    this.applyFilters();
  }

  exportCases(): void {
    const casesToExport = this.filteredCases.length > 0 ? this.filteredCases : this.allCases;
    if (casesToExport.length === 0) {
      return;
    }
    this.exportService.exportCasesToCSV(casesToExport);
  }

  toggleBulkSelection(): void {
    this.showBulkActions = !this.showBulkActions;
    if (!this.showBulkActions) {
      this.clearSelection();
    }
  }

  toggleCaseSelection(caseId: string): void {
    if (this.selectedCases.has(caseId)) {
      this.selectedCases.delete(caseId);
    } else {
      this.selectedCases.add(caseId);
    }
    this.selectAll =
      this.paginatedCases.length > 0 && this.selectedCases.size === this.paginatedCases.length;
    this.showBulkActions = this.selectedCases.size > 0;
  }

  toggleSelectAll(): void {
    this.selectAll = !this.selectAll;
    if (this.selectAll) {
      this.paginatedCases.forEach((c) => this.selectedCases.add(c.id));
    } else {
      this.paginatedCases.forEach((c) => this.selectedCases.delete(c.id));
    }
  }

  clearSelection(): void {
    this.selectedCases.clear();
    this.selectAll = false;
    this.showBulkActions = false;
  }

  protected bulkStatusAction = '';

  private caseStatusLabel(status: string): string {
    return this.translate.instant(`cases.caseStatus.${status}`);
  }

  async applyBulkStatus(): Promise<void> {
    if (!this.bulkStatusAction || this.selectedCases.size === 0) return;
    const count = this.selectedCases.size;
    const statusLabel = this.caseStatusLabel(this.bulkStatusAction);
    const confirmed = await this.confirmDialog.confirm({
      title: this.translate.instant('confirm.bulkChangeStatusTitle'),
      message: this.translate.instant('confirm.bulkChangeStatusMessage', {
        count,
        status: statusLabel,
      }),
      confirmText: this.translate.instant('cases.list.apply'),
      cancelText: this.translate.instant('actions.cancel'),
      type: 'info',
    });
    if (!confirmed) return;
    try {
      this.selectedCases.forEach((id) => {
        this.casesService.updateMeta(id, { status: this.bulkStatusAction as any });
      });
      this.allCases = this.casesService.list();
      this.applyFilters();
      this.clearSelection();
      this.bulkStatusAction = '';
      this.toast.success(this.translate.instant('toasts.casesList.statusUpdated', { count }));
    } catch (error) {
      this.toast.error(this.translate.instant('toasts.casesList.statusUpdateFailed'));
      console.error('Error updating status:', error);
    }
  }

  bulkExport(): void {
    if (this.selectedCases.size === 0) return;
    const casesToExport = this.allCases.filter((c) => this.selectedCases.has(c.id));
    this.exportService.exportCasesToCSV(casesToExport);
    this.toast.success(
      this.translate.instant('toasts.casesList.exported', { count: casesToExport.length }),
    );
  }

  async bulkDelete(): Promise<void> {
    if (this.selectedCases.size === 0) return;
    const count = this.selectedCases.size;
    const confirmed = await this.confirmDialog.confirm({
      title: this.translate.instant('confirm.bulkDeleteCasesTitle'),
      message: this.translate.instant('confirm.bulkDeleteCasesMessage', { count }),
      confirmText: this.translate.instant('actions.delete'),
      cancelText: this.translate.instant('actions.cancel'),
      type: 'danger',
    });
    if (!confirmed) return;
    try {
      this.selectedCases.forEach((id) => {
        this.casesService.delete(id);
      });
      this.allCases = this.casesService.list();
      this.applyFilters();
      this.clearSelection();
      this.toast.success(this.translate.instant('toasts.casesList.deleted', { count }));
    } catch (error) {
      this.toast.error(this.translate.instant('toasts.casesList.deleteFailed'));
      console.error('Error deleting cases:', error);
    }
  }
}
