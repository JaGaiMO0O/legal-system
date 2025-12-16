import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { UIButtonComponent } from '../../shared/components/ui/button.component';
import { UICardComponent } from '../../shared/components/ui/card.component';
import { LawyersService, Lawyer } from '../../shared/services/lawyers.service';

@Component({
  standalone: true,
  selector: 'app-lawyers-list',
  imports: [CommonModule, RouterModule, TranslateModule, UIButtonComponent, UICardComponent],
  template: `
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-[rgb(var(--text))]">Lawyers</h2>
        <p class="text-sm text-[rgb(var(--text-muted))] mt-1">
          {{ lawyers.length }} {{ lawyers.length === 1 ? 'lawyer' : 'lawyers' }} total
        </p>
      </div>
      <ui-button variant="primary" routerLink="/lawyers/new">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        Add Lawyer
      </ui-button>
    </div>

    <div *ngIf="lawyers.length === 0" class="card p-12 text-center">
      <p class="text-[rgb(var(--text-muted))]">No lawyers yet.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" *ngIf="lawyers.length > 0">
      <ui-card
        *ngFor="let lawyer of lawyers"
        class="cursor-pointer hover:shadow-lg transition-shadow"
        [routerLink]="['/lawyers', lawyer.id]"
      >
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-semibold text-lg">{{ lawyer.name }}</h3>
          <span class="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-mono">
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
      </ui-card>
    </div>
  `,
})
export class LawyersListComponent {
  private readonly lawyersService = inject(LawyersService);
  protected lawyers: Lawyer[] = this.lawyersService.list();
}
