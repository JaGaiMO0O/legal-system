import { CommonModule } from '@angular/common';
import { Component, DestroyRef, HostListener, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { TabViewModule } from 'primeng/tabview';
import { TagModule } from 'primeng/tag';
import { interval } from 'rxjs';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { CaseWorkflowComponent } from '../../shared/components/case-workflow/case-workflow.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { DeadlineStatusPipe } from '../../shared/pipes/deadline-status.pipe';
import { RelativeDatePipe } from '../../shared/pipes/relative-date.pipe';
import {
  BusinessSettlement,
  BusinessSettlementService,
} from '../../shared/services/business-settlement.service';
import { CaseTrackingService } from '../../shared/services/case-tracking.service';
import {
  CASE_MATTER_TYPES,
  CaseDeadline,
  CaseDevelopment,
  CaseItem,
  CaseMatterType,
  CaseRuling,
  CasesService,
  CaseTask,
  CaseStage,
  CaseType,
  ClaimantDemographics,
  DamageType,
  DisabilityMetrics,
  PortalWorkbookFields,
  RulingInFavorOf,
} from '../../shared/services/cases.service';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';
import { CourtLevel, CourtsService, CourtType } from '../../shared/services/courts.service';
import { ExportService } from '../../shared/services/export.service';
import { Lawyer, LawyersService } from '../../shared/services/lawyers.service';
import { ToastService } from '../../shared/services/toast.service';

type LastSavedData = {
  title: string;
  client: string;
  status: string;
  companyLawyerId: string;
  claimant: string;
  beneficiary: string;
  initialHearingDate: string;
  matterType: CaseMatterType;
  portalJson: string;
};

@Component({
  standalone: true,
  selector: 'app-case-detail',
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    InputNumberModule,
    CalendarModule,
    TagModule,
    TabViewModule,
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
    <div class="flex flex-col gap-8">
      <div>
        <div class="flex items-start justify-between mb-6">
          <div>
            <h2
              class="text-2xl md:text-3xl font-semibold tracking-tight mb-2 text-[rgb(var(--text))]"
            >
              {{ caseItem?.title || ('common.newCase' | translate) }}
            </h2>
            <p class="text-sm text-[rgb(var(--text-muted))]">
              {{ 'common.clientLabel' | translate }}:
              {{ caseItem?.client || ('common.notSet' | translate) }}
            </p>
          </div>
          <div class="flex items-center gap-3">
            <p-tag
              [value]="
                ('common.stagePrefix' | translate) +
                ': ' +
                ('cases.stage.' + (caseItem?.stage || 'primary') | translate)
              "
              severity="info"
            ></p-tag>
            <p-button
              [outlined]="true"
              (click)="nextStage()"
              *ngIf="caseItem?.stage !== 'settled'"
              class="text-sm"
            >
              {{ 'caseDetail.header.nextCourt' | translate }}
            </p-button>
            <p-button
              severity="primary"
              (click)="settle()"
              *ngIf="
                caseItem?.stage && caseItem?.stage !== 'settled' && caseItem?.stage !== 'execution'
              "
              class="text-sm"
            >
              {{ 'caseDetail.header.settleCase' | translate }}
            </p-button>
            <p-button
              severity="primary"
              (click)="execute()"
              *ngIf="caseItem?.stage === 'execution'"
              class="text-sm"
            >
              {{ 'cases.execute' | translate }}
            </p-button>
            <p-button [outlined]="true" (click)="exportCase()" *ngIf="caseItem" class="text-sm">
              <svg class="w-4 h-4 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              {{ 'caseDetail.header.export' | translate }}
            </p-button>
          </div>
        </div>
      </div>

      <!-- Case Workflow -->
      <p-card *ngIf="caseItem">
        <app-case-workflow
          [currentStage]="caseItem.stage || 'primary'"
          mode="full"
        ></app-case-workflow>
      </p-card>

      <!-- Tabbed Content -->
      <p-tabView>
        <!-- Overview Tab -->
        <p-tabPanel [header]="'caseDetail.tabs.overview' | translate">
          <div class="p-4 flex flex-col gap-8">
            <div>
              <h3 class="text-lg font-bold mb-6">{{ 'caseDetail.caseInformation' | translate }}</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                    'caseDetail.caseNumber' | translate
                  }}</label>
                  <input
                    type="text"
                    [value]="
                      caseItem?.caseNumber ||
                      caseItem?.baseCaseNumber ||
                      ('common.willBeGenerated' | translate)
                    "
                    readonly
                    class="w-full bg-[rgb(var(--surface-muted))] cursor-not-allowed font-mono"
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                    'caseDetail.legalStatus' | translate
                  }}</label>
                  <div class="flex items-center gap-2">
                    <p-tag
                      [value]="'cases.legalStatus.' + legalStatusTranslationSegment() | translate"
                      [severity]="getLegalStatusSeverity()"
                    ></p-tag>
                    <p-tag
                      *ngIf="caseItem?.settledStatus === 2"
                      [value]="'caseDetail.legallySettledTag' | translate"
                      severity="success"
                    ></p-tag>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                    'caseDetail.matterType' | translate
                  }}</label>
                  <select [(ngModel)]="matterType" class="w-full">
                    <option *ngFor="let mt of matterTypeOptions" [ngValue]="mt">
                      {{ 'cases.matterType.' + mt | translate }}
                    </option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                    'caseDetail.status' | translate
                  }}</label>
                  <select [(ngModel)]="status" class="w-full">
                    <option value="open">{{ 'cases.caseStatus.open' | translate }}</option>
                    <option value="pending">{{ 'cases.caseStatus.pending' | translate }}</option>
                    <option value="closed">{{ 'cases.caseStatus.closed' | translate }}</option>
                    <option value="on-hold">{{ 'cases.caseStatus.onHold' | translate }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                    'caseDetail.companyLawyer' | translate
                  }}</label>
                  <select [(ngModel)]="companyLawyerId" class="w-full">
                    <option value="">{{ 'common.unassigned' | translate }}</option>
                    <option *ngFor="let l of lawyers" [value]="l.id">
                      {{ l.lawyerNumber }} - {{ l.name }}
                    </option>
                  </select>
                  <p class="text-xs text-[rgb(var(--text-muted))] mt-1" *ngIf="companyLawyerId">
                    {{ 'common.assignedPrefix' | translate }}: {{ getCompanyLawyerDisplay() }}
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                    'caseDetail.caseId' | translate
                  }}</label>
                  <input
                    type="text"
                    [value]="caseItem?.id || ('common.willBeGenerated' | translate)"
                    readonly
                    class="w-full bg-[rgb(var(--surface-muted))] cursor-not-allowed text-xs"
                  />
                </div>
                <div class="md:col-span-2 pt-4 border-t border-[rgb(var(--border-light))]">
                  <h4 class="text-sm font-bold text-[rgb(var(--text))] mb-4">
                    {{ 'portalWorkbook.sectionTitle' | translate }}
                  </h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                        'portalWorkbook.fields.userNumber' | translate
                      }}</label>
                      <input type="text" [(ngModel)]="portalFields.userNumber" class="w-full" />
                    </div>
                    <div>
                      <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                        'portalWorkbook.fields.externalId' | translate
                      }}</label>
                      <input type="text" [(ngModel)]="portalFields.externalId" class="w-full" />
                    </div>
                    <div>
                      <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                        'portalWorkbook.fields.plaintiff' | translate
                      }}</label>
                      <input type="text" [(ngModel)]="portalFields.plaintiff" class="w-full" />
                    </div>
                    <div>
                      <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                        'portalWorkbook.fields.defendant' | translate
                      }}</label>
                      <input type="text" [(ngModel)]="portalFields.defendant" class="w-full" />
                    </div>
                    <div>
                      <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                        'portalWorkbook.fields.claimType' | translate
                      }}</label>
                      <input type="text" [(ngModel)]="portalFields.claimType" class="w-full" />
                    </div>
                    <div>
                      <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                        'portalWorkbook.fields.claimValue' | translate
                      }}</label>
                      <input type="text" [(ngModel)]="portalFields.claimValue" class="w-full" />
                    </div>
                    <div>
                      <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                        'portalWorkbook.fields.compensationType' | translate
                      }}</label>
                      <input
                        type="text"
                        [(ngModel)]="portalFields.compensationType"
                        class="w-full"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                        'portalWorkbook.fields.claimStatus' | translate
                      }}</label>
                      <input type="text" [(ngModel)]="portalFields.claimStatus" class="w-full" />
                    </div>
                    <div>
                      <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                        'portalWorkbook.fields.requiredAction' | translate
                      }}</label>
                      <input type="text" [(ngModel)]="portalFields.requiredAction" class="w-full" />
                    </div>
                    <div>
                      <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                        'portalWorkbook.fields.decisionType' | translate
                      }}</label>
                      <input type="text" [(ngModel)]="portalFields.decisionType" class="w-full" />
                    </div>
                    <div>
                      <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                        'portalWorkbook.fields.subrogationFiledOn' | translate
                      }}</label>
                      <input
                        type="text"
                        [(ngModel)]="portalFields.subrogationFiledOn"
                        class="w-full"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                        'portalWorkbook.fields.subrogationExpectedEnd' | translate
                      }}</label>
                      <input
                        type="text"
                        [(ngModel)]="portalFields.subrogationExpectedEnd"
                        class="w-full"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                        'portalWorkbook.fields.courtSubject' | translate
                      }}</label>
                      <input type="text" [(ngModel)]="portalFields.courtSubject" class="w-full" />
                    </div>
                    <div>
                      <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                        'portalWorkbook.fields.courtName' | translate
                      }}</label>
                      <input type="text" [(ngModel)]="portalFields.courtName" class="w-full" />
                    </div>
                    <div>
                      <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                        'portalWorkbook.fields.courtCity' | translate
                      }}</label>
                      <input type="text" [(ngModel)]="portalFields.courtCity" class="w-full" />
                    </div>
                    <div>
                      <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                        'portalWorkbook.fields.nextHearingDate' | translate
                      }}</label>
                      <input
                        type="text"
                        [(ngModel)]="portalFields.nextHearingDate"
                        class="w-full"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                        'portalWorkbook.fields.nextHearingTime' | translate
                      }}</label>
                      <input
                        type="text"
                        [(ngModel)]="portalFields.nextHearingTime"
                        class="w-full"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                        'portalWorkbook.fields.doublePaymentAmount' | translate
                      }}</label>
                      <p-inputNumber
                        [(ngModel)]="portalFields.doublePaymentAmount"
                        [min]="0"
                        [minFractionDigits]="2"
                        [maxFractionDigits]="2"
                        styleClass="w-full"
                        inputStyleClass="w-full"
                      ></p-inputNumber>
                    </div>
                    <div class="md:col-span-2">
                      <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                        'portalWorkbook.fields.remarks' | translate
                      }}</label>
                      <textarea
                        [(ngModel)]="portalFields.remarks"
                        rows="3"
                        class="w-full rounded-input border border-[rgb(var(--border))] bg-[rgb(var(--surface))] px-3 py-2 text-sm"
                      ></textarea>
                    </div>
                  </div>
                </div>
                <div class="md:col-span-2">
                  <label
                    for="case-title"
                    class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                    >{{ 'caseDetail.titleRequired' | translate }}
                    <span class="text-danger">*</span></label
                  >
                  <input
                    id="case-title"
                    type="text"
                    [(ngModel)]="title"
                    class="w-full"
                    [class.border-danger]="titleError"
                    [class.bg-[rgb(var(--tint-danger-bg))]]="titleError"
                    [placeholder]="'caseDetail.titlePlaceholder' | translate"
                    aria-required="true"
                    [attr.aria-invalid]="!!titleError"
                    [attr.aria-describedby]="titleError ? 'title-error' : null"
                  />
                  <p
                    *ngIf="titleError"
                    id="title-error"
                    class="text-danger text-xs mt-1"
                    role="alert"
                  >
                    {{ titleError }}
                  </p>
                </div>
                <div>
                  <label
                    for="case-client"
                    class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                    >{{ 'caseDetail.clientRequired' | translate }}
                    <span class="text-danger">*</span></label
                  >
                  <input
                    id="case-client"
                    type="text"
                    [(ngModel)]="client"
                    class="w-full"
                    [class.border-danger]="clientError"
                    [class.bg-[rgb(var(--tint-danger-bg))]]="clientError"
                    [placeholder]="'caseDetail.clientPlaceholder' | translate"
                    aria-required="true"
                    [attr.aria-invalid]="!!clientError"
                    [attr.aria-describedby]="clientError ? 'client-error' : null"
                  />
                  <p
                    *ngIf="clientError"
                    id="client-error"
                    class="text-danger text-xs mt-1"
                    role="alert"
                  >
                    {{ clientError }}
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                    'caseDetail.claimant' | translate
                  }}</label>
                  <input
                    type="text"
                    [(ngModel)]="claimant"
                    class="w-full"
                    [placeholder]="'caseDetail.claimantPlaceholder' | translate"
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                    'caseDetail.beneficiary' | translate
                  }}</label>
                  <input
                    type="text"
                    [(ngModel)]="beneficiary"
                    class="w-full"
                    [placeholder]="'caseDetail.beneficiaryPlaceholder' | translate"
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                    'caseDetail.initialHearingDate' | translate
                  }}</label>
                  <p-calendar
                    [(ngModel)]="initialHearingDate"
                    dateFormat="dd/mm/yy"
                    [showIcon]="true"
                    styleClass="w-full"
                  ></p-calendar>
                </div>
                <ng-container *ngIf="matterType === 'CommercialContract'">
                  <div>
                    <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                      'caseDetail.contractReference' | translate
                    }}</label>
                    <input
                      type="text"
                      [(ngModel)]="contractReference"
                      class="w-full"
                      [placeholder]="'caseDetail.contractRefPlaceholder' | translate"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                      'caseDetail.disputedAmountSar' | translate
                    }}</label>
                    <input
                      type="number"
                      [(ngModel)]="disputedAmount"
                      min="0"
                      class="w-full"
                      placeholder="0"
                    />
                  </div>
                </ng-container>

                <ng-container *ngIf="matterType === 'LaborEmployment'">
                  <div>
                    <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                      'caseDetail.employerName' | translate
                    }}</label>
                    <input type="text" [(ngModel)]="employerName" class="w-full" />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                      'caseDetail.employeeName' | translate
                    }}</label>
                    <input type="text" [(ngModel)]="employeeName" class="w-full" />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                      'caseDetail.employmentStartDate' | translate
                    }}</label>
                    <p-calendar
                      [(ngModel)]="employmentStartDate"
                      dateFormat="dd/mm/yy"
                      [showIcon]="true"
                      styleClass="w-full"
                    ></p-calendar>
                  </div>
                </ng-container>

                <ng-container *ngIf="matterType === 'RealEstate'">
                  <div class="md:col-span-2">
                    <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                      'caseDetail.propertyAddress' | translate
                    }}</label>
                    <input type="text" [(ngModel)]="propertyAddress" class="w-full" />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                      'caseDetail.propertyType' | translate
                    }}</label>
                    <input
                      type="text"
                      [(ngModel)]="propertyType"
                      class="w-full"
                      [placeholder]="'caseDetail.propertyTypePlaceholder' | translate"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                      'caseDetail.titleDeedNumber' | translate
                    }}</label>
                    <input type="text" [(ngModel)]="titleDeedNumber" class="w-full" />
                  </div>
                </ng-container>

                <ng-container *ngIf="matterType === 'CriminalDefense'">
                  <div>
                    <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                      'caseDetail.offenseType' | translate
                    }}</label>
                    <input type="text" [(ngModel)]="offenseType" class="w-full" />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                      'caseDetail.incidentDate' | translate
                    }}</label>
                    <p-calendar
                      [(ngModel)]="incidentDate"
                      dateFormat="dd/mm/yy"
                      [showIcon]="true"
                      styleClass="w-full"
                    ></p-calendar>
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                      'caseDetail.policeReportNumber' | translate
                    }}</label>
                    <input type="text" [(ngModel)]="policeReportNumber" class="w-full" />
                  </div>
                </ng-container>

                <div *ngIf="matterType === 'GeneralCivil'" class="md:col-span-2">
                  <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                    'caseDetail.caseSummary' | translate
                  }}</label>
                  <textarea
                    [(ngModel)]="caseSummary"
                    rows="3"
                    class="w-full"
                    [placeholder]="'caseDetail.caseSummaryPlaceholder' | translate"
                  ></textarea>
                </div>

                <ng-container *ngIf="matterType === 'MotorInsurance'">
                  <div>
                    <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                      'caseDetail.damageType' | translate
                    }}</label>
                    <select [(ngModel)]="damageType" class="w-full">
                      <option value="">{{ 'caseDetail.selectDamageType' | translate }}</option>
                      <option value="Fatal">
                        {{ 'motorLiability.damageType.fatal' | translate }}
                      </option>
                      <option value="Disability">
                        {{ 'motorLiability.damageType.disability' | translate }}
                      </option>
                    </select>
                  </div>
                  <div *ngIf="damageType === 'Disability'">
                    <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                      'caseDetail.moralPercent' | translate
                    }}</label>
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
                    <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                      'caseDetail.physicalPercent' | translate
                    }}</label>
                    <input
                      type="number"
                      [(ngModel)]="disabilityMetrics.physicalPercent"
                      min="0"
                      max="100"
                      class="w-full"
                      placeholder="0"
                    />
                  </div>
                </ng-container>
              </div>
            </div>

            <!-- Claimant Demographics Section -->
            <div
              class="pt-6 border-t border-[rgb(var(--border-light))]"
              *ngIf="matterType === 'MotorInsurance'"
            >
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
                {{ 'caseDetail.demographicsToggle' | translate }}
              </button>
              <div *ngIf="showDemographics" class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                    'caseDetail.nationality' | translate
                  }}</label>
                  <input
                    type="text"
                    [(ngModel)]="demographics.nationality"
                    class="w-full"
                    [placeholder]="'caseDetail.nationalityPlaceholder' | translate"
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                    'caseDetail.sex' | translate
                  }}</label>
                  <select [(ngModel)]="demographics.sex" class="w-full">
                    <option value="">{{ 'common.select' | translate }}</option>
                    <option value="Male">{{ 'motorLiability.gender.male' | translate }}</option>
                    <option value="Female">{{ 'motorLiability.gender.female' | translate }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                    'caseDetail.maritalStatus' | translate
                  }}</label>
                  <select [(ngModel)]="demographics.maritalStatus" class="w-full">
                    <option value="">{{ 'common.select' | translate }}</option>
                    <option value="Single">
                      {{ 'motorLiability.maritalStatus.single' | translate }}
                    </option>
                    <option value="Married">
                      {{ 'motorLiability.maritalStatus.married' | translate }}
                    </option>
                    <option value="Divorced">
                      {{ 'motorLiability.maritalStatus.divorced' | translate }}
                    </option>
                    <option value="Widowed">
                      {{ 'motorLiability.maritalStatus.widowed' | translate }}
                    </option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                    'caseDetail.profession' | translate
                  }}</label>
                  <input
                    type="text"
                    [(ngModel)]="demographics.profession"
                    class="w-full"
                    [placeholder]="'caseDetail.professionPlaceholder' | translate"
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                    'caseDetail.age' | translate
                  }}</label>
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
                  <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                    'caseDetail.dependents' | translate
                  }}</label>
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
          </div>
        </p-tabPanel>

        <!-- Tasks & Deadlines Tab -->
        <p-tabPanel [header]="'caseDetail.tabs.tasksDeadlines' | translate">
          <div class="p-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Tasks Section -->
              <div>
                <h3 class="text-lg font-bold mb-4">{{ 'caseDetail.tasksTitle' | translate }}</h3>
                <div class="relative mb-3">
                  <input
                    type="text"
                    inputmode="search"
                    autocomplete="off"
                    class="w-full py-2.5 pe-4 rounded-input border border-[rgb(var(--border))] bg-[rgb(var(--surface))] text-[rgb(var(--text))] search-input-with-icon"
                    [(ngModel)]="taskTabSearch"
                    [placeholder]="'caseDetail.filterTasks' | translate"
                  />
                  <span class="search-input-icon" aria-hidden="true">
                    <svg
                      class="w-5 h-5 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </span>
                </div>
                <div class="mb-6">
                  <div class="flex gap-2">
                    <input
                      class="flex-1"
                      [(ngModel)]="taskTitle"
                      [placeholder]="'caseDetail.newTaskPlaceholder' | translate"
                    />
                    <p-button
                      severity="primary"
                      (click)="addTask()"
                      class="whitespace-nowrap"
                      [disabled]="addingTask"
                    >
                      <span *ngIf="!addingTask">{{ 'caseDetail.add' | translate }}</span>
                      <span *ngIf="addingTask" class="flex items-center gap-2">
                        <app-loading-spinner size="small" [show]="true"></app-loading-spinner>
                        {{ 'common.adding' | translate }}
                      </span>
                    </p-button>
                  </div>
                </div>
                <ul class="space-y-3">
                  <li
                    *ngFor="let t of filteredTasks()"
                    class="flex items-center justify-between p-3 bg-[rgb(var(--surface-muted))] rounded-lg"
                  >
                    <label class="flex items-center gap-3 flex-1 cursor-pointer">
                      <input
                        type="checkbox"
                        [checked]="t.done"
                        (change)="toggleTask(t.id)"
                        class="w-4 h-4"
                      />
                      <span
                        [class.line-through]="t.done"
                        [class.text-[rgb(var(--text-muted))]]="t.done"
                        >{{ t.title }}</span
                      >
                    </label>
                    <button
                      class="text-sm text-danger hover:opacity-90 font-medium px-2"
                      (click)="removeTask(t.id)"
                    >
                      {{ 'common.remove' | translate }}
                    </button>
                  </li>
                  <li
                    *ngIf="(caseItem?.tasks?.length ?? 0) === 0"
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
                      <p>{{ 'caseDetail.noTasksYet' | translate }}</p>
                      <p class="text-xs opacity-75">{{ 'caseDetail.addFirstTask' | translate }}</p>
                    </div>
                  </li>
                  <li
                    *ngIf="(caseItem?.tasks?.length ?? 0) > 0 && filteredTasks().length === 0"
                    class="text-sm text-[rgb(var(--text-muted))] text-center py-6"
                  >
                    {{ 'caseDetail.noTasksMatchFilter' | translate }}
                  </li>
                </ul>
              </div>
              <!-- Deadlines Section -->
              <div>
                <h3 class="text-lg font-bold mb-4">
                  {{ 'caseDetail.deadlinesTitle' | translate }}
                </h3>
                <div class="relative mb-3">
                  <input
                    type="text"
                    inputmode="search"
                    autocomplete="off"
                    class="w-full py-2.5 pe-4 rounded-input border border-[rgb(var(--border))] bg-[rgb(var(--surface))] text-[rgb(var(--text))] search-input-with-icon"
                    [(ngModel)]="deadlineTabSearch"
                    [placeholder]="'caseDetail.filterDeadlines' | translate"
                  />
                  <span class="search-input-icon" aria-hidden="true">
                    <svg
                      class="w-5 h-5 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </span>
                </div>
                <div class="mb-6">
                  <div class="space-y-2">
                    <div>
                      <input
                        class="w-full"
                        [(ngModel)]="deadlineTitle"
                        [placeholder]="'caseDetail.deadlineTitlePlaceholder' | translate"
                        [class.border-danger]="deadlineTitleError"
                        [class.bg-[rgb(var(--tint-danger-bg))]]="deadlineTitleError"
                      />
                      <p *ngIf="deadlineTitleError" class="text-danger text-xs mt-1">
                        {{ deadlineTitleError }}
                      </p>
                    </div>
                    <div>
                      <div class="flex gap-2">
                        <p-calendar
                          [(ngModel)]="deadlineDate"
                          dateFormat="dd/mm/yy"
                          [showIcon]="true"
                          styleClass="flex-1"
                          [ngClass]="{ 'p-invalid': deadlineDateError }"
                        ></p-calendar>
                        <p-button
                          severity="primary"
                          (click)="addDeadline()"
                          class="whitespace-nowrap"
                          [disabled]="addingDeadline"
                        >
                          <span *ngIf="!addingDeadline">{{ 'caseDetail.add' | translate }}</span>
                          <span *ngIf="addingDeadline" class="flex items-center gap-2">
                            <app-loading-spinner size="small" [show]="true"></app-loading-spinner>
                            {{ 'common.adding' | translate }}
                          </span>
                        </p-button>
                      </div>
                      <p *ngIf="deadlineDateError" class="text-danger text-xs mt-1">
                        {{ deadlineDateError }}
                      </p>
                    </div>
                  </div>
                </div>
                <ul class="space-y-3">
                  <li
                    *ngFor="let d of filteredDeadlines()"
                    class="flex items-center justify-between p-3 bg-[rgb(var(--surface-muted))] rounded-lg"
                  >
                    <div class="flex-1">
                      <span class="font-medium">{{ d.title }}</span>
                      <div class="flex items-center gap-2 mt-1">
                        <span
                          class="text-sm"
                          [class.text-danger]="(d.date | deadlineStatus) === 'overdue'"
                          [class.font-semibold]="(d.date | deadlineStatus) === 'overdue'"
                          [class.text-warning]="(d.date | deadlineStatus) === 'upcoming'"
                          [class.font-medium]="(d.date | deadlineStatus) === 'upcoming'"
                          [class.text-[rgb(var(--text-muted))]]="
                            (d.date | deadlineStatus) === 'normal'
                          "
                        >
                          {{ d.date | date: 'shortDate' }}
                        </span>
                        <span
                          class="text-xs px-2 py-0.5 rounded-full font-medium"
                          [class.bg-[rgb(var(--tint-danger-bg))]]="
                            (d.date | deadlineStatus) === 'overdue'
                          "
                          [class.text-[rgb(var(--tint-danger-fg))]]="
                            (d.date | deadlineStatus) === 'overdue'
                          "
                          [class.bg-[rgb(var(--tint-warning-bg))]]="
                            (d.date | deadlineStatus) === 'upcoming'
                          "
                          [class.text-[rgb(var(--tint-warning-fg))]]="
                            (d.date | deadlineStatus) === 'upcoming'
                          "
                          *ngIf="(d.date | deadlineStatus) !== 'normal'"
                        >
                          {{
                            (d.date | deadlineStatus) === 'overdue'
                              ? ('common.overdue' | translate)
                              : ('common.upcoming' | translate)
                          }}
                        </span>
                        <span class="text-xs text-[rgb(var(--text-muted))]">
                          ({{ d.date | relativeDate }})
                        </span>
                      </div>
                    </div>
                    <button
                      class="text-sm text-danger hover:opacity-90 font-medium px-2"
                      (click)="removeDeadline(d.id)"
                    >
                      {{ 'common.remove' | translate }}
                    </button>
                  </li>
                  <li
                    *ngIf="(caseItem?.deadlines?.length ?? 0) === 0"
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
                      <p>{{ 'caseDetail.noDeadlinesYet' | translate }}</p>
                      <p class="text-xs opacity-75">
                        {{ 'caseDetail.addFirstDeadline' | translate }}
                      </p>
                    </div>
                  </li>
                  <li
                    *ngIf="
                      (caseItem?.deadlines?.length ?? 0) > 0 && filteredDeadlines().length === 0
                    "
                    class="text-sm text-[rgb(var(--text-muted))] text-center py-6"
                  >
                    {{ 'caseDetail.noDeadlinesMatchFilter' | translate }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </p-tabPanel>

        <!-- Developments Tab -->
        <p-tabPanel [header]="'caseDetail.tabs.developments' | translate">
          <div class="p-4 flex flex-col gap-8">
            <div>
              <h3 class="text-lg font-bold mb-4">
                {{ 'caseDetail.developmentsTitle' | translate }}
              </h3>
              <div class="relative mb-3 max-w-xl">
                <input
                  type="text"
                  inputmode="search"
                  autocomplete="off"
                  class="w-full py-2.5 pe-4 rounded-input border border-[rgb(var(--border))] bg-[rgb(var(--surface))] text-[rgb(var(--text))] search-input-with-icon"
                  [(ngModel)]="developmentTabSearch"
                  [placeholder]="'caseDetail.filterDevelopments' | translate"
                />
                <span class="search-input-icon" aria-hidden="true">
                  <svg
                    class="w-5 h-5 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </span>
              </div>
              <div>
                <textarea
                  class="w-full"
                  [(ngModel)]="developmentNote"
                  [placeholder]="'caseDetail.developmentNotePlaceholder' | translate"
                  rows="3"
                ></textarea>
                <div class="flex justify-end mt-4">
                  <p-button
                    severity="primary"
                    (click)="addDevelopment()"
                    [disabled]="addingDevelopment"
                  >
                    <span *ngIf="!addingDevelopment">{{
                      'actions.addDevelopment' | translate
                    }}</span>
                    <span *ngIf="addingDevelopment" class="flex items-center gap-2">
                      <app-loading-spinner size="small" [show]="true"></app-loading-spinner>
                      {{ 'common.adding' | translate }}
                    </span>
                  </p-button>
                </div>
              </div>
            </div>
            <ul class="space-y-3">
              <li
                *ngFor="let dev of filteredDevelopments()"
                class="p-3 bg-[rgb(var(--surface-muted))] rounded-lg"
              >
                <div class="text-xs text-[rgb(var(--text-muted))] mb-1">
                  {{ dev.date | date: 'short' }} ({{ dev.date | relativeDate }})
                </div>
                <div class="text-sm">{{ dev.note }}</div>
              </li>
              <li
                *ngIf="(caseItem?.developments?.length ?? 0) === 0"
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
                  <p>{{ 'caseDetail.noDevelopmentsYet' | translate }}</p>
                  <p class="text-xs opacity-75">
                    {{ 'caseDetail.addFirstDevelopment' | translate }}
                  </p>
                </div>
              </li>
              <li
                *ngIf="
                  (caseItem?.developments?.length ?? 0) > 0 && filteredDevelopments().length === 0
                "
                class="text-sm text-[rgb(var(--text-muted))] text-center py-6"
              >
                {{ 'caseDetail.noDevelopmentsMatchFilter' | translate }}
              </li>
            </ul>
          </div>
        </p-tabPanel>

        <!-- Court Rulings Tab -->
        <p-tabPanel [header]="'caseDetail.tabs.courtRulings' | translate">
          <div class="p-4 flex flex-col gap-8">
            <h3 class="text-lg font-bold mb-0">{{ 'caseDetail.courtRulingsTitle' | translate }}</h3>
            <div class="relative max-w-xl">
              <input
                type="text"
                inputmode="search"
                autocomplete="off"
                class="w-full py-2.5 pe-4 rounded-input border border-[rgb(var(--border))] bg-[rgb(var(--surface))] text-[rgb(var(--text))] search-input-with-icon"
                [(ngModel)]="rulingTabSearch"
                [placeholder]="'caseDetail.filterRulings' | translate"
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

            <!-- Ruling Form -->
            <div
              class="border border-[rgb(var(--border))] rounded-xl p-6 bg-[rgb(var(--surface-muted))] flex flex-col gap-8"
            >
              <div>
                <h4 class="font-bold mb-4 text-[rgb(var(--text))]">
                  {{ 'cases.rulings.sections.mainInfo' | translate }}
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                      >{{ 'cases.rulings.fields.caseNo' | translate }}
                      <span class="text-danger">*</span></label
                    >
                    <input
                      type="text"
                      [(ngModel)]="newRuling.caseNo"
                      class="w-full"
                      [class.border-danger]="rulingCaseNoError"
                      [class.bg-[rgb(var(--tint-danger-bg))]]="rulingCaseNoError"
                      [placeholder]="'caseDetail.enterCaseNumber' | translate"
                    />
                    <p *ngIf="rulingCaseNoError" class="text-danger text-xs mt-1">
                      {{ rulingCaseNoError }}
                    </p>
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                      'cases.rulings.fields.caseType' | translate
                    }}</label>
                    <select [(ngModel)]="newRuling.caseType" class="w-full">
                      <option value="Plaintiff">
                        {{ 'cases.rulings.caseType.plaintiff' | translate }}
                      </option>
                      <option value="Defendant">
                        {{ 'cases.rulings.caseType.defendant' | translate }}
                      </option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                      >{{ 'cases.rulings.fields.courtType' | translate }}
                      <span class="text-danger">*</span></label
                    >
                    <select
                      [(ngModel)]="selectedCourtTypeId"
                      class="w-full"
                      [class.border-danger]="rulingCourtTypeError"
                      [class.bg-[rgb(var(--tint-danger-bg))]]="rulingCourtTypeError"
                      (ngModelChange)="onCourtTypeChange()"
                    >
                      <option value="">{{ 'caseDetail.selectCourtType' | translate }}</option>
                      <option *ngFor="let ct of courts" [value]="ct.id">{{ ct.name }}</option>
                    </select>
                    <p *ngIf="rulingCourtTypeError" class="text-danger text-xs mt-1">
                      {{ rulingCourtTypeError }}
                    </p>
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                      'cases.rulings.fields.courtLevel' | translate
                    }}</label>
                    <select [(ngModel)]="newRuling.courtLevel" class="w-full">
                      <option value="">{{ 'caseDetail.selectLevel' | translate }}</option>
                      <option *ngFor="let lvl of availableLevels" [value]="lvl">
                        {{ 'courts.level.' + lvl | translate }}
                      </option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                      'cases.rulings.fields.courtCity' | translate
                    }}</label>
                    <input
                      type="text"
                      [(ngModel)]="newRuling.courtCity"
                      class="w-full"
                      [placeholder]="'caseDetail.enterCourtCity' | translate"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                      'cases.rulings.fields.filingDate' | translate
                    }}</label>
                    <p-calendar
                      [(ngModel)]="newRuling.filingDate"
                      dateFormat="dd/mm/yy"
                      [showIcon]="true"
                      styleClass="w-full"
                      [ngClass]="{ 'p-invalid': rulingFilingDateError }"
                    ></p-calendar>
                    <p *ngIf="rulingFilingDateError" class="text-danger text-xs mt-1">
                      {{ rulingFilingDateError }}
                    </p>
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                      'cases.rulings.fields.filingNo' | translate
                    }}</label>
                    <input
                      type="text"
                      [(ngModel)]="newRuling.filingNo"
                      class="w-full"
                      [placeholder]="'caseDetail.enterFilingNumber' | translate"
                    />
                  </div>
                  <div class="md:col-span-2">
                    <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                      'cases.rulings.fields.caseDetails' | translate
                    }}</label>
                    <textarea
                      [(ngModel)]="newRuling.caseDetails"
                      rows="3"
                      class="w-full"
                      [placeholder]="'caseDetail.enterCaseDetails' | translate"
                    ></textarea>
                  </div>
                </div>
              </div>

              <div class="border-t border-[rgb(var(--border))] pt-6">
                <h4 class="font-bold mb-4 text-[rgb(var(--text))]">
                  {{ 'cases.rulings.sections.stageInfo' | translate }}
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                      'cases.rulings.fields.stage' | translate
                    }}</label>
                    <select [(ngModel)]="newRuling.stage" class="w-full">
                      <option value="primary">{{ 'cases.stage.primary' | translate }}</option>
                      <option value="appeal">{{ 'cases.stage.appeal' | translate }}</option>
                      <option value="cassation">{{ 'cases.stage.cassation' | translate }}</option>
                      <option value="execution">{{ 'cases.stage.execution' | translate }}</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                      'cases.rulings.fields.stageNo' | translate
                    }}</label>
                    <input type="number" [(ngModel)]="newRuling.stageNo" min="1" class="w-full" />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                      'cases.rulings.fields.rulingInFavorOf' | translate
                    }}</label>
                    <select [(ngModel)]="newRuling.rulingInFavorOf" class="w-full">
                      <option value="Company">
                        {{ 'cases.rulings.rulingInFavorOf.company' | translate }}
                      </option>
                      <option value="Adversary">
                        {{ 'cases.rulings.rulingInFavorOf.adversary' | translate }}
                      </option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                      'cases.rulings.fields.rulingDate' | translate
                    }}</label>
                    <p-calendar
                      [(ngModel)]="newRuling.rulingDate"
                      dateFormat="dd/mm/yy"
                      [showIcon]="true"
                      styleClass="w-full"
                      [ngClass]="{ 'p-invalid': rulingRulingDateError }"
                    ></p-calendar>
                    <p *ngIf="rulingRulingDateError" class="text-danger text-xs mt-1">
                      {{ rulingRulingDateError }}
                    </p>
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                      'cases.rulings.fields.courtFees' | translate
                    }}</label>
                    <p-inputNumber
                      mode="currency"
                      currency="AED"
                      [locale]="'en-SA'"
                      [(ngModel)]="newRuling.courtFees"
                      [min]="0"
                      [minFractionDigits]="2"
                      [maxFractionDigits]="2"
                      styleClass="w-full"
                    ></p-inputNumber>
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                      'cases.rulings.fields.legalExpenses' | translate
                    }}</label>
                    <p-inputNumber
                      mode="currency"
                      currency="AED"
                      [locale]="'en-SA'"
                      [(ngModel)]="newRuling.legalExpenses"
                      [min]="0"
                      [minFractionDigits]="2"
                      [maxFractionDigits]="2"
                      styleClass="w-full"
                    ></p-inputNumber>
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                      'cases.rulings.fields.translationCourtFees' | translate
                    }}</label>
                    <p-inputNumber
                      mode="currency"
                      currency="AED"
                      [locale]="'en-SA'"
                      [(ngModel)]="newRuling.translationCourtFees"
                      [min]="0"
                      [minFractionDigits]="2"
                      [maxFractionDigits]="2"
                      styleClass="w-full"
                    ></p-inputNumber>
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                      'cases.rulings.fields.courtFeesInCash' | translate
                    }}</label>
                    <p-inputNumber
                      mode="currency"
                      currency="AED"
                      [locale]="'en-SA'"
                      [(ngModel)]="newRuling.courtFeesInCash"
                      [min]="0"
                      [minFractionDigits]="2"
                      [maxFractionDigits]="2"
                      styleClass="w-full"
                    ></p-inputNumber>
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                      'cases.rulings.fields.expertFees' | translate
                    }}</label>
                    <p-inputNumber
                      mode="currency"
                      currency="AED"
                      [locale]="'en-SA'"
                      [(ngModel)]="newRuling.expertFees"
                      [min]="0"
                      [minFractionDigits]="2"
                      [maxFractionDigits]="2"
                      styleClass="w-full"
                    ></p-inputNumber>
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                      'cases.rulings.fields.advocacyFees' | translate
                    }}</label>
                    <p-inputNumber
                      mode="currency"
                      currency="AED"
                      [locale]="'en-SA'"
                      [(ngModel)]="newRuling.advocacyFees"
                      [min]="0"
                      [minFractionDigits]="2"
                      [maxFractionDigits]="2"
                      styleClass="w-full"
                    ></p-inputNumber>
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                      'cases.rulings.fields.otherExpenses' | translate
                    }}</label>
                    <p-inputNumber
                      mode="currency"
                      currency="AED"
                      [locale]="'en-SA'"
                      [(ngModel)]="newRuling.otherExpenses"
                      [min]="0"
                      [minFractionDigits]="2"
                      [maxFractionDigits]="2"
                      styleClass="w-full"
                    ></p-inputNumber>
                  </div>
                </div>
              </div>

              <div class="border-t border-[rgb(var(--border))] pt-6">
                <h4 class="font-bold mb-4 text-[rgb(var(--text))]">
                  {{ 'cases.rulings.sections.adversaryInfo' | translate }}
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                      'cases.rulings.fields.adversaryName' | translate
                    }}</label>
                    <input
                      type="text"
                      [(ngModel)]="newRuling.adversaryName"
                      class="w-full"
                      [placeholder]="'caseDetail.enterAdversaryName' | translate"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                      'cases.rulings.fields.indemnityByCourtAmount' | translate
                    }}</label>
                    <p-inputNumber
                      mode="currency"
                      currency="AED"
                      [locale]="'en-SA'"
                      [(ngModel)]="newRuling.indemnityByCourtAmount"
                      [min]="0"
                      [minFractionDigits]="2"
                      [maxFractionDigits]="2"
                      styleClass="w-full"
                    ></p-inputNumber>
                  </div>
                </div>
              </div>

              <!-- Total Ruled Out Display -->
              <div class="p-4 rounded-lg border border-info bg-info-muted">
                <div class="flex items-center justify-between gap-3">
                  <span class="text-sm font-semibold text-[rgb(var(--text))]">{{
                    'caseDetail.totalRuledOut' | translate
                  }}</span>
                  <span class="text-xl font-bold text-[rgb(var(--primary))] tabular-nums"
                    >{{ getTotalRuledOut() | number }} {{ 'common.sar' | translate }}</span
                  >
                </div>
                <p class="text-xs text-info-fg mt-1.5 leading-relaxed">
                  {{ 'caseDetail.totalRuledOutHint' | translate }}
                </p>
              </div>

              <div class="flex justify-end pt-4 border-t border-[rgb(var(--border))]">
                <p-button severity="primary" (click)="addRuling()" [disabled]="addingRuling">
                  <span *ngIf="!addingRuling">{{ 'caseDetail.addCourtRuling' | translate }}</span>
                  <span *ngIf="addingRuling" class="flex items-center gap-2">
                    <app-loading-spinner size="small" [show]="true"></app-loading-spinner>
                    {{ 'common.adding' | translate }}
                  </span>
                </p-button>
              </div>
            </div>

            <!-- Existing Rulings List -->
            <div>
              <h4 class="font-bold mb-4 text-[rgb(var(--text))]">
                {{ 'caseDetail.existingRulings' | translate }}
              </h4>
              <ul class="space-y-4">
                <li
                  *ngFor="let r of filteredRulings()"
                  class="border border-[rgb(var(--border))] rounded-xl p-5 bg-[rgb(var(--surface-muted))]"
                >
                  <div
                    class="flex items-center justify-between mb-4 pb-3 border-b border-[rgb(var(--border-light))]"
                  >
                    <div>
                      <span class="font-bold text-[rgb(var(--text))]"
                        >{{ 'cases.stage.' + r.stage | translate }} —
                        {{ 'caseDetail.stageNoShort' | translate }}: {{ r.stageNo }}</span
                      >
                      <span class="text-sm text-[rgb(var(--text-muted))] ms-3">{{
                        r.rulingDate | date: 'short'
                      }}</span>
                    </div>
                    <div class="flex items-center gap-2" *ngIf="editingRulingId !== r.id">
                      <button
                        (click)="startEditRuling(r)"
                        class="text-sm text-[rgb(var(--primary))] hover:text-[rgb(var(--primary-dark))] font-medium px-2"
                      >
                        {{ 'caseDetail.editRuling' | translate }}
                      </button>
                      <button
                        (click)="deleteRuling(r.id)"
                        class="text-sm text-danger hover:opacity-90 font-medium px-2"
                      >
                        {{ 'caseDetail.deleteRuling' | translate }}
                      </button>
                    </div>
                    <div class="flex items-center gap-2" *ngIf="editingRulingId === r.id">
                      <p-button [outlined]="true" (click)="cancelEditRuling()" class="text-sm">
                        {{ 'caseDetail.cancelEdit' | translate }}
                      </p-button>
                      <p-button severity="primary" (click)="saveEditRuling(r.id)" class="text-sm">
                        {{ 'actions.save' | translate }}
                      </p-button>
                    </div>
                  </div>
                  <div
                    *ngIf="editingRulingId !== r.id"
                    class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm"
                  >
                    <div>
                      <strong class="text-[rgb(var(--text))]">{{
                        'caseDetail.summaryCaseNo' | translate
                      }}</strong>
                      <span class="text-[rgb(var(--text-muted))]">{{ r.caseNo }}</span>
                    </div>
                    <div>
                      <strong class="text-[rgb(var(--text))]">{{
                        'caseDetail.summaryCaseType' | translate
                      }}</strong>
                      <span class="text-[rgb(var(--text-muted))]">{{
                        r.caseType === 'Plaintiff'
                          ? ('cases.rulings.caseType.plaintiff' | translate)
                          : ('cases.rulings.caseType.defendant' | translate)
                      }}</span>
                    </div>
                    <div>
                      <strong class="text-[rgb(var(--text))]">{{
                        'caseDetail.rulingSummaryFavor' | translate
                      }}</strong>
                      <span class="text-[rgb(var(--text-muted))]">{{
                        r.rulingInFavorOf === 'Company'
                          ? ('cases.rulings.rulingInFavorOf.company' | translate)
                          : ('cases.rulings.rulingInFavorOf.adversary' | translate)
                      }}</span>
                    </div>
                    <div>
                      <strong class="text-[rgb(var(--text))]">{{
                        'caseDetail.summaryAdversaryName' | translate
                      }}</strong>
                      <span class="text-[rgb(var(--text-muted))]">{{
                        r.adversaryName || '-'
                      }}</span>
                    </div>
                    <div class="md:col-span-2">
                      <strong class="text-[rgb(var(--text))]">{{
                        'caseDetail.rulingSummaryIndemnity' | translate
                      }}</strong>
                      <span class="text-[rgb(var(--primary))] font-semibold"
                        >{{ r.indemnityByCourtAmount | number }}
                        {{ 'common.sar' | translate }}</span
                      >
                    </div>
                    <div class="md:col-span-2 pt-2 border-t border-[rgb(var(--border-light))]">
                      <div class="text-xs text-[rgb(var(--text-muted))] space-y-1">
                        <div>
                          {{ 'cases.rulings.fields.courtFees' | translate }}:
                          <span class="font-medium"
                            >{{ r.courtFees | number }} {{ 'common.sar' | translate }}</span
                          >
                        </div>
                        <div>
                          {{ 'cases.rulings.fields.legalExpenses' | translate }}:
                          <span class="font-medium"
                            >{{ r.legalExpenses | number }} {{ 'common.sar' | translate }}</span
                          >
                        </div>
                        <div>
                          {{ 'cases.rulings.fields.expertFees' | translate }}:
                          <span class="font-medium"
                            >{{ r.expertFees | number }} {{ 'common.sar' | translate }}</span
                          >
                        </div>
                      </div>
                    </div>
                    <div class="md:col-span-2 mt-2 p-3 rounded-lg border border-info bg-info-muted">
                      <div class="flex items-center justify-between gap-3">
                        <span class="text-sm font-semibold text-[rgb(var(--text))]">{{
                          'caseDetail.totalRuledOut' | translate
                        }}</span>
                        <span class="text-lg font-bold text-[rgb(var(--primary))] tabular-nums"
                          >{{ getRulingTotal(r) | number }} {{ 'common.sar' | translate }}</span
                        >
                      </div>
                    </div>
                  </div>
                  <!-- Edit Form -->
                  <div *ngIf="editingRulingId === r.id" class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                          'cases.rulings.fields.caseNo' | translate
                        }}</label>
                        <input
                          type="text"
                          [(ngModel)]="editingRuling.caseNo"
                          class="w-full"
                          [placeholder]="'caseDetail.enterCaseNumber' | translate"
                        />
                      </div>
                      <div>
                        <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                          'cases.rulings.fields.caseType' | translate
                        }}</label>
                        <select [(ngModel)]="editingRuling.caseType" class="w-full">
                          <option value="Plaintiff">
                            {{ 'cases.rulings.caseType.plaintiff' | translate }}
                          </option>
                          <option value="Defendant">
                            {{ 'cases.rulings.caseType.defendant' | translate }}
                          </option>
                        </select>
                      </div>
                      <div>
                        <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                          'cases.rulings.fields.courtType' | translate
                        }}</label>
                        <input
                          type="text"
                          [(ngModel)]="editingRuling.courtType"
                          class="w-full"
                          [placeholder]="'caseDetail.selectCourtType' | translate"
                        />
                      </div>
                      <div>
                        <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                          'cases.rulings.fields.rulingDate' | translate
                        }}</label>
                        <p-calendar
                          [(ngModel)]="editingRuling.rulingDate"
                          dateFormat="dd/mm/yy"
                          [showIcon]="true"
                          styleClass="w-full"
                        ></p-calendar>
                      </div>
                      <div>
                        <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                          'cases.rulings.fields.rulingInFavorOf' | translate
                        }}</label>
                        <select [(ngModel)]="editingRuling.rulingInFavorOf" class="w-full">
                          <option value="Company">
                            {{ 'cases.rulings.rulingInFavorOf.company' | translate }}
                          </option>
                          <option value="Adversary">
                            {{ 'cases.rulings.rulingInFavorOf.adversary' | translate }}
                          </option>
                        </select>
                      </div>
                      <div>
                        <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                          'cases.rulings.fields.adversaryName' | translate
                        }}</label>
                        <input
                          type="text"
                          [(ngModel)]="editingRuling.adversaryName"
                          class="w-full"
                          [placeholder]="'caseDetail.enterAdversaryName' | translate"
                        />
                      </div>
                      <div>
                        <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                          'cases.rulings.fields.indemnityByCourtAmount' | translate
                        }}</label>
                        <input
                          type="number"
                          [(ngModel)]="editingRuling.indemnityByCourtAmount"
                          min="0"
                          step="0.01"
                          class="w-full"
                          [placeholder]="'caseDetail.amountPlaceholder' | translate"
                        />
                      </div>
                    </div>
                  </div>
                </li>
                <li
                  *ngIf="(caseItem?.rulings?.length ?? 0) === 0"
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
                      <p class="font-medium mb-1">{{ 'caseDetail.noRulingsYet' | translate }}</p>
                      <p class="text-xs opacity-75">
                        {{ 'caseDetail.addFirstRuling' | translate }}
                      </p>
                    </div>
                  </div>
                </li>
                <li
                  *ngIf="(caseItem?.rulings?.length ?? 0) > 0 && filteredRulings().length === 0"
                  class="text-sm text-[rgb(var(--text-muted))] text-center py-8 bg-[rgb(var(--surface-muted))] rounded-lg"
                >
                  {{ 'caseDetail.noRulingsMatchFilter' | translate }}
                </li>
              </ul>
            </div>
          </div>
        </p-tabPanel>

        <!-- Business Settlement Tab -->
        <p-tabPanel [header]="'caseDetail.tabs.businessSettlement' | translate">
          <div class="p-4 flex flex-col gap-8">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-bold">{{ 'settlement.detailTitle' | translate }}</h3>
              <p-button
                severity="primary"
                [size]="'small'"
                (click)="createSettlement()"
                *ngIf="!settlement"
                [label]="'actions.createSettlement' | translate"
              ></p-button>
              <a
                *ngIf="settlement"
                class="text-[rgb(var(--primary))] hover:underline text-sm font-medium"
                [routerLink]="['/settlements', settlement.id]"
              >
                {{ 'actions.viewSettlement' | translate }}
              </a>
            </div>
            <div
              *ngIf="settlement; else noSettlement"
              class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm"
            >
              <div class="p-3 bg-[rgb(var(--surface-muted))] rounded">
                <div class="text-[rgb(var(--text-muted))]">
                  {{ 'settlement.fields.amountOfAmicableAgreement' | translate }}
                </div>
                <div class="text-lg font-semibold">
                  {{ settlement.amountOfAmicableAgreement | number }} {{ 'common.sar' | translate }}
                </div>
              </div>
              <div class="p-3 bg-[rgb(var(--surface-muted))] rounded">
                <div class="text-[rgb(var(--text-muted))]">
                  {{ 'settlement.fields.departmentAmount' | translate }}
                </div>
                <div class="font-semibold">
                  {{ settlement.departmentAmount | number }} {{ 'common.sar' | translate }}
                </div>
              </div>
              <div class="p-3 bg-[rgb(var(--surface-muted))] rounded">
                <div class="text-[rgb(var(--text-muted))]">
                  {{ 'settlement.fields.legalDepartmentAmount' | translate }}
                </div>
                <div class="font-semibold">
                  {{ settlement.legalDepartmentAmount | number }} {{ 'common.sar' | translate }}
                </div>
              </div>
              <div class="p-3 bg-[rgb(var(--surface-muted))] rounded">
                <div class="text-[rgb(var(--text-muted))]">
                  {{ 'settlement.fields.managementAmount' | translate }}
                </div>
                <div class="font-semibold">
                  {{ settlement.managementAmount | number }} {{ 'common.sar' | translate }}
                </div>
              </div>
              <div class="p-3 bg-[rgb(var(--surface-muted))] rounded">
                <div class="text-[rgb(var(--text-muted))]">
                  {{ 'settlement.fields.adversaryAmount' | translate }}
                </div>
                <div class="font-semibold">
                  {{ settlement.adversaryAmount | number }} {{ 'common.sar' | translate }}
                </div>
              </div>
              <div class="text-xs text-[rgb(var(--text-muted))]">
                {{ 'common.updatedAt' | translate }}: {{ settlement.updatedAt | date: 'short' }}
              </div>
            </div>
            <ng-template #noSettlement>
              <p class="text-[rgb(var(--text-muted))] text-sm">
                {{ 'caseDetail.noSettlementLinked' | translate }}
              </p>
            </ng-template>
          </div>
        </p-tabPanel>
      </p-tabView>

      <!-- Save/Cancel Actions - Always visible at bottom -->
      <div
        class="pt-6 border-t border-[rgb(var(--border-light))] flex items-center justify-between"
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
            {{ 'common.allChangesSaved' | translate }}
          </span>
          <span
            *ngIf="caseItem && autoSaveStatus === 'saving'"
            class="flex items-center gap-1.5 text-warning"
          >
            <app-loading-spinner size="small" [show]="true"></app-loading-spinner>
            {{ 'common.saving' | translate }}
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
            {{ 'common.unsavedChanges' | translate }}
          </span>
        </div>
        <div class="flex gap-3">
          <p-button
            [outlined]="true"
            (click)="goBack()"
            [disabled]="saving"
            [attr.aria-label]="'caseDetail.cancelGoBackAria' | translate"
          >
            {{ 'actions.cancel' | translate }}
          </p-button>
          <p-button
            severity="primary"
            (click)="save()"
            [disabled]="!isFormValid() || saving"
            [attr.aria-label]="'caseDetail.saveCaseAria' | translate"
          >
            <span *ngIf="!saving">{{
              caseItem ? ('actions.saveChanges' | translate) : ('cases.list.newCase' | translate)
            }}</span>
            <span *ngIf="saving" class="flex items-center gap-2">
              <app-loading-spinner size="small" [show]="true"></app-loading-spinner>
              {{ 'common.saving' | translate }}
            </span>
          </p-button>
        </div>
      </div>
    </div>
  `,
})
export class CaseDetailComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cases = inject(CasesService);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly exportService = inject(ExportService);
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
  protected deadlineDate: Date | null = null;
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
  protected initialHearingDate: Date | null = null;
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
  protected contractReference = '';
  protected disputedAmount: number | null = null;
  protected employerName = '';
  protected employeeName = '';
  protected employmentStartDate: Date | null = null;
  protected propertyAddress = '';
  protected propertyType = '';
  protected titleDeedNumber = '';
  protected offenseType = '';
  protected incidentDate: Date | null = null;
  protected policeReportNumber = '';
  protected caseSummary = '';
  protected addingTask = false;
  protected addingDeadline = false;
  protected addingRuling = false;
  protected editingRulingId: string | null = null;
  protected editingRuling: Partial<Omit<CaseRuling, 'rulingDate'>> & {
    rulingDate?: Date | string;
  } = {};
  protected developmentNote = '';
  protected addingDevelopment = false;
  protected taskTabSearch = '';
  protected deadlineTabSearch = '';
  protected developmentTabSearch = '';
  protected rulingTabSearch = '';
  protected breadcrumbItems: Array<{
    label?: string;
    labelKey?: string;
    route?: string | any[];
  }> = [];
  protected autoSaveStatus: 'saved' | 'saving' | 'unsaved' = 'saved';
  protected lawyers: Lawyer[] = [];
  protected companyLawyerId = '';
  protected courts: CourtType[] = [];
  protected selectedCourtTypeId = '';
  protected availableLevels: CourtLevel[] = [];
  protected readonly matterTypeOptions = CASE_MATTER_TYPES;
  protected matterType: CaseMatterType = 'GeneralCivil';
  private lastSavedData: LastSavedData = {
    title: '',
    client: '',
    status: '',
    companyLawyerId: '',
    claimant: '',
    beneficiary: '',
    initialHearingDate: '',
    matterType: 'GeneralCivil',
    portalJson: '{}',
  };
  protected portalFields: PortalWorkbookFields = {};
  protected newRuling = {
    stage: 'primary' as Exclude<CaseStage, 'settled'>,
    caseNo: '',
    caseType: 'Plaintiff' as CaseType,
    courtType: '',
    courtLevel: '',
    courtCity: '',
    caseDetails: '',
    filingDate: new Date(),
    filingNo: '',
    stageNo: 1,
    rulingInFavorOf: 'Company' as RulingInFavorOf,
    rulingDate: new Date(),
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
        this.initialHearingDate = this.parseStoredDate(this.caseItem.initialHearingDate);
        this.matterType = this.caseItem.matterType ?? 'GeneralCivil';
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
        this.contractReference = this.caseItem.contractReference || '';
        this.disputedAmount = this.caseItem.disputedAmount ?? null;
        this.employerName = this.caseItem.employerName || '';
        this.employeeName = this.caseItem.employeeName || '';
        this.employmentStartDate = this.parseStoredDate(this.caseItem.employmentStartDate);
        this.propertyAddress = this.caseItem.propertyAddress || '';
        this.propertyType = this.caseItem.propertyType || '';
        this.titleDeedNumber = this.caseItem.titleDeedNumber || '';
        this.offenseType = this.caseItem.offenseType || '';
        this.incidentDate = this.parseStoredDate(this.caseItem.incidentDate);
        this.policeReportNumber = this.caseItem.policeReportNumber || '';
        this.caseSummary = this.caseItem.caseSummary || '';
        const pw = this.caseItem.portalWorkbook;
        this.portalFields = {
          userNumber: pw?.userNumber ?? '',
          externalId: pw?.externalId ?? '',
          plaintiff: pw?.plaintiff ?? '',
          defendant: pw?.defendant ?? '',
          claimType: pw?.claimType ?? '',
          claimValue: pw?.claimValue ?? '',
          compensationType: pw?.compensationType ?? '',
          claimStatus: pw?.claimStatus ?? '',
          requiredAction: pw?.requiredAction ?? '',
          remarks: pw?.remarks ?? '',
          subrogationFiledOn: pw?.subrogationFiledOn ?? '',
          subrogationExpectedEnd: pw?.subrogationExpectedEnd ?? '',
          courtSubject: pw?.courtSubject ?? '',
          courtName: pw?.courtName ?? '',
          courtCity: pw?.courtCity ?? '',
          nextHearingDate: pw?.nextHearingDate ?? '',
          nextHearingTime: pw?.nextHearingTime ?? '',
          decisionType: pw?.decisionType ?? '',
          doublePaymentAmount: pw?.doublePaymentAmount,
        };
        this.breadcrumbItems = [
          { labelKey: 'cases.title', route: '/legal/cases' },
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
          matterType: this.matterType,
          portalJson: this.portalFingerprint(),
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
      this.breadcrumbItems = [
        { labelKey: 'cases.title', route: '/legal/cases' },
        { labelKey: 'common.newCase' },
      ];
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
        matterType: this.caseItem.matterType ?? 'GeneralCivil',
        portalJson: this.portalFingerprint(),
      };
      this.matterType = this.caseItem.matterType ?? 'GeneralCivil';
    }
    this.onCourtTypeChange();
    // Auto-save every 30 seconds
    interval(30000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.autoSave());
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
      this.formatDateForStorage(this.initialHearingDate) !==
        this.lastSavedData.initialHearingDate ||
      this.matterType !== this.lastSavedData.matterType ||
      this.portalFingerprint() !== this.lastSavedData.portalJson;
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
        initialHearingDate: this.formatDateForStorage(this.initialHearingDate),
        matterType: this.matterType,
        portalWorkbook: this.packPortalWorkbook(),
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
          matterType: this.caseItem.matterType ?? 'GeneralCivil',
          portalJson: this.portalFingerprint(),
        };
      }
      this.autoSaveStatus = 'saved';
    } catch (error) {
      this.autoSaveStatus = 'unsaved';
      console.error('Error auto-saving:', error);
    }
  }

  goBack(): void {
    this.router.navigate(['/legal/cases']);
  }

  isFormValid(): boolean {
    this.validateForm();
    return !this.titleError && !this.clientError;
  }

  validateForm(): void {
    this.titleError = '';
    this.clientError = '';

    if (!this.title.trim()) {
      this.titleError = this.translate.instant('validation.titleRequired');
    }

    if (!this.client.trim()) {
      this.clientError = this.translate.instant('validation.clientRequired');
    }
  }

  async save(): Promise<void> {
    this.validateForm();
    if (this.titleError || this.clientError) {
      this.toast.error(this.translate.instant('toasts.case.fixErrorsBeforeSave'));
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
          initialHearingDate: this.formatDateForStorage(this.initialHearingDate),
          companyLawyerId: this.companyLawyerId || undefined,
          companyLawyerName: lawyer?.name,
          matterType: this.matterType,
        });
        this.cases.updateMeta(newCase.id, this.getMatterSpecificMeta());
        // Update status if not default
        if (this.status !== 'open') {
          this.cases.updateMeta(newCase.id, {
            status: (this.status as any) === 'on-hold' ? 'pending' : (this.status as any),
          });
        }
        this.toast.success(this.translate.instant('toasts.case.created'));
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
        // Update existing case (single persist; demographics and matter type included)
        this.cases.updateMeta(this.caseItem.id, {
          title: this.title.trim(),
          client: this.client.trim(),
          status: (this.status as any) === 'on-hold' ? 'pending' : (this.status as any),
          companyLawyerId: this.companyLawyerId || undefined,
          companyLawyerName: lawyer?.name,
          claimant: this.claimant.trim() || undefined,
          beneficiary: this.beneficiary.trim() || undefined,
          initialHearingDate: this.formatDateForStorage(this.initialHearingDate),
          matterType: this.matterType,
          ...this.getMatterSpecificMeta(),
        });
        this.toast.success(this.translate.instant('toasts.case.updated'));
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
            matterType: this.caseItem.matterType ?? 'GeneralCivil',
            portalJson: this.portalFingerprint(),
          };
          this.matterType = this.caseItem.matterType ?? 'GeneralCivil';
        }
        this.autoSaveStatus = 'saved';
      }
    } catch (error) {
      this.toast.error(this.translate.instant('toasts.case.saveFailed'));
      console.error('Error saving case:', error);
    } finally {
      this.saving = false;
    }
  }

  legalStatusTranslationSegment(): string {
    const status = this.getLegalStatusValue();
    if (status === 0 || status === 1 || status === 3 || status === 4) return String(status);
    return 'unknown';
  }

  getLegalStatusValue(): number {
    return this.caseItem?.legalStatus ?? 1; // Default to 1 (To Legal Department)
  }

  getLegalStatusSeverity():
    | 'success'
    | 'info'
    | 'warn'
    | 'danger'
    | 'secondary'
    | 'contrast'
    | undefined {
    const status = this.getLegalStatusValue();
    switch (status) {
      case 0:
        return undefined;
      case 1:
        return 'info';
      case 3:
        return 'warn';
      case 4:
        return 'success';
      default:
        return undefined;
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

  filteredTasks(): CaseTask[] {
    const tasks = this.caseItem?.tasks ?? [];
    const q = this.taskTabSearch.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter((t) => t.title.toLowerCase().includes(q));
  }

  filteredDeadlines(): CaseDeadline[] {
    const deadlines = this.caseItem?.deadlines ?? [];
    const q = this.deadlineTabSearch.trim().toLowerCase();
    if (!q) return deadlines;
    return deadlines.filter(
      (d) => d.title.toLowerCase().includes(q) || (d.date && d.date.toLowerCase().includes(q)),
    );
  }

  filteredDevelopments(): CaseDevelopment[] {
    const list = this.caseItem?.developments ?? [];
    const q = this.developmentTabSearch.trim().toLowerCase();
    if (!q) return list;
    return list.filter((d) => d.note.toLowerCase().includes(q));
  }

  filteredRulings(): CaseRuling[] {
    const rulings = this.caseItem?.rulings ?? [];
    const q = this.rulingTabSearch.trim().toLowerCase();
    if (!q) return rulings;
    return rulings.filter((r) => {
      const blob = [
        r.caseNo,
        r.caseType,
        r.stage,
        String(r.stageNo),
        r.courtType,
        r.adversaryName,
        r.caseDetails,
        r.filingDate,
        r.rulingDate,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return blob.includes(q);
    });
  }

  private parseStoredDate(value?: string): Date | null {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  private formatDateForStorage(value: Date | string | null | undefined): string | undefined {
    if (!value) return undefined;
    const parsed = value instanceof Date ? value : new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString().slice(0, 10);
  }

  private getMatterSpecificMeta(): Partial<CaseItem> {
    const withPortal = (meta: Partial<CaseItem>): Partial<CaseItem> => ({
      ...meta,
      portalWorkbook: this.packPortalWorkbook(),
    });
    const clearNonMotor = {
      claimantDemographics: undefined,
      damageType: undefined,
      disabilityMetrics: undefined,
    };
    const clearCommercial = { contractReference: undefined, disputedAmount: undefined };
    const clearLabor = {
      employerName: undefined,
      employeeName: undefined,
      employmentStartDate: undefined,
    };
    const clearRealEstate = {
      propertyAddress: undefined,
      propertyType: undefined,
      titleDeedNumber: undefined,
    };
    const clearCriminal = {
      offenseType: undefined,
      incidentDate: undefined,
      policeReportNumber: undefined,
    };
    const clearGeneral = { caseSummary: undefined };

    switch (this.matterType) {
      case 'MotorInsurance':
        return withPortal({
          ...clearCommercial,
          ...clearLabor,
          ...clearRealEstate,
          ...clearCriminal,
          ...clearGeneral,
          claimantDemographics: this.demographics,
          damageType: this.damageType || undefined,
          disabilityMetrics: this.damageType === 'Disability' ? this.disabilityMetrics : undefined,
        });
      case 'CommercialContract':
        return withPortal({
          ...clearNonMotor,
          ...clearLabor,
          ...clearRealEstate,
          ...clearCriminal,
          ...clearGeneral,
          contractReference: this.contractReference.trim() || undefined,
          disputedAmount: this.disputedAmount ?? undefined,
        });
      case 'LaborEmployment':
        return withPortal({
          ...clearNonMotor,
          ...clearCommercial,
          ...clearRealEstate,
          ...clearCriminal,
          ...clearGeneral,
          employerName: this.employerName.trim() || undefined,
          employeeName: this.employeeName.trim() || undefined,
          employmentStartDate: this.formatDateForStorage(this.employmentStartDate),
        });
      case 'RealEstate':
        return withPortal({
          ...clearNonMotor,
          ...clearCommercial,
          ...clearLabor,
          ...clearCriminal,
          ...clearGeneral,
          propertyAddress: this.propertyAddress.trim() || undefined,
          propertyType: this.propertyType.trim() || undefined,
          titleDeedNumber: this.titleDeedNumber.trim() || undefined,
        });
      case 'CriminalDefense':
        return withPortal({
          ...clearNonMotor,
          ...clearCommercial,
          ...clearLabor,
          ...clearRealEstate,
          ...clearGeneral,
          offenseType: this.offenseType.trim() || undefined,
          incidentDate: this.formatDateForStorage(this.incidentDate),
          policeReportNumber: this.policeReportNumber.trim() || undefined,
        });
      case 'GeneralCivil':
      default:
        return withPortal({
          ...clearNonMotor,
          ...clearCommercial,
          ...clearLabor,
          ...clearRealEstate,
          ...clearCriminal,
          caseSummary: this.caseSummary.trim() || undefined,
        });
    }
  }

  private packPortalWorkbook(): PortalWorkbookFields | undefined {
    const p = this.portalFields;
    const out: PortalWorkbookFields = {};
    const setStr = (key: keyof PortalWorkbookFields, v: unknown) => {
      if (typeof v === 'string' && v.trim())
        (out as Record<string, string>)[key as string] = v.trim();
    };
    setStr('userNumber', p.userNumber);
    setStr('externalId', p.externalId);
    setStr('plaintiff', p.plaintiff);
    setStr('defendant', p.defendant);
    setStr('claimType', p.claimType);
    setStr('claimValue', p.claimValue);
    setStr('compensationType', p.compensationType);
    setStr('claimStatus', p.claimStatus);
    setStr('requiredAction', p.requiredAction);
    setStr('remarks', p.remarks);
    setStr('subrogationFiledOn', p.subrogationFiledOn);
    setStr('subrogationExpectedEnd', p.subrogationExpectedEnd);
    setStr('courtSubject', p.courtSubject);
    setStr('courtName', p.courtName);
    setStr('courtCity', p.courtCity);
    setStr('nextHearingDate', p.nextHearingDate);
    setStr('nextHearingTime', p.nextHearingTime);
    setStr('decisionType', p.decisionType);
    if (typeof p.doublePaymentAmount === 'number' && Number.isFinite(p.doublePaymentAmount)) {
      out.doublePaymentAmount = p.doublePaymentAmount;
    }
    return Object.keys(out).length ? out : undefined;
  }

  private portalFingerprint(): string {
    return JSON.stringify(this.packPortalWorkbook() ?? {});
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
    this.toast.success(this.translate.instant('toasts.case.settlementCreated'));
    this.router.navigate(['/settlements', created.id]);
  }

  nextStage(): void {
    if (!this.caseItem) return;
    try {
      this.cases.advanceStage(this.caseItem.id);
      this.caseItem = this.cases.getById(this.caseItem.id);
      this.toast.success(this.translate.instant('toasts.case.stageAdvanced'));
    } catch (error: any) {
      const errorMessage =
        error?.message || this.translate.instant('toasts.case.advanceStageFailed');
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
      this.toast.success(this.translate.instant('toasts.case.settled'));
    } catch (error) {
      this.toast.error(this.translate.instant('toasts.case.settleFailed'));
      console.error('Error settling case:', error);
    }
  }

  execute(): void {
    if (!this.caseItem) return;
    try {
      // Execute case moves to execution stage and creates execution case record
      this.cases.executeCase(this.caseItem.id);
      this.caseItem = this.cases.getById(this.caseItem.id);
      this.toast.success(this.translate.instant('toasts.case.movedExecution'));
    } catch (error) {
      this.toast.error(this.translate.instant('toasts.case.executeFailed'));
      console.error('Error executing case:', error);
    }
  }

  async addTask(): Promise<void> {
    if (!this.caseItem) {
      this.toast.warning(this.translate.instant('toasts.case.saveBeforeTasks'));
      return;
    }
    const t = this.taskTitle.trim();
    if (!t) {
      this.toast.warning(this.translate.instant('toasts.case.taskTitleRequired'));
      return;
    }
    this.addingTask = true;
    try {
      this.cases.addTask(this.caseItem.id, t);
      this.caseItem = this.cases.getById(this.caseItem.id);
      this.taskTitle = '';
      this.toast.success(this.translate.instant('toasts.case.taskAdded'));
    } catch (error) {
      this.toast.error(this.translate.instant('toasts.case.taskAddFailed'));
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
      title: this.translate.instant('confirm.removeTaskTitle'),
      message: this.translate.instant('confirm.removeTaskMessage', {
        name: task?.title || this.translate.instant('confirm.thisTask'),
      }),
      confirmText: this.translate.instant('common.remove'),
      cancelText: this.translate.instant('actions.cancel'),
      type: 'danger',
    });
    if (!confirmed) return;
    try {
      this.cases.removeTask(this.caseItem.id, taskId);
      this.caseItem = this.cases.getById(this.caseItem.id);
      this.toast.success(this.translate.instant('toasts.case.taskRemoved'));
    } catch (error) {
      this.toast.error(this.translate.instant('toasts.case.taskRemoveFailed'));
      console.error('Error removing task:', error);
    }
  }

  validateDeadline(): void {
    this.deadlineTitleError = '';
    this.deadlineDateError = '';

    if (!this.deadlineTitle.trim()) {
      this.deadlineTitleError = this.translate.instant('validation.deadlineTitleRequired');
    }

    if (!this.deadlineDate) {
      this.deadlineDateError = this.translate.instant('validation.deadlineDateRequired');
    } else {
      const deadlineDate = this.deadlineDate;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (deadlineDate < today) {
        this.deadlineDateError = this.translate.instant('validation.deadlineFuture');
      }
    }
  }

  async addDeadline(): Promise<void> {
    if (!this.caseItem) {
      this.toast.warning(this.translate.instant('toasts.case.saveBeforeDeadlines'));
      return;
    }
    this.validateDeadline();
    if (this.deadlineTitleError || this.deadlineDateError) {
      this.toast.error(this.translate.instant('toasts.case.fixErrorsDeadline'));
      return;
    }
    this.addingDeadline = true;
    try {
      const deadlineDate = this.formatDateForStorage(this.deadlineDate);
      if (!deadlineDate) {
        this.deadlineDateError = this.translate.instant('validation.deadlineDateRequired');
        this.toast.error(this.translate.instant('toasts.case.fixErrorsDeadline'));
        return;
      }
      this.cases.addDeadline(this.caseItem.id, this.deadlineTitle.trim(), deadlineDate);
      this.caseItem = this.cases.getById(this.caseItem.id);
      this.deadlineTitle = '';
      this.deadlineDate = null;
      this.deadlineTitleError = '';
      this.deadlineDateError = '';
      this.toast.success(this.translate.instant('toasts.case.deadlineAdded'));
    } catch (error) {
      this.toast.error(this.translate.instant('toasts.case.deadlineAddFailed'));
      console.error('Error adding deadline:', error);
    } finally {
      this.addingDeadline = false;
    }
  }

  async removeDeadline(deadlineId: string): Promise<void> {
    if (!this.caseItem) return;
    const deadline = this.caseItem.deadlines.find((d) => d.id === deadlineId);
    const confirmed = await this.confirmDialog.confirm({
      title: this.translate.instant('confirm.removeDeadlineTitle'),
      message: this.translate.instant('confirm.removeDeadlineMessage', {
        name: deadline?.title || this.translate.instant('confirm.thisDeadline'),
      }),
      confirmText: this.translate.instant('common.remove'),
      cancelText: this.translate.instant('actions.cancel'),
      type: 'danger',
    });
    if (!confirmed) return;
    try {
      this.cases.removeDeadline(this.caseItem.id, deadlineId);
      this.caseItem = this.cases.getById(this.caseItem.id);
      this.toast.success(this.translate.instant('toasts.case.deadlineRemoved'));
    } catch (error) {
      this.toast.error(this.translate.instant('toasts.case.deadlineRemoveFailed'));
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
      this.rulingCaseNoError = this.translate.instant('validation.caseNoRequired');
    }

    if (!this.newRuling.courtType.trim()) {
      this.rulingCourtTypeError = this.translate.instant('validation.courtTypeRequired');
    }

    if (this.newRuling.filingDate) {
      const filingDate = new Date(this.newRuling.filingDate);
      if (isNaN(filingDate.getTime())) {
        this.rulingFilingDateError = this.translate.instant('validation.invalidFilingDate');
      }
    }

    if (this.newRuling.rulingDate) {
      const rulingDate = new Date(this.newRuling.rulingDate);
      if (isNaN(rulingDate.getTime())) {
        this.rulingRulingDateError = this.translate.instant('validation.invalidRulingDate');
      }
    }
  }

  async addRuling(): Promise<void> {
    if (!this.caseItem) {
      this.toast.warning(this.translate.instant('toasts.case.saveBeforeRulings'));
      return;
    }
    this.validateRuling();
    if (
      this.rulingCaseNoError ||
      this.rulingCourtTypeError ||
      this.rulingFilingDateError ||
      this.rulingRulingDateError
    ) {
      this.toast.error(this.translate.instant('toasts.case.fixErrorsRuling'));
      return;
    }

    this.addingRuling = true;
    try {
      const filingDate = this.formatDateForStorage(this.newRuling.filingDate);
      const rulingDate = this.formatDateForStorage(this.newRuling.rulingDate);
      if (!filingDate || !rulingDate) {
        this.rulingFilingDateError = filingDate
          ? ''
          : this.translate.instant('validation.invalidFilingDate');
        this.rulingRulingDateError = rulingDate
          ? ''
          : this.translate.instant('validation.invalidRulingDate');
        this.toast.error(this.translate.instant('toasts.case.fixErrorsRuling'));
        return;
      }
      this.cases.addRuling(this.caseItem.id, {
        stage: this.newRuling.stage,
        caseNo: this.newRuling.caseNo,
        caseType: this.newRuling.caseType,
        courtType: this.newRuling.courtType,
        courtLevel: this.newRuling.courtLevel,
        courtCity: this.newRuling.courtCity,
        caseDetails: this.newRuling.caseDetails,
        filingDate,
        filingNo: this.newRuling.filingNo,
        stageNo: this.newRuling.stageNo,
        rulingInFavorOf: this.newRuling.rulingInFavorOf,
        rulingDate,
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
      this.toast.success(this.translate.instant('toasts.case.rulingAdded'));
      // Reset form
      this.newRuling = {
        stage: 'primary' as Exclude<CaseStage, 'settled'>,
        caseNo: '',
        caseType: 'Plaintiff' as CaseType,
        courtType: '',
        courtLevel: '',
        courtCity: '',
        caseDetails: '',
        filingDate: new Date(),
        filingNo: '',
        stageNo: 1,
        rulingInFavorOf: 'Company' as RulingInFavorOf,
        rulingDate: new Date(),
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
      this.toast.error(this.translate.instant('toasts.case.rulingAddFailed'));
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
      rulingDate: this.parseStoredDate(ruling.rulingDate) || undefined,
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
      const payload: Partial<CaseRuling> = { ...this.editingRuling } as Partial<CaseRuling>;
      if ('rulingDate' in payload) {
        const normalized = this.formatDateForStorage(payload.rulingDate as any);
        payload.rulingDate = normalized ?? undefined;
      }
      this.cases.updateRuling(this.caseItem.id, rulingId, payload);
      this.caseItem = this.cases.getById(this.caseItem.id);
      this.editingRulingId = null;
      this.editingRuling = {};
      this.toast.success(this.translate.instant('toasts.case.rulingUpdated'));
    } catch (error) {
      this.toast.error(this.translate.instant('toasts.case.rulingUpdateFailed'));
      console.error('Error updating ruling:', error);
    }
  }

  async deleteRuling(rulingId: string): Promise<void> {
    if (!this.caseItem) return;
    const ruling = this.caseItem.rulings?.find((r) => r.id === rulingId);
    const confirmed = await this.confirmDialog.confirm({
      title: this.translate.instant('confirm.deleteRulingTitle'),
      message: this.translate.instant('confirm.deleteRulingMessage', {
        caseNo: ruling?.caseNo || this.translate.instant('confirm.thisRuling'),
      }),
      confirmText: this.translate.instant('actions.delete'),
      cancelText: this.translate.instant('actions.cancel'),
      type: 'danger',
    });
    if (!confirmed) return;
    try {
      this.cases.deleteRuling(this.caseItem.id, rulingId);
      this.caseItem = this.cases.getById(this.caseItem.id);
      this.toast.success(this.translate.instant('toasts.case.rulingDeleted'));
    } catch (error) {
      this.toast.error(this.translate.instant('toasts.case.rulingDeleteFailed'));
      console.error('Error deleting ruling:', error);
    }
  }

  async addDevelopment(): Promise<void> {
    if (!this.caseItem) {
      this.toast.warning(this.translate.instant('toasts.case.saveBeforeDevelopments'));
      return;
    }
    const note = this.developmentNote.trim();
    if (!note) {
      this.toast.warning(this.translate.instant('toasts.case.developmentRequired'));
      return;
    }
    this.addingDevelopment = true;
    try {
      this.cases.addDevelopment(this.caseItem.id, note);
      this.caseItem = this.cases.getById(this.caseItem.id);
      this.developmentNote = '';
      this.toast.success(this.translate.instant('toasts.case.developmentAdded'));
    } catch (error) {
      this.toast.error(this.translate.instant('toasts.case.developmentAddFailed'));
      console.error('Error adding development:', error);
    } finally {
      this.addingDevelopment = false;
    }
  }

  exportCase(): void {
    if (!this.caseItem) return;
    try {
      this.exportService.exportCaseDetailsToCSV(this.caseItem);
      this.toast.success(this.translate.instant('toasts.case.exported'));
    } catch (error) {
      this.toast.error(this.translate.instant('toasts.case.exportFailed'));
      console.error('Error exporting case:', error);
    }
  }
}
