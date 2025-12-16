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

// Expose reset function to browser console for testing
if (typeof window !== 'undefined') {
  (window as any).resetLegalPortalData = () => {
    try {
      localStorage.removeItem('legal-portal-store-v1');
      localStorage.removeItem('seeded-v1');
      console.log('✓ All legal portal data cleared from localStorage');
      console.log('  Reload the page to re-seed fresh data');
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  };

  (window as any).clearLegalPortalStorage = (window as any).resetLegalPortalData;
}
