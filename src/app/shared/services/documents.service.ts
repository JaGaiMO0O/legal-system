import { Injectable, inject } from '@angular/core';
import { MockStorageService } from './mock-storage.service';

export interface DocumentVersion {
  id: string;
  number: number;
  fileName: string;
  mimeType: string;
  size: number;
  contentBase64: string;
  createdAt: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  tags: string[];
  versions: DocumentVersion[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'documents';

@Injectable({ providedIn: 'root' })
export class DocumentsService {
  private readonly storage = inject(MockStorageService);
  private generateId(): string {
    // RFC4122-ish random id without external deps
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 0x0f) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  list(): DocumentItem[] {
    return this.storage.get<DocumentItem[]>(STORAGE_KEY, []);
  }

  getById(id: string): DocumentItem | undefined {
    return this.list().find((d) => d.id === id);
  }

  create(title: string, tags: string[] = []): DocumentItem {
    const now = new Date().toISOString();
    const doc: DocumentItem = {
      id: this.generateId(),
      title,
      tags,
      versions: [],
      createdAt: now,
      updatedAt: now,
    };
    const updated = [...this.list(), doc];
    this.storage.set(STORAGE_KEY, updated);
    return doc;
  }

  rename(id: string, title: string): void {
    this.mutate((docs) =>
      docs.map((d) => (d.id === id ? { ...d, title, updatedAt: new Date().toISOString() } : d)),
    );
  }

  updateTags(id: string, tags: string[]): void {
    this.mutate((docs) =>
      docs.map((d) =>
        d.id === id ? { ...d, tags: [...tags], updatedAt: new Date().toISOString() } : d,
      ),
    );
  }

  delete(id: string): void {
    this.mutate((docs) => docs.filter((d) => d.id !== id));
  }

  async addVersion(id: string, file: File): Promise<DocumentVersion | undefined> {
    const doc = this.getById(id);
    if (!doc) return undefined;
    const base64 = await this.fileToBase64(file);
    const nextNumber = (doc.versions.at(-1)?.number ?? 0) + 1;
    const version: DocumentVersion = {
      id: this.generateId(),
      number: nextNumber,
      fileName: file.name,
      mimeType: file.type || 'application/octet-stream',
      size: file.size,
      contentBase64: base64,
      createdAt: new Date().toISOString(),
    };
    this.mutate((docs) =>
      docs.map((d) =>
        d.id === id
          ? {
              ...d,
              versions: [...d.versions, version],
              updatedAt: new Date().toISOString(),
            }
          : d,
      ),
    );
    return version;
  }

  getLatestVersionBlob(id: string): Blob | undefined {
    const doc = this.getById(id);
    const v = doc?.versions.at(-1);
    if (!v) return undefined;
    const bytes = atob(v.contentBase64);
    const arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    return new Blob([arr], { type: v.mimeType });
  }

  filterByTags(tags: string[]): DocumentItem[] {
    if (!tags.length) return this.list();
    return this.list().filter((d) => tags.every((t) => d.tags.includes(t)));
  }

  private mutate(mutator: (docs: DocumentItem[]) => DocumentItem[]): void {
    this.storage.update<DocumentItem[]>(STORAGE_KEY, (current) => mutator(current ?? []), []);
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1] ?? '';
        resolve(base64);
      };
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  }
}
