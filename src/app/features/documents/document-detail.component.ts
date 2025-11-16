import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  DocumentsService,
  DocumentItem,
  DocumentVersion,
} from '../../shared/services/documents.service';
import { PrintService } from '../../shared/services/print.service';
import { AuditService } from '../../shared/services/audit.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-document-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule],
  template: `
    <ng-container *ngIf="doc as d; else notFound">
      <div class="flex items-center justify-between">
        <input [(ngModel)]="title" class="border rounded px-2 py-1 text-sm font-medium" />
        <div class="space-x-2 rtl:space-x-reverse">
          <button class="px-2 py-1 border rounded text-sm" (click)="saveTitle()">
            {{ 'actions.save' | translate }}
          </button>
          <button class="px-2 py-1 border rounded text-sm" (click)="remove()">
            {{ 'actions.delete' | translate }}
          </button>
        </div>
      </div>
      <div class="mt-4">
        <label class="block text-sm mb-1">{{ 'documents.upload' | translate }}</label>
        <input type="file" (change)="onFile($event)" />
      </div>
      <div class="mt-6">
        <h3 class="font-semibold mb-2">{{ 'documents.versions' | translate }}</h3>
        <table class="w-full text-sm border">
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left p-2">#</th>
              <th class="text-left p-2">{{ 'documents.file' | translate }}</th>
              <th class="text-left p-2">{{ 'documents.size' | translate }}</th>
              <th class="text-left p-2">{{ 'documents.added' | translate }}</th>
              <th class="text-left p-2">{{ 'actions.actions' | translate }}</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let v of d.versions" class="border-t">
              <td class="p-2">{{ v.number }}</td>
              <td class="p-2">{{ v.fileName }}</td>
              <td class="p-2">{{ v.size / 1024 | number: '1.0-0' }} KB</td>
              <td class="p-2">{{ v.createdAt | date: 'medium' }}</td>
              <td class="p-2 space-x-2 rtl:space-x-reverse">
                <button class="px-2 py-1 border rounded text-xs" (click)="download(v)">
                  {{ 'actions.download' | translate }}
                </button>
                <button class="px-2 py-1 border rounded text-xs" (click)="print(v)">
                  {{ 'actions.print' | translate }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </ng-container>
    <ng-template #notFound>
      <div class="text-sm text-gray-500">{{ 'documents.notFound' | translate }}</div>
    </ng-template>
  `,
})
export class DocumentDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly docs = inject(DocumentsService);
  private readonly printSvc = inject(PrintService);
  private readonly audit = inject(AuditService);

  protected doc: DocumentItem | undefined;
  protected title = '';

  constructor() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.doc = this.docs.getById(id);
    this.title = this.doc?.title ?? '';
  }

  async onFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || !this.doc) return;
    const file = input.files[0];
    if (!file) return;
    await this.docs.addVersion(this.doc.id, file);
    this.audit.record('document.version.added', { id: this.doc.id, fileName: file.name });
    // refresh reference
    this.doc = this.docs.getById(this.doc.id);
  }

  saveTitle(): void {
    if (!this.doc) return;
    this.docs.rename(this.doc.id, this.title.trim());
    this.audit.record('document.renamed', { id: this.doc.id, title: this.title.trim() });
    this.doc = this.docs.getById(this.doc.id);
  }

  remove(): void {
    if (!this.doc) return;
    const id = this.doc.id;
    this.docs.delete(id);
    this.audit.record('document.deleted', { id });
    history.back();
  }

  download(v: DocumentVersion): void {
    if (!this.doc) return;
    const blob = this.docs.getLatestVersionBlob(this.doc.id);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = v.fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  print(_v: DocumentVersion): void {
    this.printSvc.print();
  }
}
