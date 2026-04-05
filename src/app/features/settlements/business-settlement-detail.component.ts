import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import {
  BusinessSettlement,
  BusinessSettlementService,
} from '../../shared/services/business-settlement.service';

@Component({
  standalone: true,
  selector: 'app-business-settlement-detail',
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    ButtonModule,
    CardModule,
    InputNumberModule,
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
        Back to Settlements
      </button>
      <h2 class="text-2xl font-bold">Business Settlement</h2>
    </div>

    <div class="flex flex-col gap-8">
      <p-card>
        <h3 class="font-semibold mb-4">Suggested Amounts</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm text-[rgb(var(--text-muted))] mb-1"
              >Department Amount</label
            >
            <p-inputNumber
              mode="currency"
              currency="AED"
              [locale]="'en-SA'"
              [(ngModel)]="settlement.departmentAmount"
              [min]="0"
              [minFractionDigits]="2"
              [maxFractionDigits]="2"
              styleClass="w-full"
            ></p-inputNumber>
          </div>
          <div>
            <label class="block text-sm text-[rgb(var(--text-muted))] mb-1"
              >Legal Department Amount</label
            >
            <p-inputNumber
              mode="currency"
              currency="AED"
              [locale]="'en-SA'"
              [(ngModel)]="settlement.legalDepartmentAmount"
              [min]="0"
              [minFractionDigits]="2"
              [maxFractionDigits]="2"
              styleClass="w-full"
            ></p-inputNumber>
          </div>
          <div>
            <label class="block text-sm text-[rgb(var(--text-muted))] mb-1"
              >Management Amount</label
            >
            <p-inputNumber
              mode="currency"
              currency="AED"
              [locale]="'en-SA'"
              [(ngModel)]="settlement.managementAmount"
              [min]="0"
              [minFractionDigits]="2"
              [maxFractionDigits]="2"
              styleClass="w-full"
            ></p-inputNumber>
          </div>
          <div>
            <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">Adversary Amount</label>
            <p-inputNumber
              mode="currency"
              currency="AED"
              [locale]="'en-SA'"
              [(ngModel)]="settlement.adversaryAmount"
              [min]="0"
              [minFractionDigits]="2"
              [maxFractionDigits]="2"
              styleClass="w-full"
            ></p-inputNumber>
          </div>
          <div>
            <label class="block text-sm text-[rgb(var(--text-muted))] mb-1"
              >Amount of Amicable Agreement</label
            >
            <p-inputNumber
              mode="currency"
              currency="AED"
              [locale]="'en-SA'"
              [(ngModel)]="settlement.amountOfAmicableAgreement"
              [min]="0"
              [minFractionDigits]="2"
              [maxFractionDigits]="2"
              styleClass="w-full"
            ></p-inputNumber>
          </div>
        </div>
      </p-card>

      <div class="flex gap-2">
        <p-button severity="primary" (click)="save()" label="Save"></p-button>
        <p-button [outlined]="true" (click)="cancel()" label="Cancel"></p-button>
      </div>
    </div>
  `,
})
export class BusinessSettlementDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly businessSettlementService = inject(BusinessSettlementService);

  protected settlement: BusinessSettlement;

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const existing = this.businessSettlementService.getById(id);
      if (existing) {
        this.settlement = { ...existing };
      } else {
        this.settlement = this.createEmptySettlement();
      }
    } else {
      this.settlement = this.createEmptySettlement();
    }
  }

  private createEmptySettlement(): BusinessSettlement {
    return {
      id: '',
      departmentAmount: 0,
      legalDepartmentAmount: 0,
      managementAmount: 0,
      adversaryAmount: 0,
      amountOfAmicableAgreement: 0,
      createdAt: '',
      updatedAt: '',
    };
  }

  save(): void {
    if (this.settlement.id) {
      this.businessSettlementService.update(this.settlement.id, this.settlement);
    } else {
      const created = this.businessSettlementService.create({
        departmentAmount: this.settlement.departmentAmount,
        legalDepartmentAmount: this.settlement.legalDepartmentAmount,
        managementAmount: this.settlement.managementAmount,
        adversaryAmount: this.settlement.adversaryAmount,
        amountOfAmicableAgreement: this.settlement.amountOfAmicableAgreement,
        linkedClaimId: this.settlement.linkedClaimId,
        linkedCaseId: this.settlement.linkedCaseId,
      });
      this.router.navigate(['/settlements', created.id]);
    }
  }

  cancel(): void {
    this.router.navigate(['/settlements']);
  }
}
