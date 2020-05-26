import { APP_INITIALIZER, LOCALE_ID, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { M3OdinModule } from '@infor-up/m3-odin-angular';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SohoAppModule } from './soho-app/soho-app.module';

@NgModule({
   declarations: [AppComponent],
   imports: [
      BrowserModule,
      FormsModule,
      M3OdinModule,
      AppRoutingModule,
      SohoAppModule
   ],
   providers: [
      {
         provide: LOCALE_ID,
         useValue: 'en-US',
      },
      {
         provide: APP_INITIALIZER,
         multi: true,
         deps: [LOCALE_ID],
         useFactory: (locale: string) => () => {
            Soho.Locale.culturesPath = 'assets/ids-enterprise/js/cultures/';
            Soho.Locale.set(locale);
         },
      },
   ],
   bootstrap: [AppComponent]
})
export class AppModule { }
