import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideM3Odin } from '@infor-up/m3-odin-angular';

export const appConfig: ApplicationConfig = {
   providers: [
      provideZonelessChangeDetection(),
      provideHttpClient(),
      provideM3Odin(),
   ]
};
