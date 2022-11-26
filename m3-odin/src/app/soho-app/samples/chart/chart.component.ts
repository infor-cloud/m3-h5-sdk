import { Component } from '@angular/core';
import { CoreBase } from '@infor-up/m3-odin';

@Component({
   templateUrl: './chart.component.html',
})
export class ChartSampleComponent extends CoreBase {
   data = [
      {
         data: [
            {
               name: 'Current Metrics',
               value: 4,
               tooltip: 'This is a tooltip',
               ref: 1,
            },
            {
               name: 'Previous Metrics',
               value: 5,
               tooltip: 'This is a tooltip',
               ref: 1,
            },
            {
               name: 'Future Metrics',
               value: 2,
               tooltip: 'This is a tooltip',
               ref: 1,
            },
         ],
         name: 'Schedule Adherence By Quantity',
         color: '#8ED1C6',
         centerLabel: 'This is center label',
         selected: true,
         ref: 1,
      },
   ];

   constructor() {
      super('ChartSampleComponent');
   }
}
