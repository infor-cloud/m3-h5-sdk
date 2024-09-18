import { Component, ViewChild } from '@angular/core';
import { UserService } from '@infor-up/m3-odin-angular';
import {
   SohoMessageService,
   SohoPersonalizeDirective,
} from 'ids-enterprise-ng';
import { first } from 'rxjs/operators';

@Component({
   templateUrl: './theme.component.html',
})
export class ThemeSampleComponent {
   @ViewChild(SohoPersonalizeDirective, { static: true })
   personalize: SohoPersonalizeDirective;
   colors: SohoPersonalizationColors;
   themes: SohoTheme[];

   fetchingContext = false;

   private _colorId = 'default';

   get themeId() {
      return this.personalize.currentTheme.id;
   }

   set themeId(id: string) {
      this.personalize.theme = id;
   }

   get colorId() {
      return this._colorId;
   }

   set colorId(id: string) {
      const color = this.colors[id];
      if (color && color.value) {
         this.personalize.colors = {
            header: color.value,
         };
         this._colorId = id;
      }
   }

   constructor(
      private userService: UserService,
      private messageService: SohoMessageService,
   ) {}

   ngOnInit() {
      this.colors = this.personalize.personalizationColors();
      this.themes = this.personalize.themes();
   }

   async getThemeFromContext() {
      if (this.fetchingContext) {
         return;
      }
      try {
         this.fetchingContext = true;
         const { theme } = await this.userService
            .getUserContext()
            .pipe(first())
            .toPromise();
         if (theme) {
            this.colorId = theme.toLowerCase();
         } else {
            const ref = this.messageService
               .alert({
                  title: 'Theme not detected',
                  message:
                     "The 'theme' property may not be a part of the user context in some situations. See documentation for IUserContext.theme",
                  buttons: [
                     {
                        text: 'OK',
                        isDefault: true,
                        click: () => ref.close(),
                     },
                  ],
               })
               .open();
         }
      } finally {
         this.fetchingContext = false;
      }
   }
}
