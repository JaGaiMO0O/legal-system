import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { Arbitration, ArbitrationsService } from '../../shared/services/arbitrations.service';

@Component({
  standalone: true,
  selector: 'app-arbitrations-list',
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule, ButtonModule, CardModule],
  styleUrl: './arbitrations-list.component.scss',
  template: `
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6 md:gap-6">
      <div class="shrink-0">
        <h2 class="text-2xl font-bold text-[rgb(var(--text))]">Arbitrations</h2>
        <p class="text-sm text-[rgb(var(--text-muted))] mt-1">
          {{ filteredArbitrations().length }} of {{ arbitrations.length }}
          {{ arbitrations.length === 1 ? 'arbitration' : 'arbitrations' }}
          <span *ngIf="searchQuery.trim()">(filtered)</span>
        </p>
      </div>
      <div class="flex flex-col sm:flex-row gap-3 w-full md:flex-1 md:min-w-0 lg:max-w-4xl">
        <div class="relative w-full flex-1 min-w-0 min-h-[2.5rem]">
          <input
            type="text"
            inputmode="search"
            autocomplete="off"
            class="w-full min-w-0 rounded-input border border-[rgb(var(--border))] py-2 pe-3 text-sm bg-[rgb(var(--surface))] text-[rgb(var(--text))] search-input-with-icon--compact"
            [(ngModel)]="searchQuery"
            [placeholder]="'arbitrations.searchPlaceholder' | translate"
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
        <p-button severity="primary" routerLink="/arbitrations/new" styleClass="shrink-0">
          <svg class="w-4 h-4 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add
        </p-button>
      </div>
    </div>

    <div *ngIf="arbitrations.length === 0" class="card p-12 text-center">
      <p class="text-[rgb(var(--text-muted))]">{{ 'arbitrations.empty' | translate }}</p>
    </div>

    <div
      *ngIf="arbitrations.length > 0 && filteredArbitrations().length === 0"
      class="card p-12 text-center"
    >
      <p class="text-[rgb(var(--text-muted))]">No arbitrations match your search.</p>
    </div>

    <div
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch"
      *ngIf="filteredArbitrations().length > 0"
    >
      <p-card
        *ngFor="let arbitration of filteredArbitrations()"
        class="arbitration-card-host cursor-pointer hover:shadow-lg transition-shadow"
        [routerLink]="['/arbitrations', arbitration.id]"
      >
        <div class="flex flex-col flex-1 min-h-0 h-full">
          <div class="shrink-0 space-y-3 mb-0">
            <h3 class="font-semibold text-lg line-clamp-2 min-h-[3.5rem]">
              {{ arbitration.caseDescription || 'No description' }}
            </h3>
            <div class="flex flex-wrap items-start gap-2 min-h-[2.75rem] content-start">
              <span
                class="px-2 py-1 bg-info-muted text-info-fg border border-info rounded text-xs font-medium max-w-full truncate"
              >
                {{ arbitration.arbitrationRoom }}
              </span>
              <span
                class="px-2 py-1 bg-[rgb(var(--surface-muted))] text-[rgb(var(--text))] border border-[rgb(var(--border-light))] rounded text-xs max-w-full truncate"
              >
                {{ arbitration.appealability }}
              </span>
            </div>
          </div>
          <div
            class="text-sm text-[rgb(var(--text-muted))] space-y-2 mt-auto shrink-0 pt-4 border-t border-[rgb(var(--border-light))]"
          >
            <div class="flex items-center min-h-[1.25rem]">
              <svg
                class="w-4 h-4 me-2 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span class="truncate">{{ arbitration.fillingDate | date: 'mediumDate' }}</span>
            </div>
            <div class="flex items-center min-h-[1.25rem]">
              <svg
                class="w-4 h-4 me-2 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span class="truncate">{{ arbitration.arbitrationFees | number }} SAR</span>
            </div>
            <div class="flex items-center min-h-[1.25rem]">
              <svg
                class="w-4 h-4 me-2 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span class="truncate">Hearings: {{ arbitration.hearings.length }}</span>
            </div>
          </div>
        </div>
      </p-card>
    </div>
  `,
})
export class ArbitrationsListComponent {
  private readonly arbitrationsService = inject(ArbitrationsService);
  protected arbitrations = this.arbitrationsService.list();
  protected searchQuery = '';

  filteredArbitrations(): Arbitration[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.arbitrations;
    return this.arbitrations.filter((a) => {
      const blob = [
        a.caseDescription,
        a.arbitrationRoom,
        a.caseNumber,
        a.appealability,
        String(a.arbitrationFees),
        a.maximumPeriod,
        a.unifiedCaseId,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return blob.includes(q);
    });
  }
}
