import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ClaimsService, Claim } from '../../shared/services/claims.service';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-claims-list',
  imports: [CommonModule, TranslateModule, RouterModule],
  template: `
    <h2 class="text-lg font-semibold mb-4">{{ 'claims.title' | translate }}</h2>
    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="table">
          <thead class="sticky top-0">
            <tr>
              <th class="w-40">{{ 'claims.reference' | translate }}</th>
              <th class="min-w-56">{{ 'claims.claimant' | translate }}</th>
              <th class="w-40">{{ 'claims.date' | translate }}</th>
              <th class="w-40">{{ 'claims.status' | translate }}</th>
              <th class="w-56">{{ 'actions.actions' | translate }}</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of claims">
              <td class="font-mono text-xs">{{ c.reference }}</td>
              <td>{{ c.claimant }}</td>
              <td>{{ c.date | date: 'mediumDate' }}</td>
              <td>
                <span
                  class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border"
                  [class.bg-emerald-50]="c.legalFlag === 1"
                  [class.border-transparent]="c.legalFlag === 1"
                >
                  {{
                    c.legalFlag === 1
                      ? ('claims.toLegal' | translate)
                      : ('claims.normal' | translate)
                  }}
                </span>
              </td>
              <td class="space-x-2 rtl:space-x-reverse">
                <a
                  *ngIf="c.linkedCaseId"
                  class="underline"
                  [routerLink]="['/cases', c.linkedCaseId]"
                >
                  {{ 'claims.viewCase' | translate }}
                </a>
                <button
                  *ngIf="c.legalFlag === 0"
                  class="px-2 py-1 border rounded text-sm"
                  (click)="convert(c)"
                >
                  {{ 'claims.convert' | translate }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div *ngIf="claims.length === 0" class="text-sm text-gray-500 mt-4">
      {{ 'claims.empty' | translate }}
    </div>
  `,
})
export class ClaimsListComponent {
  private readonly claimsSvc = inject(ClaimsService);
  get claims(): Claim[] {
    return this.claimsSvc.list();
  }
  convert(c: Claim): void {
    this.claimsSvc.markToLegal(c.id);
  }
}
