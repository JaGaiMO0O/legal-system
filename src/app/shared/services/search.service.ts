import { Injectable, inject } from '@angular/core';
import { DocumentsService, DocumentItem } from './documents.service';
import { CasesService, CaseItem } from './cases.service';

export type SearchResult =
  | { kind: 'document'; id: string; title: string; tags: string[] }
  | { kind: 'case'; id: string; title: string; tags: string[] };

@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly documents = inject(DocumentsService);
  private readonly cases = inject(CasesService);

  search(query: string): SearchResult[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const d = this.documents.list().filter((x) => this.matchDoc(x, q));
    const c = this.cases.list().filter((x) => this.matchCase(x, q));
    return [
      ...d.map<SearchResult>((x) => ({ kind: 'document', id: x.id, title: x.title, tags: x.tags })),
      ...c.map<SearchResult>((x) => ({ kind: 'case', id: x.id, title: x.title, tags: x.tags })),
    ];
  }

  private matchDoc(doc: DocumentItem, q: string): boolean {
    return (
      doc.title.toLowerCase().includes(q) ||
      doc.tags.some((t) => t.toLowerCase().includes(q)) ||
      doc.versions.some((v) => v.fileName.toLowerCase().includes(q))
    );
  }

  private matchCase(caze: CaseItem, q: string): boolean {
    return (
      caze.title.toLowerCase().includes(q) ||
      caze.client.toLowerCase().includes(q) ||
      caze.tags.some((t) => t.toLowerCase().includes(q))
    );
  }
}
