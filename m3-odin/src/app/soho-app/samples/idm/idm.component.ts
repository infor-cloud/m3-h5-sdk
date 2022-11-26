import { Component, OnInit } from '@angular/core';
import { CoreBase } from '@infor-up/m3-odin';
import { SohoMessageService } from 'ids-enterprise-ng';
import { IdmDataService, IIdmError, ISearchItems } from './idm-data.service';

@Component({
   templateUrl: './idm.component.html',
   styleUrls: ['./idm.component.css'],
})
export class IdmSampleComponent extends CoreBase implements OnInit {
   items: ISearchItems;

   constructor(
      private idmService: IdmDataService,
      private messageService: SohoMessageService
   ) {
      super('IdmSampleComponent');
   }

   ngOnInit() {
      this.idmService.searchItems().subscribe(
         (response) => {
            this.items = response.items;
         },
         (error: IIdmError) => {
            this.handleError(error);
         }
      );
   }

   private handleError(error: IIdmError) {
      let message = error.message || 'Failed to perform action.';
      if (!message.endsWith('.')) {
         message += '.';
      }
      const buttons = [
         {
            text: 'Ok',
            click: (e, modal) => {
               modal.close();
            },
         },
      ];
      this.messageService
         .error()
         .title('An error occured')
         .message(
            message + ' More details might be available in the browser console.'
         )
         .buttons(buttons)
         .open();
   }
}
