import { MediaMatcher } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
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
