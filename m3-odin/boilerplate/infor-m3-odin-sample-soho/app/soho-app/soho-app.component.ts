import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CoreBase, Log } from '@infor-up/m3-odin';

@Component({
   templateUrl: './soho-app.component.html',
   styleUrls: ['./soho-app.component.css'],
   encapsulation: ViewEncapsulation.None
})
export class SohoAppComponent extends CoreBase implements OnInit {
   title = 'Odin SoHo Xi';
   triggers: any[];

   constructor() {
      super('SohoAppComponent');
      Log.setDebug();
   }

   ngOnInit(): void {
      this.triggers = ['#appmenu-trigger'];
   }
}
