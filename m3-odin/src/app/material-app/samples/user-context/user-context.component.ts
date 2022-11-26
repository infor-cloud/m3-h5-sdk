import { Component } from '@angular/core';
import { ArrayUtil, CoreBase, IUserContext } from '@infor-up/m3-odin';
import { UserService, MIService } from '@infor-up/m3-odin-angular';

interface IKeyValue {
   key: string;
   value: string;
}

@Component({
   templateUrl: './user-context.component.html',
})
export class UserContextSampleComponent extends CoreBase {
   userContext = {} as IUserContext;
   sortedValues: IKeyValue[] = [];

   userIdService: string;
   userNameService: string;

   constructor(private miService: MIService, private userService: UserService) {
      super('UserSampleComponent');
   }

   onClickLoad(): void {
      this.logInfo('onClickLoad');
      this.userService
         .getUserContext()
         .subscribe((userContext: IUserContext) => {
            this.logInfo('onClickLoad: Received user context');
            this.userContext = userContext;
            this.sortedValues = this.createSortedValues();
         });
   }

   private createSortedValues(): IKeyValue[] {
      const userContext = this.userContext;
      const values = [];
      for (const key of Object.keys(userContext)) {
         let value = userContext[key];
         if (typeof value !== 'string') {
            value = JSON.stringify(value);
         }
         values.push({ key: key, value: value });
      }
      return ArrayUtil.sortByProperty(values, 'key');
   }
}
