import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import hljs from 'highlight.js/lib/core';
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
      hljs.registerLanguage('typescript', typescript);
      hljs.registerLanguage('css', css);
      hljs.registerLanguage('xml', xml);
   } catch (err) {
      console.error(err);
   }
}
