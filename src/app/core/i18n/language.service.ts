import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translate = inject(TranslateService);
  private readonly defaultLang = 'en';
  private readonly rtlLangs = new Set(['ar']);

  init() {
    this.translate.addLangs(['en', 'ar']);
    this.translate.setDefaultLang(this.defaultLang);
    const saved = localStorage.getItem('lang');
    this.setLanguage((saved as 'en' | 'ar') || this.defaultLang);
  }

  setLanguage(lang: 'en' | 'ar') {
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', this.rtlLangs.has(lang) ? 'rtl' : 'ltr');
  }
}
