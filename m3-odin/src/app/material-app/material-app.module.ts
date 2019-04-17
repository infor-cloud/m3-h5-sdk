import { MediaMatcher } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule, MatCardModule, MatCheckboxModule, MatDialogModule, MatFormFieldModule, MatGridListModule, MatIconModule, MatInputModule, MatListModule, MatPaginatorModule, MatProgressSpinnerModule, MatSidenavModule, MatSnackBarModule, MatSortModule, MatTableModule, MatTabsModule, MatToolbarModule, MatTooltipModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { M3OdinModule } from '@infor-up/m3-odin-angular';
import { CommonAppModule } from '../common/common-app.module';
import { MaterialAppComponent } from './material-app.component';
import { MaterialAppRoutingModule } from './material-app.routes';
import { SampleViewerComponent, SampleViewerDialogComponent } from './sample-viewer/sample-viewer.component';
import { BookmarkSampleComponent } from './samples/bookmark/bookmark.component';
import { PanelDetailSampleComponent } from './samples/bookmark/panel-detail/panel-detail.component';
import { CustomerSampleComponent } from './samples/customer/customer.component';
import { FormattingSampleComponent } from './samples/formatting/formatting.component';
import { HomeSampleComponent } from './samples/home/home.component';
import { IdmDataService } from './samples/idm/idm-data.service';
import { IdmSampleComponent } from './samples/idm/idm.component';
import { InfinitePagingSampleComponent } from './samples/infinite-paging/infinite-paging.component';
import { IonApiSocialSampleComponent } from './samples/ionapi-social/ionapi-social.component';
import { LaunchSampleComponent } from './samples/launch/launch.component';
import { LogSampleComponent } from './samples/log/log.component';
import { SearchSampleComponent } from './samples/search/search.component';
import { UserContextSampleComponent } from './samples/user-context/user-context.component';

@NgModule({
   declarations: [
      MaterialAppComponent,
      SampleViewerComponent,
      SampleViewerDialogComponent,
      HomeSampleComponent,
      BookmarkSampleComponent,
      CustomerSampleComponent,
      FormattingSampleComponent,
      IdmSampleComponent,
      IonApiSocialSampleComponent,
      InfinitePagingSampleComponent,
      LaunchSampleComponent,
      LogSampleComponent,
      PanelDetailSampleComponent,
      SearchSampleComponent,
      UserContextSampleComponent
   ],
   entryComponents: [SampleViewerDialogComponent],
   imports: [
      CommonModule,
      BrowserAnimationsModule,
      HttpClientModule,
      FormsModule,
      CommonAppModule,
      M3OdinModule,
      MaterialAppRoutingModule,
      MatGridListModule,
      MatToolbarModule,
      MatSidenavModule,
      MatIconModule,
      MatListModule,
      MatCardModule,
      MatButtonModule,
      MatProgressSpinnerModule,
      MatTableModule,
      MatCheckboxModule,
      MatPaginatorModule,
      MatSortModule,
      MatFormFieldModule,
      MatInputModule,
      MatSnackBarModule,
      MatTooltipModule,
      MatDialogModule,
      MatTabsModule
   ],
   providers: [MediaMatcher, IdmDataService]
})
export class MaterialAppModule { }
