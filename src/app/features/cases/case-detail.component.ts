import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { interval, Subscription } from 'rxjs';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { CaseWorkflowComponent } from '../../shared/components/case-workflow/case-workflow.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { UIButtonComponent } from '../../shared/components/ui/button.component';
import { UICardComponent } from '../../shared/components/ui/card.component';
import { DeadlineStatusPipe } from '../../shared/pipes/deadline-status.pipe';
import { RelativeDatePipe } from '../../shared/pipes/relative-date.pipe';
import {
  BusinessSettlement,
  BusinessSettlementService,
} from '../../shared/services/business-settlement.service';
import { CaseTrackingService } from '../../shared/services/case-tracking.service';
import {
  CaseItem,
  CaseRuling,
  CasesService,
  CaseStage,
  CaseType,
  ClaimantDemographics,
  DamageType,
  DisabilityMetrics,
  RulingInFavorOf,
} from '../../shared/services/cases.service';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';
import { CourtLevel, CourtsService, CourtType } from '../../shared/services/courts.service';
import { ExportService } from '../../shared/services/export.service';
import { Lawyer, LawyersService } from '../../shared/services/lawyers.service';
import { ToastService } from '../../shared/services/toast.service';
import { UndoRedoService } from '../../shared/services/undo-redo.service';

type LastSavedData = {
  title: string;
  client: string;
  status: string;
  companyLawyerId: string;
  claimant: string;
  beneficiary: string;
  initialHearingDate: string;
};

@Component({
  standalone: true,
  selector: 'app-case-detail',
  imports: [
    CommonModule,
    UIButtonComponent,
    UICardComponent,
    FormsModule,
    TranslateModule,
    RouterModule,
    LoadingSpinnerComponent,
    RelativeDatePipe,
    DeadlineStatusPipe,
    BreadcrumbComponent,
    CaseWorkflowComponent,
  ],
  template: `
    <app-breadcrumb [items]="breadcrumbItems"></app-breadcrumb>
    <div class="mb-8">
      <div class="flex items-start justify-between mb-6">
        <div>
          <h2 class="text-3xl font-bold mb-2">{{ caseItem?.title || 'New Case' }}</h2>
          <p class="text-sm text-[rgb(var(--text-muted))]">
            Client: {{ caseItem?.client || 'Not set' }}
          </p>
        </div>
        <div class="flex items-center gap-3">
          <span
            class="inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200"
          >
            Stage: {{ caseItem?.stage || 'primary' | titlecase }}
          </span>
          <ui-button
            variant="ghost"
            (click)="nextStage()"
            *ngIf="caseItem?.stage !== 'settled'"
            class="text-sm"
          >
            Next Court
          </ui-button>
          <ui-button
            variant="primary"
            (click)="settle()"
            *ngIf="
              caseItem?.stage && caseItem?.stage !== 'settled' && caseItem?.stage !== 'execution'
            "
            class="text-sm"
          >
            Settle Case
          </ui-button>
          <ui-button
            variant="primary"
            (click)="execute()"
            *ngIf="caseItem?.stage === 'execution'"
            class="text-sm"
          >
            Execute Case
          </ui-button>
          <ui-button variant="ghost" (click)="exportCase()" *ngIf="caseItem" class="text-sm">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Export
          </ui-button>
        </div>
      </div>
    </div>

    <!-- Case Workflow -->
    <ui-card *ngIf="caseItem">
      <app-case-workflow
        [currentStage]="caseItem.stage || 'primary'"
        mode="full"
      ></app-case-workflow>
    </ui-card>

    <ui-card>
      <h3 class="text-lg font-bold mb-6">Case Information</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
            >Case Number</label
          >
          <input
            type="text"
            [value]="caseItem?.caseNumber || caseItem?.baseCaseNumber || 'Will be generated'"
            readonly
            class="w-full bg-[rgb(var(--surface-muted))] cursor-not-allowed font-mono"
          />
        </div>
        <div>
          <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
            >Legal Status</label
          >
          <div class="flex items-center gap-2">
            <span
              class="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
              [class.bg-gray-100]="getLegalStatusValue() === 0"
              [class.text-gray-800]="getLegalStatusValue() === 0"
              [class.bg-blue-100]="getLegalStatusValue() === 1"
              [class.text-blue-800]="getLegalStatusValue() === 1"
              [class.bg-yellow-100]="getLegalStatusValue() === 3"
              [class.text-yellow-800]="getLegalStatusValue() === 3"
              [class.bg-emerald-100]="getLegalStatusValue() === 4"
              [class.text-emerald-800]="getLegalStatusValue() === 4"
            >
              {{ getLegalStatusLabel() }}
            </span>
            <span
              *ngIf="caseItem?.settledStatus === 2"
              class="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-purple-100 text-purple-800"
            >
              Legally Settled
            </span>
          </div>
        </div>
        <div>
          <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">Status</label>
          <select [(ngModel)]="status" class="w-full">
            <option value="open">Open</option>
            <option value="pending">Pending</option>
            <option value="closed">Closed</option>
            <option value="on-hold">On Hold</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
            >Company Lawyer</label
          >
          <select [(ngModel)]="companyLawyerId" class="w-full">
            <option value="">Unassigned</option>
            <option *ngFor="let l of lawyers" [value]="l.id">
              {{ l.lawyerNumber }} - {{ l.name }}
            </option>
          </select>
          <p class="text-xs text-[rgb(var(--text-muted))] mt-1" *ngIf="companyLawyerId">
            Assigned: {{ getCompanyLawyerDisplay() }}
          </p>
        </div>
        <div>
          <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">Case ID</label>
          <input
            type="text"
            [value]="caseItem?.id || 'Will be generated'"
            readonly
            class="w-full bg-[rgb(var(--surface-muted))] cursor-not-allowed text-xs"
          />
        </div>
        <div class="md:col-span-2">
          <label for="case-title" class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
            >Title <span class="text-red-500">*</span></label
          >
          <input
            id="case-title"
            type="text"
            [(ngModel)]="title"
            class="w-full"
            [class.border-red-300]="titleError"
            [class.bg-red-50]="titleError"
            placeholder="Enter case title"
            aria-required="true"
            [attr.aria-invalid]="!!titleError"
            [attr.aria-describedby]="titleError ? 'title-error' : null"
          />
          <p *ngIf="titleError" id="title-error" class="text-red-600 text-xs mt-1" role="alert">
            {{ titleError }}
          </p>
        </div>
        <div>
          <label for="case-client" class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
            >Client <span class="text-red-500">*</span></label
          >
          <input
            id="case-client"
            type="text"
            [(ngModel)]="client"
            class="w-full"
            [class.border-red-300]="clientError"
            [class.bg-red-50]="clientError"
            placeholder="Enter client name"
            aria-required="true"
            [attr.aria-invalid]="!!clientError"
            [attr.aria-describedby]="clientError ? 'client-error' : null"
          />
          <p *ngIf="clientError" id="client-error" class="text-red-600 text-xs mt-1" role="alert">
            {{ clientError }}
          </p>
        </div>
        <div>
          <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">Claimant</label>
          <input
            type="text"
            [(ngModel)]="claimant"
            class="w-full"
            placeholder="Enter claimant name"
          />
        </div>
        <div>
          <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
            >Beneficiary</label
          >
          <input
            type="text"
            [(ngModel)]="beneficiary"
            class="w-full"
            placeholder="Enter beneficiary name"
          />
        </div>
        <div>
          <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
            >Initial Hearing Date</label
          >
          <input type="date" [(ngModel)]="initialHearingDate" class="w-full" />
        </div>
        <div>
          <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
            >Damage Type</label
          >
          <select [(ngModel)]="damageType" class="w-full">
            <option value="">Select damage type</option>
            <option value="Fatal">Fatal</option>
            <option value="Disability">Disability</option>
          </select>
        </div>
        <div *ngIf="damageType === 'Disability'">
          <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
            >Moral Percent (%)</label
          >
          <input
            type="number"
            [(ngModel)]="disabilityMetrics.moralPercent"
            min="0"
            max="100"
            class="w-full"
            placeholder="0"
          />
        </div>
        <div *ngIf="damageType === 'Disability'">
          <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
            >Physical Percent (%)</label
          >
          <input
            type="number"
            [(ngModel)]="disabilityMetrics.physicalPercent"
            min="0"
            max="100"
            class="w-full"
            placeholder="0"
          />
        </div>
      </div>

      <!-- Claimant Demographics Section -->
      <div class="mt-6 pt-6 border-t border-[rgb(var(--border-light))]">
        <button
          type="button"
          class="flex items-center gap-2 text-sm font-semibold text-[rgb(var(--text))] mb-4"
          (click)="showDemographics = !showDemographics"
        >
          <svg
            class="w-4 h-4 transition-transform"
            [class.rotate-90]="showDemographics"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
          Claimant Demographics
        </button>
        <div *ngIf="showDemographics" class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
              >Nationality</label
            >
            <input
              type="text"
              [(ngModel)]="demographics.nationality"
              class="w-full"
              placeholder="Enter nationality"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">Sex</label>
            <select [(ngModel)]="demographics.sex" class="w-full">
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
              >Marital Status</label
            >
            <select [(ngModel)]="demographics.maritalStatus" class="w-full">
              <option value="">Select</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Divorced">Divorced</option>
              <option value="Widowed">Widowed</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
              >Profession</label
            >
            <input
              type="text"
              [(ngModel)]="demographics.profession"
              class="w-full"
              placeholder="Enter profession"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">Age</label>
            <input
              type="number"
              [(ngModel)]="demographics.age"
              min="0"
              max="150"
              class="w-full"
              placeholder="0"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
              >Dependents</label
            >
            <input
              type="number"
              [(ngModel)]="demographics.dependents"
              min="0"
              class="w-full"
              placeholder="0"
            />
          </div>
        </div>
      </div>
      <div
        class="mt-8 pt-6 border-t border-[rgb(var(--border-light))] flex items-center justify-between"
      >
        <div class="flex items-center gap-2 text-sm">
          <span
            *ngIf="caseItem && autoSaveStatus === 'saved'"
            class="flex items-center gap-1.5 text-emerald-600"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            All changes saved
          </span>
          <span
            *ngIf="caseItem && autoSaveStatus === 'saving'"
            class="flex items-center gap-1.5 text-amber-600"
          >
            <app-loading-spinner size="small" [show]="true"></app-loading-spinner>
            Saving...
          </span>
          <span
            *ngIf="caseItem && autoSaveStatus === 'unsaved'"
            class="flex items-center gap-1.5 text-[rgb(var(--text-muted))]"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            Unsaved changes
          </span>
        </div>
        <div class="flex gap-3">
          <ui-button
            variant="ghost"
            (click)="goBack()"
            [disabled]="saving"
            aria-label="Cancel and go back"
          >
            Cancel
          </ui-button>
          <ui-button
            variant="primary"
            (click)="save()"
            [disabled]="!isFormValid() || saving"
            aria-label="Save case"
          >
            <span *ngIf="!saving">{{ caseItem ? 'Save Changes' : 'Create Case' }}</span>
            <span *ngIf="saving" class="flex items-center gap-2">
              <app-loading-spinner size="small" [show]="true"></app-loading-spinner>
              Saving...
            </span>
          </ui-button>
        </div>
      </div>
    </ui-card>

    <ui-card class="mt-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold">Business Settlement</h3>
        <ui-button variant="primary" size="sm" (click)="createSettlement()" *ngIf="!settlement">
          Create Settlement
        </ui-button>
        <a
          *ngIf="settlement"
          class="text-[rgb(var(--primary))] hover:underline text-sm font-medium"
          [routerLink]="['/settlements', settlement.id]"
        >
          View Settlement
        </a>
      </div>
      <div
        *ngIf="settlement; else noSettlement"
        class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm"
      >
        <div class="p-3 bg-[rgb(var(--surface-muted))] rounded">
          <div class="text-[rgb(var(--text-muted))]">Amount of Amicable Agreement</div>
          <div class="text-lg font-semibold">
            {{ settlement.amountOfAmicableAgreement | number }} SAR
          </div>
        </div>
        <div class="p-3 bg-[rgb(var(--surface-muted))] rounded">
          <div class="text-[rgb(var(--text-muted))]">Department Amount</div>
          <div class="font-semibold">{{ settlement.departmentAmount | number }} SAR</div>
        </div>
        <div class="p-3 bg-[rgb(var(--surface-muted))] rounded">
          <div class="text-[rgb(var(--text-muted))]">Legal Department Amount</div>
          <div class="font-semibold">{{ settlement.legalDepartmentAmount | number }} SAR</div>
        </div>
        <div class="p-3 bg-[rgb(var(--surface-muted))] rounded">
          <div class="text-[rgb(var(--text-muted))]">Management Amount</div>
          <div class="font-semibold">{{ settlement.managementAmount | number }} SAR</div>
        </div>
        <div class="p-3 bg-[rgb(var(--surface-muted))] rounded">
          <div class="text-[rgb(var(--text-muted))]">Adversary Amount</div>
          <div class="font-semibold">{{ settlement.adversaryAmount | number }} SAR</div>
        </div>
        <div class="text-xs text-[rgb(var(--text-muted))]">
          Updated at: {{ settlement.updatedAt | date: 'short' }}
        </div>
      </div>
      <ng-template #noSettlement>
        <p class="text-[rgb(var(--text-muted))] text-sm">No settlement linked to this case.</p>
      </ng-template>
    </ui-card>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <ui-card>
        <div class="mb-6">
          <h3 class="text-lg font-bold mb-4">Tasks</h3>
          <div class="flex gap-2">
            <input class="flex-1" [(ngModel)]="taskTitle" placeholder="Enter new task" />
            <ui-button
              variant="primary"
              (click)="addTask()"
              class="whitespace-nowrap"
              [disabled]="addingTask"
            >
              <span *ngIf="!addingTask">Add</span>
              <span *ngIf="addingTask" class="flex items-center gap-2">
                <app-loading-spinner size="small" [show]="true"></app-loading-spinner>
                Adding...
              </span>
            </ui-button>
          </div>
        </div>
        <ul class="space-y-3">
          <li
            *ngFor="let t of caseItem?.tasks"
            class="flex items-center justify-between p-3 bg-[rgb(var(--surface-muted))] rounded-lg"
          >
            <label class="flex items-center gap-3 flex-1 cursor-pointer">
              <input
                type="checkbox"
                [checked]="t.done"
                (change)="toggleTask(t.id)"
                class="w-4 h-4"
              />
              <span [class.line-through]="t.done" [class.text-[rgb(var(--text-muted))]]="t.done">{{
                t.title
              }}</span>
            </label>
            <button
              class="text-sm text-red-600 hover:text-red-700 font-medium px-2"
              (click)="removeTask(t.id)"
            >
              Remove
            </button>
          </li>
          <li
            *ngIf="!caseItem?.tasks || caseItem?.tasks?.length === 0"
            class="text-sm text-[rgb(var(--text-muted))] text-center py-8"
          >
            <div class="flex flex-col items-center gap-2">
              <svg
                class="w-8 h-8 text-[rgb(var(--text-muted))] opacity-50"
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
              <p>No tasks yet</p>
              <p class="text-xs opacity-75">Add your first task above</p>
            </div>
          </li>
        </ul>
      </ui-card>
      <ui-card>
        <div class="mb-6">
          <h3 class="text-lg font-bold mb-4">Deadlines</h3>
          <div class="space-y-2">
            <div>
              <input
                class="w-full"
                [(ngModel)]="deadlineTitle"
                placeholder="Deadline title"
                [class.border-red-300]="deadlineTitleError"
                [class.bg-red-50]="deadlineTitleError"
              />
              <p *ngIf="deadlineTitleError" class="text-red-600 text-xs mt-1">
                {{ deadlineTitleError }}
              </p>
            </div>
            <div>
              <div class="flex gap-2">
                <input
                  type="date"
                  class="flex-1"
                  [(ngModel)]="deadlineDate"
                  [class.border-red-300]="deadlineDateError"
                  [class.bg-red-50]="deadlineDateError"
                />
                <ui-button
                  variant="primary"
                  (click)="addDeadline()"
                  class="whitespace-nowrap"
                  [disabled]="addingDeadline"
                >
                  <span *ngIf="!addingDeadline">Add</span>
                  <span *ngIf="addingDeadline" class="flex items-center gap-2">
                    <app-loading-spinner size="small" [show]="true"></app-loading-spinner>
                    Adding...
                  </span>
                </ui-button>
              </div>
              <p *ngIf="deadlineDateError" class="text-red-600 text-xs mt-1">
                {{ deadlineDateError }}
              </p>
            </div>
          </div>
        </div>
        <ul class="space-y-3">
          <li
            *ngFor="let d of caseItem?.deadlines"
            class="flex items-center justify-between p-3 bg-[rgb(var(--surface-muted))] rounded-lg"
          >
            <div class="flex-1">
              <span class="font-medium">{{ d.title }}</span>
              <div class="flex items-center gap-2 mt-1">
                <span
                  class="text-sm"
                  [class.text-red-600]="(d.date | deadlineStatus) === 'overdue'"
                  [class.font-semibold]="(d.date | deadlineStatus) === 'overdue'"
                  [class.text-amber-600]="(d.date | deadlineStatus) === 'upcoming'"
                  [class.font-medium]="(d.date | deadlineStatus) === 'upcoming'"
                  [class.text-[rgb(var(--text-muted))]]="(d.date | deadlineStatus) === 'normal'"
                >
                  {{ d.date | date: 'shortDate' }}
                </span>
                <span
                  class="text-xs px-2 py-0.5 rounded-full font-medium"
                  [class.bg-red-100]="(d.date | deadlineStatus) === 'overdue'"
                  [class.text-red-800]="(d.date | deadlineStatus) === 'overdue'"
                  [class.bg-amber-100]="(d.date | deadlineStatus) === 'upcoming'"
                  [class.text-amber-800]="(d.date | deadlineStatus) === 'upcoming'"
                  *ngIf="(d.date | deadlineStatus) !== 'normal'"
                >
                  {{ (d.date | deadlineStatus) === 'overdue' ? 'Overdue' : 'Upcoming' }}
                </span>
                <span class="text-xs text-[rgb(var(--text-muted))]">
                  ({{ d.date | relativeDate }})
                </span>
              </div>
            </div>
            <button
              class="text-sm text-red-600 hover:text-red-700 font-medium px-2"
              (click)="removeDeadline(d.id)"
            >
              Remove
            </button>
          </li>
          <li
            *ngIf="!caseItem?.deadlines || caseItem?.deadlines?.length === 0"
            class="text-sm text-[rgb(var(--text-muted))] text-center py-8"
          >
            <div class="flex flex-col items-center gap-2">
              <svg
                class="w-8 h-8 text-[rgb(var(--text-muted))] opacity-50"
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
              <p>No deadlines yet</p>
              <p class="text-xs opacity-75">Add your first deadline above</p>
            </div>
          </li>
        </ul>
      </ui-card>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <ui-card>
        <div class="mb-6">
          <h3 class="text-lg font-bold mb-4">Developments</h3>
          <div class="space-y-2">
            <textarea
              class="w-full"
              [(ngModel)]="developmentNote"
              placeholder="Enter development note..."
              rows="3"
            ></textarea>
            <ui-button
              variant="primary"
              (click)="addDevelopment()"
              [disabled]="addingDevelopment"
              class="w-full"
            >
              <span *ngIf="!addingDevelopment">Add Development</span>
              <span *ngIf="addingDevelopment" class="flex items-center gap-2">
                <app-loading-spinner size="small" [show]="true"></app-loading-spinner>
                Adding...
              </span>
            </ui-button>
          </div>
        </div>
        <ul class="space-y-3">
          <li
            *ngFor="let dev of caseItem?.developments"
            class="p-3 bg-[rgb(var(--surface-muted))] rounded-lg"
          >
            <div class="text-xs text-[rgb(var(--text-muted))] mb-1">
              {{ dev.date | date: 'short' }} ({{ dev.date | relativeDate }})
            </div>
            <div class="text-sm">{{ dev.note }}</div>
          </li>
          <li
            *ngIf="!caseItem?.developments || caseItem?.developments?.length === 0"
            class="text-sm text-[rgb(var(--text-muted))] text-center py-8"
          >
            <div class="flex flex-col items-center gap-2">
              <svg
                class="w-8 h-8 text-[rgb(var(--text-muted))] opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p>No developments yet</p>
              <p class="text-xs opacity-75">Add your first development above</p>
            </div>
          </li>
        </ul>
      </ui-card>
      <ui-card>
        <h3 class="text-lg font-bold mb-6">Court Rulings</h3>

        <!-- Ruling Form -->
        <div
          class="border border-[rgb(var(--border))] rounded-xl p-6 mb-6 bg-[rgb(var(--surface-muted))]"
        >
          <h4 class="font-bold mb-4 text-[rgb(var(--text))]">Main Info</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                >Case No <span class="text-red-500">*</span></label
              >
              <input
                type="text"
                [(ngModel)]="newRuling.caseNo"
                class="w-full"
                [class.border-red-300]="rulingCaseNoError"
                [class.bg-red-50]="rulingCaseNoError"
                placeholder="Enter case number"
              />
              <p *ngIf="rulingCaseNoError" class="text-red-600 text-xs mt-1">
                {{ rulingCaseNoError }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                >Case Type</label
              >
              <select [(ngModel)]="newRuling.caseType" class="w-full">
                <option value="Plaintiff">Plaintiff</option>
                <option value="Defendant">Defendant</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                >Court Type <span class="text-red-500">*</span></label
              >
              <select
                [(ngModel)]="selectedCourtTypeId"
                class="w-full"
                [class.border-red-300]="rulingCourtTypeError"
                [class.bg-red-50]="rulingCourtTypeError"
                (ngModelChange)="onCourtTypeChange()"
              >
                <option value="">Select court type</option>
                <option *ngFor="let ct of courts" [value]="ct.id">{{ ct.name }}</option>
              </select>
              <p *ngIf="rulingCourtTypeError" class="text-red-600 text-xs mt-1">
                {{ rulingCourtTypeError }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                >Court Level</label
              >
              <select [(ngModel)]="newRuling.courtLevel" class="w-full">
                <option value="">Select level</option>
                <option *ngFor="let lvl of availableLevels" [value]="lvl">
                  {{ levelLabel(lvl) }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                >Court City</label
              >
              <input
                type="text"
                [(ngModel)]="newRuling.courtCity"
                class="w-full"
                placeholder="Enter court city"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                >Filing Date</label
              >
              <input
                type="date"
                [(ngModel)]="newRuling.filingDate"
                class="w-full"
                [class.border-red-300]="rulingFilingDateError"
                [class.bg-red-50]="rulingFilingDateError"
              />
              <p *ngIf="rulingFilingDateError" class="text-red-600 text-xs mt-1">
                {{ rulingFilingDateError }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                >Filing No</label
              >
              <input
                type="text"
                [(ngModel)]="newRuling.filingNo"
                class="w-full"
                placeholder="Enter filing number"
              />
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                >Case Details</label
              >
              <textarea
                [(ngModel)]="newRuling.caseDetails"
                rows="3"
                class="w-full"
                placeholder="Enter case details"
              ></textarea>
            </div>
          </div>

          <div class="border-t border-[rgb(var(--border))] pt-6 mt-6">
            <h4 class="font-bold mb-4 text-[rgb(var(--text))]">Stage Info</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                  >Stage</label
                >
                <select [(ngModel)]="newRuling.stage" class="w-full">
                  <option value="primary">Primary</option>
                  <option value="appeal">Appeal</option>
                  <option value="cassation">Cassation</option>
                  <option value="execution">Execution</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                  >Stage No</label
                >
                <input type="number" [(ngModel)]="newRuling.stageNo" min="1" class="w-full" />
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                  >Ruling in favor of</label
                >
                <select [(ngModel)]="newRuling.rulingInFavorOf" class="w-full">
                  <option value="Company">Company</option>
                  <option value="Adversary">Adversary</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                  >Ruling Date</label
                >
                <input
                  type="date"
                  [(ngModel)]="newRuling.rulingDate"
                  class="w-full"
                  [class.border-red-300]="rulingRulingDateError"
                  [class.bg-red-50]="rulingRulingDateError"
                />
                <p *ngIf="rulingRulingDateError" class="text-red-600 text-xs mt-1">
                  {{ rulingRulingDateError }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                  >Court Fees</label
                >
                <input
                  type="number"
                  [(ngModel)]="newRuling.courtFees"
                  min="0"
                  step="0.01"
                  class="w-full"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                  >Legal Expenses</label
                >
                <input
                  type="number"
                  [(ngModel)]="newRuling.legalExpenses"
                  min="0"
                  step="0.01"
                  class="w-full"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                  >Translation Court Fees</label
                >
                <input
                  type="number"
                  [(ngModel)]="newRuling.translationCourtFees"
                  min="0"
                  step="0.01"
                  class="w-full"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                  >Court Fees in Cash</label
                >
                <input
                  type="number"
                  [(ngModel)]="newRuling.courtFeesInCash"
                  min="0"
                  step="0.01"
                  class="w-full"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                  >Expert Fees</label
                >
                <input
                  type="number"
                  [(ngModel)]="newRuling.expertFees"
                  min="0"
                  step="0.01"
                  class="w-full"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                  >Advocacy Fees</label
                >
                <input
                  type="number"
                  [(ngModel)]="newRuling.advocacyFees"
                  min="0"
                  step="0.01"
                  class="w-full"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                  >Other Expenses</label
                >
                <input
                  type="number"
                  [(ngModel)]="newRuling.otherExpenses"
                  min="0"
                  step="0.01"
                  class="w-full"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div class="border-t border-[rgb(var(--border))] pt-6 mt-6">
            <h4 class="font-bold mb-4 text-[rgb(var(--text))]">Adversary Info</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                  >Adversary Name</label
                >
                <input
                  type="text"
                  [(ngModel)]="newRuling.adversaryName"
                  class="w-full"
                  placeholder="Enter adversary name"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                  >Indemnity by Court Amount</label
                >
                <input
                  type="number"
                  [(ngModel)]="newRuling.indemnityByCourtAmount"
                  min="0"
                  step="0.01"
                  class="w-full"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <!-- Total Ruled Out Display -->
          <div
            class="mt-6 p-4 bg-[rgb(var(--primary))] bg-opacity-10 rounded-lg border border-[rgb(var(--primary))] border-opacity-20"
          >
            <div class="flex items-center justify-between">
              <span class="text-sm font-semibold text-[rgb(var(--text))]">Total Ruled Out</span>
              <span class="text-xl font-bold text-[rgb(var(--primary))]"
                >{{ getTotalRuledOut() | number }} SAR</span
              >
            </div>
            <p class="text-xs text-[rgb(var(--text-muted))] mt-1">
              Auto-calculated sum of all fees and indemnity
            </p>
          </div>

          <div class="flex justify-end pt-4 border-t border-[rgb(var(--border))]">
            <ui-button variant="primary" (click)="addRuling()" [disabled]="addingRuling">
              <span *ngIf="!addingRuling">Add Court Ruling</span>
              <span *ngIf="addingRuling" class="flex items-center gap-2">
                <app-loading-spinner size="small" [show]="true"></app-loading-spinner>
                Adding...
              </span>
            </ui-button>
          </div>
        </div>

        <!-- Existing Rulings List -->
        <div class="mt-6">
          <h4 class="font-bold mb-4 text-[rgb(var(--text))]">Existing Rulings</h4>
          <ul class="space-y-4">
            <li
              *ngFor="let r of caseItem?.rulings"
              class="border border-[rgb(var(--border))] rounded-xl p-5 bg-[rgb(var(--surface-muted))]"
            >
              <div
                class="flex items-center justify-between mb-4 pb-3 border-b border-[rgb(var(--border-light))]"
              >
                <div>
                  <span class="font-bold text-[rgb(var(--text))]"
                    >{{ r.stage | titlecase }} - Stage No: {{ r.stageNo }}</span
                  >
                  <span class="text-sm text-[rgb(var(--text-muted))] ml-3">{{
                    r.rulingDate | date: 'short'
                  }}</span>
                </div>
                <div class="flex items-center gap-2" *ngIf="editingRulingId !== r.id">
                  <button
                    (click)="startEditRuling(r)"
                    class="text-sm text-[rgb(var(--primary))] hover:text-[rgb(var(--primary-dark))] font-medium px-2"
                  >
                    Edit
                  </button>
                  <button
                    (click)="deleteRuling(r.id)"
                    class="text-sm text-red-600 hover:text-red-700 font-medium px-2"
                  >
                    Delete
                  </button>
                </div>
                <div class="flex items-center gap-2" *ngIf="editingRulingId === r.id">
                  <ui-button variant="ghost" (click)="cancelEditRuling()" class="text-sm">
                    Cancel
                  </ui-button>
                  <ui-button variant="primary" (click)="saveEditRuling(r.id)" class="text-sm">
                    Save
                  </ui-button>
                </div>
              </div>
              <div
                *ngIf="editingRulingId !== r.id"
                class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm"
              >
                <div>
                  <strong class="text-[rgb(var(--text))]">Case No:</strong>
                  <span class="text-[rgb(var(--text-muted))]">{{ r.caseNo }}</span>
                </div>
                <div>
                  <strong class="text-[rgb(var(--text))]">Case Type:</strong>
                  <span class="text-[rgb(var(--text-muted))]">{{ r.caseType }}</span>
                </div>
                <div>
                  <strong class="text-[rgb(var(--text))]">Ruling in favor of:</strong>
                  <span class="text-[rgb(var(--text-muted))]">{{ r.rulingInFavorOf }}</span>
                </div>
                <div>
                  <strong class="text-[rgb(var(--text))]">Adversary Name:</strong>
                  <span class="text-[rgb(var(--text-muted))]">{{ r.adversaryName || '-' }}</span>
                </div>
                <div class="md:col-span-2">
                  <strong class="text-[rgb(var(--text))]">Indemnity by Court Amount:</strong>
                  <span class="text-[rgb(var(--primary))] font-semibold"
                    >{{ r.indemnityByCourtAmount | number }} SAR</span
                  >
                </div>
                <div class="md:col-span-2 pt-2 border-t border-[rgb(var(--border-light))]">
                  <div class="text-xs text-[rgb(var(--text-muted))] space-y-1">
                    <div>
                      Court Fees: <span class="font-medium">{{ r.courtFees | number }} SAR</span>
                    </div>
                    <div>
                      Legal Expenses:
                      <span class="font-medium">{{ r.legalExpenses | number }} SAR</span>
                    </div>
                    <div>
                      Expert Fees: <span class="font-medium">{{ r.expertFees | number }} SAR</span>
                    </div>
                  </div>
                </div>
                <div
                  class="md:col-span-2 mt-2 p-3 bg-[rgb(var(--primary))] bg-opacity-10 rounded-lg"
                >
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-semibold text-[rgb(var(--text))]"
                      >Total Ruled Out</span
                    >
                    <span class="text-lg font-bold text-[rgb(var(--primary))]"
                      >{{ getRulingTotal(r) | number }} SAR</span
                    >
                  </div>
                </div>
              </div>
              <!-- Edit Form -->
              <div *ngIf="editingRulingId === r.id" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                      >Case No</label
                    >
                    <input
                      type="text"
                      [(ngModel)]="editingRuling.caseNo"
                      class="w-full"
                      placeholder="Enter case number"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                      >Case Type</label
                    >
                    <select [(ngModel)]="editingRuling.caseType" class="w-full">
                      <option value="Plaintiff">Plaintiff</option>
                      <option value="Defendant">Defendant</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                      >Court Type</label
                    >
                    <input
                      type="text"
                      [(ngModel)]="editingRuling.courtType"
                      class="w-full"
                      placeholder="Enter court type"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                      >Ruling Date</label
                    >
                    <input type="date" [(ngModel)]="editingRuling.rulingDate" class="w-full" />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                      >Ruling in favor of</label
                    >
                    <select [(ngModel)]="editingRuling.rulingInFavorOf" class="w-full">
                      <option value="Company">Company</option>
                      <option value="Adversary">Adversary</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                      >Adversary Name</label
                    >
                    <input
                      type="text"
                      [(ngModel)]="editingRuling.adversaryName"
                      class="w-full"
                      placeholder="Enter adversary name"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                      >Indemnity by Court Amount</label
                    >
                    <input
                      type="number"
                      [(ngModel)]="editingRuling.indemnityByCourtAmount"
                      min="0"
                      step="0.01"
                      class="w-full"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </li>
            <li
              *ngIf="!caseItem?.rulings || caseItem?.rulings?.length === 0"
              class="text-sm text-[rgb(var(--text-muted))] text-center py-12 bg-[rgb(var(--surface-muted))] rounded-lg"
            >
              <div class="flex flex-col items-center gap-3">
                <svg
                  class="w-12 h-12 text-[rgb(var(--text-muted))] opacity-50"
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
                <div>
                  <p class="font-medium mb-1">No rulings yet</p>
                  <p class="text-xs opacity-75">Add your first court ruling above</p>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </ui-card>
    </div>
  `,
})
export class CaseDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cases = inject(CasesService);
  private readonly toast = inject(ToastService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly exportService = inject(ExportService);
  private readonly undoRedo = inject(UndoRedoService);
  private readonly caseTracking = inject(CaseTrackingService);
  private readonly businessSettlements = inject(BusinessSettlementService);
  private readonly lawyersService = inject(LawyersService);
  private readonly courtsService = inject(CourtsService);
  protected caseItem: CaseItem | undefined;
  protected title = '';
  protected client = '';
  protected status: 'open' | 'pending' | 'closed' | 'on-hold' = 'open';
  protected taskTitle = '';
  protected deadlineTitle = '';
  protected deadlineDate = '';
  protected titleError = '';
  protected clientError = '';
  protected deadlineTitleError = '';
  protected deadlineDateError = '';
  protected rulingCaseNoError = '';
  protected rulingCourtTypeError = '';
  protected rulingFilingDateError = '';
  protected rulingRulingDateError = '';
  protected saving = false;
  protected claimant = '';
  protected beneficiary = '';
  protected initialHearingDate = '';
  // Claimant demographics
  protected demographics: ClaimantDemographics = {
    nationality: '',
    sex: '',
    maritalStatus: '',
    profession: '',
    age: 0,
    dependents: 0,
  };
  protected showDemographics = false;
  // Damage type and disability metrics
  protected damageType: DamageType | '' = '';
  protected disabilityMetrics: DisabilityMetrics = {
    moralPercent: 0,
    physicalPercent: 0,
  };
  protected addingTask = false;
  protected addingDeadline = false;
  protected addingRuling = false;
  protected editingRulingId: string | null = null;
  protected editingRuling: Partial<CaseRuling> = {};
  protected developmentNote = '';
  protected addingDevelopment = false;
  protected breadcrumbItems: Array<{ label: string; route?: string | any[] }> = [];
  protected autoSaveStatus: 'saved' | 'saving' | 'unsaved' = 'saved';
  protected lawyers: Lawyer[] = [];
  protected companyLawyerId = '';
  protected courts: CourtType[] = [];
  protected selectedCourtTypeId = '';
  protected availableLevels: CourtLevel[] = [];
  private autoSaveSubscription?: Subscription;
  private lastSavedData: LastSavedData = {
    title: '',
    client: '',
    status: '',
    companyLawyerId: '',
    claimant: '',
    beneficiary: '',
    initialHearingDate: '',
  };
  protected newRuling = {
    stage: 'primary' as Exclude<CaseStage, 'settled'>,
    caseNo: '',
    caseType: 'Plaintiff' as CaseType,
    courtType: '',
    courtLevel: '',
    courtCity: '',
    caseDetails: '',
    filingDate: new Date().toISOString().slice(0, 10),
    filingNo: '',
    stageNo: 1,
    rulingInFavorOf: 'Company' as RulingInFavorOf,
    rulingDate: new Date().toISOString().slice(0, 10),
    courtFees: 0,
    legalExpenses: 0,
    translationCourtFees: 0,
    courtFeesInCash: 0,
    expertFees: 0,
    advocacyFees: 0,
    otherExpenses: 0,
    adversaryName: '',
    indemnityByCourtAmount: 0,
  };

  constructor() {
    this.lawyers = this.lawyersService.list();
    this.courts = this.courtsService.list();
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.caseItem = this.cases.getById(id);
      if (this.caseItem) {
        this.title = this.caseItem.title;
        this.client = this.caseItem.client;
        this.status = this.caseItem.status;
        this.companyLawyerId = this.caseItem.companyLawyerId || '';
        this.claimant = this.caseItem.claimant || '';
        this.beneficiary = this.caseItem.beneficiary || '';
        this.initialHearingDate = this.caseItem.initialHearingDate || '';
        this.demographics = this.caseItem.claimantDemographics || {
          nationality: '',
          sex: '',
          maritalStatus: '',
          profession: '',
          age: 0,
          dependents: 0,
        };
        this.damageType = this.caseItem.damageType || '';
        this.disabilityMetrics = this.caseItem.disabilityMetrics || {
          moralPercent: 0,
          physicalPercent: 0,
        };
        this.breadcrumbItems = [
          { label: 'Cases', route: '/legal/dashboard' },
          { label: this.caseItem.title },
        ];
        this.lastSavedData = {
          title: this.caseItem.title,
          client: this.caseItem.client,
          status: this.caseItem.status,
          companyLawyerId: this.caseItem.companyLawyerId || '',
          claimant: this.caseItem.claimant || '',
          beneficiary: this.caseItem.beneficiary || '',
          initialHearingDate: this.caseItem.initialHearingDate || '',
        };
        // Set the current case in tracking service
        if (this.caseItem.unifiedCaseId) {
          this.caseTracking.setCurrentCase(this.caseItem.unifiedCaseId);
          this.caseTracking.linkEntityToCase(this.caseItem.unifiedCaseId, 'case', this.caseItem.id);
          this.caseTracking.upsertUnifiedCase({
            unifiedCaseId: this.caseItem.unifiedCaseId,
            caseId: this.caseItem.id,
            title: this.caseItem.title,
            client: this.caseItem.client,
          });
        } else {
          // Generate unified case ID if missing
          const unifiedCaseId = this.caseTracking.generateUnifiedCaseId();
          this.caseTracking.setCurrentCase(unifiedCaseId);
          this.caseTracking.linkEntityToCase(unifiedCaseId, 'case', this.caseItem.id);
          this.caseTracking.upsertUnifiedCase({
            unifiedCaseId,
            caseId: this.caseItem.id,
            title: this.caseItem.title,
            client: this.caseItem.client,
          });
        }
      }
    } else {
      this.breadcrumbItems = [{ label: 'Cases', route: '/legal/dashboard' }, { label: 'New Case' }];
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    // Ctrl+S or Cmd+S to save
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();
      if (this.isFormValid() && !this.saving) {
        this.save();
      }
    }
    // Esc to cancel/go back
    if (event.key === 'Escape' && !this.editingRulingId) {
      this.goBack();
    }
  }

  ngOnInit(): void {
    // Initialize auto-save
    if (this.caseItem) {
      this.lastSavedData = {
        title: this.caseItem.title,
        client: this.caseItem.client,
        status: this.caseItem.status,
        companyLawyerId: this.caseItem.companyLawyerId || '',
        claimant: this.caseItem.claimant || '',
        beneficiary: this.caseItem.beneficiary || '',
        initialHearingDate: this.caseItem.initialHearingDate || '',
      };
    }
    this.onCourtTypeChange();
    // Auto-save every 30 seconds
    this.autoSaveSubscription = interval(30000).subscribe(() => {
      this.autoSave();
    });
  }

  ngOnDestroy(): void {
    this.autoSaveSubscription?.unsubscribe();
  }

  private autoSave(): void {
    if (!this.caseItem || this.saving) return;
    // Check if data has changed
    const hasChanges =
      this.title.trim() !== this.lastSavedData.title ||
      this.client.trim() !== this.lastSavedData.client ||
      this.status !== this.lastSavedData.status ||
      this.companyLawyerId !== this.lastSavedData.companyLawyerId ||
      this.claimant.trim() !== this.lastSavedData.claimant ||
      this.beneficiary.trim() !== this.lastSavedData.beneficiary ||
      this.initialHearingDate !== this.lastSavedData.initialHearingDate;
    if (!hasChanges) {
      this.autoSaveStatus = 'saved';
      return;
    }
    // Validate before auto-saving
    this.validateForm();
    if (this.titleError || this.clientError) {
      this.autoSaveStatus = 'unsaved';
      return;
    }
    // Auto-save
    this.autoSaveStatus = 'saving';
    try {
      const lawyer = this.getSelectedLawyer();
      this.cases.updateMeta(this.caseItem.id, {
        title: this.title.trim(),
        client: this.client.trim(),
        status: (this.status as any) === 'on-hold' ? 'pending' : (this.status as any),
        companyLawyerId: this.companyLawyerId || undefined,
        companyLawyerName: lawyer?.name,
        claimant: this.claimant.trim() || undefined,
        beneficiary: this.beneficiary.trim() || undefined,
        initialHearingDate: this.initialHearingDate || undefined,
      });
      this.caseItem = this.cases.getById(this.caseItem.id);
      if (this.caseItem) {
        this.lastSavedData = {
          title: this.caseItem.title,
          client: this.caseItem.client,
          status: this.caseItem.status,
          companyLawyerId: this.caseItem.companyLawyerId || '',
          claimant: this.caseItem.claimant || '',
          beneficiary: this.caseItem.beneficiary || '',
          initialHearingDate: this.caseItem.initialHearingDate || '',
        };
      }
      this.autoSaveStatus = 'saved';
    } catch (error) {
      this.autoSaveStatus = 'unsaved';
      console.error('Error auto-saving:', error);
    }
  }

  goBack(): void {
    this.router.navigate(['/legal/dashboard']);
  }

  isFormValid(): boolean {
    this.validateForm();
    return !this.titleError && !this.clientError;
  }

  validateForm(): void {
    this.titleError = '';
    this.clientError = '';

    if (!this.title.trim()) {
      this.titleError = 'Title is required';
    }

    if (!this.client.trim()) {
      this.clientError = 'Client is required';
    }
  }

  async save(): Promise<void> {
    this.validateForm();
    if (this.titleError || this.clientError) {
      this.toast.error('Please fix the errors before saving');
      return;
    }

    this.saving = true;
    try {
      const lawyer = this.getSelectedLawyer();
      if (!this.caseItem) {
        // Create new case
        const newCase = this.cases.create({
          title: this.title.trim(),
          client: this.client.trim(),
          claimant: this.claimant.trim() || undefined,
          beneficiary: this.beneficiary.trim() || undefined,
          initialHearingDate: this.initialHearingDate || undefined,
          companyLawyerId: this.companyLawyerId || undefined,
          companyLawyerName: lawyer?.name,
        });
        // Update status if not default
        if (this.status !== 'open') {
          this.cases.updateMeta(newCase.id, {
            status: (this.status as any) === 'on-hold' ? 'pending' : (this.status as any),
          });
        }
        this.toast.success('Case created successfully');
        // Navigate to the new case detail page
        this.router.navigate(['/legal/case', newCase.id]);
        this.caseItem = this.cases.getById(newCase.id);
        if (this.caseItem) {
          this.title = this.caseItem.title;
          this.client = this.caseItem.client;
          this.status = this.caseItem.status;
          this.companyLawyerId = this.caseItem.companyLawyerId || '';
        }
      } else {
        // Update existing case
        this.cases.updateMeta(this.caseItem.id, {
          title: this.title.trim(),
          client: this.client.trim(),
          status: (this.status as any) === 'on-hold' ? 'pending' : (this.status as any),
          companyLawyerId: this.companyLawyerId || undefined,
          companyLawyerName: lawyer?.name,
          claimant: this.claimant.trim() || undefined,
          beneficiary: this.beneficiary.trim() || undefined,
          initialHearingDate: this.initialHearingDate || undefined,
          claimantDemographics: this.demographics,
          damageType: this.damageType || undefined,
          disabilityMetrics: this.damageType === 'Disability' ? this.disabilityMetrics : undefined,
        });
        const oldData = {
          title: this.caseItem.title,
          client: this.caseItem.client,
          status: this.caseItem.status,
        };
        this.cases.updateMeta(this.caseItem.id, {
          title: this.title.trim(),
          client: this.client.trim(),
          status: (this.status as any) === 'on-hold' ? 'pending' : (this.status as any),
        });
        this.toast.success('Case updated successfully');
        this.caseItem = this.cases.getById(this.caseItem.id);
        if (this.caseItem) {
          this.lastSavedData = {
            title: this.caseItem.title,
            client: this.caseItem.client,
            status: this.caseItem.status,
            companyLawyerId: this.caseItem.companyLawyerId || '',
            claimant: this.caseItem.claimant || '',
            beneficiary: this.caseItem.beneficiary || '',
            initialHearingDate: this.caseItem.initialHearingDate || '',
          };
          // Record undo action
          this.undoRedo.record({
            type: 'update-case',
            description: 'Update case',
            undo: () => {
              this.cases.updateMeta(this.caseItem!.id, oldData);
              this.caseItem = this.cases.getById(this.caseItem!.id);
              if (this.caseItem) {
                this.title = this.caseItem.title;
                this.client = this.caseItem.client;
                this.status = this.caseItem.status;
              }
            },
            redo: () => {
              this.cases.updateMeta(this.caseItem!.id, {
                title: this.title.trim(),
                client: this.client.trim(),
                status: (this.status as any) === 'on-hold' ? 'pending' : (this.status as any),
              });
              this.caseItem = this.cases.getById(this.caseItem!.id);
              if (this.caseItem) {
                this.title = this.caseItem.title;
                this.client = this.caseItem.client;
                this.status = this.caseItem.status;
              }
            },
          });
        }
        this.autoSaveStatus = 'saved';
      }
    } catch (error) {
      this.toast.error('Failed to save case');
      console.error('Error saving case:', error);
    } finally {
      this.saving = false;
    }
  }

  getLegalStatusValue(): number {
    return this.caseItem?.legalStatus ?? 1; // Default to 1 (To Legal Department)
  }

  getLegalStatusLabel(): string {
    const status = this.getLegalStatusValue();
    switch (status) {
      case 0:
        return 'Normal';
      case 1:
        return 'To Legal Department';
      case 3:
        return 'In Execution';
      case 4:
        return 'Settled';
      default:
        return 'Unknown';
    }
  }

  private getSelectedLawyer(): Lawyer | undefined {
    return this.lawyers.find((l) => l.id === this.companyLawyerId);
  }

  getCompanyLawyerName(): string {
    const found = this.getSelectedLawyer();
    return found ? found.name : '';
  }

  getCompanyLawyerDisplay(): string {
    const found = this.getSelectedLawyer();
    return found ? `${found.lawyerNumber} - ${found.name}` : '';
  }

  onCourtTypeChange(): void {
    const ct = this.courts.find((c) => c.id === this.selectedCourtTypeId);
    this.availableLevels = ct ? [...ct.levels] : [];
    this.newRuling.courtType = ct ? ct.name : '';
    // Reset level if not in available levels
    if (!this.availableLevels.includes(this.newRuling.courtLevel as CourtLevel)) {
      this.newRuling.courtLevel = this.availableLevels[0] || '';
    }
  }

  levelLabel(level: CourtLevel): string {
    switch (level) {
      case 'primary':
        return 'Primary Court';
      case 'appeal':
        return 'Appeal Court';
      case 'cassation':
        return 'Cassation Court';
      case 'execution':
        return 'Execution Court';
      default:
        return level;
    }
  }

  getTotalRuledOut(): number {
    return (
      (this.newRuling.courtFees || 0) +
      (this.newRuling.courtFeesInCash || 0) +
      (this.newRuling.legalExpenses || 0) +
      (this.newRuling.expertFees || 0) +
      (this.newRuling.translationCourtFees || 0) +
      (this.newRuling.advocacyFees || 0) +
      (this.newRuling.otherExpenses || 0) +
      (this.newRuling.indemnityByCourtAmount || 0)
    );
  }

  getRulingTotal(ruling: CaseRuling): number {
    return (
      (ruling.courtFees || 0) +
      (ruling.courtFeesInCash || 0) +
      (ruling.legalExpenses || 0) +
      (ruling.expertFees || 0) +
      (ruling.translationCourtFees || 0) +
      (ruling.advocacyFees || 0) +
      (ruling.otherExpenses || 0) +
      (ruling.indemnityByCourtAmount || 0)
    );
  }

  get settlement(): BusinessSettlement | undefined {
    return this.caseItem ? this.businessSettlements.getByCaseId(this.caseItem.id) : undefined;
  }

  createSettlement(): void {
    if (!this.caseItem) return;
    const created = this.businessSettlements.create({
      departmentAmount: 0,
      legalDepartmentAmount: 0,
      managementAmount: 0,
      adversaryAmount: 0,
      amountOfAmicableAgreement: 0,
      linkedCaseId: this.caseItem.id,
    });
    this.toast.success('Settlement created');
    this.router.navigate(['/settlements', created.id]);
  }

  nextStage(): void {
    if (!this.caseItem) return;
    try {
      this.cases.advanceStage(this.caseItem.id);
      this.caseItem = this.cases.getById(this.caseItem.id);
      this.toast.success('Case stage advanced');
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to advance case stage';
      this.toast.error(errorMessage);
      console.error('Error advancing stage:', error);
    }
  }

  settle(): void {
    if (!this.caseItem) return;
    try {
      const currentStage = this.caseItem.stage || 'primary';
      this.cases.settleCase(this.caseItem.id, currentStage as CaseStage);
      this.caseItem = this.cases.getById(this.caseItem.id);
      this.toast.success('Case settled successfully');
    } catch (error) {
      this.toast.error('Failed to settle case');
      console.error('Error settling case:', error);
    }
  }

  execute(): void {
    if (!this.caseItem) return;
    try {
      // Execute case moves to execution stage and creates execution case record
      this.cases.executeCase(this.caseItem.id);
      this.caseItem = this.cases.getById(this.caseItem.id);
      this.toast.success('Case moved to execution stage');
    } catch (error) {
      this.toast.error('Failed to execute case');
      console.error('Error executing case:', error);
    }
  }

  async addTask(): Promise<void> {
    if (!this.caseItem) {
      this.toast.warning('Please save the case first before adding tasks');
      return;
    }
    const t = this.taskTitle.trim();
    if (!t) {
      this.toast.warning('Task title is required');
      return;
    }
    this.addingTask = true;
    try {
      const task = this.cases.addTask(this.caseItem.id, t);
      this.caseItem = this.cases.getById(this.caseItem.id);
      this.taskTitle = '';
      this.toast.success('Task added successfully');
      // Record undo action
      if (task) {
        this.undoRedo.record({
          type: 'add-task',
          description: 'Add task',
          undo: () => {
            this.cases.removeTask(this.caseItem!.id, task.id);
            this.caseItem = this.cases.getById(this.caseItem!.id);
          },
          redo: () => {
            this.cases.addTask(this.caseItem!.id, t);
            this.caseItem = this.cases.getById(this.caseItem!.id);
          },
        });
      }
    } catch (error) {
      this.toast.error('Failed to add task');
      console.error('Error adding task:', error);
    } finally {
      this.addingTask = false;
    }
  }

  toggleTask(taskId: string): void {
    if (!this.caseItem) return;
    this.cases.toggleTask(this.caseItem.id, taskId);
    this.caseItem = this.cases.getById(this.caseItem.id);
  }

  async removeTask(taskId: string): Promise<void> {
    if (!this.caseItem) return;
    const task = this.caseItem.tasks.find((t) => t.id === taskId);
    const confirmed = await this.confirmDialog.confirm({
      title: 'Remove Task',
      message: `Are you sure you want to remove the task "${task?.title || 'this task'}"?`,
      confirmText: 'Remove',
      cancelText: 'Cancel',
      type: 'danger',
    });
    if (!confirmed) return;
    try {
      this.cases.removeTask(this.caseItem.id, taskId);
      this.caseItem = this.cases.getById(this.caseItem.id);
      this.toast.success('Task removed');
      // Record undo action
      if (task) {
        this.undoRedo.record({
          type: 'remove-task',
          description: 'Remove task',
          undo: () => {
            this.cases.addTask(this.caseItem!.id, task.title);
            this.caseItem = this.cases.getById(this.caseItem!.id);
          },
          redo: () => {
            this.cases.removeTask(this.caseItem!.id, taskId);
            this.caseItem = this.cases.getById(this.caseItem!.id);
          },
        });
      }
    } catch (error) {
      this.toast.error('Failed to remove task');
      console.error('Error removing task:', error);
    }
  }

  validateDeadline(): void {
    this.deadlineTitleError = '';
    this.deadlineDateError = '';

    if (!this.deadlineTitle.trim()) {
      this.deadlineTitleError = 'Deadline title is required';
    }

    if (!this.deadlineDate) {
      this.deadlineDateError = 'Deadline date is required';
    } else {
      const deadlineDate = new Date(this.deadlineDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (deadlineDate < today) {
        this.deadlineDateError = 'Deadline date must be in the future';
      }
    }
  }

  async addDeadline(): Promise<void> {
    if (!this.caseItem) {
      this.toast.warning('Please save the case first before adding deadlines');
      return;
    }
    this.validateDeadline();
    if (this.deadlineTitleError || this.deadlineDateError) {
      this.toast.error('Please fix the errors before adding deadline');
      return;
    }
    this.addingDeadline = true;
    try {
      this.cases.addDeadline(this.caseItem.id, this.deadlineTitle.trim(), this.deadlineDate);
      this.caseItem = this.cases.getById(this.caseItem.id);
      this.deadlineTitle = '';
      this.deadlineDate = '';
      this.deadlineTitleError = '';
      this.deadlineDateError = '';
      this.toast.success('Deadline added successfully');
    } catch (error) {
      this.toast.error('Failed to add deadline');
      console.error('Error adding deadline:', error);
    } finally {
      this.addingDeadline = false;
    }
  }

  async removeDeadline(deadlineId: string): Promise<void> {
    if (!this.caseItem) return;
    const deadline = this.caseItem.deadlines.find((d) => d.id === deadlineId);
    const confirmed = await this.confirmDialog.confirm({
      title: 'Remove Deadline',
      message: `Are you sure you want to remove the deadline "${deadline?.title || 'this deadline'}"?`,
      confirmText: 'Remove',
      cancelText: 'Cancel',
      type: 'danger',
    });
    if (!confirmed) return;
    try {
      this.cases.removeDeadline(this.caseItem.id, deadlineId);
      this.caseItem = this.cases.getById(this.caseItem.id);
      this.toast.success('Deadline removed');
    } catch (error) {
      this.toast.error('Failed to remove deadline');
      console.error('Error removing deadline:', error);
    }
  }

  validateRuling(): void {
    this.rulingCaseNoError = '';
    this.rulingCourtTypeError = '';
    this.rulingFilingDateError = '';
    this.rulingRulingDateError = '';

    if (!this.newRuling.caseNo) {
      this.newRuling.caseNo = this.caseItem?.caseNumber || this.caseItem?.baseCaseNumber || '';
    }
    if (this.selectedCourtTypeId && !this.newRuling.courtType) {
      const ct = this.courts.find((c) => c.id === this.selectedCourtTypeId);
      if (ct) {
        this.newRuling.courtType = ct.name;
      }
    }
    if (!this.newRuling.courtLevel && this.availableLevels.length > 0) {
      this.newRuling.courtLevel = this.availableLevels[0];
    }

    if (!this.newRuling.caseNo.trim()) {
      this.rulingCaseNoError = 'Case number is required';
    }

    if (!this.newRuling.courtType.trim()) {
      this.rulingCourtTypeError = 'Court type is required';
    }

    if (this.newRuling.filingDate) {
      const filingDate = new Date(this.newRuling.filingDate);
      if (isNaN(filingDate.getTime())) {
        this.rulingFilingDateError = 'Invalid filing date';
      }
    }

    if (this.newRuling.rulingDate) {
      const rulingDate = new Date(this.newRuling.rulingDate);
      if (isNaN(rulingDate.getTime())) {
        this.rulingRulingDateError = 'Invalid ruling date';
      }
    }
  }

  async addRuling(): Promise<void> {
    if (!this.caseItem) {
      this.toast.warning('Please save the case first before adding rulings');
      return;
    }
    this.validateRuling();
    if (
      this.rulingCaseNoError ||
      this.rulingCourtTypeError ||
      this.rulingFilingDateError ||
      this.rulingRulingDateError
    ) {
      this.toast.error('Please fix the errors before adding ruling');
      return;
    }

    this.addingRuling = true;
    try {
      this.cases.addRuling(this.caseItem.id, {
        stage: this.newRuling.stage,
        caseNo: this.newRuling.caseNo,
        caseType: this.newRuling.caseType,
        courtType: this.newRuling.courtType,
        courtLevel: this.newRuling.courtLevel,
        courtCity: this.newRuling.courtCity,
        caseDetails: this.newRuling.caseDetails,
        filingDate: this.newRuling.filingDate,
        filingNo: this.newRuling.filingNo,
        stageNo: this.newRuling.stageNo,
        rulingInFavorOf: this.newRuling.rulingInFavorOf,
        rulingDate: this.newRuling.rulingDate,
        courtFees: this.newRuling.courtFees,
        legalExpenses: this.newRuling.legalExpenses,
        translationCourtFees: this.newRuling.translationCourtFees,
        courtFeesInCash: this.newRuling.courtFeesInCash,
        expertFees: this.newRuling.expertFees,
        advocacyFees: this.newRuling.advocacyFees,
        otherExpenses: this.newRuling.otherExpenses,
        adversaryName: this.newRuling.adversaryName,
        indemnityByCourtAmount: this.newRuling.indemnityByCourtAmount,
      });

      this.caseItem = this.cases.getById(this.caseItem.id);
      this.toast.success('Court ruling added successfully');
      // Reset form
      this.newRuling = {
        stage: 'primary' as Exclude<CaseStage, 'settled'>,
        caseNo: '',
        caseType: 'Plaintiff' as CaseType,
        courtType: '',
        courtLevel: '',
        courtCity: '',
        caseDetails: '',
        filingDate: new Date().toISOString().slice(0, 10),
        filingNo: '',
        stageNo: 1,
        rulingInFavorOf: 'Company' as RulingInFavorOf,
        rulingDate: new Date().toISOString().slice(0, 10),
        courtFees: 0,
        legalExpenses: 0,
        translationCourtFees: 0,
        courtFeesInCash: 0,
        expertFees: 0,
        advocacyFees: 0,
        otherExpenses: 0,
        adversaryName: '',
        indemnityByCourtAmount: 0,
      };
      // Clear errors
      this.rulingCaseNoError = '';
      this.rulingCourtTypeError = '';
      this.rulingFilingDateError = '';
      this.rulingRulingDateError = '';
    } catch (error) {
      this.toast.error('Failed to add court ruling');
      console.error('Error adding ruling:', error);
    } finally {
      this.addingRuling = false;
    }
  }

  startEditRuling(ruling: CaseRuling): void {
    this.editingRulingId = ruling.id;
    this.editingRuling = {
      caseNo: ruling.caseNo,
      caseType: ruling.caseType,
      courtType: ruling.courtType,
      rulingDate: ruling.rulingDate,
      rulingInFavorOf: ruling.rulingInFavorOf,
      adversaryName: ruling.adversaryName,
      indemnityByCourtAmount: ruling.indemnityByCourtAmount,
    };
  }

  cancelEditRuling(): void {
    this.editingRulingId = null;
    this.editingRuling = {};
  }

  saveEditRuling(rulingId: string): void {
    if (!this.caseItem) return;
    try {
      this.cases.updateRuling(this.caseItem.id, rulingId, this.editingRuling);
      this.caseItem = this.cases.getById(this.caseItem.id);
      this.editingRulingId = null;
      this.editingRuling = {};
      this.toast.success('Court ruling updated successfully');
    } catch (error) {
      this.toast.error('Failed to update court ruling');
      console.error('Error updating ruling:', error);
    }
  }

  async deleteRuling(rulingId: string): Promise<void> {
    if (!this.caseItem) return;
    const ruling = this.caseItem.rulings?.find((r) => r.id === rulingId);
    const confirmed = await this.confirmDialog.confirm({
      title: 'Delete Court Ruling',
      message: `Are you sure you want to delete the ruling for case "${ruling?.caseNo || 'this ruling'}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
    });
    if (!confirmed) return;
    try {
      this.cases.deleteRuling(this.caseItem.id, rulingId);
      this.caseItem = this.cases.getById(this.caseItem.id);
      this.toast.success('Court ruling deleted successfully');
    } catch (error) {
      this.toast.error('Failed to delete court ruling');
      console.error('Error deleting ruling:', error);
    }
  }

  async addDevelopment(): Promise<void> {
    if (!this.caseItem) {
      this.toast.warning('Please save the case first before adding developments');
      return;
    }
    const note = this.developmentNote.trim();
    if (!note) {
      this.toast.warning('Development note is required');
      return;
    }
    this.addingDevelopment = true;
    try {
      this.cases.addDevelopment(this.caseItem.id, note);
      this.caseItem = this.cases.getById(this.caseItem.id);
      this.developmentNote = '';
      this.toast.success('Development added successfully');
    } catch (error) {
      this.toast.error('Failed to add development');
      console.error('Error adding development:', error);
    } finally {
      this.addingDevelopment = false;
    }
  }

  exportCase(): void {
    if (!this.caseItem) return;
    try {
      this.exportService.exportCaseDetailsToCSV(this.caseItem);
      this.toast.success('Case exported successfully');
    } catch (error) {
      this.toast.error('Failed to export case');
      console.error('Error exporting case:', error);
    }
  }
}
