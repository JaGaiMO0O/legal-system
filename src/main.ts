import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from './app/core/i18n/language.service';

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    importProvidersFrom(HttpClientModule, TranslateModule.forRoot()),
  ],
})
  .then(() => {
    const svc = new LanguageService(null as any);
    svc.init();
  })
  .catch((err) => console.error(err));
