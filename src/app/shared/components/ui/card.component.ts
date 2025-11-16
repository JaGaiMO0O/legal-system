import { Component } from '@angular/core';

@Component({
  selector: 'ui-card',
  standalone: true,
  host: { class: 'card p-4' },
  template: `<ng-content />`,
})
export class UICardComponent {}
