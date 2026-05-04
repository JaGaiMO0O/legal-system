import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import {
  BusinessSettlement,
  BusinessSettlementService,
} from '../../shared/services/business-settlement.service';

@Component({
  standalone: true,
  selector: 'app-business-settlements-list',
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule, ButtonModule, CardModule],
  template: `
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-[rgb(var(--text))]">Business Settlements</h2>
        <p class="text-sm text-[rgb(var(--text-muted))] mt-1">
          {{ filteredSettlements().length }} of {{ settlements.length }}
          {{ settlements.length === 1 ? 'settlement' : 'settlements' }}
          <span *ngIf="searchQuery.trim()">(filtered)</span>
        </p>
      </div>
      <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto md:min-w-[16rem]">
        <input
          type="search"
          class="w-full rounded-input border border-[rgb(var(--border))] px-3 py-2 text-sm bg-[rgb(var(--surface))] text-[rgb(var(--text))]"
          [(ngModel)]="searchQuery"
          placeholder="Search by id or amounts..."
        />
        <p-button severity="primary" routerLink="/settlements/new" styleClass="shrink-0">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add
        </p-button>
      </div>
    </div>

    <div *ngIf="settlements.length === 0" class="card p-12 text-center">
      <p class="text-[rgb(var(--text-muted))]">{{ 'settlement.empty' | translate }}</p>
    </div>

    <div
      *ngIf="settlements.length > 0 && filteredSettlements().length === 0"
      class="card p-12 text-center"
    >
      <p class="text-[rgb(var(--text-muted))]">No settlements match your search.</p>
    </div>

    <div
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      *ngIf="filteredSettlements().length > 0"
    >
      <p-card
        *ngFor="let settlement of filteredSettlements()"
        class="cursor-pointer hover:shadow-lg transition-shadow"
        [routerLink]="['/settlements', settlement.id]"
      >
        <div class="mb-4">
          <h3 class="font-semibold text-lg mb-4">Settlement #{{ settlement.id.slice(0, 8) }}</h3>
        </div>
        <div class="text-sm space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[rgb(var(--text-muted))]">Department Amount:</span>
            <span class="font-medium">{{ settlement.departmentAmount | number }} SAR</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-[rgb(var(--text-muted))]">Legal Department Amount:</span>
            <span class="font-medium">{{ settlement.legalDepartmentAmount | number }} SAR</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-[rgb(var(--text-muted))]">Management Amount:</span>
            <span class="font-medium">{{ settlement.managementAmount | number }} SAR</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-[rgb(var(--text-muted))]">Adversary Amount:</span>
            <span class="font-medium">{{ settlement.adversaryAmount | number }} SAR</span>
          </div>
          <div class="border-t border-[rgb(var(--border))] pt-2 mt-3">
            <div class="flex items-center justify-between font-bold text-lg">
              <span>Amount of Amicable Agreement:</span>
              <span class="text-[rgb(var(--primary))]"
                >{{ settlement.amountOfAmicableAgreement | number }} SAR</span
              >
            </div>
          </div>
        </div>
      </p-card>
    </div>
  `,
})
export class BusinessSettlementsListComponent {
  private readonly businessSettlementService = inject(BusinessSettlementService);
  protected settlements = this.businessSettlementService.list();
  protected searchQuery = '';

  filteredSettlements(): BusinessSettlement[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.settlements;
    return this.settlements.filter((s) => {
      const blob = [
        s.id,
        s.linkedCaseId,
        s.linkedClaimId,
        String(s.departmentAmount),
        String(s.legalDepartmentAmount),
        String(s.managementAmount),
        String(s.adversaryAmount),
        String(s.amountOfAmicableAgreement),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return blob.includes(q);
    });
  }
}
