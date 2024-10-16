import { Component } from '@angular/core';
import { CoreBase, IUserContext, FormatUtil } from '@infor-up/m3-odin';
import { UserService } from '@infor-up/m3-odin-angular';

@Component({
   templateUrl: './formatting.component.html',
})
export class FormattingSampleComponent extends CoreBase {
   isInitialized = false;
   dateFormat: string;
   m3DateFormat: string;
   today = new Date();

   shortDateString1: string;
   shortDateString2: string;
   shortDateString3: string;

   constructor(private userService: UserService) {
      super('FormattingSampleComponent');

      this.userService
         .getUserContext()
         .subscribe((userContext: IUserContext) => {
            this.m3DateFormat = userContext.DTFM;
            this.dateFormat = userContext.dateFormat;
            this.shortDateString1 = FormatUtil.formatDate(
               new Date(2018, 11, 24),
            );
            this.shortDateString2 = FormatUtil.formatDate(
               new Date(1999, 11, 24),
            );
            this.shortDateString3 = FormatUtil.formatDate(
               new Date(1950, 11, 24),
            );
            this.isInitialized = true;
         });
   }
}
