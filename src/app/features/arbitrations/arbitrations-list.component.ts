import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ArbitrationsService } from '../../shared/services/arbitrations.service';

@Component({
  standalone: true,
  selector: 'app-arbitrations-list',
  imports: [CommonModule, RouterModule, TranslateModule, ButtonModule, CardModule],
  template: `
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-[rgb(var(--text))]">Arbitrations</h2>
        <p class="text-sm text-[rgb(var(--text-muted))] mt-1">
          {{ arbitrations.length }}
          {{ arbitrations.length === 1 ? 'arbitration' : 'arbitrations' }} total
        </p>
      </div>
      <p-button severity="primary" routerLink="/arbitrations/new">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        Add Arbitration
      </p-button>
    </div>

    <div *ngIf="arbitrations.length === 0" class="card p-12 text-center">
      <p class="text-[rgb(var(--text-muted))]">{{ 'arbitrations.empty' | translate }}</p>
    </div>

    <div
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      *ngIf="arbitrations.length > 0"
    >
      <p-card
        *ngFor="let arbitration of arbitrations"
        class="cursor-pointer hover:shadow-lg transition-shadow"
        [routerLink]="['/arbitrations', arbitration.id]"
      >
        <div class="mb-3">
          <h3 class="font-semibold text-lg mb-2 line-clamp-2">
            {{ arbitration.caseDescription || 'No description' }}
          </h3>
          <div class="flex items-center gap-2 mb-2">
            <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
              {{ arbitration.arbitrationRoom }}
            </span>
            <span class="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
              {{ arbitration.appealability }}
            </span>
          </div>
        </div>
        <div class="text-sm text-[rgb(var(--text-muted))] space-y-2">
          <div class="flex items-center">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {{ arbitration.fillingDate | date: 'mediumDate' }}
          </div>
          <div class="flex items-center">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {{ arbitration.arbitrationFees | number }} SAR
          </div>
          <div class="flex items-center">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Hearings: {{ arbitration.hearings.length }}
          </div>
        </div>
      </p-card>
    </div>
  `,
})
export class ArbitrationsListComponent {
  private readonly arbitrationsService = inject(ArbitrationsService);
  protected arbitrations = this.arbitrationsService.list();
}
