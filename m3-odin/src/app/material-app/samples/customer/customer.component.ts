import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { CoreBase, IMIRequest, IMIResponse } from '@infor-up/m3-odin';
import { MIService, UserService } from '@infor-up/m3-odin-angular';

@Component({
   templateUrl: './customer.component.html',
   styleUrls: ['./customer.component.css']
})
export class CustomerSampleComponent extends CoreBase implements OnInit, AfterViewInit {
   @ViewChild(MatPaginator) paginator: MatPaginator;
   @ViewChild(MatSort) sort: MatSort;

   displayedColumns = ['select', 'CUNO', 'CUNM', 'TOWN', 'CUA1'];
   dataSource = new MatTableDataSource<any>([]);
   selection = new SelectionModel<any>(false);
   detailItem: any;
   hasSelected: boolean;
   isBusy = false;

   private items: any[] = [];
   private maxRecords = 100;

   constructor(private miService: MIService, private userService: UserService, private snackBar: MatSnackBar) {
      super('CustomerSampleComponent');
   }

   ngOnInit() {
      this.listItems();
   }

   /**
    * Set the paginator after the view init since this component will
    * be able to query its view for the initialized paginator.
    */
   ngAfterViewInit() {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

      // Reset the paginator after sorting
      this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
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
               this.setItems();
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

   onSelected(customer: any) {
      if (this.isBusy) { return; }

      this.selection.toggle(customer);
      const isSelected = this.selection.isSelected(customer);
      if (isSelected) {
         this.getDetails(customer);
      }
   }

   onUpdate() {
      const detailItem = this.detailItem;
      const request: IMIRequest = {
         program: 'CRS610MI',
         transaction: 'ChgBasicData',
         record: detailItem
      };
      this.setBusy(true);
      this.miService.execute(request).subscribe((response: IMIResponse) => {
         if (!response.hasError()) {
            this.getDetails(response.item);
            this.refreshTableItem();
         } else {
            this.setBusy(false);
            this.handleError('Failed to update item');
         }
      }, (error) => {
         this.setBusy(false);
         this.handleError('Failed to update item', error);
      });
   }

   private getDetails(selectedCustomer: any) {
      const request: IMIRequest = {
         program: 'CRS610MI',
         transaction: 'GetBasicData',
         record: selectedCustomer,
         outputFields: ['CUNM', 'CUNO', 'TOWN', 'CSCD', 'CUA1', 'CUA2', 'CUA3', 'CUA4']
      };
      this.setBusy(true);
      this.miService.execute(request).subscribe((response: IMIResponse) => {
         this.setBusy(false);
         if (!response.hasError()) {
            this.detailItem = response.item;
         } else {
            this.detailItem = undefined;
            this.handleError('Failed to get details');
         }
      }, (error) => {
         this.setBusy(false);
         this.detailItem = undefined;
         this.handleError('Failed to get details', error);
      });
   }

   private refreshTableItem() {
      const idx = this.items.findIndex(obj => obj === this.selection.selected[0]);
      this.items[idx] = this.detailItem;
      this.setItems();
      this.selection.select(this.detailItem);
   }

   private setItems() {
      this.dataSource.data = this.items;
   }

   private setBusy(isBusy: boolean) {
      this.isBusy = isBusy;
   }

   private handleError(message: string, error?: any) {
      this.logError(message, error ? '- Error: ' + JSON.stringify(error) : '');
      this.snackBar.open('An error occured. ' + message + '. More details might be available in the browser console.',
         'Close',
         { duration: 5000 }
      );
   }
}
