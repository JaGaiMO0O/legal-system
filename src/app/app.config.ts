import { ApplicationConfig, APP_INITIALIZER, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import { LanguageService } from './core/i18n/language.service';
import { SeedService } from './core/seed/seed.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [LanguageService],
      useFactory: (lang: LanguageService) => () => lang.init(),
    },
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [SeedService],
      useFactory: (seed: SeedService) => () => seed.run(),
    },
  ],
};
