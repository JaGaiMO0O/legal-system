import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-lawyers-list',
  imports: [TranslateModule],
  template: `
    <h2 class="text-lg font-semibold mb-4">{{ 'nav.lawyers' | translate }}</h2>
    <p>List of lawyers will appear here.</p>
  `,
})
export class LawyersListComponent {}
