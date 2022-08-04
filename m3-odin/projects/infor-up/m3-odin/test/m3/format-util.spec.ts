import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Configuration, FormatUtil } from '../../m3/runtime';
import { IDateOptions, IUserContext } from '../../m3/types';

describe('FormatUtil', () => {
    let getDateFormat;

    beforeEach(() => {
        getDateFormat = Configuration.getDateFormat;
    });

    afterEach(() => {
        Configuration.getDateFormat = getDateFormat;
    });

    it('should format date', () => {
        const date = new Date(2022, 0, 1);

        Configuration.getDateFormat = jest.fn<() => string>()
            .mockReturnValueOnce('yyMMdd')
            .mockReturnValueOnce('yyyyMMdd')
            .mockReturnValueOnce('MMddyy')
            .mockReturnValueOnce('MMddyyyy')
            .mockReturnValueOnce('ddMMyy')
            .mockReturnValueOnce('ddMMyyyy')
            .mockReturnValueOnce('yyMMdd')
            .mockReturnValueOnce('yyMMdd');

        expect(FormatUtil.formatDate(date)).toBe('220101');
        expect(FormatUtil.formatDate(date)).toBe('20220101');
        expect(FormatUtil.formatDate(date)).toBe('010122');
        expect(FormatUtil.formatDate(date)).toBe('01012022');
        expect(FormatUtil.formatDate(date)).toBe('010122');
        expect(FormatUtil.formatDate(date)).toBe('01012022');
        expect(FormatUtil.formatDate(date, { dateFormat: 'ddMMyyyy' })).toBe('01012022');
        expect(FormatUtil.formatDate(date, { foo: 'bar' } as IDateOptions)).toBe('220101');
    });

    it('should parse date', () => {
        expect(FormatUtil.parseDate('220101')).toEqual(new Date(1922, 0, 1));

        Configuration.update({ firstActiveDate: new Date(1955, 0, 1) } as IUserContext);
        expect(FormatUtil.parseDate('220101', { useCalendar: true })).toEqual(new Date(2022, 0, 1));

        Configuration.update({ firstActiveDate: new Date(1855, 0, 1) } as IUserContext);
        expect(FormatUtil.parseDate('220101', { useCalendar: true })).toEqual(new Date(1922, 0, 1));

        Configuration.update({ firstActiveDate: new Date(2001, 0, 1) } as IUserContext);
        expect(FormatUtil.parseDate('220101', { useCalendar: true })).toEqual(new Date(2022, 0, 1));

        expect(() => { FormatUtil.parseDate('22220101T00:00:00Z') }).toThrowError('Invalid format and/or value, format=yyMMdd value=22220101T00:00:00Z');
    });
});