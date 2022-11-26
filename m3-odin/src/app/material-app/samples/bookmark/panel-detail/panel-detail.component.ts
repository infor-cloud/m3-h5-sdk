import { Component, Input } from '@angular/core';
import { CoreBase, IFormControlInfo } from '@infor-up/m3-odin';

@Component({
   selector: 'odin-panel-detail',
   templateUrl: './panel-detail.component.html',
   styleUrls: ['./panel-detail.component.css'],
})
export class PanelDetailSampleComponent extends CoreBase {
   @Input() formData: IFormControlInfo[];
   @Input() columns: number;

   constructor() {
      super('PanelDetailSampleComponent');
   }
}
