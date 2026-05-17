import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CaseAttachment } from '../../models/case-attachment.model';
import { CaseAttachmentService } from '../../services/case-attachment.service';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';
import { ToastService } from '../../services/toast.service';
import { AttachmentPreviewDialogComponent } from '../attachment-preview-dialog/attachment-preview-dialog.component';

@Component({
  standalone: true,
  selector: 'app-case-documents-panel',
  imports: [
    CommonModule,
    TranslateModule,
    ButtonModule,
    TableModule,
    AttachmentPreviewDialogComponent,
  ],
  template: `
    <div class="p-4 flex flex-col gap-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <p class="text-sm text-[rgb(var(--text-muted))]">
          {{ 'documents.uploadHint' | translate }}
        </p>
        <input
          #fileInput
          type="file"
          class="hidden"
          accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.doc,.docx,.xls,.xlsx"
          (change)="onFileSelected($event)"
        />
        <p-button [label]="'documents.upload' | translate" (onClick)="fileInput.click()" />
      </div>

      @if (rows.length === 0) {
        <p class="text-sm text-[rgb(var(--text-muted))] text-center py-8">
          {{ 'documents.empty' | translate }}
        </p>
      } @else {
        <p-table [value]="rows" styleClass="p-datatable-sm">
          <ng-template pTemplate="header">
            <tr>
              <th>{{ 'documents.file' | translate }}</th>
              <th>{{ 'documents.size' | translate }}</th>
              <th>{{ 'documents.added' | translate }}</th>
              <th>{{ 'documents.uploadedBy' | translate }}</th>
              <th></th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-row>
            <tr>
              <td>{{ row.fileName }}</td>
              <td>{{ formatSize(row.sizeBytes) }}</td>
              <td>{{ row.uploadedAt | date: 'medium' }}</td>
              <td>{{ row.uploadedBy }}</td>
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
                <p-button
                  [text]="true"
                  severity="danger"
                  size="small"
                  [label]="'actions.delete' | translate"
                  (onClick)="remove(row)"
                />
              </td>
            </tr>
          </ng-template>
        </p-table>
      }

      <app-attachment-preview-dialog
        [attachment]="previewTarget"
        [(visible)]="previewVisible"
        (download)="download($event)"
      />
    </div>
  `,
})
export class CaseDocumentsPanelComponent implements OnChanges {
  @Input({ required: true }) caseId!: string;

  private readonly attachments = inject(CaseAttachmentService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmDialogService);
  private readonly translate = inject(TranslateService);

  rows: CaseAttachment[] = [];
  previewTarget: CaseAttachment | null = null;
  previewVisible = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['caseId']) this.refresh();
  }

  refresh(): void {
    if (!this.caseId) {
      this.rows = [];
      return;
    }
    this.rows = this.attachments.listByCase(this.caseId);
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file || !this.caseId) return;
    try {
      await this.attachments.upload(this.caseId, file);
      this.toast.success(this.translate.instant('documents.uploadSuccess'));
      this.refresh();
    } catch (e) {
      const msg =
        (e as Error).message === 'FILE_TOO_LARGE'
          ? 'documents.errorTooLarge'
          : (e as Error).message === 'MIME_NOT_ALLOWED'
            ? 'documents.errorMime'
            : 'documents.uploadFailed';
      this.toast.error(this.translate.instant(msg));
    }
  }

  preview(row: CaseAttachment): void {
    this.previewTarget = row;
    this.previewVisible = true;
  }

  async download(row: CaseAttachment): Promise<void> {
    await this.attachments.download(row);
  }

  async remove(row: CaseAttachment): Promise<void> {
    const ok = await this.confirm.confirm({
      message: this.translate.instant('documents.deleteConfirm'),
      title: this.translate.instant('actions.delete'),
    });
    if (!ok) return;
    await this.attachments.delete(row);
    this.toast.success(this.translate.instant('documents.deleted'));
    this.refresh();
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
