import { MediaMatcher } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatSidenav } from '@angular/material';
import { CoreBase, Log } from '@infor-up/m3-odin';

@Component({
   templateUrl: './material-app.component.html',
   styleUrls: ['./material-app.component.css'],
   encapsulation: ViewEncapsulation.None
})
export class MaterialAppComponent extends CoreBase implements OnInit, OnDestroy {
   @ViewChild('sideNav') sideBar: MatSidenav;

   title = 'Odin Material';
   mobileQuery: MediaQueryList;

   private mobileQueryListener: () => void;

   constructor(changeDetectorRef: ChangeDetectorRef, media: MediaMatcher) {
      super('MaterialAppComponent');
      Log.setDebug();

      this.mobileQuery = media.matchMedia('(max-width: 600px)');
      this.mobileQueryListener = () => changeDetectorRef.detectChanges();
      this.mobileQuery.addListener(this.mobileQueryListener);
   }

   ngOnInit(): void {
      this.sideBar.open();
   }

   ngOnDestroy(): void {
      this.mobileQuery.removeListener(this.mobileQueryListener);
   }
}
