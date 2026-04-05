import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { Lawyer, LawyersService } from '../../shared/services/lawyers.service';

@Component({
  standalone: true,
  selector: 'app-lawyers-list',
  imports: [CommonModule, RouterModule, TranslateModule, ButtonModule, CardModule],
  template: `
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-[rgb(var(--text))]">Lawyers</h2>
        <p class="text-sm text-[rgb(var(--text-muted))] mt-1">
          {{ lawyers.length }} {{ lawyers.length === 1 ? 'lawyer' : 'lawyers' }} total
        </p>
      </div>
      <p-button severity="primary" routerLink="/lawyers/new">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        Add Lawyer
      </p-button>
    </div>

    <div *ngIf="lawyers.length === 0" class="card p-12 text-center">
      <p class="text-[rgb(var(--text-muted))]">No lawyers yet.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" *ngIf="lawyers.length > 0">
      <p-card
        *ngFor="let lawyer of lawyers; trackBy: trackByLawyerId"
        class="cursor-pointer hover:shadow-lg transition-shadow"
        [routerLink]="['/lawyers', lawyer.id]"
      >
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-semibold text-lg">{{ lawyer.name }}</h3>
          <span
            class="px-2 py-1 bg-[rgb(var(--surface-muted))] text-[rgb(var(--text))] border border-[rgb(var(--border-light))] rounded text-xs font-mono"
          >
            {{ lawyer.lawyerNumber }}
          </span>
        </div>
        <div class="text-sm text-[rgb(var(--text-muted))] space-y-1">
          <div *ngIf="lawyer.phone">📞 {{ lawyer.phone }}</div>
          <div *ngIf="lawyer.email">✉️ {{ lawyer.email }}</div>
          <div *ngIf="lawyer.address">{{ lawyer.address }}</div>
          <div class="text-xs text-[rgb(var(--text-muted))]">
            Updated {{ lawyer.updatedAt | date: 'short' }}
          </div>
        </div>
      </p-card>
    </div>
  `,
})
export class LawyersListComponent {
  private readonly lawyersService = inject(LawyersService);
  protected lawyers: Lawyer[] = this.lawyersService.list();

  trackByLawyerId(_index: number, lawyer: Lawyer): string {
    return lawyer.id;
  }
}
