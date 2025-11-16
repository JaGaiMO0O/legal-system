import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [CommonModule],
  template: ` <button [ngClass]="classes"><ng-content /></button> `,
})
export class UIButtonComponent {
  @Input() variant: 'primary' | 'ghost' | 'default' = 'default';

  get classes() {
    switch (this.variant) {
      case 'primary':
        return 'btn btn-primary';
      case 'ghost':
        return 'btn btn-ghost';
      default:
        return 'btn';
    }
  }
}
