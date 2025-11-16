import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UIButtonComponent } from '../../shared/components/ui/button.component';
import { UICardComponent } from '../../shared/components/ui/card.component';
import { FormsModule } from '@angular/forms';
import { CasesService, CaseItem } from '../../shared/services/cases.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-case-detail',
  imports: [CommonModule, UIButtonComponent, UICardComponent, FormsModule, TranslateModule],
  template: `
    <h2 class="mb-4">{{ 'nav.cases' | translate }} - {{ caseItem?.title || '...' }}</h2>
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
}
