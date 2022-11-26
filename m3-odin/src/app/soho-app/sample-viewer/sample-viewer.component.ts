import { Component, Input, ViewChild, ViewContainerRef } from "@angular/core";
import { CoreBase } from "@infor-up/m3-odin";
import { SohoModalDialogService } from "ids-enterprise-ng";

@Component({
   selector: "odin-sample-viewer",
   templateUrl: "./sample-viewer.component.html",
   styleUrls: ["./sample-viewer.component.css"],
})
export class SampleViewerComponent extends CoreBase {
   @Input() sample: string;
   @Input() service: string;

   @ViewChild("dialogPlaceholder", { read: ViewContainerRef })
   placeholder: ViewContainerRef;

   constructor(private modalService: SohoModalDialogService) {
      super("SampleViewerComponent");
   }

   openDialog() {
      const buttons = [
         {
            text: "Close",
            click: (e, modal) => {
               modal.close();
            },
            isDefault: true,
         },
      ];
      const dialogRef = this.modalService
         .modal<SampleViewerDialogComponent>(
            SampleViewerDialogComponent,
            this.placeholder
         )
         .id("sample-viewer-modal")
         .title(`Source files for '${this.sample}' sample`)
         .buttons(buttons)
         .apply((dialogComponent) => {
            dialogComponent.sample = this.sample;
            dialogComponent.service = this.service;
         });
      dialogRef.open();
   }
}

@Component({
   templateUrl: "./sample-viewer-dialog.component.html",
})
export class SampleViewerDialogComponent {
   sample: string;
   service: string;

   private appName = "soho";

   constructor() {}

   getSampleUrl(extension: string) {
      return `assets/source/${this.appName}-app/samples/${this.sample}/${
         this.sample
      }.component.${extension.toLowerCase()}`;
   }

   getServiceUrl() {
      return `assets/source/${this.appName}-app/samples/${this.sample}/${this.service}.service.ts`;
   }
}
