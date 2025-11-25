import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translate = inject(TranslateService);
  private readonly defaultLang = 'en';

  init() {
    this.translate.addLangs(['en']);
    this.translate.setDefaultLang(this.defaultLang);
    this.translate.use(this.defaultLang);
    document.documentElement.setAttribute('lang', this.defaultLang);
    document.documentElement.setAttribute('dir', 'ltr');
  }
}
