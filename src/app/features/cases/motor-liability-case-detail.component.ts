import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { TabViewModule } from 'primeng/tabview';
import { CasesService } from '../../shared/services/cases.service';
import {
  MotorLiabilityCase,
  MotorLiabilityService,
} from '../../shared/services/motor-liability.service';

@Component({
  standalone: true,
  selector: 'app-motor-liability-case-detail',
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    ButtonModule,
    TabViewModule,
    CalendarModule,
  ],
  template: `
    <div class="mb-6">
      <button
        (click)="cancel()"
        class="mb-4 flex items-center text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))] transition"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Cases
      </button>
      <h2 class="text-2xl font-bold">Motor Liability Case</h2>
    </div>

    <div class="flex flex-col gap-8">
      <!-- Tabbed Content -->
      <p-tabView>
        <!-- Overview Tab -->
        <p-tabPanel header="Overview">
          <div class="p-4">
            <h3 class="text-lg font-bold mb-6">Case Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                  >Case No</label
                >
                <input type="text" [(ngModel)]="caseData.caseNo" class="w-full" />
              </div>
              <div *ngIf="linkedLegalCaseNumber">
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                  >Linked Legal Case No</label
                >
                <input
                  type="text"
                  [value]="linkedLegalCaseNumber"
                  readonly
                  class="w-full font-mono bg-[rgb(var(--surface-muted))] cursor-not-allowed"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                  >Court Type</label
                >
                <input type="text" [(ngModel)]="caseData.courtType" class="w-full" />
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                  >Court Level</label
                >
                <input type="text" [(ngModel)]="caseData.courtLevel" class="w-full" />
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                  >Court City</label
                >
                <input type="text" [(ngModel)]="caseData.courtCity" class="w-full" />
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                  >Case Description</label
                >
                <textarea [(ngModel)]="caseData.caseDescription" rows="3" class="w-full"></textarea>
              </div>
            </div>
          </div>
        </p-tabPanel>

        <!-- Claimant Info Tab -->
        <p-tabPanel header="Claimant Info">
          <div class="p-4">
            <h3 class="text-lg font-bold mb-6">Claimant Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                  >Claimant Name</label
                >
                <input type="text" [(ngModel)]="caseData.claimantName" class="w-full" />
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                  >Nationality</label
                >
                <input type="text" [(ngModel)]="caseData.nationality" class="w-full" />
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                  >Gender</label
                >
                <select [(ngModel)]="caseData.gender" class="w-full">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">Age</label>
                <input type="number" [(ngModel)]="caseData.age" min="0" class="w-full" />
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                  >Marital Status</label
                >
                <select [(ngModel)]="caseData.maritalStatus" class="w-full">
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
                <input type="text" [(ngModel)]="caseData.profession" class="w-full" />
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                  >Damage Type</label
                >
                <select [(ngModel)]="caseData.damageType" class="w-full">
                  <option value="Fatal">Fatal</option>
                  <option value="Disability">Disability</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                  >Percent of (Moral, Physical)</label
                >
                <input
                  type="text"
                  [(ngModel)]="caseData.percentMoralPhysical"
                  placeholder="e.g., 50% Moral, 30% Physical"
                  class="w-full"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                  >Total Claimed Amount</label
                >
                <input
                  type="number"
                  [(ngModel)]="caseData.totalClaimedAmount"
                  min="0"
                  step="0.01"
                  class="w-full"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                  >Total Paid Amount</label
                >
                <input
                  type="number"
                  [(ngModel)]="caseData.totalPaidAmount"
                  min="0"
                  step="0.01"
                  class="w-full"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                  >Date of Insertion</label
                >
                <p-calendar
                  [(ngModel)]="dateOfInsertion"
                  dateFormat="dd/mm/yy"
                  [showIcon]="true"
                  styleClass="w-full"
                ></p-calendar>
              </div>
            </div>
          </div>
        </p-tabPanel>

        <!-- Hearings & Development Tab -->
        <p-tabPanel header="Hearings & Development">
          <div class="p-4">
            <h3 class="text-lg font-bold mb-6">Hearings and Case Development</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                  >Period (From)</label
                >
                <p-calendar
                  [(ngModel)]="periodFrom"
                  dateFormat="dd/mm/yy"
                  [showIcon]="true"
                  styleClass="w-full"
                ></p-calendar>
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                  >Period (To)</label
                >
                <p-calendar
                  [(ngModel)]="periodTo"
                  dateFormat="dd/mm/yy"
                  [showIcon]="true"
                  styleClass="w-full"
                ></p-calendar>
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                  >Court Type</label
                >
                <input type="text" [(ngModel)]="caseData.hearingsCourtType" class="w-full" />
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                  >Court Level</label
                >
                <input type="text" [(ngModel)]="caseData.hearingsCourtLevel" class="w-full" />
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                  >Court Room</label
                >
                <input type="text" [(ngModel)]="caseData.courtRoom" class="w-full" />
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                  >Ruling Date</label
                >
                <p-calendar
                  [(ngModel)]="rulingDate"
                  dateFormat="dd/mm/yy"
                  [showIcon]="true"
                  styleClass="w-full"
                ></p-calendar>
              </div>
            </div>
          </div>
        </p-tabPanel>
      </p-tabView>

      <!-- Save/Cancel Actions -->
      <div class="pt-6 border-t border-[rgb(var(--border-light))] flex gap-2">
        <p-button severity="primary" (click)="save()" label="Save"></p-button>
        <p-button [outlined]="true" (click)="cancel()" label="Cancel"></p-button>
      </div>
    </div>
  `,
})
export class MotorLiabilityCaseDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly motorLiabilityService = inject(MotorLiabilityService);
  private readonly casesService = inject(CasesService);

  protected caseData: MotorLiabilityCase;
  protected dateOfInsertion: string = '';
  protected periodFrom: string = '';
  protected periodTo: string = '';
  protected rulingDate: string = '';
  protected linkedLegalCaseNumber: string = '';

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const existing = this.motorLiabilityService.getById(id);
      if (existing) {
        this.caseData = { ...existing };
        this.dateOfInsertion = existing.dateOfInsertion
          ? existing.dateOfInsertion.split('T')[0]
          : '';
        this.periodFrom = existing.periodFrom ? existing.periodFrom.split('T')[0] : '';
        this.periodTo = existing.periodTo ? existing.periodTo.split('T')[0] : '';
        this.rulingDate = existing.rulingDate ? existing.rulingDate.split('T')[0] : '';
        this.linkedLegalCaseNumber = this.resolveLegalCaseNumber(existing.unifiedCaseId);
      } else {
        this.caseData = this.createEmptyCase();
      }
    } else {
      this.caseData = this.createEmptyCase();
    }
  }

  private resolveLegalCaseNumber(unifiedCaseId?: string): string {
    if (!unifiedCaseId) return '';
    const match = this.casesService.list().find((c) => c.unifiedCaseId === unifiedCaseId);
    return match?.caseNumber || match?.baseCaseNumber || '';
  }

  private createEmptyCase(): MotorLiabilityCase {
    return {
      id: '',
      caseNo: '',
      courtType: '',
      courtLevel: '',
      courtCity: '',
      caseDescription: '',
      claimantName: '',
      nationality: '',
      gender: 'Male',
      age: 0,
      maritalStatus: 'Single',
      profession: '',
      damageType: 'Fatal',
      percentMoralPhysical: '',
      totalClaimedAmount: 0,
      totalPaidAmount: 0,
      dateOfInsertion: '',
      periodFrom: '',
      periodTo: '',
      hearingsCourtType: '',
      hearingsCourtLevel: '',
      courtRoom: '',
      rulingDate: '',
      unifiedCaseId: '',
      createdAt: '',
      updatedAt: '',
    };
  }

  save(): void {
    this.caseData.dateOfInsertion = this.dateOfInsertion
      ? new Date(this.dateOfInsertion).toISOString()
      : '';
    this.caseData.periodFrom = this.periodFrom ? new Date(this.periodFrom).toISOString() : '';
    this.caseData.periodTo = this.periodTo ? new Date(this.periodTo).toISOString() : '';
    this.caseData.rulingDate = this.rulingDate ? new Date(this.rulingDate).toISOString() : '';

    if (this.caseData.id) {
      this.motorLiabilityService.update(this.caseData.id, this.caseData);
    } else {
      const created = this.motorLiabilityService.create({
        caseNo: this.caseData.caseNo,
        courtType: this.caseData.courtType,
        courtLevel: this.caseData.courtLevel,
        courtCity: this.caseData.courtCity,
        caseDescription: this.caseData.caseDescription,
        claimantName: this.caseData.claimantName,
        nationality: this.caseData.nationality,
        gender: this.caseData.gender,
        age: this.caseData.age,
        maritalStatus: this.caseData.maritalStatus,
        profession: this.caseData.profession,
        damageType: this.caseData.damageType,
        percentMoralPhysical: this.caseData.percentMoralPhysical,
        totalClaimedAmount: this.caseData.totalClaimedAmount,
        totalPaidAmount: this.caseData.totalPaidAmount,
        dateOfInsertion: this.caseData.dateOfInsertion,
        periodFrom: this.caseData.periodFrom,
        periodTo: this.caseData.periodTo,
        hearingsCourtType: this.caseData.hearingsCourtType,
        hearingsCourtLevel: this.caseData.hearingsCourtLevel,
        courtRoom: this.caseData.courtRoom,
        rulingDate: this.caseData.rulingDate,
        linkedClaimId: this.caseData.linkedClaimId,
      });
      this.router.navigate(['/motor-liability', created.id]);
    }
  }

  cancel(): void {
    this.router.navigate(['/legal/dashboard']);
  }
}
