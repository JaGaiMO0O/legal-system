import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-loading-spinner',
  imports: [CommonModule],
  template: `
    <div
      *ngIf="show"
      class="flex items-center justify-center"
      [class.p-4]="size === 'small'"
      [class.p-8]="size === 'medium'"
      [class.p-12]="size === 'large'"
    >
      <div
        class="animate-spin rounded-full border-t-2 border-b-2 border-[rgb(var(--primary))]"
        [class.w-4]="size === 'small'"
        [class.h-4]="size === 'small'"
        [class.w-6]="size === 'medium'"
        [class.h-6]="size === 'medium'"
        [class.w-8]="size === 'large'"
        [class.h-8]="size === 'large'"
        [class.border-t-2]="size === 'small' || size === 'medium'"
        [class.border-b-2]="size === 'small' || size === 'medium'"
        [class.border-t-4]="size === 'large'"
        [class.border-b-4]="size === 'large'"
        role="status"
        aria-label="Loading"
      >
        <span class="sr-only">Loading...</span>
      </div>
      <span *ngIf="message" class="ml-3 text-sm text-[rgb(var(--text-muted))]">{{ message }}</span>
    </div>
  `,
})
export class LoadingSpinnerComponent {
  @Input() show = true;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() message = '';
}
