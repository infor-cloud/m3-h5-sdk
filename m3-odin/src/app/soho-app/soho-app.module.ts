import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { M3OdinModule } from '@infor-up/m3-odin-angular';
import { SohoComponentsModule } from 'ids-enterprise-ng';
import { CommonAppModule } from '../common/common-app.module';
import { SampleViewerComponent, SampleViewerDialogComponent } from './sample-viewer/sample-viewer.component';
import { BookmarkSampleComponent } from './samples/bookmark/bookmark.component';
import { PanelDetailSampleComponent } from './samples/bookmark/panel-detail/panel-detail.component';
import { ChartSampleComponent } from './samples/chart/chart.component';
import { CustomerSampleComponent } from './samples/customer/customer.component';
import { FormattingSampleComponent } from './samples/formatting/formatting.component';
import { HomeSampleComponent } from './samples/home/home.component';
import { IdmDataService } from './samples/idm/idm-data.service';
import { IdmSampleComponent } from './samples/idm/idm.component';
import { CustomerPagingService } from './samples/infinite-paging/customer-paging.service';
import { InfinitePagingSampleComponent } from './samples/infinite-paging/infinite-paging.component';
import { IonApiSocialSampleComponent } from './samples/ionapi-social/ionapi-social.component';
import { LaunchSampleComponent } from './samples/launch/launch.component';
import { LogSampleComponent } from './samples/log/log.component';
import { SearchSampleComponent } from './samples/search/search.component';
import { ThemeSampleComponent } from './samples/theme/theme.component';
import { UserContextSampleComponent } from './samples/user-context/user-context.component';
import { SohoAppComponent } from './soho-app.component';
import { SohoAppRoutingModule } from './soho-app.routes';

@NgModule({
   declarations: [
      SohoAppComponent,
      SampleViewerComponent,
      SampleViewerDialogComponent,
      HomeSampleComponent,
      BookmarkSampleComponent,
      ChartSampleComponent,
      CustomerSampleComponent,
      FormattingSampleComponent,
      IdmSampleComponent,
      IonApiSocialSampleComponent,
      InfinitePagingSampleComponent,
      LaunchSampleComponent,
      LogSampleComponent,
      ThemeSampleComponent,
      PanelDetailSampleComponent,
      SearchSampleComponent,
      UserContextSampleComponent
   ],
   imports: [
      CommonModule,
      FormsModule,
      M3OdinModule,
      SohoAppRoutingModule,
      SohoComponentsModule,
      CommonAppModule
   ],
   providers: [CustomerPagingService, IdmDataService]
})
export class SohoAppModule { }
