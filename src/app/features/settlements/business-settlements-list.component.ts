import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { LanguageService } from '../../core/i18n/language.service';
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
        <h2 class="text-2xl font-bold text-[rgb(var(--text))]">
          {{ 'nav.settlements' | translate }}
        </h2>
        <p class="text-sm text-[rgb(var(--text-muted))] mt-1">
          {{
            'settlement.list.countOf'
              | translate: { filtered: filteredSettlements().length, total: settlements.length }
          }}
          {{
            settlements.length === 1
              ? ('settlement.list.settlementOne' | translate)
              : ('settlement.list.settlementsMany' | translate)
          }}
          <span *ngIf="searchQuery.trim()">{{ 'settlement.list.filtered' | translate }}</span>
        </p>
      </div>
      <div class="flex flex-col sm:flex-row gap-3 w-full md:flex-1 md:min-w-0 lg:max-w-4xl">
        <div class="relative w-full flex-1 min-w-0 min-h-[2.5rem]">
          <input
            type="text"
            inputmode="search"
            autocomplete="off"
            class="w-full rounded-input border border-[rgb(var(--border))] py-2 pe-3 text-sm bg-[rgb(var(--surface))] text-[rgb(var(--text))] search-input-with-icon--compact"
            [(ngModel)]="searchQuery"
            [placeholder]="'lists.searchSettlementsPlaceholder' | translate"
          />
          <span class="search-input-icon search-input-icon--tight" aria-hidden="true">
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
        </div>
        <p-button severity="primary" routerLink="/settlements/new" styleClass="shrink-0">
          <svg class="w-4 h-4 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          {{ 'actions.add' | translate }}
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
      <p class="text-[rgb(var(--text-muted))]">{{ 'lists.noSettlementsMatch' | translate }}</p>
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
          <h3 class="font-semibold text-lg mb-4">
            {{ 'settlement.list.cardRef' | translate: { id: settlement.id.slice(0, 8) } }}
          </h3>
        </div>
        <div class="text-sm space-y-2">
          <div class="flex items-center justify-between gap-2">
            <span class="text-[rgb(var(--text-muted))]"
              >{{ 'settlement.fields.departmentAmount' | translate }}:</span
            >
            <span class="font-medium tabular-nums text-end"
              >{{ settlement.departmentAmount | number: '1.2-2' : ngLocale() }}
              {{ 'common.sar' | translate }}</span
            >
          </div>
          <div class="flex items-center justify-between gap-2">
            <span class="text-[rgb(var(--text-muted))]"
              >{{ 'settlement.fields.legalDepartmentAmount' | translate }}:</span
            >
            <span class="font-medium tabular-nums text-end"
              >{{ settlement.legalDepartmentAmount | number: '1.2-2' : ngLocale() }}
              {{ 'common.sar' | translate }}</span
            >
          </div>
          <div class="flex items-center justify-between gap-2">
            <span class="text-[rgb(var(--text-muted))]"
              >{{ 'settlement.fields.managementAmount' | translate }}:</span
            >
            <span class="font-medium tabular-nums text-end"
              >{{ settlement.managementAmount | number: '1.2-2' : ngLocale() }}
              {{ 'common.sar' | translate }}</span
            >
          </div>
          <div class="flex items-center justify-between gap-2">
            <span class="text-[rgb(var(--text-muted))]"
              >{{ 'settlement.fields.adversaryAmount' | translate }}:</span
            >
            <span class="font-medium tabular-nums text-end"
              >{{ settlement.adversaryAmount | number: '1.2-2' : ngLocale() }}
              {{ 'common.sar' | translate }}</span
            >
          </div>
          <div class="border-t border-[rgb(var(--border))] pt-2 mt-3">
            <div class="flex items-center justify-between font-bold text-lg gap-2">
              <span>{{ 'settlement.fields.amountOfAmicableAgreement' | translate }}:</span>
              <span class="text-[rgb(var(--primary))] tabular-nums text-end"
                >{{ settlement.amountOfAmicableAgreement | number: '1.2-2' : ngLocale() }}
                {{ 'common.sar' | translate }}</span
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
  private readonly language = inject(LanguageService);

  protected readonly ngLocale = computed(() =>
    this.language.currentLang() === 'ar' ? 'ar-SA' : 'en-US',
  );

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
