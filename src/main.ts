import { registerLocaleData } from '@angular/common';
import localeArSA from '@angular/common/locales/ar-SA';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { BundledTranslateLoader } from './app/core/i18n/bundled-translate.loader';

registerLocaleData(localeArSA);
bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    ...provideTranslateService({
      fallbackLang: 'ar',
      loader: {
        provide: TranslateLoader,
        useClass: BundledTranslateLoader,
      },
    }),
  ],
}).catch((err) => console.error(err));
