import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { M3OdinModule } from '@infor-up/m3-odin-angular';
import { AppComponent } from './app.component';

@NgModule({
   declarations: [
      AppComponent
   ],
   imports: [
      BrowserModule,
      M3OdinModule
   ],
   providers: [],
   bootstrap: [AppComponent]
})
export class AppModule { }
