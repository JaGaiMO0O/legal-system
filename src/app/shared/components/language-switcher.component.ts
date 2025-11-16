import { Component, inject } from '@angular/core';
import { LanguageService } from '../../core/i18n/language.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  template: `
    <button class="px-2 py-1 text-sm border rounded" (click)="set('en')">EN</button>
    <button class="px-2 py-1 text-sm border rounded ml-2" (click)="set('ar')">AR</button>
  `,
})
export class LanguageSwitcherComponent {
  private readonly lang = inject(LanguageService);
  set(code: 'en' | 'ar') {
    this.lang.setLanguage(code);
  }
}
