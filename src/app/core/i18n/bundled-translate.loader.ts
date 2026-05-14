import { TranslateLoader, TranslationObject } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import ar from '../../../assets/i18n/ar.json';
import en from '../../../assets/i18n/en.json';

/**
 * Loads translations from bundled JSON (no HTTP). Avoids /assets 404s and
 * dev-server path issues that leave ngx-translate showing raw keys.
 */
const BUNDLES: Record<string, TranslationObject> = {
  ar: ar as TranslationObject,
  en: en as TranslationObject,
};

export class BundledTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<TranslationObject> {
    return of(BUNDLES[lang] ?? BUNDLES['ar'] ?? {});
  }
}
