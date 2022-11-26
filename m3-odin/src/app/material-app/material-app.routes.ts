import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MaterialAppComponent } from './material-app.component';
import { BookmarkSampleComponent } from './samples/bookmark/bookmark.component';
import { CustomerSampleComponent } from './samples/customer/customer.component';
import { FormattingSampleComponent } from './samples/formatting/formatting.component';
import { HomeSampleComponent } from './samples/home/home.component';
import { IdmSampleComponent } from './samples/idm/idm.component';
import { InfinitePagingSampleComponent } from './samples/infinite-paging/infinite-paging.component';
import { IonApiSocialSampleComponent } from './samples/ionapi-social/ionapi-social.component';
import { LaunchSampleComponent } from './samples/launch/launch.component';
import { LogSampleComponent } from './samples/log/log.component';
import { SearchSampleComponent } from './samples/search/search.component';
import { UserContextSampleComponent } from './samples/user-context/user-context.component';

const routes: Routes = [
   {
      path: 'material',
      component: MaterialAppComponent,
      children: [
         { path: '', component: HomeSampleComponent },
         { path: 'bookmark', component: BookmarkSampleComponent },
         { path: 'customer', component: CustomerSampleComponent },
         { path: 'formatting', component: FormattingSampleComponent },
         { path: 'home', component: HomeSampleComponent },
         { path: 'idm', component: IdmSampleComponent },
         { path: 'infinite-paging', component: InfinitePagingSampleComponent },
         { path: 'ionapi-social', component: IonApiSocialSampleComponent },
         { path: 'launch', component: LaunchSampleComponent },
         { path: 'log', component: LogSampleComponent },
         { path: 'search', component: SearchSampleComponent },
         { path: 'user-context', component: UserContextSampleComponent },
      ],
   },
];

@NgModule({
   imports: [RouterModule.forChild(routes)],
   exports: [RouterModule],
})
export class MaterialAppRoutingModule {}
