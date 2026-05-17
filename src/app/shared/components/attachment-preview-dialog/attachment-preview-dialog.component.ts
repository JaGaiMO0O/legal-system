import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CaseAttachment } from '../../models/case-attachment.model';
import { CaseAttachmentService } from '../../services/case-attachment.service';

@Component({
  standalone: true,
  selector: 'app-attachment-preview-dialog',
  imports: [CommonModule, TranslateModule, DialogModule, ButtonModule],
  template: `
    <p-dialog
      [header]="attachment?.fileName ?? ''"
      [(visible)]="visible"
      [modal]="true"
      [style]="{ width: 'min(90vw, 56rem)' }"
      (onHide)="onClose()"
    >
      @if (loading) {
        <p class="text-sm text-[rgb(var(--text-muted))]">…</p>
      } @else if (previewUrl && isImage) {
        <img
          [src]="previewUrl"
          [alt]="attachment?.fileName"
          class="max-w-full max-h-[70vh] mx-auto"
        />
      } @else if (previewUrl && isPdf) {
        <iframe
          [src]="previewUrl"
          class="w-full h-[70vh] border-0"
          [title]="attachment?.fileName"
        ></iframe>
      } @else {
        <p class="text-sm text-[rgb(var(--text-muted))] mb-4">
          {{ 'documents.previewUnavailable' | translate }}
        </p>
        <p-button [label]="'actions.download' | translate" (onClick)="download.emit(attachment!)" />
      }
    </p-dialog>
  `,
})
export class AttachmentPreviewDialogComponent implements OnChanges, OnDestroy {
  private readonly attachments = inject(CaseAttachmentService);

  @Input() attachment: CaseAttachment | null = null;
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() download = new EventEmitter<CaseAttachment>();

  loading = false;
  previewUrl: string | null = null;
  isImage = false;
  isPdf = false;

  private objectUrl: string | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue === true && this.attachment) {
      void this.loadPreview();
    }
    if (changes['visible']?.currentValue === false) {
      this.revoke();
    }
  }

  async loadPreview(): Promise<void> {
    if (!this.attachment) return;
    this.loading = true;
    this.revoke();
    const mime = this.attachment.mimeType;
    this.isImage = mime.startsWith('image/');
    this.isPdf = mime === 'application/pdf';
    try {
      const url = await this.attachments.getPreviewObjectUrl(this.attachment);
      this.objectUrl = url ?? null;
      this.previewUrl = url ?? null;
    } finally {
      this.loading = false;
    }
  }

  onClose(): void {
    this.revoke();
    this.visible = false;
    this.visibleChange.emit(false);
  }

  private revoke(): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
    this.previewUrl = null;
  }

  ngOnDestroy(): void {
    this.revoke();
  }
}
