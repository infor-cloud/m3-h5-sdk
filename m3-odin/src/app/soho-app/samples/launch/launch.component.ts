import { Component } from '@angular/core';
import { CoreBase } from '@infor-up/m3-odin';
import { ApplicationService } from '@infor-up/m3-odin-angular';
import { SampleViewerComponent } from '../../sample-viewer/sample-viewer.component';
import { FormsModule } from '@angular/forms';

@Component({
   templateUrl: './launch.component.html',
   imports: [SampleViewerComponent, FormsModule]
})
export class LaunchSampleComponent extends CoreBase {
   link: string;
   maxLengthLink = 1024;

   constructor(private applicationService: ApplicationService) {
      super('LaunchSampleComponent');
   }

   canLaunch(): boolean {
      const link = this.link;
      return link && link.trim() !== '';
   }

   onClickLaunch(): void {
      const link = this.link;
      this.logDebug('onClickLaunch: ' + link);

      this.applicationService.launch(link);
   }
}
