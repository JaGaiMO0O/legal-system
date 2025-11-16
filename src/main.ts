import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader, TranslationObject } from '@ngx-translate/core';
import { Observable } from 'rxjs';

class JsonHttpLoader implements TranslateLoader {
  constructor(private http: HttpClient) {}
  getTranslation(lang: string): Observable<TranslationObject> {
    return this.http.get<TranslationObject>(`/assets/i18n/${lang}.json`);
  }
}

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    importProvidersFrom(
      HttpClientModule,
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: (http: HttpClient) => new JsonHttpLoader(http),
          deps: [HttpClient],
        },
        defaultLanguage: 'en',
      }),
    ),
  ],
}).catch((err) => console.error(err));
