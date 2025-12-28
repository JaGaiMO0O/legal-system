import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { UIButtonComponent } from '../../shared/components/ui/button.component';
import { UICardComponent } from '../../shared/components/ui/card.component';
import { CasesService, CaseStage } from '../../shared/services/cases.service';
import {
  ExecutionCase,
  ExecutionCasesService,
} from '../../shared/services/execution-cases.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  standalone: true,
  selector: 'app-execution-case-detail',
  imports: [CommonModule, FormsModule, TranslateModule, UIButtonComponent, UICardComponent],
  template: `
    <div class="mb-6">
      <button
        (click)="cancel()"
        class="mb-4 flex items-center text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))] transition"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Execution Cases
      </button>
      <h2 class="text-2xl font-bold">Execution Case</h2>
    </div>

    <ui-card>
      <h3 class="font-semibold mb-4">Main Info</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">Execution Case No</label>
          <input type="text" [(ngModel)]="executionCase.executionCaseNo" class="w-full" />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">File No</label>
          <input type="text" [(ngModel)]="executionCase.fileNo" class="w-full" />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">Linked Case ID</label>
          <input type="text" [(ngModel)]="executionCase.linkedCaseId" class="w-full font-mono" />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">Unified Case ID</label>
          <input type="text" [(ngModel)]="executionCase.unifiedCaseId" class="w-full font-mono" />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">File Date</label>
          <input type="date" [(ngModel)]="fileDate" class="w-full" />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">Court Room</label>
          <input type="text" [(ngModel)]="executionCase.courtRoom" class="w-full" />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">Company Lawyer</label>
          <input type="text" [(ngModel)]="executionCase.companyLawyer" class="w-full" />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">Last Court Type</label>
          <input type="text" [(ngModel)]="executionCase.lastCourtType" class="w-full" />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">Last Court Level</label>
          <input type="text" [(ngModel)]="executionCase.lastCourtLevel" class="w-full" />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">Amount Ruled</label>
          <input
            type="number"
            [(ngModel)]="executionCase.amountRuled"
            min="0"
            step="0.01"
            class="w-full"
          />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">Amount Paid</label>
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
      <ui-button variant="primary" (click)="save()">Save</ui-button>
      <ui-button variant="ghost" (click)="cancel()">Cancel</ui-button>
      <ui-button
        *ngIf="executionCase.linkedCaseId"
        variant="ghost"
        class="text-emerald-700"
        (click)="finalizeAndSettle()"
      >
        Finalize & Settle Case
      </ui-button>
    </div>
  `,
})
export class ExecutionCaseDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly executionCasesService = inject(ExecutionCasesService);
  private readonly casesService = inject(CasesService);
  private readonly toast = inject(ToastService);

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
      caseNumber: '',
      executionCaseNo: '',
      fileNo: '',
      fileDate: '',
      courtRoom: '',
      companyLawyer: '',
      lastCourtType: '',
      lastCourtLevel: '',
      amountRuled: 0,
      amountPaid: 0,
      linkedCaseId: '',
      unifiedCaseId: '',
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
        unifiedCaseId: this.executionCase.unifiedCaseId,
      });
      this.router.navigate(['/execution', created.id]);
    }
  }

  cancel(): void {
    this.router.navigate(['/execution']);
  }

  finalizeAndSettle(): void {
    if (!this.executionCase.linkedCaseId) return;
    try {
      this.casesService.settleCase(this.executionCase.linkedCaseId, 'execution' as CaseStage);
      this.toast.success('Linked case settled');
    } catch (error) {
      this.toast.error('Failed to settle linked case');
      console.error('Error settling linked case:', error);
    }
  }
}
