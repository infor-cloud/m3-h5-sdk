import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';


import { BrowserModule } from '@angular/platform-browser';
import { SohoLocaleModule } from 'ids-enterprise-ng';
import { routes } from './soho-app/soho-app.routes';
// import { SohoLocaleInitializerModule } from './locale/l.module';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    importProvidersFrom(BrowserModule, SohoLocaleModule),
  ]
};
