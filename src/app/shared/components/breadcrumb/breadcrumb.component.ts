import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

export interface BreadcrumbItem {
  /** Static label (takes precedence if set without labelKey) */
  label?: string;
  /** ngx-translate key */
  labelKey?: string;
  route?: string | any[];
}

@Component({
  standalone: true,
  selector: 'app-breadcrumb',
  imports: [CommonModule, RouterModule, TranslateModule],
  template: `
    <nav
      class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm mb-6"
      [attr.aria-label]="'common.breadcrumbAria' | translate"
    >
      <a
        routerLink="/legal/dashboard"
        class="text-[rgb(var(--text-muted))] hover:text-[rgb(var(--primary))] transition-colors inline-flex items-center"
      >
        <i class="pi pi-home text-sm" aria-hidden="true"></i>
        <span class="sr-only">{{ 'nav.dashboard' | translate }}</span>
      </a>
      <span class="text-[rgb(var(--text-muted))] select-none" aria-hidden="true">/</span>
      <ng-container *ngFor="let item of items; let last = last; trackBy: trackByLabel">
        <a
          *ngIf="item.route && !last"
          [routerLink]="item.route"
          class="text-[rgb(var(--text-muted))] hover:text-[rgb(var(--primary))] transition-colors"
        >
          <ng-container *ngIf="item.labelKey">{{ item.labelKey | translate }}</ng-container>
          <ng-container *ngIf="!item.labelKey">{{ item.label }}</ng-container>
        </a>
        <span
          *ngIf="!item.route || last"
          [ngClass]="
            last ? 'font-semibold text-[rgb(var(--text))]' : 'text-[rgb(var(--text-muted))]'
          "
        >
          <ng-container *ngIf="item.labelKey">{{ item.labelKey | translate }}</ng-container>
          <ng-container *ngIf="!item.labelKey">{{ item.label }}</ng-container>
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
    return item.labelKey ?? item.label ?? '';
  }
}
