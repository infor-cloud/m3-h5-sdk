import { Schema as AngularDevServerSchema } from '@angular-devkit/build-angular/src/dev-server/schema';

export interface Schema extends AngularDevServerSchema {
   m3?: string;
   ionapi?: string;
}
