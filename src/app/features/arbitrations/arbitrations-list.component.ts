import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { UIButtonComponent } from '../../shared/components/ui/button.component';
import { UICardComponent } from '../../shared/components/ui/card.component';
import { ArbitrationsService } from '../../shared/services/arbitrations.service';

@Component({
  standalone: true,
  selector: 'app-arbitrations-list',
  imports: [CommonModule, RouterModule, TranslateModule, UIButtonComponent, UICardComponent],
  template: `
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold">{{ 'nav.arbitrations' | translate }}</h2>
      <ui-button variant="primary" routerLink="/arbitrations/new"
        >{{ 'actions.add' | translate }} {{ 'nav.arbitrations' | translate }}</ui-button
      >
    </div>

    <div *ngIf="arbitrations.length === 0" class="text-center py-8 text-[rgb(var(--text-muted))]">
      {{ 'arbitrations.empty' | translate }}
    </div>

    <div
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      *ngIf="arbitrations.length > 0"
    >
      <ui-card
        *ngFor="let arbitration of arbitrations"
        class="cursor-pointer hover:shadow-lg transition-shadow"
        [routerLink]="['/arbitrations', arbitration.id]"
      >
        <div class="mb-2">
          <h3 class="font-semibold">
            {{ arbitration.caseDescription || ('arbitrations.noDescription' | translate) }}
          </h3>
        </div>
        <div class="text-sm text-[rgb(var(--text-muted))] space-y-1">
          <div>
            {{ 'arbitrations.fields.fillingDate' | translate }}:
            {{ arbitration.fillingDate | date: 'short' }}
          </div>
          <div>
            {{ 'arbitrations.fields.arbitrationRoom' | translate }}:
            {{ arbitration.arbitrationRoom || '-' }}
          </div>
          <div>
            {{ 'arbitrations.fields.arbitrationFees' | translate }}:
            {{ arbitration.arbitrationFees | number }}
          </div>
          <div>
            {{ 'arbitrations.hearingsCount' | translate }}: {{ arbitration.hearings.length }}
          </div>
        </div>
      </ui-card>
    </div>
  `,
})
export class ArbitrationsListComponent {
  private readonly arbitrationsService = inject(ArbitrationsService);
  protected arbitrations = this.arbitrationsService.list();
}
