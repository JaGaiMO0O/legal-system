import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
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
    <nav class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm mb-6" aria-label="Breadcrumb">
      <a
        routerLink="/legal/dashboard"
        class="text-[rgb(var(--text-muted))] hover:text-[rgb(var(--primary))] transition-colors inline-flex items-center"
      >
        <i class="pi pi-home text-sm" aria-hidden="true"></i>
        <span class="sr-only">Dashboard</span>
      </a>
      <span class="text-[rgb(var(--text-muted))] select-none" aria-hidden="true">/</span>
      <ng-container *ngFor="let item of items; let last = last; trackBy: trackByLabel">
        <a
          *ngIf="item.route && !last"
          [routerLink]="item.route"
          class="text-[rgb(var(--text-muted))] hover:text-[rgb(var(--primary))] transition-colors"
        >
          {{ item.label }}
        </a>
        <span
          *ngIf="!item.route || last"
          [ngClass]="
            last ? 'font-semibold text-[rgb(var(--text))]' : 'text-[rgb(var(--text-muted))]'
          "
        >
          {{ item.label }}
        </span>
        <span *ngIf="!last" class="text-[rgb(var(--text-muted))] select-none" aria-hidden="true"
          >/</span
        >
      </ng-container>
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbComponent {
  @Input() items: BreadcrumbItem[] = [];

  trackByLabel(_index: number, item: BreadcrumbItem): string {
    return item.label;
  }
}
