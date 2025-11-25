import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { UIButtonComponent } from '../../shared/components/ui/button.component';
import { UICardComponent } from '../../shared/components/ui/card.component';
import { ExecutionCasesService } from '../../shared/services/execution-cases.service';

@Component({
  standalone: true,
  selector: 'app-execution-cases-list',
  imports: [CommonModule, RouterModule, TranslateModule, UIButtonComponent, UICardComponent],
  template: `
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold">{{ 'execution.title' | translate }}</h2>
      <ui-button variant="primary" routerLink="/execution/new"
        >{{ 'actions.add' | translate }} {{ 'execution.title' | translate }}</ui-button
      >
    </div>

    <div *ngIf="executionCases.length === 0" class="text-center py-8 text-[rgb(var(--text-muted))]">
      {{ 'execution.empty' | translate }}
    </div>

    <div
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      *ngIf="executionCases.length > 0"
    >
      <ui-card
        *ngFor="let executionCase of executionCases"
        class="cursor-pointer hover:shadow-lg transition-shadow"
        [routerLink]="['/execution', executionCase.id]"
      >
        <div class="mb-2">
          <h3 class="font-semibold">
            {{ executionCase.executionCaseNo || ('execution.noCaseNo' | translate) }}
          </h3>
        </div>
        <div class="text-sm text-[rgb(var(--text-muted))] space-y-1">
          <div>{{ 'execution.fields.fileNo' | translate }}: {{ executionCase.fileNo || '-' }}</div>
          <div>
            {{ 'execution.fields.fileDate' | translate }}:
            {{ executionCase.fileDate | date: 'short' }}
          </div>
          <div>
            {{ 'execution.fields.courtRoom' | translate }}: {{ executionCase.courtRoom || '-' }}
          </div>
          <div>
            {{ 'execution.fields.companyLawyer' | translate }}:
            {{ executionCase.companyLawyer || '-' }}
          </div>
          <div>
            {{ 'execution.fields.amountRuled' | translate }}:
            {{ executionCase.amountRuled | number }}
          </div>
          <div>
            {{ 'execution.fields.amountPaid' | translate }}: {{ executionCase.amountPaid | number }}
          </div>
        </div>
      </ui-card>
    </div>
  `,
})
export class ExecutionCasesListComponent {
  private readonly executionCasesService = inject(ExecutionCasesService);
  protected executionCases = this.executionCasesService.list();
}
