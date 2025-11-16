import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SearchService, SearchResult } from '../../shared/services/search.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  template: `
    <h2 class="text-lg font-semibold mb-4">{{ 'search.title' | translate }}</h2>
    <div *ngIf="results.length === 0" class="text-sm text-gray-500">
      {{ 'search.empty' | translate }}
    </div>
    <div class="space-y-2">
      <a
        *ngFor="let r of results"
        [routerLink]="r.kind === 'document' ? ['/documents', r.id] : ['/cases', r.id]"
        class="block border rounded p-3 hover:bg-gray-50"
      >
        <div class="font-medium">
          <span class="px-2 py-0.5 text-xs border rounded mr-2">{{ r.kind }}</span>
          {{ r.title }}
        </div>
        <div class="text-xs text-gray-500 mt-1">{{ r.tags.join(', ') }}</div>
      </a>
    </div>
  `,
})
export class SearchPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly search = inject(SearchService);
  protected results: SearchResult[] = [];

  constructor() {
    const q = (this.route.snapshot.queryParamMap.get('q') ?? '').toString();
    this.results = this.search.search(q);
  }
}
