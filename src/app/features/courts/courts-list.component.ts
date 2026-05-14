import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { LanguageService } from '../../core/i18n/language.service';
import { CourtLevel, CourtsService, CourtType } from '../../shared/services/courts.service';

@Component({
  standalone: true,
  selector: 'app-courts-list',
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule, ButtonModule, CardModule],
  template: `
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-[rgb(var(--text))]">{{ 'nav.courts' | translate }}</h2>
        <p class="text-sm text-[rgb(var(--text-muted))] mt-1">
          {{
            'courts.list.countOf'
              | translate: { filtered: filteredCourts().length, total: courts.length }
          }}
          {{
            courts.length === 1
              ? ('courts.list.typeOne' | translate)
              : ('courts.list.typesMany' | translate)
          }}
          <span *ngIf="searchQuery.trim()">{{ 'courts.list.filtered' | translate }}</span>
        </p>
      </div>
      <div class="flex flex-col sm:flex-row gap-3 w-full md:flex-1 md:min-w-0 lg:max-w-4xl">
        <div class="relative w-full flex-1 min-w-0 min-h-[2.5rem]">
          <input
            type="text"
            inputmode="search"
            autocomplete="off"
            class="w-full rounded-input border border-[rgb(var(--border))] py-2 pe-3 text-sm bg-[rgb(var(--surface))] text-[rgb(var(--text))] search-input-with-icon--compact"
            [(ngModel)]="searchQuery"
            [placeholder]="'lists.searchCourtsPlaceholder' | translate"
          />
          <span class="search-input-icon search-input-icon--tight" aria-hidden="true">
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
        </div>
        <p-button severity="primary" routerLink="/courts/new" styleClass="shrink-0">
          <svg class="w-4 h-4 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          {{ 'actions.add' | translate }}
        </p-button>
      </div>
    </div>

    <div *ngIf="courts.length === 0" class="card p-12 text-center">
      <p class="text-[rgb(var(--text-muted))]">{{ 'lists.noCourtsYet' | translate }}</p>
    </div>

    <div *ngIf="courts.length > 0 && filteredCourts().length === 0" class="card p-12 text-center">
      <p class="text-[rgb(var(--text-muted))]">{{ 'lists.noCourtsMatch' | translate }}</p>
    </div>

    <div
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      *ngIf="filteredCourts().length > 0"
    >
      <p-card
        *ngFor="let court of filteredCourts()"
        class="cursor-pointer hover:shadow-lg transition-shadow"
        [routerLink]="['/courts', court.id]"
      >
        <div class="flex items-start justify-between gap-2 mb-2 min-w-0">
          <h3 class="font-semibold text-lg min-w-0 flex-1 truncate">{{ court.name }}</h3>
          <span
            class="px-2 py-1 bg-[rgb(var(--surface-muted))] text-[rgb(var(--text))] border border-[rgb(var(--border-light))] rounded text-xs font-mono shrink-0 whitespace-nowrap"
          >
            {{ 'courts.list.levelsCount' | translate: { count: court.levels.length } }}
          </span>
        </div>
        <div class="text-sm text-[rgb(var(--text-muted))] space-y-1">
          <div class="flex flex-wrap gap-1">
            <span
              *ngFor="let lvl of court.levels"
              class="px-2 py-0.5 rounded-full text-xs bg-info-muted text-info-fg border border-info"
            >
              {{ levelLabel(lvl) }}
            </span>
          </div>
          <div class="text-xs text-[rgb(var(--text-muted))] pt-1">
            {{ 'cases.list.updatedPrefix' | translate }}
            {{ court.updatedAt | date: 'short' : '' : ngLocale() }}
          </div>
        </div>
      </p-card>
    </div>
  `,
})
export class CourtsListComponent {
  private readonly courtsService = inject(CourtsService);
  private readonly translate = inject(TranslateService);
  private readonly language = inject(LanguageService);

  protected readonly ngLocale = computed(() =>
    this.language.currentLang() === 'ar' ? 'ar-SA' : 'en-US',
  );

  protected courts: CourtType[] = this.courtsService.list();
  protected searchQuery = '';

  filteredCourts(): CourtType[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.courts;
    return this.courts.filter((c) => {
      const levels = c.levels
        .map((lvl) => this.levelLabel(lvl))
        .join(' ')
        .toLowerCase();
      const blob = `${c.name} ${levels}`.toLowerCase();
      return blob.includes(q);
    });
  }

  levelLabel(level: CourtLevel): string {
    return this.translate.instant(`courts.level.${level}`);
  }
}
