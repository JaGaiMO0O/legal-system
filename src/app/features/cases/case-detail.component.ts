import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
    <h2 class="mb-2">{{ 'nav.cases' | translate }} - {{ caseItem?.title || '...' }}</h2>
    <div class="mb-4 text-sm">
      <span class="inline-flex items-center rounded-full px-2 py-0.5 border">
        Stage: {{ caseItem?.stage || 'primary' | titlecase }}
      </span>
      <button class="ml-2 px-2 py-1 border rounded text-xs" (click)="nextStage()">
        {{ 'cases.nextCourt' | translate }}
      </button>
      <button
        class="ml-2 px-2 py-1 border rounded text-xs"
        (click)="execute()"
        *ngIf="caseItem?.stage === 'execution'"
      >
        {{ 'cases.execute' | translate }}
      </button>
    </div>
    <ui-card>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">ID</label>
          <input type="text" [value]="caseItem?.id || ''" readonly />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">Client</label>
          <input type="text" [(ngModel)]="client" />
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">Title</label>
          <input type="text" [(ngModel)]="title" />
        </div>
        <div>
          <label class="block text-sm text-[rgb(var(--text-muted))] mb-1">Status</label>
          <select [(ngModel)]="status">
            <option value="open">Open</option>
            <option value="pending">Pending</option>
            <option value="closed">Closed</option>
            <option value="on-hold">On Hold</option>
          </select>
        </div>
      </div>
      <div class="mt-4 flex gap-2">
        <ui-button variant="primary" (click)="save()">Save</ui-button>
        <ui-button variant="ghost">Cancel</ui-button>
      </div>
    </ui-card>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      <ui-card>
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-semibold">Tasks</h3>
          <div>
            <input
              class="border rounded px-2 py-1 text-sm"
              [(ngModel)]="taskTitle"
              placeholder="New task"
            />
            <button class="ml-2 px-2 py-1 border rounded text-sm" (click)="addTask()">Add</button>
          </div>
        </div>
        <ul class="space-y-2">
          <li *ngFor="let t of caseItem?.tasks" class="flex items-center justify-between">
            <label class="flex items-center gap-2">
              <input type="checkbox" [checked]="t.done" (change)="toggleTask(t.id)" />
              <span [class.line-through]="t.done">{{ t.title }}</span>
            </label>
            <button class="text-xs text-red-600" (click)="removeTask(t.id)">Remove</button>
          </li>
        </ul>
      </ui-card>
      <ui-card>
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-semibold">Deadlines</h3>
          <div class="flex items-center gap-2">
            <input
              class="border rounded px-2 py-1 text-sm"
              [(ngModel)]="deadlineTitle"
              placeholder="Title"
            />
            <input
              type="date"
              class="border rounded px-2 py-1 text-sm"
              [(ngModel)]="deadlineDate"
            />
            <button class="px-2 py-1 border rounded text-sm" (click)="addDeadline()">Add</button>
          </div>
        </div>
        <ul class="space-y-2">
          <li *ngFor="let d of caseItem?.deadlines" class="flex items-center justify-between">
            <span>{{ d.title }} — {{ d.date }}</span>
            <button class="text-xs text-red-600" (click)="removeDeadline(d.id)">Remove</button>
          </li>
        </ul>
      </ui-card>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      <ui-card>
        <h3 class="font-semibold mb-2">Developments</h3>
        <ul class="space-y-2 text-sm">
          <li *ngFor="let dev of caseItem?.developments">
            <span class="text-gray-500">{{ dev.date | date: 'short' }}</span> — {{ dev.note }}
          </li>
        </ul>
      </ui-card>
      <ui-card>
        <h3 class="font-semibold mb-4">{{ 'cases.rulings.title' | translate }}</h3>

        <!-- Ruling Form -->
        <div class="border rounded p-4 mb-4 bg-gray-50">
          <h4 class="font-semibold mb-3">{{ 'cases.rulings.sections.mainInfo' | translate }}</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div>
              <label class="block text-xs text-[rgb(var(--text-muted))] mb-1">{{
                'cases.rulings.fields.caseNo' | translate
              }}</label>
              <input type="text" [(ngModel)]="newRuling.caseNo" class="w-full text-sm" />
            </div>
            <div>
              <label class="block text-xs text-[rgb(var(--text-muted))] mb-1">{{
                'cases.rulings.fields.caseType' | translate
              }}</label>
              <select [(ngModel)]="newRuling.caseType" class="w-full text-sm">
                <option value="Plaintiff">
                  {{ 'cases.rulings.caseType.plaintiff' | translate }}
                </option>
                <option value="Defendant">
                  {{ 'cases.rulings.caseType.defendant' | translate }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-xs text-[rgb(var(--text-muted))] mb-1">{{
                'cases.rulings.fields.courtType' | translate
              }}</label>
              <input type="text" [(ngModel)]="newRuling.courtType" class="w-full text-sm" />
            </div>
            <div>
              <label class="block text-xs text-[rgb(var(--text-muted))] mb-1">{{
                'cases.rulings.fields.courtLevel' | translate
              }}</label>
              <input type="text" [(ngModel)]="newRuling.courtLevel" class="w-full text-sm" />
            </div>
            <div>
              <label class="block text-xs text-[rgb(var(--text-muted))] mb-1">{{
                'cases.rulings.fields.courtCity' | translate
              }}</label>
              <input type="text" [(ngModel)]="newRuling.courtCity" class="w-full text-sm" />
            </div>
            <div>
              <label class="block text-xs text-[rgb(var(--text-muted))] mb-1">{{
                'cases.rulings.fields.filingDate' | translate
              }}</label>
              <input type="date" [(ngModel)]="newRuling.filingDate" class="w-full text-sm" />
            </div>
            <div>
              <label class="block text-xs text-[rgb(var(--text-muted))] mb-1">{{
                'cases.rulings.fields.filingNo' | translate
              }}</label>
              <input type="text" [(ngModel)]="newRuling.filingNo" class="w-full text-sm" />
            </div>
            <div class="md:col-span-2">
              <label class="block text-xs text-[rgb(var(--text-muted))] mb-1">{{
                'cases.rulings.fields.caseDetails' | translate
              }}</label>
              <textarea
                [(ngModel)]="newRuling.caseDetails"
                rows="2"
                class="w-full text-sm"
              ></textarea>
            </div>
          </div>

          <h4 class="font-semibold mb-3">{{ 'cases.rulings.sections.stageInfo' | translate }}</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div>
              <label class="block text-xs text-[rgb(var(--text-muted))] mb-1">{{
                'cases.rulings.fields.stage' | translate
              }}</label>
              <select [(ngModel)]="newRuling.stage" class="w-full text-sm">
                <option value="primary">Primary</option>
                <option value="appeal">Appeal</option>
                <option value="cassation">Cassation</option>
                <option value="execution">Execution</option>
              </select>
            </div>
            <div>
              <label class="block text-xs text-[rgb(var(--text-muted))] mb-1">{{
                'cases.rulings.fields.stageNo' | translate
              }}</label>
              <input type="number" [(ngModel)]="newRuling.stageNo" min="1" class="w-full text-sm" />
            </div>
            <div>
              <label class="block text-xs text-[rgb(var(--text-muted))] mb-1">{{
                'cases.rulings.fields.rulingInFavorOf' | translate
              }}</label>
              <select [(ngModel)]="newRuling.rulingInFavorOf" class="w-full text-sm">
                <option value="Company">
                  {{ 'cases.rulings.rulingInFavorOf.company' | translate }}
                </option>
                <option value="Adversary">
                  {{ 'cases.rulings.rulingInFavorOf.adversary' | translate }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-xs text-[rgb(var(--text-muted))] mb-1">{{
                'cases.rulings.fields.rulingDate' | translate
              }}</label>
              <input type="date" [(ngModel)]="newRuling.rulingDate" class="w-full text-sm" />
            </div>
            <div>
              <label class="block text-xs text-[rgb(var(--text-muted))] mb-1">{{
                'cases.rulings.fields.courtFees' | translate
              }}</label>
              <input
                type="number"
                [(ngModel)]="newRuling.courtFees"
                min="0"
                step="0.01"
                class="w-full text-sm"
              />
            </div>
            <div>
              <label class="block text-xs text-[rgb(var(--text-muted))] mb-1">{{
                'cases.rulings.fields.legalExpenses' | translate
              }}</label>
              <input
                type="number"
                [(ngModel)]="newRuling.legalExpenses"
                min="0"
                step="0.01"
                class="w-full text-sm"
              />
            </div>
            <div>
              <label class="block text-xs text-[rgb(var(--text-muted))] mb-1">{{
                'cases.rulings.fields.translationCourtFees' | translate
              }}</label>
              <input
                type="number"
                [(ngModel)]="newRuling.translationCourtFees"
                min="0"
                step="0.01"
                class="w-full text-sm"
              />
            </div>
            <div>
              <label class="block text-xs text-[rgb(var(--text-muted))] mb-1">{{
                'cases.rulings.fields.courtFeesInCash' | translate
              }}</label>
              <input
                type="number"
                [(ngModel)]="newRuling.courtFeesInCash"
                min="0"
                step="0.01"
                class="w-full text-sm"
              />
            </div>
            <div>
              <label class="block text-xs text-[rgb(var(--text-muted))] mb-1">{{
                'cases.rulings.fields.expertFees' | translate
              }}</label>
              <input
                type="number"
                [(ngModel)]="newRuling.expertFees"
                min="0"
                step="0.01"
                class="w-full text-sm"
              />
            </div>
            <div>
              <label class="block text-xs text-[rgb(var(--text-muted))] mb-1">{{
                'cases.rulings.fields.advocacyFees' | translate
              }}</label>
              <input
                type="number"
                [(ngModel)]="newRuling.advocacyFees"
                min="0"
                step="0.01"
                class="w-full text-sm"
              />
            </div>
            <div>
              <label class="block text-xs text-[rgb(var(--text-muted))] mb-1">{{
                'cases.rulings.fields.otherExpenses' | translate
              }}</label>
              <input
                type="number"
                [(ngModel)]="newRuling.otherExpenses"
                min="0"
                step="0.01"
                class="w-full text-sm"
              />
            </div>
          </div>

          <h4 class="font-semibold mb-3">
            {{ 'cases.rulings.sections.adversaryInfo' | translate }}
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div>
              <label class="block text-xs text-[rgb(var(--text-muted))] mb-1">{{
                'cases.rulings.fields.adversaryName' | translate
              }}</label>
              <input type="text" [(ngModel)]="newRuling.adversaryName" class="w-full text-sm" />
            </div>
            <div>
              <label class="block text-xs text-[rgb(var(--text-muted))] mb-1">{{
                'cases.rulings.fields.indemnityByCourtAmount' | translate
              }}</label>
              <input
                type="number"
                [(ngModel)]="newRuling.indemnityByCourtAmount"
                min="0"
                step="0.01"
                class="w-full text-sm"
              />
            </div>
          </div>

          <div class="flex justify-end">
            <button class="px-4 py-2 bg-blue-600 text-white rounded text-sm" (click)="addRuling()">
              {{ 'actions.add' | translate }} {{ 'cases.rulings.title' | translate }}
            </button>
          </div>
        </div>

        <!-- Existing Rulings List -->
        <ul class="space-y-3">
          <li *ngFor="let r of caseItem?.rulings" class="border rounded p-3">
            <div class="flex items-center justify-between mb-2">
              <span class="font-medium"
                >{{ r.stage | titlecase }} - {{ 'cases.rulings.fields.stageNo' | translate }}:
                {{ r.stageNo }}</span
              >
              <span class="text-xs text-[rgb(var(--text-muted))]">{{
                r.rulingDate | date: 'short'
              }}</span>
            </div>
            <div class="text-sm space-y-1">
              <div>
                <strong>{{ 'cases.rulings.fields.caseNo' | translate }}:</strong> {{ r.caseNo }}
              </div>
              <div>
                <strong>{{ 'cases.rulings.fields.caseType' | translate }}:</strong> {{ r.caseType }}
              </div>
              <div>
                <strong>{{ 'cases.rulings.fields.rulingInFavorOf' | translate }}:</strong>
                {{ r.rulingInFavorOf }}
              </div>
              <div>
                <strong>{{ 'cases.rulings.fields.adversaryName' | translate }}:</strong>
                {{ r.adversaryName || '-' }}
              </div>
              <div>
                <strong>{{ 'cases.rulings.fields.indemnityByCourtAmount' | translate }}:</strong>
                {{ r.indemnityByCourtAmount | number }}
              </div>
              <div class="text-xs text-[rgb(var(--text-muted))] mt-2">
                {{ 'cases.rulings.fields.courtFees' | translate }}: {{ r.courtFees | number }} |
                {{ 'cases.rulings.fields.legalExpenses' | translate }}:
                {{ r.legalExpenses | number }} |
                {{ 'cases.rulings.fields.expertFees' | translate }}: {{ r.expertFees | number }}
              </div>
            </div>
          </li>
          <li
            *ngIf="!caseItem?.rulings || caseItem.rulings.length === 0"
            class="text-sm text-[rgb(var(--text-muted))] text-center py-4"
          >
            {{ 'cases.rulings.empty' | translate }}
          </li>
        </ul>
      </ui-card>
    </div>
  `,
})
export class CaseDetailComponent {
  private readonly route = inject(ActivatedRoute);
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
    const id = this.route.snapshot.paramMap.get('id')!;
    this.caseItem = this.cases.getById(id);
    if (!this.caseItem) {
      // if not found, create a placeholder
      this.caseItem = this.cases.create({ title: 'New Case', client: 'Client' });
    }
    this.title = this.caseItem.title;
    this.client = this.caseItem.client;
    this.status = (this.caseItem.status as any) || 'open';
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
