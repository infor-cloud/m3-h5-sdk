import { Component, ViewChild } from "@angular/core";
import { CoreBase } from "@infor-up/m3-odin";
import { SohoDataGridComponent } from "ids-enterprise-ng";
import {
   CustomerPagingService,
   IPagingResult,
} from "./customer-paging.service";

@Component({
   templateUrl: "./infinite-paging.component.html",
})
export class InfinitePagingSampleComponent extends CoreBase {
   @ViewChild("infinitePagingDatagrid") datagrid: SohoDataGridComponent;

   datagridOptions: SohoDataGridOptions;

   constructor(public pagingService: CustomerPagingService) {
      super("InfinitePagingSampleComponent");
      this.initGrid();
   }

   private initGrid() {
      const options: SohoDataGridOptions = {
         disableRowDeactivation: true,
         alternateRowShading: true,
         cellNavigation: false,
         idProperty: "col-cuno",
         rowHeight: "short",
         paging: true,
         pagesize: 50,
         showPageSizeSelector: false,
         indeterminate: true,
         columns: [
            {
               width: "auto",
               id: "col-cuno",
               field: "CUNO",
               name: "Number",
               resizable: true,
               filterType: "text",
               sortable: false,
            },
            {
               width: "auto",
               id: "col-cunm",
               field: "CUNM",
               name: "Name",
               resizable: true,
               filterType: "text",
               sortable: false,
            },
            {
               width: "auto",
               id: "col-stat",
               field: "STAT",
               name: "Status",
               resizable: true,
               filterType: "text",
               sortable: false,
            },
            {
               width: "auto",
               id: "col-phno",
               field: "PHNO",
               name: "Phone number",
               resizable: true,
               filterType: "text",
               sortable: false,
            },
            {
               width: "auto",
               id: "col-yref",
               field: "YREF",
               name: "Your reference",
               resizable: true,
               filterType: "text",
               sortable: false,
            },
         ],
         dataset: [],
         emptyMessage: {
            title: "No customers available",
            icon: "icon-empty-no-data",
         },
         source: (
            request: SohoDataGridSourceRequest,
            response: SohoDataGridResponseFunction
         ) => {
            this.pagingService
               .getData(request)
               .subscribe((result: IPagingResult) =>
                  response(result.items, result.request)
               );
         },
      };
      this.datagridOptions = options;
   }
}
