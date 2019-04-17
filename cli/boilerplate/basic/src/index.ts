import { Log } from '@infor-up/m3-odin';
import { interval, Observable } from 'rxjs';

Log.level = Log.levelDebug;

Log.debug('Hello World!');
Log.debug('Starting timer...');
interval(1000).subscribe(x => {
   Log.debug('Hello ' + x);
   document.getElementById('timer').innerHTML = `${x}`;
});
