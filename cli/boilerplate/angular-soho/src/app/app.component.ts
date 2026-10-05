import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IUserContext } from '@infor-up/m3-odin';
import { UserService } from '@infor-up/m3-odin-angular';
import { SohoComponentsModule } from 'ids-enterprise-ng';

@Component({
   selector: 'app-root',
   standalone: true,
   imports: [SohoComponentsModule],
   templateUrl: './app.component.html',
   styleUrls: ['./app.component.css']
})
export class AppComponent {
   private readonly userService = inject(UserService);
   private readonly destroyRef = inject(DestroyRef);

   isBusy = signal(false);
   company = signal('');
   currentCompany = signal('');
   division = signal('');
   currentDivision = signal('');
   language = signal('');
   currentLanguage = signal('');

   onClickLoad(): void {
      this.isBusy.set(true);

      // takeUntilDestroyed ensures this subscription is automatically
      // cleaned up when the component is destroyed — no manual unsubscribe needed.
      this.userService.getUserContext().pipe(
         takeUntilDestroyed(this.destroyRef)
      ).subscribe({
         next: (userContext: IUserContext) => {
            this.isBusy.set(false);
            this.company.set(userContext.company);
            this.division.set(userContext.division);
            this.language.set(userContext.language);
            this.currentCompany.set(userContext.currentCompany);
            this.currentDivision.set(userContext.currentDivision);
            this.currentLanguage.set(userContext.currentLanguage);
         },
         error: (error) => {
            this.isBusy.set(false);
            console.error('Unable to get userContext', error);
         }
      });
   }
}
