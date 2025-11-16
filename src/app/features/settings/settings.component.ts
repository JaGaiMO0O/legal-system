import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-settings',
  imports: [TranslateModule],
  template: `
    <h2 class="text-lg font-semibold mb-4">{{ 'nav.settings' | translate }}</h2>
    <p>Settings coming soon.</p>
  `,
})
export class SettingsComponent {}
