import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
   CoreBase,
   IBookmark,
   IFormControlInfo,
   IFormResponse,
} from '@infor-up/m3-odin';
import { FormService } from '@infor-up/m3-odin-angular';

@Component({
   templateUrl: './bookmark.component.html',
})
export class BookmarkSampleComponent extends CoreBase {
   fieldNames = ['WWCUNO', 'WRCUNM', 'WRTOWN', 'WRCSCD', 'WRPHNO', 'WRYREF'];
   controlInfos: IFormControlInfo[];
   canExecute = true;
   CUNO: string;

   constructor(
      private readonly formService: FormService,
      private snackBar: MatSnackBar
   ) {
      super('BookmarkSampleComponent');
   }

   isEnabled(): boolean {
      return this.canExecute && !!this.CUNO;
   }

   onClickOpen(): void {
      this.logDebug('open: ' + this.CUNO);
      this.canExecute = false;
      this.openBookmark();
   }

   private openBookmark(): void {
      const bookmark = this.getBookmark();
      bookmark.values = {
         OKCUNO: this.CUNO,
      };

      this.formService.executeBookmark(bookmark).subscribe(
         (r) => {
            this.onResponse(r);
         },
         (r) => {
            this.onError(r);
         }
      );
   }

   private onResponse(response: IFormResponse): void {
      if (response.result !== 0) {
         this.onError(response);
         return;
      }

      const panel = response.panel;
      if (panel) {
         this.controlInfos = panel.getControlInfos(this.fieldNames);
      }

      this.canExecute = true;
   }

   private onError(response: IFormResponse): void {
      const message = response.message || 'Unable to open bookmark';
      this.logError(message);
      this.snackBar.open(
         'Bookmark error' +
            message +
            '. More details might be available in the browser console.',
         'Close',
         { duration: 5000 }
      );

      this.canExecute = true;
   }

   private getBookmark(): IBookmark {
      return {
         program: 'CRS610',
         table: 'OCUSMA',
         keyNames: 'OKCONO,OKCUNO',
         option: '5',
         panel: 'E',
         isStateless: true,
      };
   }
}
