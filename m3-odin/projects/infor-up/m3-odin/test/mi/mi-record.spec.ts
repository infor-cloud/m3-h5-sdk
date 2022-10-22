import { describe, expect, it, beforeEach, afterEach } from '@jest/globals';
import { MIRecord, MIUtil } from '../../mi/runtime';

describe('MI Record', () => {
    let getDateFormatted;

    beforeEach(() => {
        getDateFormatted = MIUtil.getDateFormatted;
    });

    afterEach(() => {
        MIUtil.getDateFormatted = getDateFormatted;
    });

    it('should create MIRecord without values', () => {
        const record = new MIRecord();
        expect(record.metadata).toBeNull();
    });

    it('should create MIRecord with values', () => {
        const values = { foo: 'bar' };
        const record = new MIRecord(values);
        expect(record['foo']).toBe(values.foo);
    });

    it('should set number string', () => {
        const record = new MIRecord();
        const foo = Number('123e-1');
        record.setNumberString('foo', foo);
        expect(record['foo']).toBe('12.3');
    });

    it('should set number', () => {
        const record = new MIRecord();
        const foo = '12.4';
        record.setNumber('foo', foo);
        expect(record['foo']).toBe(foo);
    });

    it('should set date string', () => {
        const record = new MIRecord();
        const foo = '2022-10-16T03:24:00';
        const bar = 'hello';
        MIUtil.getDateFormatted = jest.fn().mockImplementation((date) => {
            expect(date).toStrictEqual(new Date(foo));
            return bar;
        });

        record.setDateString('foo', new Date(foo));
        expect(record['foo']).toBe(bar);
    });

    it('should set date', () => {
        const record = new MIRecord();
        const foo = '2022-10-16T03:24:00';
        record.setDate('foo', new Date(foo));
        expect(record['foo']).toStrictEqual(new Date(foo));
    });

    it('should set string', () => {
        const record = new MIRecord();
        const foo = 'bar';
        record.setString('foo', foo);
        expect(record['foo']).toBe(foo);
    });
});
