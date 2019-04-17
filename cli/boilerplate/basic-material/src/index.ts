import { Log } from '@infor-up/m3-odin';
import mdcAutoInit from '@material/auto-init';
import { interval, Observable } from 'rxjs';

mdcAutoInit();
Log.level = Log.levelDebug;

Log.debug('Hello World!');
Log.debug('Starting timer...');
interval(1000).subscribe(x => {
   Log.debug('Hello ' + x);
   document.getElementById('timer').innerHTML = `${x}`;
});


document.getElementById('clickMe').onclick = () => {
   Log.debug('Button clicked!');
};
