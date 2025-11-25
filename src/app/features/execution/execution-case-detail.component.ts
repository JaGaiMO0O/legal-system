import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { UIButtonComponent } from '../../shared/components/ui/button.component';
import { UICardComponent } from '../../shared/components/ui/card.component';
import {
  ExecutionCasesService,
  ExecutionCase,
} from '../../shared/services/execution-cases.service';

@Component({
  standalone: true,
  selector: 'app-execution-case-detail',
  imports: [CommonModule, FormsModule, TranslateModule, UIButtonComponent, UICardComponent],
  template: `
    <h2 class="mb-4">{{ 'execution.title' | translate }}</h2>

    <ui-card>
      <h3 class="font-semibold mb-4">{{ 'execution.sections.mainInfo' | translate }}</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">{{
            'execution.fields.executionCaseNo' | translate
          }}</label>
          <input type="text" [(ngModel)]="executionCase.executionCaseNo" class="w-full" />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">{{
            'execution.fields.fileNo' | translate
          }}</label>
          <input type="text" [(ngModel)]="executionCase.fileNo" class="w-full" />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">{{
            'execution.fields.fileDate' | translate
          }}</label>
          <input type="date" [(ngModel)]="fileDate" class="w-full" />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">{{
            'execution.fields.courtRoom' | translate
          }}</label>
          <input type="text" [(ngModel)]="executionCase.courtRoom" class="w-full" />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">{{
            'execution.fields.companyLawyer' | translate
          }}</label>
          <input type="text" [(ngModel)]="executionCase.companyLawyer" class="w-full" />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">{{
            'execution.fields.lastCourtType' | translate
          }}</label>
          <input type="text" [(ngModel)]="executionCase.lastCourtType" class="w-full" />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">{{
            'execution.fields.lastCourtLevel' | translate
          }}</label>
          <input type="text" [(ngModel)]="executionCase.lastCourtLevel" class="w-full" />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">{{
            'execution.fields.amountRuled' | translate
          }}</label>
          <input
            type="number"
            [(ngModel)]="executionCase.amountRuled"
            min="0"
            step="0.01"
            class="w-full"
          />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">{{
            'execution.fields.amountPaid' | translate
          }}</label>
          <input
            type="number"
            [(ngModel)]="executionCase.amountPaid"
            min="0"
            step="0.01"
            class="w-full"
          />
        </div>
      </div>
    </ui-card>

    <div class="mt-6 flex gap-2">
      <ui-button variant="primary" (click)="save()">{{ 'actions.save' | translate }}</ui-button>
      <ui-button variant="ghost" (click)="cancel()">{{ 'actions.cancel' | translate }}</ui-button>
    </div>
  `,
})
export class ExecutionCaseDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly executionCasesService = inject(ExecutionCasesService);

  protected executionCase: ExecutionCase;
  protected fileDate: string = '';

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const existing = this.executionCasesService.getById(id);
      if (existing) {
        this.executionCase = { ...existing };
        this.fileDate = existing.fileDate ? existing.fileDate.split('T')[0] : '';
      } else {
        this.executionCase = this.createEmptyCase();
      }
    } else {
      this.executionCase = this.createEmptyCase();
    }
  }

  private createEmptyCase(): ExecutionCase {
    return {
      id: '',
      executionCaseNo: '',
      fileNo: '',
      fileDate: '',
      courtRoom: '',
      companyLawyer: '',
      lastCourtType: '',
      lastCourtLevel: '',
      amountRuled: 0,
      amountPaid: 0,
      createdAt: '',
      updatedAt: '',
    };
  }

  save(): void {
    this.executionCase.fileDate = this.fileDate ? new Date(this.fileDate).toISOString() : '';

    if (this.executionCase.id) {
      this.executionCasesService.update(this.executionCase.id, this.executionCase);
    } else {
      const created = this.executionCasesService.create({
        executionCaseNo: this.executionCase.executionCaseNo,
        fileNo: this.executionCase.fileNo,
        fileDate: this.executionCase.fileDate,
        courtRoom: this.executionCase.courtRoom,
        companyLawyer: this.executionCase.companyLawyer,
        lastCourtType: this.executionCase.lastCourtType,
        lastCourtLevel: this.executionCase.lastCourtLevel,
        amountRuled: this.executionCase.amountRuled,
        amountPaid: this.executionCase.amountPaid,
        linkedCaseId: this.executionCase.linkedCaseId,
      });
      this.router.navigate(['/execution', created.id]);
    }
  }

  cancel(): void {
    this.router.navigate(['/execution']);
  }
}
