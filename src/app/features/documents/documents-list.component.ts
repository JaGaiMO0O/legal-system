import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { AttachmentPreviewDialogComponent } from '../../shared/components/attachment-preview-dialog/attachment-preview-dialog.component';
import { CaseAttachment } from '../../shared/models/case-attachment.model';
import { CaseAttachmentService } from '../../shared/services/case-attachment.service';
import { CasesService } from '../../shared/services/cases.service';

interface AttachmentRow extends CaseAttachment {
  caseNumber: string;
  caseTitle: string;
}

@Component({
  standalone: true,
  selector: 'app-documents-list',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslateModule,
    ButtonModule,
    CardModule,
    TableModule,
    AttachmentPreviewDialogComponent,
  ],
  template: `
    <div class="mb-8">
      <h2 class="text-2xl md:text-3xl font-semibold text-[rgb(var(--text))] mb-2 tracking-tight">
        {{ 'documents.title' | translate }}
      </h2>
      <p class="text-sm text-[rgb(var(--text-muted))]">
        {{ 'documents.globalSubtitle' | translate }}
      </p>
    </div>

    <p-card>
      <div class="search-input-with-icon mb-4 max-w-xl">
        <span class="search-input-icon" aria-hidden="true">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </span>
        <input
          type="search"
          class="search-input-with-icon-field w-full"
          [ngModel]="query"
          (ngModelChange)="onQueryChange($event)"
          [placeholder]="'documents.searchPlaceholder' | translate"
        />
      </div>

      @if (filtered.length === 0) {
        <p class="text-sm text-[rgb(var(--text-muted))] py-8 text-center">
          {{ 'documents.empty' | translate }}
        </p>
      } @else {
        <p-table [value]="filtered" styleClass="p-datatable-sm">
          <ng-template pTemplate="header">
            <tr>
              <th>{{ 'documents.file' | translate }}</th>
              <th>{{ 'documents.case' | translate }}</th>
              <th>{{ 'documents.size' | translate }}</th>
              <th>{{ 'documents.added' | translate }}</th>
              <th></th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-row>
            <tr>
              <td>{{ row.fileName }}</td>
              <td>
                <a
                  [routerLink]="['/legal/case', row.caseId]"
                  [queryParams]="{ tab: 'documents' }"
                  class="text-[rgb(var(--primary))] hover:underline"
                >
                  {{ row.caseNumber }} — {{ row.caseTitle }}
                </a>
              </td>
              <td>{{ formatSize(row.sizeBytes) }}</td>
              <td>{{ row.uploadedAt | date: 'medium' }}</td>
              <td class="flex gap-2 justify-end">
                <p-button
                  [text]="true"
                  size="small"
                  [label]="'actions.view' | translate"
                  (onClick)="preview(row)"
                />
                <p-button
                  [text]="true"
                  size="small"
                  [label]="'actions.download' | translate"
                  (onClick)="download(row)"
                />
              </td>
            </tr>
          </ng-template>
        </p-table>
      }
    </p-card>

    <app-attachment-preview-dialog
      [attachment]="previewTarget"
      [(visible)]="previewVisible"
      (download)="download($event)"
    />
  `,
})
export class DocumentsListComponent implements OnInit {
  private readonly attachments = inject(CaseAttachmentService);
  private readonly cases = inject(CasesService);

  rows: AttachmentRow[] = [];
  filtered: AttachmentRow[] = [];
  query = '';
  previewTarget: CaseAttachment | null = null;
  previewVisible = false;

  ngOnInit(): void {
    const caseMap = new Map(this.cases.list().map((c) => [c.id, c]));
    this.rows = this.attachments.listAll().map((a) => {
      const c = caseMap.get(a.caseId);
      return {
        ...a,
        caseNumber: c?.caseNumber ?? a.caseId,
        caseTitle: c?.title ?? '—',
      };
    });
    this.applyFilter();
  }

  applyFilter(): void {
    const q = this.query.trim().toLowerCase();
    this.filtered = !q
      ? this.rows
      : this.rows.filter(
          (r) =>
            r.fileName.toLowerCase().includes(q) ||
            r.caseId.toLowerCase().includes(q) ||
            r.caseNumber.toLowerCase().includes(q) ||
            r.caseTitle.toLowerCase().includes(q) ||
            r.mimeType.toLowerCase().includes(q),
        );
  }

  onQueryChange(value: string): void {
    this.query = value;
    this.applyFilter();
  }

  preview(row: CaseAttachment): void {
    this.previewTarget = row;
    this.previewVisible = true;
  }

  async download(row: CaseAttachment): Promise<void> {
    await this.attachments.download(row);
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
