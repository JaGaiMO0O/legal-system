import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import {
  Arbitration,
  ArbitrationHearing,
  ArbitrationsService,
} from '../../shared/services/arbitrations.service';
import { CaseTrackingService } from '../../shared/services/case-tracking.service';
import { CasesService } from '../../shared/services/cases.service';
import { Lawyer, LawyersService } from '../../shared/services/lawyers.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  standalone: true,
  selector: 'app-arbitration-detail',
  imports: [CommonModule, FormsModule, TranslateModule, ButtonModule, CardModule, CalendarModule],
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
        {{ 'arbitrations.backToList' | translate }}
      </button>
      <h2 class="text-2xl font-bold">{{ 'arbitrations.detailTitle' | translate }}</h2>
    </div>

    <div class="flex flex-col gap-8">
      <p-card>
        <h3 class="font-semibold mb-4">
          {{ 'arbitrations.sections.arbitrationInfo' | translate }}
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">{{
              'arbitrations.fields.appealability' | translate
            }}</label>
            <input type="text" [(ngModel)]="arbitration.appealability" class="w-full" />
          </div>
          <div>
            <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">{{
              'arbitrations.fields.fillingDate' | translate
            }}</label>
            <p-calendar
              [(ngModel)]="fillingDate"
              dateFormat="dd/mm/yy"
              [showIcon]="true"
              styleClass="w-full"
            ></p-calendar>
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">{{
              'arbitrations.fields.caseDescription' | translate
            }}</label>
            <textarea [(ngModel)]="arbitration.caseDescription" rows="3" class="w-full"></textarea>
          </div>
          <div>
            <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">{{
              'arbitrations.fields.arbitrationRoom' | translate
            }}</label>
            <input type="text" [(ngModel)]="arbitration.arbitrationRoom" class="w-full" />
          </div>
          <div>
            <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">{{
              'arbitrations.fields.arbitrationFees' | translate
            }}</label>
            <input
              type="number"
              [(ngModel)]="arbitration.arbitrationFees"
              min="0"
              step="0.01"
              class="w-full"
            />
          </div>
          <div>
            <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">{{
              'arbitrations.fields.maximumPeriod' | translate
            }}</label>
            <input type="text" [(ngModel)]="arbitration.maximumPeriod" class="w-full" />
          </div>
        </div>
      </p-card>

      <p-card>
        <h3 class="font-semibold mb-4">
          {{ 'arbitrations.sections.companyRepresentative' | translate }}
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">{{
              'arbitrations.selectLawyer' | translate
            }}</label>
            <select
              [(ngModel)]="arbitration.companyRepresentative.lawyerName"
              class="w-full"
              (ngModelChange)="onSelectLawyer($event, 'company')"
            >
              <option value="">{{ 'arbitrations.selectLawyerPlaceholder' | translate }}</option>
              <option *ngFor="let l of lawyers" [value]="l.name">
                {{ l.lawyerNumber }} - {{ l.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">{{
              'arbitrations.fields.position' | translate
            }}</label>
            <input
              type="text"
              [(ngModel)]="arbitration.companyRepresentative.position"
              class="w-full"
            />
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">{{
              'arbitrations.fields.address' | translate
            }}</label>
            <textarea
              [(ngModel)]="arbitration.companyRepresentative.address"
              rows="2"
              class="w-full"
            ></textarea>
          </div>
        </div>
      </p-card>

      <p-card>
        <h3 class="font-semibold mb-4">
          {{ 'arbitrations.sections.oppositionRepresentative' | translate }}
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">{{
              'arbitrations.fields.lawyerName' | translate
            }}</label>
            <input
              type="text"
              [(ngModel)]="arbitration.oppositionRepresentative.lawyerName"
              class="w-full"
            />
          </div>
          <div>
            <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">{{
              'arbitrations.fields.position' | translate
            }}</label>
            <input
              type="text"
              [(ngModel)]="arbitration.oppositionRepresentative.position"
              class="w-full"
            />
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">{{
              'arbitrations.fields.address' | translate
            }}</label>
            <textarea
              [(ngModel)]="arbitration.oppositionRepresentative.address"
              rows="2"
              class="w-full"
            ></textarea>
          </div>
        </div>
      </p-card>

      <p-card>
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h3 class="font-semibold">{{ 'arbitrations.sections.hearings' | translate }}</h3>
          <div class="flex gap-2 w-full md:w-auto md:min-w-[28rem]">
            <p-calendar
              [(ngModel)]="newHearingDate"
              dateFormat="dd/mm/yy"
              [showIcon]="true"
              styleClass="w-full text-sm"
            ></p-calendar>
            <input
              type="text"
              [(ngModel)]="newHearingRemarks"
              [placeholder]="'arbitrations.fields.remarks' | translate"
              class="border rounded px-2 py-1 text-sm flex-1 min-w-0"
            />
            <button class="px-2 py-1 border rounded text-sm" (click)="addHearing()">
              {{ 'actions.add' | translate }}
            </button>
          </div>
        </div>
        <div class="relative w-full mb-3">
          <input
            type="text"
            inputmode="search"
            autocomplete="off"
            class="w-full text-sm border rounded py-1.5 pe-2 search-input-with-icon--compact"
            [(ngModel)]="hearingTabSearch"
            [placeholder]="'arbitrations.filterHearings' | translate"
          />
          <span class="search-input-icon search-input-icon--tight" aria-hidden="true">
            <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
        </div>
        <ul class="space-y-2">
          <li
            *ngFor="let hearing of filteredHearings(); trackBy: trackByHearingId"
            class="flex items-center justify-between border-b pb-2"
          >
            <div>
              <span class="font-medium">{{ hearing.date | date: 'short' }}</span>
              <span class="ms-2 text-sm text-[rgb(var(--text-muted))]">{{ hearing.remarks }}</span>
            </div>
            <button
              type="button"
              class="text-xs text-danger hover:underline"
              (click)="removeHearing(hearing.id)"
            >
              {{ 'common.remove' | translate }}
            </button>
          </li>
          <li
            *ngIf="arbitration.hearings.length === 0"
            class="text-sm text-[rgb(var(--text-muted))]"
          >
            {{ 'arbitrations.noHearings' | translate }}
          </li>
          <li
            *ngIf="arbitration.hearings.length > 0 && filteredHearings().length === 0"
            class="text-sm text-[rgb(var(--text-muted))]"
          >
            {{ 'arbitrations.hearingsNoMatchFilter' | translate }}
          </li>
        </ul>
      </p-card>

      <div class="flex gap-2">
        <div class="flex items-center gap-3">
          <p-button *ngIf="arbitration.id" severity="success" (click)="createCase()">
            <svg class="w-4 h-4 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            {{ 'arbitrations.createCase' | translate }}
          </p-button>
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
        </div>
      </div>
    </div>
  `,
})
export class ArbitrationDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly arbitrationsService = inject(ArbitrationsService);
  private readonly casesService = inject(CasesService);
  private readonly caseTracking = inject(CaseTrackingService);
  private readonly lawyersService = inject(LawyersService);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);

  protected arbitration: Arbitration;
  protected fillingDate: Date | null = null;
  protected newHearingDate: Date | null = null;
  protected newHearingRemarks: string = '';
  protected hearingTabSearch = '';
  protected lawyers: Lawyer[] = [];

  filteredHearings(): ArbitrationHearing[] {
    const list = this.arbitration.hearings ?? [];
    const q = this.hearingTabSearch.trim().toLowerCase();
    if (!q) return list;
    return list.filter((h) => {
      const blob = [h.remarks, h.date].filter(Boolean).join(' ').toLowerCase();
      return blob.includes(q);
    });
  }

  constructor() {
    this.lawyers = this.lawyersService.list();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const existing = this.arbitrationsService.getById(id);
      if (existing) {
        this.arbitration = { ...existing };
        this.fillingDate = existing.fillingDate ? new Date(existing.fillingDate) : null;
      } else {
        this.arbitration = this.createEmptyArbitration();
      }
    } else {
      this.arbitration = this.createEmptyArbitration();
    }
  }

  private createEmptyArbitration(): Arbitration {
    return {
      id: '',
      caseNumber: '',
      appealability: '',
      fillingDate: '',
      caseDescription: '',
      arbitrationRoom: '',
      arbitrationFees: 0,
      maximumPeriod: '',
      companyRepresentative: { lawyerName: '', position: '', address: '' },
      oppositionRepresentative: { lawyerName: '', position: '', address: '' },
      hearings: [],
      createdAt: '',
      updatedAt: '',
    };
  }

  save(): void {
    this.arbitration.fillingDate = this.fillingDate ? this.fillingDate.toISOString() : '';

    if (this.arbitration.id) {
      this.arbitrationsService.update(this.arbitration.id, this.arbitration);
    } else {
      const created = this.arbitrationsService.create({
        appealability: this.arbitration.appealability,
        fillingDate: this.arbitration.fillingDate,
        caseDescription: this.arbitration.caseDescription,
        arbitrationRoom: this.arbitration.arbitrationRoom,
        arbitrationFees: this.arbitration.arbitrationFees,
        maximumPeriod: this.arbitration.maximumPeriod,
        companyRepresentative: this.arbitration.companyRepresentative,
        oppositionRepresentative: this.arbitration.oppositionRepresentative,
      });
      this.router.navigate(['/arbitrations', created.id]);
    }
  }

  onSelectLawyer(lawyerName: string, side: 'company' | 'opposition'): void {
    if (side === 'company') {
      this.arbitration.companyRepresentative.lawyerName = lawyerName;
    } else {
      this.arbitration.oppositionRepresentative.lawyerName = lawyerName;
    }
  }

  cancel(): void {
    this.router.navigate(['/arbitrations']);
  }

  addHearing(): void {
    if (!this.newHearingDate) return;
    this.arbitrationsService.addHearing(this.arbitration.id, {
      date: this.newHearingDate.toISOString(),
      remarks: this.newHearingRemarks,
    });
    this.arbitration = this.arbitrationsService.getById(this.arbitration.id)!;
    this.newHearingDate = null;
    this.newHearingRemarks = '';
  }

  trackByHearingId(_index: number, hearing: { id: string }): string {
    return hearing.id;
  }

  removeHearing(hearingId: string): void {
    this.arbitrationsService.removeHearing(this.arbitration.id, hearingId);
    this.arbitration = this.arbitrationsService.getById(this.arbitration.id)!;
  }

  createCase(): void {
    if (!this.arbitration.id) {
      this.toast.warning(this.translate.instant('toasts.arbitration.saveFirst'));
      return;
    }

    try {
      // Generate unified case ID if not exists
      let unifiedCaseId = this.arbitration.unifiedCaseId;
      if (!unifiedCaseId) {
        unifiedCaseId = this.caseTracking.generateUnifiedCaseId();
        this.arbitrationsService.update(this.arbitration.id, { unifiedCaseId });
      }

      const caseTitle = this.translate.instant('arbitrations.caseFromArbitrationTitle', {
        caseNumber: this.arbitration.caseNumber || '',
      });

      // Create case with data from arbitration
      const newCase = this.casesService.create({
        title: caseTitle,
        client:
          this.arbitration.companyRepresentative.lawyerName ||
          this.translate.instant('common.unassigned'),
        tags: ['arbitration'],
        legalStatus: 1,
        matterType: 'CommercialContract',
      });

      // Link case to arbitration via unifiedCaseId
      this.casesService.updateMeta(newCase.id, {
        unifiedCaseId,
      });
      this.caseTracking.linkEntityToCase(unifiedCaseId, 'case', newCase.id);
      this.caseTracking.linkEntityToCase(unifiedCaseId, 'arbitration', this.arbitration.id);
      this.caseTracking.upsertUnifiedCase({
        unifiedCaseId,
        caseId: newCase.id,
        arbitrationId: this.arbitration.id,
        title: newCase.title,
        client: newCase.client,
      });

      this.toast.success(this.translate.instant('toasts.arbitration.caseCreated'));
      this.router.navigate(['/legal/case', newCase.id]);
    } catch (error: any) {
      this.toast.error(error?.message || this.translate.instant('toasts.arbitration.createFailed'));
      console.error('Error creating case from arbitration:', error);
    }
  }
}
