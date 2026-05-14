import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { TabViewModule } from 'primeng/tabview';
import { InputNumberModule } from 'primeng/inputnumber';
import { LanguageService } from '../../core/i18n/language.service';
import { CasesService, CaseStage } from '../../shared/services/cases.service';
import {
  ExecutionCase,
  ExecutionCasesService,
} from '../../shared/services/execution-cases.service';
import { ToastService } from '../../shared/services/toast.service';
import { LOCALE_CONFIG } from '../../shared/config/locale.config';

@Component({
  standalone: true,
  selector: 'app-execution-case-detail',
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    ButtonModule,
    TabViewModule,
    InputNumberModule,
    CalendarModule,
  ],
  template: `
    <div class="mb-6">
      <button
        (click)="cancel()"
        class="mb-4 flex items-center text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))] transition"
      >
        <svg class="w-5 h-5 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        {{ 'execution.backToList' | translate }}
      </button>
      <h2 class="text-2xl font-bold">{{ 'execution.detailTitle' | translate }}</h2>
    </div>

    <div class="flex flex-col gap-8">
      <!-- Tabbed Content -->
      <p-tabView>
        <!-- Overview Tab -->
        <p-tabPanel [header]="'execution.tabs.overview' | translate">
          <div class="p-4">
            <h3 class="text-lg font-bold mb-6">{{ 'execution.caseInformation' | translate }}</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                  'execution.fields.executionCaseNo' | translate
                }}</label>
                <input type="text" [(ngModel)]="executionCase.executionCaseNo" class="w-full" />
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                  'execution.fields.requestNo' | translate
                }}</label>
                <input type="text" [(ngModel)]="executionCase.requestNo" class="w-full" />
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                  'execution.fields.fileNo' | translate
                }}</label>
                <input type="text" [(ngModel)]="executionCase.fileNo" class="w-full" />
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                  'execution.fields.requestDate' | translate
                }}</label>
                <p-calendar
                  [(ngModel)]="requestDate"
                  dateFormat="dd/mm/yy"
                  [showIcon]="true"
                  styleClass="w-full"
                ></p-calendar>
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                  'execution.fields.linkedCaseId' | translate
                }}</label>
                <input
                  type="text"
                  [(ngModel)]="executionCase.linkedCaseId"
                  class="w-full font-mono bg-[rgb(var(--surface-muted))] cursor-not-allowed"
                  readonly
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                  'execution.fields.unifiedCaseId' | translate
                }}</label>
                <input
                  type="text"
                  [(ngModel)]="executionCase.unifiedCaseId"
                  class="w-full font-mono bg-[rgb(var(--surface-muted))] cursor-not-allowed"
                  readonly
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                  'execution.fields.fileDate' | translate
                }}</label>
                <p-calendar
                  [(ngModel)]="fileDate"
                  dateFormat="dd/mm/yy"
                  [showIcon]="true"
                  styleClass="w-full"
                ></p-calendar>
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                  'execution.fields.executionApplicant' | translate
                }}</label>
                <input type="text" [(ngModel)]="executionCase.executionApplicant" class="w-full" />
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                  'execution.fields.executionRespondent' | translate
                }}</label>
                <input type="text" [(ngModel)]="executionCase.executionRespondent" class="w-full" />
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                  'execution.fields.requestClassification' | translate
                }}</label>
                <input
                  type="text"
                  [(ngModel)]="executionCase.requestClassification"
                  class="w-full"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                  'execution.fields.demandedSubject' | translate
                }}</label>
                <input type="text" [(ngModel)]="executionCase.demandedSubject" class="w-full" />
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                  'execution.fields.enforcementInstrument' | translate
                }}</label>
                <input
                  type="text"
                  [(ngModel)]="executionCase.enforcementInstrument"
                  class="w-full"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                  'execution.fields.instrumentIssuingBody' | translate
                }}</label>
                <input
                  type="text"
                  [(ngModel)]="executionCase.instrumentIssuingBody"
                  class="w-full"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                  'execution.fields.executionRequestStatus' | translate
                }}</label>
                <input
                  type="text"
                  [(ngModel)]="executionCase.executionRequestStatus"
                  class="w-full"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                  'execution.fields.rulingReferenceNo' | translate
                }}</label>
                <input type="text" [(ngModel)]="executionCase.rulingReferenceNo" class="w-full" />
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                  'execution.fields.courtRoom' | translate
                }}</label>
                <input type="text" [(ngModel)]="executionCase.courtRoom" class="w-full" />
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                  'execution.fields.companyLawyer' | translate
                }}</label>
                <input type="text" [(ngModel)]="executionCase.companyLawyer" class="w-full" />
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                  'execution.fields.lastCourtType' | translate
                }}</label>
                <input type="text" [(ngModel)]="executionCase.lastCourtType" class="w-full" />
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                  'execution.fields.lastCourtLevel' | translate
                }}</label>
                <input type="text" [(ngModel)]="executionCase.lastCourtLevel" class="w-full" />
              </div>
            </div>
          </div>
        </p-tabPanel>

        <!-- Financial Info Tab -->
        <p-tabPanel [header]="'execution.tabs.financial' | translate">
          <div class="p-4">
            <h3 class="text-lg font-bold mb-6">
              {{ 'execution.financialInformation' | translate }}
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                  'execution.fields.amountRuled' | translate
                }}</label>
                <p-inputNumber
                  mode="currency"
                  [currency]="currencyCode"
                  [locale]="primeNumberLocale()"
                  [(ngModel)]="executionCase.amountRuled"
                  [min]="0"
                  [minFractionDigits]="2"
                  [maxFractionDigits]="2"
                  styleClass="w-full"
                ></p-inputNumber>
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">{{
                  'execution.fields.amountPaid' | translate
                }}</label>
                <p-inputNumber
                  mode="currency"
                  [currency]="currencyCode"
                  [locale]="primeNumberLocale()"
                  [(ngModel)]="executionCase.amountPaid"
                  [min]="0"
                  [minFractionDigits]="2"
                  [maxFractionDigits]="2"
                  styleClass="w-full"
                ></p-inputNumber>
              </div>
              <div class="md:col-span-2">
                <div class="p-4 rounded-lg border border-info bg-info-muted">
                  <div class="flex items-center justify-between gap-3">
                    <span class="text-sm font-semibold text-[rgb(var(--text))]">{{
                      'execution.remainingAmount' | translate
                    }}</span>
                    <span class="text-xl font-bold text-[rgb(var(--primary))] tabular-nums">
                      {{
                        (executionCase.amountRuled || 0) - (executionCase.amountPaid || 0)
                          | number: '1.2-2' : primeNumberLocale()
                      }}
                      {{ 'common.sar' | translate }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </p-tabPanel>
      </p-tabView>

      <!-- Save/Cancel Actions -->
      <div class="pt-6 border-t border-[rgb(var(--border-light))] flex gap-2">
        <p-button
          severity="primary"
          (click)="save()"
          [label]="'actions.save' | translate"
        ></p-button>
        <p-button
          [outlined]="true"
          (click)="cancel()"
          [label]="'actions.cancel' | translate"
        ></p-button>
        <p-button
          *ngIf="executionCase.linkedCaseId"
          [outlined]="true"
          class="text-emerald-700"
          (click)="finalizeAndSettle()"
        >
          {{ 'execution.finalizeSettle' | translate }}
        </p-button>
      </div>
    </div>
  `,
})
export class ExecutionCaseDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly executionCasesService = inject(ExecutionCasesService);
  private readonly casesService = inject(CasesService);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);
  private readonly language = inject(LanguageService);

  /** SAR; displayed label comes from `common.sar` in the active language. */
  protected readonly currencyCode = LOCALE_CONFIG.currency;
  protected readonly primeNumberLocale = computed(() =>
    this.language.currentLang() === 'ar' ? 'ar-SA' : 'en-US',
  );

  protected executionCase: ExecutionCase;
  protected fileDate: Date | null = null;
  protected requestDate: Date | null = null;

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const existing = this.executionCasesService.getById(id);
      if (existing) {
        this.executionCase = { ...existing };
        this.fileDate = existing.fileDate ? new Date(existing.fileDate) : null;
        this.requestDate = existing.requestDate ? new Date(existing.requestDate) : null;
      } else {
        this.executionCase = this.createEmptyCase();
      }
    } else {
      this.executionCase = this.createEmptyCase();
    }
  }

  private createEmptyCase(): ExecutionCase {
    return {
      id: '',
      caseNumber: '',
      executionCaseNo: '',
      fileNo: '',
      fileDate: '',
      courtRoom: '',
      companyLawyer: '',
      lastCourtType: '',
      lastCourtLevel: '',
      amountRuled: 0,
      amountPaid: 0,
      linkedCaseId: '',
      unifiedCaseId: '',
      createdAt: '',
      updatedAt: '',
    };
  }

  save(): void {
    this.executionCase.fileDate = this.fileDate ? this.fileDate.toISOString() : '';
    this.executionCase.requestDate = this.requestDate ? this.requestDate.toISOString() : '';

    if (this.executionCase.id) {
      const { id, createdAt, updatedAt, ...patch } = this.executionCase;
      void createdAt;
      void updatedAt;
      this.executionCasesService.update(id, patch);
    } else {
      const created = this.executionCasesService.create({
        executionCaseNo: this.executionCase.executionCaseNo,
        fileNo: this.executionCase.fileNo,
        fileDate: this.executionCase.fileDate,
        courtRoom: this.executionCase.courtRoom,
        companyLawyer: this.executionCase.companyLawyer,
        lastCourtType: this.executionCase.lastCourtType,
        lastCourtLevel: this.executionCase.lastCourtLevel,
        amountRuled: this.executionCase.amountRuled,
        amountPaid: this.executionCase.amountPaid,
        linkedCaseId: this.executionCase.linkedCaseId || undefined,
        unifiedCaseId: this.executionCase.unifiedCaseId || undefined,
        requestNo: this.executionCase.requestNo,
        requestDate: this.executionCase.requestDate,
        executionApplicant: this.executionCase.executionApplicant,
        executionRespondent: this.executionCase.executionRespondent,
        requestClassification: this.executionCase.requestClassification,
        demandedSubject: this.executionCase.demandedSubject,
        enforcementInstrument: this.executionCase.enforcementInstrument,
        instrumentIssuingBody: this.executionCase.instrumentIssuingBody,
        executionRequestStatus: this.executionCase.executionRequestStatus,
        rulingReferenceNo: this.executionCase.rulingReferenceNo,
      });
      this.router.navigate(['/execution', created.id]);
    }
  }

  cancel(): void {
    this.router.navigate(['/execution']);
  }

  finalizeAndSettle(): void {
    if (!this.executionCase.linkedCaseId) return;
    try {
      this.casesService.settleCase(this.executionCase.linkedCaseId, 'execution' as CaseStage);
      this.toast.success(this.translate.instant('execution.toast.settled'));
    } catch (error) {
      this.toast.error(this.translate.instant('execution.toast.settleFailed'));
      console.error('Error settling linked case:', error);
    }
  }
}
