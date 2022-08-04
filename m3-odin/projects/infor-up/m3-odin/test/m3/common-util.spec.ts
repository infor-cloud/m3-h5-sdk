import { beforeEach, afterEach, describe, expect, it, jest } from '@jest/globals';
import { Log } from '../../log';
import { UserServiceCore } from '../../m3/runtime';
import { IUserContext } from '../../m3/types';
import { IMIService } from '../../mi/base';

describe('CommonUtil via UserServiceCore', () => {
    const userService = new UserServiceCore({} as IMIService);
    let warning;

    beforeEach(() =>{
        warning = Log.warning;
    });

    afterEach(() => {
        Log.warning = warning;
    });

    it('should return language tag', () => {
        const emptyContext = {} as IUserContext;
        const deContext = { LANC: 'DE' } as IUserContext;
        Log.warning = jest.fn().mockImplementation((message) => {
            expect(message).toBe('getLanguageTag: M3 language undefined not found. Fallback to en-US');
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
        ]

        formats.forEach((o) => {
            const context = { DTFM: o.m3Format } as IUserContext;
            userService['addAliases'](context);
            expect(context.dateFormat).toBe(o.dateFormat);
        })
    });
});