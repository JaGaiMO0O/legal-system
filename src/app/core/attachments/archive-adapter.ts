import { CaseAttachment } from '../../shared/models/case-attachment.model';

export interface ArchiveAdapter {
  upload(attachment: CaseAttachment, blob: Blob): Promise<string | undefined>;
  download(attachment: CaseAttachment): Promise<Blob | undefined>;
  delete(attachment: CaseAttachment): Promise<void>;
  getPreviewUrl(attachment: CaseAttachment): Promise<string | undefined>;
}
