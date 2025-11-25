import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { UIButtonComponent } from '../../shared/components/ui/button.component';
import { UICardComponent } from '../../shared/components/ui/card.component';
import { BusinessSettlementService } from '../../shared/services/business-settlement.service';

@Component({
  standalone: true,
  selector: 'app-business-settlements-list',
  imports: [CommonModule, RouterModule, TranslateModule, UIButtonComponent, UICardComponent],
  template: `
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold">{{ 'settlement.title' | translate }}</h2>
      <ui-button variant="primary" routerLink="/settlements/new"
        >{{ 'actions.add' | translate }} {{ 'settlement.title' | translate }}</ui-button
      >
    </div>

    <div *ngIf="settlements.length === 0" class="text-center py-8 text-[rgb(var(--text-muted))]">
      {{ 'settlement.empty' | translate }}
    </div>

    <div
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      *ngIf="settlements.length > 0"
    >
      <ui-card
        *ngFor="let settlement of settlements"
        class="cursor-pointer hover:shadow-lg transition-shadow"
        [routerLink]="['/settlements', settlement.id]"
      >
        <div class="mb-2">
          <h3 class="font-semibold">
            {{ 'settlement.settlement' | translate }} #{{ settlement.id.slice(0, 8) }}
          </h3>
        </div>
        <div class="text-sm text-[rgb(var(--text-muted))] space-y-1">
          <div>
            {{ 'settlement.fields.departmentAmount' | translate }}:
            {{ settlement.departmentAmount | number }}
          </div>
          <div>
            {{ 'settlement.fields.legalDepartmentAmount' | translate }}:
            {{ settlement.legalDepartmentAmount | number }}
          </div>
          <div>
            {{ 'settlement.fields.managementAmount' | translate }}:
            {{ settlement.managementAmount | number }}
          </div>
          <div>
            {{ 'settlement.fields.adversaryAmount' | translate }}:
            {{ settlement.adversaryAmount | number }}
          </div>
          <div class="font-semibold mt-2">
            {{ 'settlement.fields.amountOfAmicableAgreement' | translate }}:
            {{ settlement.amountOfAmicableAgreement | number }}
          </div>
        </div>
      </ui-card>
    </div>
  `,
})
export class BusinessSettlementsListComponent {
  private readonly businessSettlementService = inject(BusinessSettlementService);
  protected settlements = this.businessSettlementService.list();
}
