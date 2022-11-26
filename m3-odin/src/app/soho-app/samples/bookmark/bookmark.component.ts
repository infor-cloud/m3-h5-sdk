import { Component } from '@angular/core';
import {
   CoreBase,
   IBookmark,
   IFormControlInfo,
   IFormResponse,
} from '@infor-up/m3-odin';
import { FormService } from '@infor-up/m3-odin-angular';
import { SohoMessageService } from 'ids-enterprise-ng';

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
      private messageService: SohoMessageService
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
      const buttons = [
         {
            text: 'OK',
            click: (e, modal) => {
               modal.close();
            },
         },
      ];
      this.messageService
         .error()
         .title('Bookmark error')
         .message(message)
         .buttons(buttons)
         .open();

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
