import { beforeEach, describe, expect, it } from '@jest/globals';
import { Configuration } from '../../m3/runtime';
import { IUserContext } from '../../m3/types';

describe('Configuration', () => {
    beforeEach(() => {
        Configuration['userContext'] = {} as IUserContext;
    });

    it('should return date format', () => {
        const userContext = { dateFormat: 'foo' } as IUserContext;
        expect(Configuration.getDateFormat()).toBe('yyMMdd');
        Configuration['userContext'] = userContext;
        expect(Configuration.getDateFormat()).toBe(userContext.dateFormat);
    });

    it('should return decimal separator', () => {
        const userContext = { DCFM: ',' } as IUserContext;
        expect(Configuration.getDecimalSeparator()).toBe('.');
        Configuration['userContext'] = userContext;
        expect(Configuration.getDecimalSeparator()).toBe(userContext.DCFM);
    });

    it('should return first active date', () => {
        const userContext = { firstActiveDate: new Date(2022, 0, 1) } as IUserContext;
        expect(Configuration.getFirstActiveDate()).toBeUndefined();
        Configuration['userContext'] = userContext;
        expect(Configuration.getFirstActiveDate()).toBe(userContext.firstActiveDate);
    });

    it('should return first active year', () => {
        expect(Configuration.getFirstActiveYear()).toBe(0);
    });

    it('should return last active date', () => {
        const userContext = { lastActiveDate: new Date(2022, 0, 1) } as IUserContext;
        expect(Configuration.getLastActiveDate()).toBeUndefined();
        Configuration['userContext'] = userContext;
        expect(Configuration.getLastActiveDate()).toBe(userContext.lastActiveDate);
    });

    it('should update firstActiveYear in configuration', () => {
        const userContext = { firstActiveDate: new Date(2022, 0, 1) } as IUserContext;
        expect(Configuration.getFirstActiveDate()).toBeUndefined();
        Configuration.update(userContext);
        expect(Configuration.getFirstActiveYear()).toBe(2022);
    });
});