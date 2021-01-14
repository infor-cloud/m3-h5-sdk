import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { registerLanguage } from 'highlight.js';
import css from 'highlight.js/lib/languages/css';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

initHighlightJs();

if (environment.production) {
   enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
   .catch(err => console.error(err));

function initHighlightJs(): void {
   try {
      registerLanguage('typescript', typescript);
      registerLanguage('css', css);
      registerLanguage('xml', xml);
   } catch (err) {
      console.error(err);
   }
}
