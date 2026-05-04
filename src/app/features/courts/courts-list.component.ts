import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CourtLevel, CourtsService, CourtType } from '../../shared/services/courts.service';

@Component({
  standalone: true,
  selector: 'app-courts-list',
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule, ButtonModule, CardModule],
  template: `
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-[rgb(var(--text))]">Courts</h2>
        <p class="text-sm text-[rgb(var(--text-muted))] mt-1">
          {{ filteredCourts().length }} of {{ courts.length }}
          {{ courts.length === 1 ? 'court type' : 'court types' }}
          <span *ngIf="searchQuery.trim()">(filtered)</span>
        </p>
      </div>
      <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto md:min-w-[16rem]">
        <input
          type="search"
          class="w-full rounded-input border border-[rgb(var(--border))] px-3 py-2 text-sm bg-[rgb(var(--surface))] text-[rgb(var(--text))]"
          [(ngModel)]="searchQuery"
          placeholder="Search court name or levels..."
        />
        <p-button severity="primary" routerLink="/courts/new" styleClass="shrink-0">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

    <div *ngIf="courts.length === 0" class="card p-12 text-center">
      <p class="text-[rgb(var(--text-muted))]">No court types yet.</p>
    </div>

    <div *ngIf="courts.length > 0 && filteredCourts().length === 0" class="card p-12 text-center">
      <p class="text-[rgb(var(--text-muted))]">No court types match your search.</p>
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
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-semibold text-lg">{{ court.name }}</h3>
          <span
            class="px-2 py-1 bg-[rgb(var(--surface-muted))] text-[rgb(var(--text))] border border-[rgb(var(--border-light))] rounded text-xs font-mono"
          >
            {{ court.levels.length }} levels
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
          <div class="text-xs text-[rgb(var(--text-muted))]">
            Updated {{ court.updatedAt | date: 'short' }}
          </div>
        </div>
      </p-card>
    </div>
  `,
})
export class CourtsListComponent {
  private readonly courtsService = inject(CourtsService);
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
    switch (level) {
      case 'primary':
        return 'Primary';
      case 'appeal':
        return 'Appeal';
      case 'cassation':
        return 'Cassation';
      case 'execution':
        return 'Execution';
      default:
        return level;
    }
  }
}
