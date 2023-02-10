import { Component, OnInit } from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { CoreBase } from '@infor-up/m3-odin';
import { IdmDataService, IIdmError, ISearchItems } from './idm-data.service';

@Component({
   templateUrl: './idm.component.html',
   styleUrls: ['idm.component.css']
})
export class IdmSampleComponent extends CoreBase implements OnInit {
   items: ISearchItems;

   constructor(private idmService: IdmDataService, private snackBar: MatSnackBar) {
      super('IdmSampleComponent');
   }

   ngOnInit() {
      this.idmService.searchItems().subscribe(response => {
         this.items = response.items;
      }, (error: IIdmError) => {
         this.handleError(error);
      });
   }

   private handleError(error: IIdmError) {
      let message = error.message || 'Failed to perform action.';
      if (!message.endsWith('.')) {
         message += '.';
      }
      this.snackBar.open('An error occured. ' + message + ' More details might be available in the browser console.',
         'Close',
         { duration: 5000 }
      );
   }
}
