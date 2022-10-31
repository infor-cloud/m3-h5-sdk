import { IMIMetadataInfo, MIDataType } from '../mi/base';
import { MIRecord, MIUtil } from '../mi/runtime';

describe('MI Util', () => {

    it('should evaluate date parameter', () => {
        expect(MIUtil.isDate('foo')).toBe(false);
        expect(MIUtil.isDate(new Date('foo'))).toBe(false);
        expect(MIUtil.isDate(new Date('2022-10-16T02:00:00'))).toBe(true);
    });

    it('should convert a date or number to a valid MI Format', () => {
        expect(MIUtil.toMIFormat(null)).toBe('');
        expect(MIUtil.toMIFormat(undefined)).toBe('');
        expect(MIUtil.toMIFormat('foo')).toBe('foo');
        expect(MIUtil.toMIFormat(Number('123e-1'))).toBe('12.3');
        expect(MIUtil.toMIFormat(new Date('2022-10-16T02:00:00'))).toBe('20221016');
        expect(MIUtil.toMIFormat(new Date('2022-03-06T02:00:00'))).toBe('20220306');
    });

    it('should create update record', () => {
        const originalRecord = new MIRecord({ CONO: 100, DIVI: 200, CUNO: 'foo', SUNO: 'bar' });
        const newRecord = { DIVI: 300, CUNO: 'bar', SUNO: originalRecord['SUNO'] };
        const updatedFields = ['CUNO', 'SUNO'];
        const mandatoryFields = ['CONO', 'DIVI'];
        const expectedRecord = new MIRecord({ CONO: originalRecord['CONO'].toString(), DIVI: newRecord['DIVI'].toString(), CUNO: newRecord.CUNO, metadata: null });
        expect(MIUtil.createUpdateRecord(originalRecord, newRecord, updatedFields, mandatoryFields)).toEqual(expectedRecord);
    });

    it('should return Date object from string', () => {
        const date = MIUtil.getDate('20221016');
        expect(date.getDate()).toBe(16);
        expect(date.getMonth()).toBe(9);
        expect(date.getFullYear()).toBe(2022);
    });

    it('should convert a dictionary structure to an array', () => {
        expect(MIUtil.metadataToArray({})).toEqual([]);
        const metaData = { ITNO: { name: 'ITNO', type: MIDataType.String, length: 10, description: 'foo' } as IMIMetadataInfo };
        expect(MIUtil.metadataToArray(metaData)).toEqual([metaData.ITNO]);
    });
});
