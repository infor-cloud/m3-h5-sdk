import { Component, OnInit, ViewChild } from '@angular/core';
import { CoreBase, IMIRequest, IMIResponse, MIRecord } from '@infor-up/m3-odin';
import { MIService, UserService } from '@infor-up/m3-odin-angular';
import { SohoDataGridComponent, SohoMessageService } from 'ids-enterprise-ng';

@Component({
   templateUrl: './customer.component.html'
})
export class CustomerSampleComponent extends CoreBase implements OnInit {
   @ViewChild('customersDatagrid', { static: true }) datagrid: SohoDataGridComponent;

   datagridOptions: SohoDataGridOptions;
   items: any[] = [];
   detailItem: any;
   hasSelected: boolean;
   isBusy = false;
   isDetailBusy = false;

   private maxRecords = 100;
   private pageSize = 25;

   constructor(private miService: MIService, private userService: UserService, private messageService: SohoMessageService) {
      super('CustomerSampleComponent');
      this.initGrid();
   }

   ngOnInit() {
      this.listItems();
   }

   private initGrid() {
      const options: SohoDataGridOptions = {
         selectable: 'single' as SohoDataGridSelectable,
         disableRowDeactivation: true,
         clickToSelect: false,
         alternateRowShading: true,
         cellNavigation: false,
         idProperty: 'col-cuno',
         paging: true,
         pagesize: this.pageSize,
         indeterminate: false,
         columns: [
            {
               width: 50, id: 'selectionCheckbox', field: '', name: '', sortable: false,
               resizable: false, align: 'center', formatter: Soho.Formatters.SelectionCheckbox
            },
            {
               width: 'auto', id: 'col-cuno', field: 'CUNO', name: 'Number',
               resizable: true, filterType: 'text', sortable: true
            },
            {
               width: 'auto', id: 'col-cunm', field: 'CUNM', name: 'Name',
               resizable: true, filterType: 'text', sortable: true
            },
            {
               width: 'auto', id: 'col-town', field: 'TOWN', name: 'City',
               resizable: true, filterType: 'text', sortable: true
            },
            {
               width: 'auto', id: 'col-cua1', field: 'CUA1', name: 'Address',
               resizable: true, filterType: 'text', sortable: true
            }
         ],
         dataset: [],
         emptyMessage: {
            title: 'No customers available',
            icon: 'icon-empty-no-data'
         }
      };
      this.datagridOptions = options;
   }

   listItems() {
      if (this.isBusy) { return; }
      this.setBusy(true);

      this.userService.getUserContext().subscribe((context) => {
         const request: IMIRequest = {
            program: 'CRS610MI',
            transaction: 'LstByNumber',
            outputFields: ['CUNO', 'CUNM', 'TOWN', 'CUA1'],
            maxReturnedRecords: this.maxRecords
         };

         this.miService.execute(request).subscribe((response: IMIResponse) => {
            if (!response.hasError()) {
               this.items = response.items;
               this.updateGridData();
            } else {
               this.handleError('Failed to list items');
            }
            this.setBusy(false);
         }, (error) => {
            this.setBusy(false);
            this.handleError('Failed to list items', error);
         });
      }, (error) => {
         this.setBusy(false);
         this.handleError('Failed to get user context', error);
      });
   }

   onSelected(args: any[], isSingleSelect?: boolean) {
      if (this.isBusy) { return; }

      const newCount = args.length;
      const selected = args && newCount === 1 ? args[0].data : null;
      this.hasSelected = !!selected;
      if (this.hasSelected) {
         this.getDetails(selected);
      }
   }

   onUpdate() {
      const detailItem = this.detailItem;
      const request: IMIRequest = {
         program: 'CRS610MI',
         transaction: 'ChgBasicData',
         record: detailItem
      };
      this.setBusy(true, true);
      this.miService.execute(request).subscribe((response: IMIResponse) => {
         if (!response.hasError()) {
            this.getDetails(response.item);
            this.refreshGridItem(detailItem);
         } else {
            this.setBusy(false, true);
            this.handleError('Failed to update item');
         }
      }, (error) => {
         this.setBusy(false, true);
         this.handleError('Failed to update item', error);
      });
   }

   private updateGridData() {
      this.datagrid ? this.datagrid.dataset = this.items : this.datagridOptions.dataset = this.items;
   }

   private getDetails(selectedCustomer: MIRecord) {
      this.setBusy(true, true);
      const request: IMIRequest = {
         program: 'CRS610MI',
         transaction: 'GetBasicData',
         record: selectedCustomer,
         outputFields: ['CUNM', 'CUNO', 'TOWN', 'CSCD', 'CUA1', 'CUA2', 'CUA3', 'CUA4']
      };
      this.miService.execute(request).subscribe((response: IMIResponse) => {
         this.setBusy(false, true);
         if (!response.hasError()) {
            this.detailItem = response.item;
         } else {
            this.detailItem = undefined;
            this.handleError('Failed to get details');
         }
      }, (error) => {
         this.setBusy(false, true);
         this.detailItem = undefined;
         this.handleError('Failed to get details', error);
      });
   }

   private refreshGridItem(detailItem: any) {
      const selected = this.datagrid.getSelectedRows()[0];
      const clone = Object.assign(selected.data, detailItem);
      this.datagrid.updateRow(selected.idx, clone);
   }

   private setBusy(isBusy: boolean, isDetail?: boolean) {
      isDetail ? this.isDetailBusy = isBusy : this.isBusy = isBusy;
   }

   private handleError(message: string, error?: any) {
      this.logError(message, error ? '- Error: ' + JSON.stringify(error) : '');
      const buttons = [{ text: 'Ok', click: (e, modal) => { modal.close(); } }];
      this.messageService.error()
         .title('An error occured')
         .message(message + '. More details might be available in the browser console.')
         .buttons(buttons)
         .open();
   }
}
