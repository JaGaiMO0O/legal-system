import { provideHttpClient } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import Aura from '@primeng/themes/aura';
import { MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';

import { routes } from './app.routes';
import { LanguageService } from './core/i18n/language.service';
import { SeedService } from './core/seed/seed.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(),
    providePrimeNG({
      ripple: false,
      inputStyle: 'outlined',
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.dark',
          cssLayer: false,
        },
      },
    }),
    MessageService,
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
      localStorage.removeItem('seeded-v2');
      localStorage.removeItem('seeded-v3');
      console.log('✓ All legal portal data cleared from localStorage');
      console.log('  Reload the page to re-seed fresh data');
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  };

  (window as any).clearLegalPortalStorage = (window as any).resetLegalPortalData;
}
