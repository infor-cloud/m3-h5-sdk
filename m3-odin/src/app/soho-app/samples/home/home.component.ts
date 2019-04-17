import { Component } from '@angular/core';
import { CoreBase } from '@infor-up/m3-odin';

@Component({
   templateUrl: './home.component.html'
})
export class HomeSampleComponent extends CoreBase {

   constructor() {
      super('HomeSampleComponent');
   }
}
