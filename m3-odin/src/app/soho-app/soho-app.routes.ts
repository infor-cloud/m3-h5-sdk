import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookmarkSampleComponent } from './samples/bookmark/bookmark.component';
import { ChartSampleComponent } from './samples/chart/chart.component';
import { CustomerSampleComponent } from './samples/customer/customer.component';
import { FormattingSampleComponent } from './samples/formatting/formatting.component';
import { HomeSampleComponent } from './samples/home/home.component';
import { IdmSampleComponent } from './samples/idm/idm.component';
import { InfinitePagingSampleComponent } from './samples/infinite-paging/infinite-paging.component';
import { IonApiSocialSampleComponent } from './samples/ionapi-social/ionapi-social.component';
import { LaunchSampleComponent } from './samples/launch/launch.component';
import { LogSampleComponent } from './samples/log/log.component';
import { SearchSampleComponent } from './samples/search/search.component';
import { ThemeSampleComponent } from './samples/theme/theme.component';
import { UserContextSampleComponent } from './samples/user-context/user-context.component';
import { SohoAppComponent } from './soho-app.component';

const routes: Routes = [
   {
      path: 'soho',
      component: SohoAppComponent,
      children: [
         { path: '', component: HomeSampleComponent },
         { path: 'bookmark', component: BookmarkSampleComponent },
         { path: 'chart', component: ChartSampleComponent },
         { path: 'customer', component: CustomerSampleComponent },
         { path: 'formatting', component: FormattingSampleComponent },
         { path: 'home', component: HomeSampleComponent },
         { path: 'idm', component: IdmSampleComponent },
         { path: 'infinite-paging', component: InfinitePagingSampleComponent },
         { path: 'ionapi-social', component: IonApiSocialSampleComponent },
         { path: 'launch', component: LaunchSampleComponent },
         { path: 'log', component: LogSampleComponent },
         { path: 'theme', component: ThemeSampleComponent },
         { path: 'search', component: SearchSampleComponent },
         { path: 'user-context', component: UserContextSampleComponent },
      ],
   },
];

@NgModule({
   imports: [RouterModule.forChild(routes)],
   exports: [RouterModule],
})
export class SohoAppRoutingModule {}
