import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UIButtonComponent } from '../../shared/components/ui/button.component';
import { UICardComponent } from '../../shared/components/ui/card.component';
import { ClaimsService, Claim } from '../../shared/services/claims.service';
import { ToastService } from '../../shared/services/toast.service';
import { CaseTrackingService } from '../../shared/services/case-tracking.service';
import { BusinessSettlementService } from '../../shared/services/business-settlement.service';

@Component({
  standalone: true,
  selector: 'app-claim-detail',
  imports: [CommonModule, RouterLink, UIButtonComponent, UICardComponent],
  template: `
    <div class="mb-6">
      <button
        (click)="goBack()"
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
        Back to Claims
      </button>
      <h2 class="text-2xl font-bold">Claim {{ claim?.reference || '' }}</h2>
    </div>

    <div *ngIf="!claim" class="card p-12 text-center">
      <p class="text-[rgb(var(--text-muted))]">Claim not found</p>
    </div>

    <div *ngIf="claim" class="space-y-4">
      <ui-card>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div class="text-[rgb(var(--text-muted))]">Reference</div>
            <div class="font-semibold">{{ claim.reference }}</div>
          </div>
          <div>
            <div class="text-[rgb(var(--text-muted))]">Claimant</div>
            <div class="font-semibold">{{ claim.claimant }}</div>
          </div>
          <div>
            <div class="text-[rgb(var(--text-muted))]">Date</div>
            <div class="font-semibold">{{ claim.date | date: 'mediumDate' }}</div>
          </div>
          <div>
            <div class="text-[rgb(var(--text-muted))]">Legal Case</div>
            <div>
              <span
                class="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
                [class.bg-emerald-100]="claim.legalFlag === 1"
                [class.text-emerald-800]="claim.legalFlag === 1"
                [class.bg-gray-100]="claim.legalFlag === 0"
                [class.text-gray-800]="claim.legalFlag === 0"
              >
                {{ claim.legalFlag === 1 ? 'To Legal Dept.' : 'Normal' }}
              </span>
            </div>
          </div>
          <div>
            <div class="text-[rgb(var(--text-muted))]">Unified Case ID</div>
            <div class="font-mono text-xs">{{ claim.unifiedCaseId || '-' }}</div>
          </div>
          <div>
            <div class="text-[rgb(var(--text-muted))]">Linked Case</div>
            <div>
              <a
                *ngIf="claim.linkedCaseId"
                class="text-[rgb(var(--primary))] hover:underline font-medium"
                [routerLink]="['/cases', claim.linkedCaseId]"
              >
                View Case
              </a>
              <span *ngIf="!claim.linkedCaseId" class="text-[rgb(var(--text-muted))]">None</span>
            </div>
          </div>
        </div>
      </ui-card>

      <div class="flex gap-2">
        <ui-button variant="primary" (click)="convert()">Convert to Legal</ui-button>
        <ui-button variant="ghost" (click)="createSettlement()">Business Settlement</ui-button>
      </div>
    </div>
  `,
})
export class ClaimDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly claimsSvc = inject(ClaimsService);
  private readonly toast = inject(ToastService);
  private readonly caseTracking = inject(CaseTrackingService);
  private readonly settlementSvc = inject(BusinessSettlementService);

  protected claim: Claim | undefined;

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.claim = this.claimsSvc.list().find((c) => c.id === id);
    }
  }

  goBack(): void {
    this.router.navigate(['/claims']);
  }

  convert(): void {
    if (!this.claim) return;
    try {
      this.claimsSvc.markToLegal(this.claim.id);
      this.claim = this.claimsSvc.list().find((c) => c.id === this.claim!.id);
      this.toast.success('Claim converted to legal case successfully');
    } catch (error) {
      this.toast.error('Failed to convert claim');
      console.error('Error converting claim:', error);
    }
  }

  createSettlement(): void {
    if (!this.claim) return;
    const existing = this.settlementSvc.getByClaimId(this.claim.id);
    if (existing) {
      this.toast.info('Settlement already exists for this claim');
      return;
    }
    this.settlementSvc.create({
      departmentAmount: 0,
      legalDepartmentAmount: 0,
      managementAmount: 0,
      adversaryAmount: 0,
      amountOfAmicableAgreement: 0,
      linkedClaimId: this.claim.id,
      linkedCaseId: this.claim.linkedCaseId,
    });
    this.toast.success('Business settlement created');
  }
}
