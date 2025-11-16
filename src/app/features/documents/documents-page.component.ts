import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DocumentsService, DocumentItem } from '../../shared/services/documents.service';
import { AuditService } from '../../shared/services/audit.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-documents-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule],
  template: `
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold">{{ 'documents.title' | translate }}</h2>
      <div class="flex items-center space-x-2 rtl:space-x-reverse">
        <input
          [(ngModel)]="newTitle"
          class="border rounded px-2 py-1 text-sm"
          [placeholder]="'documents.new.placeholder' | translate"
        />
        <button class="px-2 py-1 border rounded text-sm" (click)="create()">
          {{ 'documents.new.create' | translate }}
        </button>
      </div>
    </div>
    <div class="mt-4">
      <input
        [(ngModel)]="tagFilter"
        class="border rounded px-2 py-1 text-sm"
        [placeholder]="'documents.filter.tags' | translate"
      />
    </div>
    <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
      <a
        *ngFor="let d of filtered()"
        [routerLink]="['/documents', d.id]"
        class="block border rounded p-3 hover:bg-gray-50"
      >
        <div class="font-medium">{{ d.title }}</div>
        <div class="text-xs text-gray-500 mt-1">{{ d.tags.join(', ') }}</div>
        <div class="text-xs text-gray-400 mt-1">
          {{ 'documents.versions' | translate }}: {{ d.versions.length }}
        </div>
      </a>
    </div>
    <div *ngIf="filtered().length === 0" class="text-sm text-gray-500 mt-6">
      {{ 'documents.empty' | translate }}
    </div>
  `,
})
export class DocumentsPageComponent {
  private readonly docs = inject(DocumentsService);
  private readonly audit = inject(AuditService);

  protected newTitle = '';
  protected tagFilter = '';

  filtered(): DocumentItem[] {
    const tag = this.tagFilter.trim().toLowerCase();
    const list = this.docs.list();
    if (!tag) return list;
    return list.filter((d) => d.tags.some((t) => t.toLowerCase().includes(tag)));
  }

  create(): void {
    const title = this.newTitle.trim();
    if (!title) return;
    const item = this.docs.create(title);
    this.audit.record('document.created', { id: item.id, title: item.title });
    this.newTitle = '';
  }
}
