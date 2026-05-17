import { Injectable } from '@angular/core';
import { CaseAttachment } from '../../shared/models/case-attachment.model';
import { ArchiveAdapter } from './archive-adapter';

/** Local stub: archive integration is a no-op; blobs stay in IndexedDB only. */
@Injectable({ providedIn: 'root' })
export class LocalArchiveAdapter implements ArchiveAdapter {
  async upload(_attachment: CaseAttachment, _blob: Blob): Promise<string | undefined> {
    return undefined;
  }

  async download(_attachment: CaseAttachment): Promise<Blob | undefined> {
    return undefined;
  }

  async delete(_attachment: CaseAttachment): Promise<void> {
    return;
  }

  async getPreviewUrl(_attachment: CaseAttachment): Promise<string | undefined> {
    return undefined;
  }
}
