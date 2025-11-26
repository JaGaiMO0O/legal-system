import { Component, inject, HostListener, OnInit, OnDestroy } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UIButtonComponent } from '../../shared/components/ui/button.component';
import { UICardComponent } from '../../shared/components/ui/card.component';
import { FormsModule } from '@angular/forms';
import {
  CasesService,
  CaseItem,
  CaseStage,
  CaseType,
  RulingInFavorOf,
  CaseRuling,
} from '../../shared/services/cases.service';
import { TranslateModule } from '@ngx-translate/core';
import { ToastService } from '../../shared/services/toast.service';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { RelativeDatePipe } from '../../shared/pipes/relative-date.pipe';
import { DeadlineStatusPipe } from '../../shared/pipes/deadline-status.pipe';
import { ExportService } from '../../shared/services/export.service';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { UndoRedoService } from '../../shared/services/undo-redo.service';

@Component({
  standalone: true,
  selector: 'app-case-detail',
  imports: [
    CommonModule,
    UIButtonComponent,
    UICardComponent,
    FormsModule,
    TranslateModule,
    LoadingSpinnerComponent,
    RelativeDatePipe,
    DeadlineStatusPipe,
    BreadcrumbComponent,
  ],
  template: `
    <app-breadcrumb
      [items]="breadcrumbItems"
    ></app-breadcrumb>
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
          <ui-button variant="ghost" (click)="nextStage()" class="text-sm"> Next Court </ui-button>
          <ui-button
            variant="primary"
            (click)="execute()"
            *ngIf="caseItem?.stage === 'execution'"
            class="text-sm"
          >
            Execute Case
          </ui-button>
          <ui-button
            variant="ghost"
            (click)="exportCase()"
            *ngIf="caseItem"
            class="text-sm"
          >
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
    <ui-card>
      <h3 class="text-lg font-bold mb-6">Case Information</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">Case ID</label>
          <input
            type="text"
            [value]="caseItem?.id || 'Will be generated'"
            readonly
            class="w-full bg-[rgb(var(--surface-muted))] cursor-not-allowed"
          />
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
        <div class="md:col-span-2">
          <label
            for="case-title"
            class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
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
          <p
            *ngIf="titleError"
            id="title-error"
            class="text-red-600 text-xs mt-1"
            role="alert"
          >
            {{ titleError }}
          </p>
        </div>
        <div class="md:col-span-2">
          <label
            for="case-client"
            class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
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
          <p
            *ngIf="clientError"
            id="client-error"
            class="text-red-600 text-xs mt-1"
            role="alert"
          >
            {{ clientError }}
          </p>
        </div>
      </div>
      <div class="mt-8 pt-6 border-t border-[rgb(var(--border-light))] flex items-center justify-between">
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
            <app-loading-spinner size="small" show="true"></app-loading-spinner>
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
              <app-loading-spinner size="small" show="true"></app-loading-spinner>
              Saving...
            </span>
          </ui-button>
        </div>
      </div>
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
                <app-loading-spinner size="small" show="true"></app-loading-spinner>
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
              <p *ngIf="deadlineTitleError" class="text-red-600 text-xs mt-1">{{ deadlineTitleError }}</p>
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
                    <app-loading-spinner size="small" show="true"></app-loading-spinner>
                    Adding...
                  </span>
                </ui-button>
              </div>
              <p *ngIf="deadlineDateError" class="text-red-600 text-xs mt-1">{{ deadlineDateError }}</p>
            </div>
              <ui-button variant="primary" (click)="addDeadline()" class="whitespace-nowrap"
                >Add</ui-button
              >
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
                <app-loading-spinner size="small" show="true"></app-loading-spinner>
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
              <p *ngIf="rulingCaseNoError" class="text-red-600 text-xs mt-1">{{ rulingCaseNoError }}</p>
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
              <input
                type="text"
                [(ngModel)]="newRuling.courtType"
                class="w-full"
                [class.border-red-300]="rulingCourtTypeError"
                [class.bg-red-50]="rulingCourtTypeError"
                placeholder="Enter court type"
              />
              <p *ngIf="rulingCourtTypeError" class="text-red-600 text-xs mt-1">{{ rulingCourtTypeError }}</p>
            </div>
            <div>
              <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                >Court Level</label
              >
              <input
                type="text"
                [(ngModel)]="newRuling.courtLevel"
                class="w-full"
                placeholder="Enter court level"
              />
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
              <p *ngIf="rulingFilingDateError" class="text-red-600 text-xs mt-1">{{
                rulingFilingDateError
              }}</p>
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
              <p *ngIf="rulingRulingDateError" class="text-red-600 text-xs mt-1">{{
                rulingRulingDateError
              }}</p>
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

          <div class="flex justify-end pt-4 border-t border-[rgb(var(--border))]">
            <ui-button variant="primary" (click)="addRuling()" [disabled]="addingRuling">
              <span *ngIf="!addingRuling">Add Court Ruling</span>
              <span *ngIf="addingRuling" class="flex items-center gap-2">
                <app-loading-spinner size="small" show="true"></app-loading-spinner>
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
              <div *ngIf="editingRulingId !== r.id" class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
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
  protected addingTask = false;
  protected addingDeadline = false;
  protected addingRuling = false;
  protected editingRulingId: string | null = null;
  protected editingRuling: Partial<CaseRuling> = {};
  protected developmentNote = '';
  protected addingDevelopment = false;
  protected breadcrumbItems: Array<{ label: string; route?: string | any[] }> = [];
  protected autoSaveStatus: 'saved' | 'saving' | 'unsaved' = 'saved';
  private autoSaveSubscription?: Subscription;
  private lastSavedData: { title: string; client: string; status: string } = {
    title: '',
    client: '',
    status: '',
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
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.caseItem = this.cases.getById(id);
      if (this.caseItem) {
        this.title = this.caseItem.title;
        this.client = this.caseItem.client;
        this.status = this.caseItem.status;
        this.breadcrumbItems = [
          { label: 'Cases', route: '/cases' },
          { label: this.caseItem.title },
        ];
      }
    } else {
      this.breadcrumbItems = [{ label: 'Cases', route: '/cases' }, { label: 'New Case' }];
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
      };
    }
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
      this.status !== this.lastSavedData.status;
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
      this.cases.updateMeta(this.caseItem.id, {
        title: this.title.trim(),
        client: this.client.trim(),
        status: (this.status as any) === 'on-hold' ? 'pending' : (this.status as any),
      });
      this.caseItem = this.cases.getById(this.caseItem.id);
      if (this.caseItem) {
        this.lastSavedData = {
          title: this.caseItem.title,
          client: this.caseItem.client,
          status: this.caseItem.status,
        };
      }
      this.autoSaveStatus = 'saved';
    } catch (error) {
      this.autoSaveStatus = 'unsaved';
      console.error('Error auto-saving:', error);
    }
  }

  goBack(): void {
    this.router.navigate(['/cases']);
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
      if (!this.caseItem) {
        // Create new case
        const newCase = this.cases.create({
          title: this.title.trim(),
          client: this.client.trim(),
        });
        // Update status if not default
        if (this.status !== 'open') {
          this.cases.updateMeta(newCase.id, {
            status: (this.status as any) === 'on-hold' ? 'pending' : (this.status as any),
          });
        }
        this.toast.success('Case created successfully');
        // Navigate to the new case detail page
        this.router.navigate(['/cases', newCase.id]);
        this.caseItem = this.cases.getById(newCase.id);
        if (this.caseItem) {
          this.title = this.caseItem.title;
          this.client = this.caseItem.client;
          this.status = this.caseItem.status;
        }
      } else {
        // Update existing case
        this.cases.updateMeta(this.caseItem.id, {
          title: this.title.trim(),
          client: this.client.trim(),
          status: (this.status as any) === 'on-hold' ? 'pending' : (this.status as any),
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

  nextStage(): void {
    if (!this.caseItem) return;
    try {
      this.cases.advanceStage(this.caseItem.id);
      this.caseItem = this.cases.getById(this.caseItem.id);
      this.toast.success('Case stage advanced');
    } catch (error) {
      this.toast.error('Failed to advance case stage');
      console.error('Error advancing stage:', error);
    }
  }

  execute(): void {
    if (!this.caseItem) return;
    try {
      this.cases.executeCase(this.caseItem.id);
      this.caseItem = this.cases.getById(this.caseItem.id);
      this.toast.success('Case executed successfully');
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
