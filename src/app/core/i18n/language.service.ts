import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { catchError, defaultIfEmpty, firstValueFrom, of, timeout } from 'rxjs';

export type AppLanguage = 'ar' | 'en';

const STORAGE_KEY = 'legal-portal-lang';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translate = inject(TranslateService);
  private readonly defaultLang: AppLanguage = 'ar';

  /** Active UI language (Arabic default). */
  readonly currentLang = signal<AppLanguage>(this.defaultLang);

  /**
   * Loads stored language and activates ngx-translate.
   * Never rejects — a failed HTTP load must not block bootstrap (white screen).
   */
  init(): Promise<void> {
    this.translate.addLangs(['ar', 'en']);
    const stored = localStorage.getItem(STORAGE_KEY) as AppLanguage | null;
    const initial: AppLanguage = stored === 'en' || stored === 'ar' ? stored : this.defaultLang;
    this.currentLang.set(initial);
    this.setDocumentAttrs(initial);

    const stream = this.translate.use(initial).pipe(
      timeout({ first: 15000 }),
      defaultIfEmpty(undefined),
      catchError((err) => {
        console.error('[i18n] Failed to load translations — UI may show keys.', err);
        return of(undefined);
      }),
    );

    return firstValueFrom(stream).then(() => undefined);
  }

  setLanguage(lang: AppLanguage): void {
    localStorage.setItem(STORAGE_KEY, lang);
    this.currentLang.set(lang);
    this.setDocumentAttrs(lang);
    void firstValueFrom(
      this.translate.use(lang).pipe(
        timeout({ first: 15000 }),
        defaultIfEmpty(undefined),
        catchError((err) => {
          console.error('[i18n] Language switch failed', err);
          return of(undefined);
        }),
      ),
    );
  }

  private setDocumentAttrs(lang: AppLanguage): void {
    document.documentElement.setAttribute('lang', lang === 'ar' ? 'ar' : 'en');
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  }
}
