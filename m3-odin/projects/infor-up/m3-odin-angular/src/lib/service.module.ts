import { CommonModule } from '@angular/common';
import { EnvironmentProviders, makeEnvironmentProviders, NgModule } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { DatePipe } from './pipes';
import { ApplicationService, FormService, IonApiService, MIService, UserService } from './service';

/**
 * Provides M3 Odin services for standalone Angular applications.
 *
 * ```typescript
 * import { provideM3Odin } from '@infor-up/m3-odin-angular';
 * ```
 *
 * Use this function in your application config to register all M3 Odin services.
 * This is the recommended approach for Angular 20+ applications using standalone components.
 *
 * **Example**
 *
 * ```typescript
 * // app.config.ts
 * import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
 * import { provideHttpClient } from '@angular/common/http';
 * import { provideM3Odin } from '@infor-up/m3-odin-angular';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideZonelessChangeDetection(),
 *     provideHttpClient(),
 *     provideM3Odin(),
 *   ]
 * };
 * ```
 *
 * @since 9.0.0
 */
export function provideM3Odin(): EnvironmentProviders {
   return makeEnvironmentProviders([
      ApplicationService,
      MIService,
      UserService,
      FormService,
      IonApiService,
   ]);
}

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
 * @deprecated Use `provideM3Odin()` instead for standalone Angular applications.
 * This module is provided for backward compatibility with NgModule-based apps.
 *
 * @since 2.0.0
 */
@NgModule({
   imports: [
      CommonModule,
      DatePipe
   ],
   exports: [
      DatePipe
   ],
   providers: [ApplicationService, IonApiService, MIService, UserService, FormService]
})
export class M3OdinModule { }
