import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { BusinessSettlementService } from '../../shared/services/business-settlement.service';
import { CaseTrackingService } from '../../shared/services/case-tracking.service';
import { Claim, ClaimsService } from '../../shared/services/claims.service';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  standalone: true,
  selector: 'app-claims-list',
  imports: [CommonModule, TranslateModule, RouterModule, ButtonModule, TableModule, TagModule],
  template: `
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-[rgb(var(--text))]">Claims</h2>
        <p class="text-sm text-[rgb(var(--text-muted))] mt-1">
          {{ claims.length }} {{ claims.length === 1 ? 'claim' : 'claims' }} total
        </p>
      </div>
    </div>

    <div *ngIf="claims.length === 0" class="card p-16 text-center">
      <div class="max-w-md mx-auto">
        <div
          class="w-20 h-20 mx-auto mb-6 bg-[rgb(var(--surface-muted))] rounded-full flex items-center justify-center"
        >
          <svg
            class="w-10 h-10 text-[rgb(var(--text-muted))]"
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
        </div>
        <h3 class="text-lg font-semibold text-[rgb(var(--text))] mb-2">No claims yet</h3>
        <p class="text-sm text-[rgb(var(--text-muted))]">
          Claims will appear here when they are added to the system
        </p>
      </div>
    </div>

    <p-table
      *ngIf="claims.length > 0"
      [value]="claims"
      [stripedRows]="true"
      [size]="'small'"
      styleClass="p-datatable-striped p-datatable-sm"
    >
      <ng-template pTemplate="header">
        <tr>
          <th style="width: 10rem">Reference</th>
          <th style="min-width: 14rem">Claimant</th>
          <th style="width: 10rem">Date</th>
          <th style="width: 10rem">Status</th>
          <th style="width: 14rem">Actions</th>
        </tr>
      </ng-template>
      <ng-template pTemplate="body" let-c>
        <tr>
          <td class="font-mono text-xs font-semibold">{{ c.reference }}</td>
          <td>{{ c.claimant }}</td>
          <td>{{ c.date | date: 'mediumDate' }}</td>
          <td>
            <p-tag
              [value]="c.legalFlag === 1 ? 'To Legal Dept.' : 'Normal'"
              [severity]="c.legalFlag === 1 ? 'success' : undefined"
            ></p-tag>
          </td>
          <td>
            <div class="flex items-center gap-2 flex-wrap">
              <p-button
                *ngIf="c.linkedCaseId"
                [label]="'View Case'"
                severity="primary"
                [size]="'small'"
                [routerLink]="['/legal/case', c.linkedCaseId]"
                (click)="viewClaim(c)"
                styleClass="action-button"
              ></p-button>
              <p-button
                *ngIf="c.legalFlag === 0"
                [label]="'Convert to Legal'"
                severity="primary"
                [size]="'small'"
                (click)="convert(c)"
                styleClass="action-button"
              ></p-button>
              <p-button
                [label]="'View Claim'"
                severity="primary"
                [size]="'small'"
                [routerLink]="['/claims', c.id]"
                styleClass="action-button"
              ></p-button>
              <p-button
                [label]="'Business Settlement'"
                severity="primary"
                [size]="'small'"
                (click)="createSettlement(c)"
                styleClass="action-button"
              ></p-button>
              <span
                *ngIf="c.unifiedCaseId"
                class="text-xs text-[rgb(var(--text-muted))] font-mono"
                title="Unified Case ID: {{ c.unifiedCaseId }}"
              >
                UC: {{ c.unifiedCaseId.substring(0, 8) }}...
              </span>
            </div>
          </td>
        </tr>
      </ng-template>
    </p-table>
  `,
})
export class ClaimsListComponent {
  private readonly claimsSvc = inject(ClaimsService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly toast = inject(ToastService);
  private readonly caseTracking = inject(CaseTrackingService);
  private readonly settlementSvc = inject(BusinessSettlementService);
  protected claims: Claim[] = this.claimsSvc.list();

  constructor() {
    // Update claims list when data changes (for reactive updates)
    this.claims = this.claimsSvc.list();
  }

  viewClaim(claim: Claim): void {
    // Set the current case when viewing a claim
    if (claim.unifiedCaseId) {
      this.caseTracking.setCurrentCase(claim.unifiedCaseId);
      this.caseTracking.linkEntityToCase(claim.unifiedCaseId, 'claim', claim.id);
      this.caseTracking.upsertUnifiedCase({
        unifiedCaseId: claim.unifiedCaseId,
        claimId: claim.id,
        title: `Claim ${claim.reference}`,
        client: claim.claimant,
        reference: claim.reference,
      });
    }
  }

  async convert(c: Claim): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Convert to Legal',
      message: `Are you sure you want to convert claim "${c.reference}" to a legal case? This will create a new motor liability case.`,
      confirmText: 'Convert',
      cancelText: 'Cancel',
      type: 'info',
    });
    if (!confirmed) return;
    try {
      this.claimsSvc.markToLegal(c.id);
      this.claims = this.claimsSvc.list();
      this.toast.success('Claim converted to legal case successfully');
    } catch (error) {
      this.toast.error('Failed to convert claim');
      console.error('Error converting claim:', error);
    }
  }

  createSettlement(c: Claim): void {
    try {
      const existing = this.settlementSvc.getByClaimId(c.id);
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
        linkedClaimId: c.id,
        linkedCaseId: c.linkedCaseId,
      });
      this.toast.success('Business settlement created');
    } catch (error) {
      this.toast.error('Failed to create settlement');
      console.error('Error creating settlement from claim:', error);
    }
  }
}
