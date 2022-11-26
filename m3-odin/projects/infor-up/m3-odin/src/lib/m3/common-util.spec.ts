import { Log } from '../log';
import { UserServiceCore } from './runtime';
import { IUserContext } from './types';
import { IMIService } from '../mi/base';
import { waitForAsync } from '@angular/core/testing';

describe('CommonUtil via UserServiceCore', () => {
   let userService;

   beforeAll(waitForAsync(() => {
      userService = new UserServiceCore({} as IMIService);
   }));

   it('should return language tag', () => {
      const emptyContext = {} as IUserContext;
      const deContext = { LANC: 'DE' } as IUserContext;
      spyOn(Log, 'warning').and.callFake((message) => {
         expect(message).toBe(
            'getLanguageTag: M3 language undefined not found. Fallback to en-US'
         );
      });

      userService['addAliases'](emptyContext);
      expect(emptyContext.languageTag).toBe('en-US');

      userService['addAliases'](deContext);
      expect(deContext.languageTag).toBe('de-DE');
   });

   it('should return date format', () => {
      const formats = [
         { m3Format: 'YMD', dateFormat: 'yyMMdd' },
         { m3Format: 'YYMMDD', dateFormat: 'yyMMdd' },
         { m3Format: 'YYYYMMDD', dateFormat: 'yyyyMMdd' },
         { m3Format: 'MDY', dateFormat: 'MMddyy' },
         { m3Format: 'MMDDYY', dateFormat: 'MMddyy' },
         { m3Format: 'MMDDYYYY', dateFormat: 'MMddyyyy' },
         { m3Format: 'DMY', dateFormat: 'ddMMyy' },
         { m3Format: 'DDMMYY', dateFormat: 'ddMMyy' },
         { m3Format: 'DDMMYYYY', dateFormat: 'ddMMyyyy' },
      ];

      formats.forEach((o) => {
         const context = { DTFM: o.m3Format } as IUserContext;
         userService['addAliases'](context);
         expect(context.dateFormat).toBe(o.dateFormat);
      });
   });
});
