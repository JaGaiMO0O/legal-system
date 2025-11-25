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
    <h2 class="mb-4">{{ 'motorLiability.title' | translate }}</h2>

    <ui-card>
      <h3 class="font-semibold mb-4">{{ 'motorLiability.sections.case' | translate }}</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">{{
            'motorLiability.fields.caseNo' | translate
          }}</label>
          <input type="text" [(ngModel)]="caseData.caseNo" class="w-full" />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">{{
            'motorLiability.fields.courtType' | translate
          }}</label>
          <input type="text" [(ngModel)]="caseData.courtType" class="w-full" />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">{{
            'motorLiability.fields.courtLevel' | translate
          }}</label>
          <input type="text" [(ngModel)]="caseData.courtLevel" class="w-full" />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">{{
            'motorLiability.fields.courtCity' | translate
          }}</label>
          <input type="text" [(ngModel)]="caseData.courtCity" class="w-full" />
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">{{
            'motorLiability.fields.caseDescription' | translate
          }}</label>
          <textarea [(ngModel)]="caseData.caseDescription" rows="3" class="w-full"></textarea>
        </div>
      </div>
    </ui-card>

    <ui-card class="mt-6">
      <h3 class="font-semibold mb-4">{{ 'motorLiability.sections.claimantInfo' | translate }}</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">{{
            'motorLiability.fields.claimantName' | translate
          }}</label>
          <input type="text" [(ngModel)]="caseData.claimantName" class="w-full" />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">{{
            'motorLiability.fields.nationality' | translate
          }}</label>
          <input type="text" [(ngModel)]="caseData.nationality" class="w-full" />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">{{
            'motorLiability.fields.gender' | translate
          }}</label>
          <select [(ngModel)]="caseData.gender" class="w-full">
            <option value="Male">{{ 'motorLiability.gender.male' | translate }}</option>
            <option value="Female">{{ 'motorLiability.gender.female' | translate }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">{{
            'motorLiability.fields.age' | translate
          }}</label>
          <input type="number" [(ngModel)]="caseData.age" min="0" class="w-full" />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">{{
            'motorLiability.fields.maritalStatus' | translate
          }}</label>
          <select [(ngModel)]="caseData.maritalStatus" class="w-full">
            <option value="Single">{{ 'motorLiability.maritalStatus.single' | translate }}</option>
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
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">{{
            'motorLiability.fields.profession' | translate
          }}</label>
          <input type="text" [(ngModel)]="caseData.profession" class="w-full" />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">{{
            'motorLiability.fields.damageType' | translate
          }}</label>
          <select [(ngModel)]="caseData.damageType" class="w-full">
            <option value="Fatal">{{ 'motorLiability.damageType.fatal' | translate }}</option>
            <option value="Disability">
              {{ 'motorLiability.damageType.disability' | translate }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">{{
            'motorLiability.fields.percentMoralPhysical' | translate
          }}</label>
          <input
            type="text"
            [(ngModel)]="caseData.percentMoralPhysical"
            placeholder="e.g., 50% Moral, 30% Physical"
            class="w-full"
          />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">{{
            'motorLiability.fields.totalClaimedAmount' | translate
          }}</label>
          <input
            type="number"
            [(ngModel)]="caseData.totalClaimedAmount"
            min="0"
            step="0.01"
            class="w-full"
          />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">{{
            'motorLiability.fields.totalPaidAmount' | translate
          }}</label>
          <input
            type="number"
            [(ngModel)]="caseData.totalPaidAmount"
            min="0"
            step="0.01"
            class="w-full"
          />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">{{
            'motorLiability.fields.dateOfInsertion' | translate
          }}</label>
          <input type="date" [(ngModel)]="dateOfInsertion" class="w-full" />
        </div>
      </div>
    </ui-card>

    <ui-card class="mt-6">
      <h3 class="font-semibold mb-4">{{ 'motorLiability.sections.hearings' | translate }}</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">{{
            'motorLiability.fields.periodFrom' | translate
          }}</label>
          <input type="date" [(ngModel)]="periodFrom" class="w-full" />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">{{
            'motorLiability.fields.periodTo' | translate
          }}</label>
          <input type="date" [(ngModel)]="periodTo" class="w-full" />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">{{
            'motorLiability.fields.hearingsCourtType' | translate
          }}</label>
          <input type="text" [(ngModel)]="caseData.hearingsCourtType" class="w-full" />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">{{
            'motorLiability.fields.hearingsCourtLevel' | translate
          }}</label>
          <input type="text" [(ngModel)]="caseData.hearingsCourtLevel" class="w-full" />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">{{
            'motorLiability.fields.courtRoom' | translate
          }}</label>
          <input type="text" [(ngModel)]="caseData.courtRoom" class="w-full" />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">{{
            'motorLiability.fields.rulingDate' | translate
          }}</label>
          <input type="date" [(ngModel)]="rulingDate" class="w-full" />
        </div>
      </div>
    </ui-card>

    <div class="mt-6 flex gap-2">
      <ui-button variant="primary" (click)="save()">{{ 'actions.save' | translate }}</ui-button>
      <ui-button variant="ghost" (click)="cancel()">{{ 'actions.cancel' | translate }}</ui-button>
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
