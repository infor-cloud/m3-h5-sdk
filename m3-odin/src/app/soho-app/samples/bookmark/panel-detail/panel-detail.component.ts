import { Component, Input, OnInit } from "@angular/core";
import { CoreBase, IFormControlInfo } from "@infor-up/m3-odin";

@Component({
   selector: "odin-panel-detail",
   templateUrl: "./panel-detail.component.html",
})
export class PanelDetailSampleComponent extends CoreBase implements OnInit {
   @Input() formData: IFormControlInfo[];
   /**
    * Valid column values are: 12, 6, 4, 3, 2 or 1 since we always want to fill the entire row of 12 columns
    */
   @Input() columns: number;

   rowCounter: number[];
   columnCounter: string[];

   private maxColumns = 12;

   constructor() {
      super("PanelDetailSampleComponent");
   }

   ngOnInit(): void {
      this.setupComponent();
   }

   private setupComponent() {
      const maxColumns = this.maxColumns;
      const columnWidth = Math.floor(maxColumns / this.columns);
      let columnClass: string;
      let columnsInRow = 1;
      switch (columnWidth) {
         case maxColumns: {
            columnClass = "twelve";
            break;
         }
         case 6: {
            columnClass = "six";
            columnsInRow = 2;
            break;
         }
         case 4: {
            columnClass = "four";
            columnsInRow = 3;
            break;
         }
         case 3: {
            columnClass = "three";
            columnsInRow = 4;
            break;
         }
         case 2: {
            columnClass = "two";
            columnsInRow = 6;
            break;
         }
         case 1: {
            columnClass = "one";
            columnsInRow = 12;
            break;
         }
         default: {
            this.logWarning(
               "The entered value for columns is not supported: " +
                  this.columns +
                  ". Using max columns: " +
                  maxColumns
            );
            columnClass = "one";
            columnsInRow = 12;
            break;
         }
      }
      const rowSpan = Math.ceil(this.formData.length / columnsInRow);
      this.createLoopCounters(rowSpan, columnsInRow, columnClass);
   }

   private createLoopCounters(
      rows: number,
      columnsInRow: number,
      columnClass: string
   ) {
      this.rowCounter = Array(rows);
      this.columnCounter = Array(columnsInRow).fill(columnClass);
   }
}
