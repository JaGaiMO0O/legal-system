import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { CourtsSettingsComponent } from './courts-settings.component';

@Component({
  standalone: true,
  selector: 'app-settings',
  imports: [CommonModule, TranslateModule, CourtsSettingsComponent],
  template: `
    <h2 class="text-lg font-semibold mb-4">{{ 'nav.settings' | translate }}</h2>
    <app-courts-settings></app-courts-settings>
  `,
})
export class SettingsComponent {}
