import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  route?: string | any[];
}

@Component({
  standalone: true,
  selector: 'app-breadcrumb',
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="flex items-center space-x-2 text-sm mb-6" aria-label="Breadcrumb">
      <a
        routerLink="/legal/dashboard"
        class="text-[rgb(var(--text-muted))] hover:text-[rgb(var(--primary))] transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      </a>
      <span class="text-[rgb(var(--text-muted))]">/</span>
      <ng-container *ngFor="let item of items; let last = last">
        <a
          *ngIf="item.route && !last"
          [routerLink]="item.route"
          class="text-[rgb(var(--text-muted))] hover:text-[rgb(var(--primary))] transition-colors"
        >
          {{ item.label }}
        </a>
        <span
          *ngIf="!item.route || last"
          [class.text-[rgb(var(--text))]]="last"
          [class.text-[rgb(var(--text-muted))]]="!last"
          [class.font-semibold]="last"
        >
          {{ item.label }}
        </span>
        <span *ngIf="!last" class="text-[rgb(var(--text-muted))]">/</span>
      </ng-container>
    </nav>
  `,
})
export class BreadcrumbComponent {
  @Input() items: BreadcrumbItem[] = [];
}
