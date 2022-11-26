import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DatePipe } from './pipes';
import {
   ApplicationService,
   FormService,
   IonApiService,
   MIService,
   UserService,
} from './service';

/**
 * Angular module for M3 Odin.
 *
 * ```typescript
 * import { M3OdinModule } from '@infor-up/m3-odin-angular';
 * ```
 *
 * Import the M3OdinModule in your application to use the M3 Odin Angular services and
 * other Angular functionality.
 *
 * ** Example **
 *
 * ```typescript
 *  @NgModule({
 *    declarations: [MyAppComponent],
 *    imports: [
 *       BrowserModule,
 *       FormsModule,
 *       M3OdinModule,
 *       SohoAppModule
 *   ],
 *   providers: [],
 *   bootstrap: [MyAppComponent]
 * })
 * export class MyAppModule { }
 * ```
 *
 * @since 2.0.0
 */
@NgModule({
   imports: [CommonModule],
   declarations: [DatePipe],
   exports: [DatePipe],
   providers: [
      ApplicationService,
      IonApiService,
      MIService,
      UserService,
      FormService,
   ],
})
export class M3OdinModule {}
