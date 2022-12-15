import { IMIMetadataInfo, IMIMetadataMap, MIDataType } from './base';
import { MIMetadataInfo, MIRecord, MIUtil } from './runtime';

describe('MI Meatdata Info', () => {
    const name = 'foo';
    const types = [
        { typeString: 'A', type: MIDataType.String },
        { typeString: 'D', type: MIDataType.Date },
        { typeString: 'N', type: MIDataType.Numeric },
        { typeString: 'X', type: undefined },
    ];
    const length = 12;
    const description = 'bar';

    const objString = new MIMetadataInfo(name, length, types[0].typeString, description);
    const objDate = new MIMetadataInfo(name, length, types[1].typeString, description);
    const objNumeric = new MIMetadataInfo(name, length, types[2].typeString, description);
    const objUndefined = new MIMetadataInfo(name, length, types[3].typeString, description);

    it('should create String object', () => {
        expect(objString.name).toBe(name);
        expect(objString.length).toBe(length);
        expect(objString.description).toBe(description);
        expect(objString.type).toBe(types[0].type);
        expect(objString.isDate()).toBe(false);
        expect(objString.isNumeric()).toBe(false);
        expect(objString.isString()).toBe(true);
    });

    it('should create Date object', () => {
        expect(objDate.name).toBe(name);
        expect(objDate.length).toBe(length);
        expect(objDate.description).toBe(description);
        expect(objDate.type).toBe(types[1].type);
        expect(objDate.isDate()).toBe(true);
        expect(objDate.isNumeric()).toBe(false);
        expect(objDate.isString()).toBe(false);
    });

    it('should create Numeric object', () => {
        expect(objNumeric.name).toBe(name);
        expect(objNumeric.length).toBe(length);
        expect(objNumeric.description).toBe(description);
        expect(objNumeric.type).toBe(types[2].type);
        expect(objNumeric.isDate()).toBe(false);
        expect(objNumeric.isNumeric()).toBe(true);
        expect(objNumeric.isString()).toBe(false);
    });

    it('should create Undefined object', () => {
        expect(objUndefined.name).toBe(name);
        expect(objUndefined.length).toBe(length);
        expect(objUndefined.description).toBe(description);
        expect(objUndefined.type).toBe(types[3].type);
        expect(objUndefined.isDate()).toBe(false);
        expect(objUndefined.isNumeric()).toBe(false);
        expect(objUndefined.isString()).toBe(false);
    });
});
