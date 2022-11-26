import { Component } from '@angular/core';
import {
   CoreBase,
   IFormResponse,
   ISearchRequest,
   ListRow,
} from '@infor-up/m3-odin';
import { FormService } from '@infor-up/m3-odin-angular';

@Component({
   templateUrl: './search.component.html',
   styleUrls: ['./search.component.css'],
})
export class SearchSampleComponent extends CoreBase {
   canExecute = true;
   query: string;
   results: ListRow[] = [];

   constructor(private formService: FormService) {
      super('SearchSampleComponent');
   }

   isEnabled(): boolean {
      return this.canExecute && !!this.query;
   }

   onClickSearch(): void {
      this.logDebug('onClickSearch: ' + this.query);
      this.canExecute = false;
      this.search();
   }

   getValue(row: ListRow, index: number): string {
      return row.items[index].text;
   }

   private search(): void {
      const request = {
         program: 'MMS001',
         query: this.query,
         sortingOrder: '1',
         view: 'STD01-01',
      } as ISearchRequest;

      this.formService.executeSearch(request).subscribe(
         (r) => {
            this.onResponse(r);
         },
         (r) => {
            this.onError(r);
         }
      );
   }

   private onResponse(response: IFormResponse): void {
      if (response.result !== 0) {
         this.onError(response);
         return;
      }

      let results = [];
      const panel = response.panel;
      if (panel) {
         const list = panel.list;
         if (list) {
            results = list.items;
         }
      }

      this.results = results;
      this.canExecute = true;
   }

   private onError(response: IFormResponse): void {
      // TODO Show error...
      this.canExecute = true;
   }
}
