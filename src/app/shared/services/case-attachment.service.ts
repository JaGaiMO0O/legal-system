import { Injectable, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { AttachmentBlobStore } from '../../core/attachments/attachment-blob.store';
import { LocalArchiveAdapter } from '../../core/attachments/local-archive.adapter';
import {
  ATTACHMENT_ALLOWED_MIME,
  ATTACHMENT_MAX_BYTES,
  CaseAttachment,
} from '../models/case-attachment.model';
import { AuditService } from './audit.service';
import { MockStorageService } from './mock-storage.service';

const STORAGE_KEY = 'caseAttachments';

@Injectable({ providedIn: 'root' })
export class CaseAttachmentService {
  private readonly storage = inject(MockStorageService);
  private readonly blobs = inject(AttachmentBlobStore);
  private readonly archive = inject(LocalArchiveAdapter);
  private readonly auth = inject(AuthService);
  private readonly audit = inject(AuditService);

  private generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 0x0f) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  listAll(): CaseAttachment[] {
    return this.storage.get<CaseAttachment[]>(STORAGE_KEY, []);
  }

  listByCase(caseId: string): CaseAttachment[] {
    return this.listAll()
      .filter((a) => a.caseId === caseId)
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }

  async upload(caseId: string, file: File, category?: string): Promise<CaseAttachment> {
    if (file.size > ATTACHMENT_MAX_BYTES) {
      throw new Error('FILE_TOO_LARGE');
    }
    const mime = file.type || 'application/octet-stream';
    if (!ATTACHMENT_ALLOWED_MIME.has(mime)) {
      throw new Error('MIME_NOT_ALLOWED');
    }

    const id = this.generateId();
    const meta: CaseAttachment = {
      id,
      caseId,
      fileName: file.name,
      mimeType: mime,
      sizeBytes: file.size,
      uploadedAt: new Date().toISOString(),
      uploadedBy: this.auth.username() ?? 'unknown',
      category,
      syncStatus: 'local',
    };

    await this.blobs.put(id, file);
    const archiveRef = await this.archive.upload(meta, file);
    if (archiveRef) {
      meta.archiveRef = archiveRef;
      meta.syncStatus = 'archived';
    }

    this.storage.update<CaseAttachment[]>(STORAGE_KEY, (current) => [...(current ?? []), meta], []);
    this.audit.record('attachment.uploaded', { caseId, attachmentId: id, fileName: file.name });
    return meta;
  }

  async getBlob(attachmentId: string): Promise<Blob | undefined> {
    return this.blobs.get(attachmentId);
  }

  async download(attachment: CaseAttachment): Promise<void> {
    const blob = await this.blobs.get(attachment.id);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = attachment.fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  async getPreviewObjectUrl(attachment: CaseAttachment): Promise<string | undefined> {
    const archived = await this.archive.getPreviewUrl(attachment);
    if (archived) return archived;
    const blob = await this.blobs.get(attachment.id);
    if (!blob) return undefined;
    return URL.createObjectURL(blob);
  }

  async delete(attachment: CaseAttachment): Promise<void> {
    await this.blobs.delete(attachment.id);
    await this.archive.delete(attachment);
    this.storage.update<CaseAttachment[]>(
      STORAGE_KEY,
      (current) => (current ?? []).filter((a) => a.id !== attachment.id),
      [],
    );
    this.audit.record('attachment.deleted', {
      caseId: attachment.caseId,
      attachmentId: attachment.id,
    });
  }
}
