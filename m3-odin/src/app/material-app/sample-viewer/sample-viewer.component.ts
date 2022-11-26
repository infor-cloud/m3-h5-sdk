import { Component, Inject, Input } from '@angular/core';
import {
   MatDialog,
   MatDialogRef,
   MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { CoreBase } from '@infor-up/m3-odin';

interface IModalData {
   sample: string;
   service?: string;
}

@Component({
   selector: 'odin-sample-viewer',
   templateUrl: './sample-viewer.component.html',
})
export class SampleViewerComponent extends CoreBase {
   @Input() sample: string;
   @Input() service: string;

   constructor(private dialog: MatDialog) {
      super('SampleViewerComponent');
   }

   openDialog() {
      this.dialog.open(SampleViewerDialogComponent, {
         width: '80vw',
         data: { sample: this.sample, service: this.service } as IModalData,
      });
   }
}

@Component({
   templateUrl: './sample-viewer-dialog.component.html',
})
export class SampleViewerDialogComponent {
   private appName = 'material';

   constructor(
      public dialogRef: MatDialogRef<SampleViewerDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: IModalData
   ) {}

   getSampleUrl(extension: string) {
      return `assets/source/${this.appName}-app/samples/${this.data.sample}/${
         this.data.sample
      }.component.${extension.toLowerCase()}`;
   }

   getServiceUrl() {
      return `assets/source/${this.appName}-app/samples/${this.data.sample}/${this.data.service}.service.ts`;
   }
}
