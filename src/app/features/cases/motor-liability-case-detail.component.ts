import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { UIButtonComponent } from '../../shared/components/ui/button.component';
import { UICardComponent } from '../../shared/components/ui/card.component';
import {
  MotorLiabilityService,
  MotorLiabilityCase,
  Gender,
  MaritalStatus,
  DamageType,
} from '../../shared/services/motor-liability.service';

@Component({
  standalone: true,
  selector: 'app-motor-liability-case-detail',
  imports: [CommonModule, FormsModule, TranslateModule, UIButtonComponent, UICardComponent],
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

    <ui-card>
      <h3 class="font-semibold mb-4">Case</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">Case No</label>
          <input type="text" [(ngModel)]="caseData.caseNo" class="w-full" />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">Court Type</label>
          <input type="text" [(ngModel)]="caseData.courtType" class="w-full" />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">Court Level</label>
          <input type="text" [(ngModel)]="caseData.courtLevel" class="w-full" />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">Court City</label>
          <input type="text" [(ngModel)]="caseData.courtCity" class="w-full" />
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">Case Description</label>
          <textarea [(ngModel)]="caseData.caseDescription" rows="3" class="w-full"></textarea>
        </div>
      </div>
    </ui-card>

    <ui-card class="mt-6">
      <h3 class="font-semibold mb-4">Claimant Info</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">Claimant Name</label>
          <input type="text" [(ngModel)]="caseData.claimantName" class="w-full" />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">Nationality</label>
          <input type="text" [(ngModel)]="caseData.nationality" class="w-full" />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">Gender</label>
          <select [(ngModel)]="caseData.gender" class="w-full">
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">Age</label>
          <input type="number" [(ngModel)]="caseData.age" min="0" class="w-full" />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">Marital Status</label>
          <select [(ngModel)]="caseData.maritalStatus" class="w-full">
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Divorced">Divorced</option>
            <option value="Widowed">Widowed</option>
          </select>
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">Profession</label>
          <input type="text" [(ngModel)]="caseData.profession" class="w-full" />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">Damage Type</label>
          <select [(ngModel)]="caseData.damageType" class="w-full">
            <option value="Fatal">Fatal</option>
            <option value="Disability">Disability</option>
          </select>
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1"
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
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1"
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
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">Total Paid Amount</label>
          <input
            type="number"
            [(ngModel)]="caseData.totalPaidAmount"
            min="0"
            step="0.01"
            class="w-full"
          />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">Date of Insertion</label>
          <input type="date" [(ngModel)]="dateOfInsertion" class="w-full" />
        </div>
      </div>
    </ui-card>

    <ui-card class="mt-6">
      <h3 class="font-semibold mb-4">Hearings and Case Development</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">Period (From)</label>
          <input type="date" [(ngModel)]="periodFrom" class="w-full" />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">Period (To)</label>
          <input type="date" [(ngModel)]="periodTo" class="w-full" />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">Court Type</label>
          <input type="text" [(ngModel)]="caseData.hearingsCourtType" class="w-full" />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">Court Level</label>
          <input type="text" [(ngModel)]="caseData.hearingsCourtLevel" class="w-full" />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">Court Room</label>
          <input type="text" [(ngModel)]="caseData.courtRoom" class="w-full" />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">Ruling Date</label>
          <input type="date" [(ngModel)]="rulingDate" class="w-full" />
        </div>
      </div>
    </ui-card>

    <div class="mt-6 flex gap-2">
      <ui-button variant="primary" (click)="save()">Save</ui-button>
      <ui-button variant="ghost" (click)="cancel()">Cancel</ui-button>
    </div>
  `,
})
export class MotorLiabilityCaseDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly motorLiabilityService = inject(MotorLiabilityService);

  protected caseData: MotorLiabilityCase;
  protected dateOfInsertion: string = '';
  protected periodFrom: string = '';
  protected periodTo: string = '';
  protected rulingDate: string = '';

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
      } else {
        this.caseData = this.createEmptyCase();
      }
    } else {
      this.caseData = this.createEmptyCase();
    }
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
    this.router.navigate(['/cases']);
  }
}
