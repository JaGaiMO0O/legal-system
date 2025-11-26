import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ClaimsService, Claim } from '../../shared/services/claims.service';
import { RouterModule } from '@angular/router';
import { UIButtonComponent } from '../../shared/components/ui/button.component';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  standalone: true,
  selector: 'app-claims-list',
  imports: [CommonModule, TranslateModule, RouterModule, UIButtonComponent],
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

    <div class="card overflow-hidden" *ngIf="claims.length > 0">
      <div class="overflow-x-auto">
        <table class="table">
          <thead>
            <tr>
              <th class="w-40">Reference</th>
              <th class="min-w-56">Claimant</th>
              <th class="w-40">Date</th>
              <th class="w-40">Status</th>
              <th class="w-56">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of claims" class="hover:bg-[rgb(var(--surface-muted))]">
              <td class="font-mono text-xs font-semibold">{{ c.reference }}</td>
              <td>{{ c.claimant }}</td>
              <td>{{ c.date | date: 'mediumDate' }}</td>
              <td>
                <span
                  class="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
                  [class.bg-emerald-100]="c.legalFlag === 1"
                  [class.text-emerald-800]="c.legalFlag === 1"
                  [class.bg-gray-100]="c.legalFlag === 0"
                  [class.text-gray-800]="c.legalFlag === 0"
                >
                  {{ c.legalFlag === 1 ? 'To Legal Dept.' : 'Normal' }}
                </span>
              </td>
              <td class="space-x-2 rtl:space-x-reverse">
                <a
                  *ngIf="c.linkedCaseId"
                  class="text-[rgb(var(--primary))] hover:underline font-medium"
                  [routerLink]="['/cases', c.linkedCaseId]"
                >
                  View Case
                </a>
                <button
                  *ngIf="c.legalFlag === 0"
                  class="btn btn-primary text-xs px-3 py-1"
                  (click)="convert(c)"
                >
                  Convert to Legal
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class ClaimsListComponent {
  private readonly claimsSvc = inject(ClaimsService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly toast = inject(ToastService);
  protected claims: Claim[] = this.claimsSvc.list();

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
}
