import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-arbitrations-list',
  imports: [TranslateModule],
  template: `
    <h2 class="text-lg font-semibold mb-4">{{ 'nav.arbitrations' | translate }}</h2>
    <p>Arbitrations content will appear here.</p>
  `,
})
export class ArbitrationsListComponent {}
