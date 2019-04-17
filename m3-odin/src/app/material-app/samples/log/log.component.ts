import { Component } from '@angular/core';
import { CoreBase } from '@infor-up/m3-odin';

@Component({
   templateUrl: './log.component.html',
   styleUrls: ['./log.component.css']
})
export class LogSampleComponent extends CoreBase {
   logs: any[] = [];

   constructor() {
      super('LogSampleComponent');
   }

   private addLog(type: string, message: string) {
      const now = new Date();
      this.logs.push({ timestamp: now, type: type, message: message });
   }

   onClickClear(): void {
      this.logs = [];
   }

   onClickDebug(): void {
      const message = 'Debug button clicked';
      this.addLog('DEBUG', message);
      this.logDebug(message);
   }

   onClickInfo(): void {
      const message = 'Info button clicked';
      this.addLog('INFO', message);
      this.logInfo(message);
   }

   onClickWarning(): void {
      const message = 'Warning button clicked';
      this.addLog('WARNING', message);
      this.logWarning(message);
   }

   onClickError(): void {
      const message = 'Error button clicked';
      this.addLog('ERROR', message);
      this.logError(message);
   }
}
