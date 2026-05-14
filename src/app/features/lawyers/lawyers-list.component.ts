import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { LanguageService } from '../../core/i18n/language.service';
import { Lawyer, LawyersService } from '../../shared/services/lawyers.service';

@Component({
  standalone: true,
  selector: 'app-lawyers-list',
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule, ButtonModule, CardModule],
  template: `
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-[rgb(var(--text))]">{{ 'nav.lawyers' | translate }}</h2>
        <p class="text-sm text-[rgb(var(--text-muted))] mt-1">
          {{
            'lawyers.list.countOf'
              | translate: { filtered: filteredLawyers().length, total: lawyers.length }
          }}
          {{
            lawyers.length === 1
              ? ('lawyers.list.lawyerOne' | translate)
              : ('lawyers.list.lawyersMany' | translate)
          }}
          <span *ngIf="searchQuery.trim()">{{ 'lawyers.list.filtered' | translate }}</span>
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
            [placeholder]="'lists.searchLawyersPlaceholder' | translate"
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
        <p-button severity="primary" routerLink="/lawyers/new" styleClass="shrink-0">
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

    <div *ngIf="lawyers.length === 0" class="card p-12 text-center">
      <p class="text-[rgb(var(--text-muted))]">{{ 'lists.noLawyersYet' | translate }}</p>
    </div>

    <div *ngIf="lawyers.length > 0 && filteredLawyers().length === 0" class="card p-12 text-center">
      <p class="text-[rgb(var(--text-muted))]">{{ 'lists.noLawyersMatch' | translate }}</p>
    </div>

    <div
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      *ngIf="filteredLawyers().length > 0"
    >
      <p-card
        *ngFor="let lawyer of filteredLawyers(); trackBy: trackByLawyerId"
        class="cursor-pointer hover:shadow-lg transition-shadow"
        [routerLink]="['/lawyers', lawyer.id]"
      >
        <div class="flex items-start justify-between gap-2 mb-2 min-w-0">
          <h3 class="font-semibold text-lg min-w-0 flex-1 truncate">{{ lawyer.name }}</h3>
          <span
            class="px-2 py-1 bg-[rgb(var(--surface-muted))] text-[rgb(var(--text))] border border-[rgb(var(--border-light))] rounded text-xs font-mono shrink-0 max-w-[45%] truncate"
          >
            {{ lawyer.lawyerNumber }}
          </span>
        </div>
        <div class="text-sm text-[rgb(var(--text-muted))] space-y-2">
          <div *ngIf="lawyer.phone" class="flex items-center gap-2 min-w-0">
            <svg
              class="w-4 h-4 shrink-0 text-[rgb(var(--text-muted))]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            <span class="truncate" [attr.title]="lawyer.phone">{{ lawyer.phone }}</span>
          </div>
          <div *ngIf="lawyer.email" class="flex items-center gap-2 min-w-0">
            <svg
              class="w-4 h-4 shrink-0 text-[rgb(var(--text-muted))]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span class="min-w-0 break-words" [attr.title]="lawyer.email">{{ lawyer.email }}</span>
          </div>
          <div *ngIf="lawyer.address" class="text-[rgb(var(--text))] line-clamp-2">
            {{ lawyer.address }}
          </div>
          <div class="text-xs text-[rgb(var(--text-muted))] pt-0.5">
            {{ 'cases.list.updatedPrefix' | translate }}
            {{ lawyer.updatedAt | date: 'short' : '' : ngLocale() }}
          </div>
        </div>
      </p-card>
    </div>
  `,
})
export class LawyersListComponent {
  private readonly lawyersService = inject(LawyersService);
  private readonly language = inject(LanguageService);

  protected readonly ngLocale = computed(() =>
    this.language.currentLang() === 'ar' ? 'ar-SA' : 'en-US',
  );

  protected lawyers: Lawyer[] = this.lawyersService.list();
  protected searchQuery = '';

  filteredLawyers(): Lawyer[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.lawyers;
    return this.lawyers.filter((l) => {
      const blob = [l.name, l.lawyerNumber, l.phone, l.email, l.address]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return blob.includes(q);
    });
  }

  trackByLawyerId(_index: number, lawyer: Lawyer): string {
    return lawyer.id;
  }
}
