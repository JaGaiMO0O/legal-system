import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UIButtonComponent } from '../../shared/components/ui/button.component';
import { UICardComponent } from '../../shared/components/ui/card.component';
import { FormsModule } from '@angular/forms';
import {
  CasesService,
  CaseItem,
  CaseStage,
  CaseType,
  RulingInFavorOf,
} from '../../shared/services/cases.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-case-detail',
  imports: [CommonModule, UIButtonComponent, UICardComponent, FormsModule, TranslateModule],
  template: `
    <div class="mb-8">
      <button
        (click)="goBack()"
        class="mb-6 flex items-center text-[rgb(var(--text-muted))] hover:text-[rgb(var(--primary))] transition-colors font-medium"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Cases
      </button>
      <div class="flex items-start justify-between mb-6">
        <div>
          <h2 class="text-3xl font-bold mb-2">{{ caseItem?.title || 'New Case' }}</h2>
          <p class="text-sm text-[rgb(var(--text-muted))]">
            Client: {{ caseItem?.client || 'Not set' }}
          </p>
        </div>
        <div class="flex items-center gap-3">
          <span
            class="inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200"
          >
            Stage: {{ caseItem?.stage || 'primary' | titlecase }}
          </span>
          <ui-button variant="ghost" (click)="nextStage()" class="text-sm"> Next Court </ui-button>
          <ui-button
            variant="primary"
            (click)="execute()"
            *ngIf="caseItem?.stage === 'execution'"
            class="text-sm"
          >
            Execute Case
          </ui-button>
        </div>
      </div>
    </div>
    <ui-card>
      <h3 class="text-lg font-bold mb-6">Case Information</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">Case ID</label>
          <input
            type="text"
            [value]="caseItem?.id || 'Will be generated'"
            readonly
            class="w-full bg-[rgb(var(--surface-muted))] cursor-not-allowed"
          />
        </div>
        <div>
          <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">Status</label>
          <select [(ngModel)]="status" class="w-full">
            <option value="open">Open</option>
            <option value="pending">Pending</option>
            <option value="closed">Closed</option>
            <option value="on-hold">On Hold</option>
          </select>
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">Title</label>
          <input type="text" [(ngModel)]="title" class="w-full" placeholder="Enter case title" />
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2">Client</label>
          <input type="text" [(ngModel)]="client" class="w-full" placeholder="Enter client name" />
        </div>
      </div>
      <div class="mt-8 pt-6 border-t border-[rgb(var(--border-light))] flex gap-3 justify-end">
        <ui-button variant="ghost" (click)="goBack()">Cancel</ui-button>
        <ui-button variant="primary" (click)="save()">Save Changes</ui-button>
      </div>
    </ui-card>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <ui-card>
        <div class="mb-6">
          <h3 class="text-lg font-bold mb-4">Tasks</h3>
          <div class="flex gap-2">
            <input class="flex-1" [(ngModel)]="taskTitle" placeholder="Enter new task" />
            <ui-button variant="primary" (click)="addTask()" class="whitespace-nowrap"
              >Add</ui-button
            >
          </div>
        </div>
        <ul class="space-y-3">
          <li
            *ngFor="let t of caseItem?.tasks"
            class="flex items-center justify-between p-3 bg-[rgb(var(--surface-muted))] rounded-lg"
          >
            <label class="flex items-center gap-3 flex-1 cursor-pointer">
              <input
                type="checkbox"
                [checked]="t.done"
                (change)="toggleTask(t.id)"
                class="w-4 h-4"
              />
              <span [class.line-through]="t.done" [class.text-[rgb(var(--text-muted))]]="t.done">{{
                t.title
              }}</span>
            </label>
            <button
              class="text-sm text-red-600 hover:text-red-700 font-medium px-2"
              (click)="removeTask(t.id)"
            >
              Remove
            </button>
          </li>
          <li
            *ngIf="!caseItem?.tasks || caseItem?.tasks?.length === 0"
            class="text-sm text-[rgb(var(--text-muted))] text-center py-4"
          >
            No tasks yet
          </li>
        </ul>
      </ui-card>
      <ui-card>
        <div class="mb-6">
          <h3 class="text-lg font-bold mb-4">Deadlines</h3>
          <div class="space-y-2">
            <input class="w-full" [(ngModel)]="deadlineTitle" placeholder="Deadline title" />
            <div class="flex gap-2">
              <input type="date" class="flex-1" [(ngModel)]="deadlineDate" />
              <ui-button variant="primary" (click)="addDeadline()" class="whitespace-nowrap"
                >Add</ui-button
              >
            </div>
          </div>
        </div>
        <ul class="space-y-3">
          <li
            *ngFor="let d of caseItem?.deadlines"
            class="flex items-center justify-between p-3 bg-[rgb(var(--surface-muted))] rounded-lg"
          >
            <div>
              <span class="font-medium">{{ d.title }}</span>
              <span class="text-sm text-[rgb(var(--text-muted))] ml-2">— {{ d.date }}</span>
            </div>
            <button
              class="text-sm text-red-600 hover:text-red-700 font-medium px-2"
              (click)="removeDeadline(d.id)"
            >
              Remove
            </button>
          </li>
          <li
            *ngIf="!caseItem?.deadlines || caseItem?.deadlines?.length === 0"
            class="text-sm text-[rgb(var(--text-muted))] text-center py-4"
          >
            No deadlines yet
          </li>
        </ul>
      </ui-card>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <ui-card>
        <h3 class="text-lg font-bold mb-6">Developments</h3>
        <ul class="space-y-3">
          <li
            *ngFor="let dev of caseItem?.developments"
            class="p-3 bg-[rgb(var(--surface-muted))] rounded-lg"
          >
            <div class="text-xs text-[rgb(var(--text-muted))] mb-1">
              {{ dev.date | date: 'short' }}
            </div>
            <div class="text-sm">{{ dev.note }}</div>
          </li>
          <li
            *ngIf="!caseItem?.developments || caseItem?.developments?.length === 0"
            class="text-sm text-[rgb(var(--text-muted))] text-center py-4"
          >
            No developments yet
          </li>
        </ul>
      </ui-card>
      <ui-card>
        <h3 class="text-lg font-bold mb-6">Court Rulings</h3>

        <!-- Ruling Form -->
        <div
          class="border border-[rgb(var(--border))] rounded-xl p-6 mb-6 bg-[rgb(var(--surface-muted))]"
        >
          <h4 class="font-bold mb-4 text-[rgb(var(--text))]">Main Info</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                >Case No</label
              >
              <input
                type="text"
                [(ngModel)]="newRuling.caseNo"
                class="w-full"
                placeholder="Enter case number"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                >Case Type</label
              >
              <select [(ngModel)]="newRuling.caseType" class="w-full">
                <option value="Plaintiff">Plaintiff</option>
                <option value="Defendant">Defendant</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                >Court Type</label
              >
              <input
                type="text"
                [(ngModel)]="newRuling.courtType"
                class="w-full"
                placeholder="Enter court type"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                >Court Level</label
              >
              <input
                type="text"
                [(ngModel)]="newRuling.courtLevel"
                class="w-full"
                placeholder="Enter court level"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                >Court City</label
              >
              <input
                type="text"
                [(ngModel)]="newRuling.courtCity"
                class="w-full"
                placeholder="Enter court city"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                >Filing Date</label
              >
              <input type="date" [(ngModel)]="newRuling.filingDate" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                >Filing No</label
              >
              <input
                type="text"
                [(ngModel)]="newRuling.filingNo"
                class="w-full"
                placeholder="Enter filing number"
              />
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                >Case Details</label
              >
              <textarea
                [(ngModel)]="newRuling.caseDetails"
                rows="3"
                class="w-full"
                placeholder="Enter case details"
              ></textarea>
            </div>
          </div>

          <div class="border-t border-[rgb(var(--border))] pt-6 mt-6">
            <h4 class="font-bold mb-4 text-[rgb(var(--text))]">Stage Info</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                  >Stage</label
                >
                <select [(ngModel)]="newRuling.stage" class="w-full">
                  <option value="primary">Primary</option>
                  <option value="appeal">Appeal</option>
                  <option value="cassation">Cassation</option>
                  <option value="execution">Execution</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                  >Stage No</label
                >
                <input type="number" [(ngModel)]="newRuling.stageNo" min="1" class="w-full" />
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                  >Ruling in favor of</label
                >
                <select [(ngModel)]="newRuling.rulingInFavorOf" class="w-full">
                  <option value="Company">Company</option>
                  <option value="Adversary">Adversary</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                  >Ruling Date</label
                >
                <input type="date" [(ngModel)]="newRuling.rulingDate" class="w-full" />
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                  >Court Fees</label
                >
                <input
                  type="number"
                  [(ngModel)]="newRuling.courtFees"
                  min="0"
                  step="0.01"
                  class="w-full"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                  >Legal Expenses</label
                >
                <input
                  type="number"
                  [(ngModel)]="newRuling.legalExpenses"
                  min="0"
                  step="0.01"
                  class="w-full"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                  >Translation Court Fees</label
                >
                <input
                  type="number"
                  [(ngModel)]="newRuling.translationCourtFees"
                  min="0"
                  step="0.01"
                  class="w-full"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                  >Court Fees in Cash</label
                >
                <input
                  type="number"
                  [(ngModel)]="newRuling.courtFeesInCash"
                  min="0"
                  step="0.01"
                  class="w-full"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                  >Expert Fees</label
                >
                <input
                  type="number"
                  [(ngModel)]="newRuling.expertFees"
                  min="0"
                  step="0.01"
                  class="w-full"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                  >Advocacy Fees</label
                >
                <input
                  type="number"
                  [(ngModel)]="newRuling.advocacyFees"
                  min="0"
                  step="0.01"
                  class="w-full"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                  >Other Expenses</label
                >
                <input
                  type="number"
                  [(ngModel)]="newRuling.otherExpenses"
                  min="0"
                  step="0.01"
                  class="w-full"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div class="border-t border-[rgb(var(--border))] pt-6 mt-6">
            <h4 class="font-bold mb-4 text-[rgb(var(--text))]">Adversary Info</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                  >Adversary Name</label
                >
                <input
                  type="text"
                  [(ngModel)]="newRuling.adversaryName"
                  class="w-full"
                  placeholder="Enter adversary name"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-[rgb(var(--text))] mb-2"
                  >Indemnity by Court Amount</label
                >
                <input
                  type="number"
                  [(ngModel)]="newRuling.indemnityByCourtAmount"
                  min="0"
                  step="0.01"
                  class="w-full"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div class="flex justify-end pt-4 border-t border-[rgb(var(--border))]">
            <ui-button variant="primary" (click)="addRuling()">Add Court Ruling</ui-button>
          </div>
        </div>

        <!-- Existing Rulings List -->
        <div class="mt-6">
          <h4 class="font-bold mb-4 text-[rgb(var(--text))]">Existing Rulings</h4>
          <ul class="space-y-4">
            <li
              *ngFor="let r of caseItem?.rulings"
              class="border border-[rgb(var(--border))] rounded-xl p-5 bg-[rgb(var(--surface-muted))]"
            >
              <div
                class="flex items-center justify-between mb-4 pb-3 border-b border-[rgb(var(--border-light))]"
              >
                <span class="font-bold text-[rgb(var(--text))]"
                  >{{ r.stage | titlecase }} - Stage No: {{ r.stageNo }}</span
                >
                <span class="text-sm text-[rgb(var(--text-muted))]">{{
                  r.rulingDate | date: 'short'
                }}</span>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <strong class="text-[rgb(var(--text))]">Case No:</strong>
                  <span class="text-[rgb(var(--text-muted))]">{{ r.caseNo }}</span>
                </div>
                <div>
                  <strong class="text-[rgb(var(--text))]">Case Type:</strong>
                  <span class="text-[rgb(var(--text-muted))]">{{ r.caseType }}</span>
                </div>
                <div>
                  <strong class="text-[rgb(var(--text))]">Ruling in favor of:</strong>
                  <span class="text-[rgb(var(--text-muted))]">{{ r.rulingInFavorOf }}</span>
                </div>
                <div>
                  <strong class="text-[rgb(var(--text))]">Adversary Name:</strong>
                  <span class="text-[rgb(var(--text-muted))]">{{ r.adversaryName || '-' }}</span>
                </div>
                <div class="md:col-span-2">
                  <strong class="text-[rgb(var(--text))]">Indemnity by Court Amount:</strong>
                  <span class="text-[rgb(var(--primary))] font-semibold"
                    >{{ r.indemnityByCourtAmount | number }} SAR</span
                  >
                </div>
                <div class="md:col-span-2 pt-2 border-t border-[rgb(var(--border-light))]">
                  <div class="text-xs text-[rgb(var(--text-muted))] space-y-1">
                    <div>
                      Court Fees: <span class="font-medium">{{ r.courtFees | number }} SAR</span>
                    </div>
                    <div>
                      Legal Expenses:
                      <span class="font-medium">{{ r.legalExpenses | number }} SAR</span>
                    </div>
                    <div>
                      Expert Fees: <span class="font-medium">{{ r.expertFees | number }} SAR</span>
                    </div>
                  </div>
                </div>
              </div>
            </li>
            <li
              *ngIf="!caseItem?.rulings || caseItem?.rulings?.length === 0"
              class="text-sm text-[rgb(var(--text-muted))] text-center py-8 bg-[rgb(var(--surface-muted))] rounded-lg"
            >
              No rulings yet. Add your first ruling above.
            </li>
          </ul>
        </div>
      </ui-card>
    </div>
  `,
})
export class CaseDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cases = inject(CasesService);
  protected caseItem: CaseItem | undefined;
  protected title = '';
  protected client = '';
  protected status: 'open' | 'pending' | 'closed' | 'on-hold' = 'open';
  protected taskTitle = '';
  protected deadlineTitle = '';
  protected deadlineDate = '';
  protected newRuling = {
    stage: 'primary' as Exclude<CaseStage, 'settled'>,
    caseNo: '',
    caseType: 'Plaintiff' as CaseType,
    courtType: '',
    courtLevel: '',
    courtCity: '',
    caseDetails: '',
    filingDate: new Date().toISOString().slice(0, 10),
    filingNo: '',
    stageNo: 1,
    rulingInFavorOf: 'Company' as RulingInFavorOf,
    rulingDate: new Date().toISOString().slice(0, 10),
    courtFees: 0,
    legalExpenses: 0,
    translationCourtFees: 0,
    courtFeesInCash: 0,
    expertFees: 0,
    advocacyFees: 0,
    otherExpenses: 0,
    adversaryName: '',
    indemnityByCourtAmount: 0,
  };

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.caseItem = this.cases.getById(id);
      if (this.caseItem) {
        this.title = this.caseItem.title;
        this.client = this.caseItem.client;
        this.status = this.caseItem.status;
      }
    }
  }

  goBack(): void {
    this.router.navigate(['/cases']);
  }

  save(): void {
    if (!this.caseItem) return;
    this.cases.updateMeta(this.caseItem.id, {
      title: this.title.trim(),
      client: this.client.trim(),
      status: (this.status as any) === 'on-hold' ? 'pending' : (this.status as any),
    });
    this.caseItem = this.cases.getById(this.caseItem.id);
  }

  nextStage(): void {
    if (!this.caseItem) return;
    this.cases.advanceStage(this.caseItem.id);
    this.caseItem = this.cases.getById(this.caseItem.id);
  }

  execute(): void {
    if (!this.caseItem) return;
    this.cases.executeCase(this.caseItem.id);
    this.caseItem = this.cases.getById(this.caseItem.id);
  }

  addTask(): void {
    if (!this.caseItem) return;
    const t = this.taskTitle.trim();
    if (!t) return;
    this.cases.addTask(this.caseItem.id, t);
    this.caseItem = this.cases.getById(this.caseItem.id);
    this.taskTitle = '';
  }

  toggleTask(taskId: string): void {
    if (!this.caseItem) return;
    this.cases.toggleTask(this.caseItem.id, taskId);
    this.caseItem = this.cases.getById(this.caseItem.id);
  }

  removeTask(taskId: string): void {
    if (!this.caseItem) return;
    this.cases.removeTask(this.caseItem.id, taskId);
    this.caseItem = this.cases.getById(this.caseItem.id);
  }

  addDeadline(): void {
    if (!this.caseItem) return;
    const t = this.deadlineTitle.trim();
    const d = this.deadlineDate;
    if (!t || !d) return;
    this.cases.addDeadline(this.caseItem.id, t, d);
    this.caseItem = this.cases.getById(this.caseItem.id);
    this.deadlineTitle = '';
    this.deadlineDate = '';
  }

  removeDeadline(deadlineId: string): void {
    if (!this.caseItem) return;
    this.cases.removeDeadline(this.caseItem.id, deadlineId);
    this.caseItem = this.cases.getById(this.caseItem.id);
  }

  addRuling(): void {
    if (!this.caseItem) return;
    if (!this.newRuling.caseNo || !this.newRuling.caseType || !this.newRuling.courtType) {
      return; // Basic validation
    }

    this.cases.addRuling(this.caseItem.id, {
      stage: this.newRuling.stage,
      caseNo: this.newRuling.caseNo,
      caseType: this.newRuling.caseType,
      courtType: this.newRuling.courtType,
      courtLevel: this.newRuling.courtLevel,
      courtCity: this.newRuling.courtCity,
      caseDetails: this.newRuling.caseDetails,
      filingDate: this.newRuling.filingDate,
      filingNo: this.newRuling.filingNo,
      stageNo: this.newRuling.stageNo,
      rulingInFavorOf: this.newRuling.rulingInFavorOf,
      rulingDate: this.newRuling.rulingDate,
      courtFees: this.newRuling.courtFees,
      legalExpenses: this.newRuling.legalExpenses,
      translationCourtFees: this.newRuling.translationCourtFees,
      courtFeesInCash: this.newRuling.courtFeesInCash,
      expertFees: this.newRuling.expertFees,
      advocacyFees: this.newRuling.advocacyFees,
      otherExpenses: this.newRuling.otherExpenses,
      adversaryName: this.newRuling.adversaryName,
      indemnityByCourtAmount: this.newRuling.indemnityByCourtAmount,
    });

    this.caseItem = this.cases.getById(this.caseItem.id);
    // Reset form
    this.newRuling = {
      stage: 'primary' as Exclude<CaseStage, 'settled'>,
      caseNo: '',
      caseType: 'Plaintiff' as CaseType,
      courtType: '',
      courtLevel: '',
      courtCity: '',
      caseDetails: '',
      filingDate: new Date().toISOString().slice(0, 10),
      filingNo: '',
      stageNo: 1,
      rulingInFavorOf: 'Company' as RulingInFavorOf,
      rulingDate: new Date().toISOString().slice(0, 10),
      courtFees: 0,
      legalExpenses: 0,
      translationCourtFees: 0,
      courtFeesInCash: 0,
      expertFees: 0,
      advocacyFees: 0,
      otherExpenses: 0,
      adversaryName: '',
      indemnityByCourtAmount: 0,
    };
  }
}
