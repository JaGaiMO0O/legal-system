import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ClaimsService, Claim } from '../../shared/services/claims.service';
import { RouterModule } from '@angular/router';
import { UIButtonComponent } from '../../shared/components/ui/button.component';

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

    <div *ngIf="claims.length === 0" class="card p-12 text-center">
      <p class="text-[rgb(var(--text-muted))]">{{ 'claims.empty' | translate }}</p>
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
  protected claims: Claim[] = this.claimsSvc.list();

  convert(c: Claim): void {
    this.claimsSvc.markToLegal(c.id);
    this.claims = this.claimsSvc.list();
  }
}
