import { Configuration } from './runtime';
import { IUserContext } from './types';

describe('Configuration', () => {
    let firstActiveYear;
    let userContext;

    beforeEach(() => {
        userContext = Configuration['userContext'];
        firstActiveYear = Configuration['firstActiveYear'];
    });

    afterEach(() => {
        Configuration['userContext'] = userContext;
        Configuration['firstActiveYear'] = firstActiveYear;
    });

    it('should return date format', () => {
        const userContext = { dateFormat: 'foo' } as IUserContext;
        expect(Configuration.getDateFormat()).toBe('yyMMdd');
        Configuration['userContext'] = userContext;
        expect(Configuration.getDateFormat()).toBe(userContext.dateFormat as string);
    });

    it('should return decimal separator', () => {
        const userContext = { DCFM: ',' } as IUserContext;
        expect(Configuration.getDecimalSeparator()).toBe('.');
        Configuration['userContext'] = userContext;
        expect(Configuration.getDecimalSeparator()).toBe(userContext.DCFM as string);
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