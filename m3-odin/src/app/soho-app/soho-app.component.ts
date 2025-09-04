/// <reference types="ids-enterprise-typings" />

import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CoreBase, Log } from '@infor-up/m3-odin';
import { SohoComponentsModule } from 'ids-enterprise-ng';

@Component({
   selector: 'odin-app',
   templateUrl: './soho-app.component.html',
   imports: [RouterOutlet, SohoComponentsModule, RouterLink],
   styleUrls: [
      './soho-app.component.css'
   ],
   encapsulation: ViewEncapsulation.None
})
export class SohoAppComponent extends CoreBase implements OnInit {
   title = 'Odin SoHo Xi';
   triggers: any[];

   constructor() {
      super('SohoAppComponent');
      Log.setDebug();
      Soho.Locale.culturesPath = 'assets/ids-enterprise/js/cultures/';
      return Soho.Locale.set('en-US').catch(err => Log.error("Failed to set IDS Locale", err));
   }

   ngOnInit(): void {
      this.triggers = ['#appmenu-trigger'];
   }
}
