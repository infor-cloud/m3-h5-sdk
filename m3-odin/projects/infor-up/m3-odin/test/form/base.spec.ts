import { afterEach, describe, expect, it, beforeEach, beforeAll, jest } from '@jest/globals';
import { Bookmark, FormResponse, ITranslationItem, TranslationItem } from '../../form/base';
import { Constraint, IFormControlInfo, Label, Panel, Position, TextBox } from '../../form/elements';
import { FormParser } from '../../form/parser';
import { IBookmark } from '../../form/types';
import { readFileSync } from 'fs';
import { IUserContext } from '../../m3/types';
import { FormConstants } from '../../form/constants';

describe('FormResponse', () => {
    let formResponse: FormResponse;
    let textBox: TextBox;
    let textBoxInfo: IFormControlInfo;

    beforeAll(() => {
        const control = {
            fieldHelp: 'FACI',
            id: 'm3od-ctl-48',
            isBrowsable: true,
            isEnabled: true,
            isRightAligned: false,
            isVisible: true,
            name: 'WWFACI',
            originalName: null!,
            referenceField: 'MBFACI',
            referenceFile: 'MITBAL',
            tabIndex: 527,
            type: 2,
            value: '\n                    \n                    \n                            210\n                ',
        };
        const constraint = { isNumeric: false, isUpper: true, maxDecimals: 0, maxLength: 3 };

        textBox = Object.assign(new TextBox(), control);
        textBox.constraint = Object.assign(new Constraint(), constraint);
        const position = { height: 1, left: 16, top: 3, width: 5, };
        textBox.position = Object.assign(new Position(), position);
    });

    beforeAll(() => {
        textBoxInfo = {
            control: textBox,
            additionalInfo: null!
        };
        textBoxInfo.control!.id = 'm3od-ctl-2';

        const additionalInfo = {
            type: 1,
            isEnabled: true,
            isVisible: true,
            id: null!,
            value: '\n                    \n                            Facility Name\n                ',
            name: 'LBL_L21T3',
            toolTip: null!,
            isFixed: false,
            isAdditionalInfo: true,
            isEmphasized: false,
            isColon: false
        } as unknown as Label;
        const additionalInfoPosition = { height: 1, left: 21, top: 3, width: 31, };
        additionalInfo.position = Object.assign(new Position(), additionalInfoPosition);
        textBoxInfo.additionalInfo = Object.assign(new Label(), additionalInfo);

        const label = {
            type: 1,
            isEnabled: true,
            isVisible: true,
            id: 'WFAC315',
            value: '\n                    \n                            Facility\n                ',
            name: 'WFAC315',
            toolTip: 'Facility',
            isFixed: false,
            isAdditionalInfo: false,
            isEmphasized: false,
            isColon: true
        } as Label;
        const labelPosition = { height: 1, left: 1, top: 3, width: 15, };
        label.position = Object.assign(new Position(), labelPosition);
        textBoxInfo.label = Object.assign(new Label(), label);
    });

    beforeEach(() => {
        FormParser['idCounter'] = 0;
        const xmlContext = readFileSync(`${__dirname}/ops610.xml`, 'utf-8');
        formResponse = FormParser.parse(xmlContext);
    });

    it('should respond to hasPanel', () => {
        formResponse = new FormResponse();
        expect(formResponse.hasPanel()).toBe(false);
        formResponse.panels = [{} as Panel];
        expect(formResponse.hasPanel()).toBe(true);
    });

    it('should return value by name', () => {
        expect(formResponse.getValue('Foo')).toBeUndefined();
        expect(formResponse.getValue('Foo', 'Bar')).toBe('Bar');
        expect(formResponse.getValue('WWFACI')).toBe('\n' +
            '                    \n' +
            '                    \n' +
            '                            210\n' +
            '                ');
    });

    it('should return control by name', () => {
        expect(formResponse.getControl('Foo')).toBeNull();

        expect(formResponse.getControl('WWFACI')).toStrictEqual(textBox);
    });

    it('should return multiple controls', () => {
        expect(formResponse.getControls([])).toStrictEqual([]);
        expect(formResponse.getControls(['Foo'])).toStrictEqual([]);
        expect(formResponse.getControls(['WWFACI', 'W1LIVR']).length).toBe(2);
    });

    it('should return control info by name', () => {
        expect(formResponse.getControlInfo('Foo')).toBeNull();
        expect(formResponse.getControlInfo('WWFACI')).toStrictEqual(textBoxInfo);
    });

    it('should return multiple control infos', () => {
        expect(formResponse.getControlInfos([])).toStrictEqual([]);
        expect(formResponse.getControlInfos(['Foo'])).toStrictEqual([]);
        expect(formResponse.getControlInfos(['WWFACI', 'W1LIVR']).length).toBe(2);
    });
});

describe('Bookmark', () => {
    let toParams;
    let createValues;

    beforeAll(() => {
        toParams = Bookmark.toParams;
        createValues = Bookmark['createValues'];
    });

    afterEach(() => {
        Bookmark.toParams = toParams;
        Bookmark['createValues'] = createValues;
    });

    it('should return a URI', () => {
        const bookmarkData: IBookmark = { program: 'OPS610', source: 'FOO' };
        Bookmark.toParams = jest.fn().mockImplementation((bm, uc) => {
            expect(bm).toStrictEqual(bookmarkData);
            return { BM_SOURCE: bookmarkData.source, BM_PROGRAM: bookmarkData.program, Foo: 'Bar' };
        });

        expect(Bookmark.toUri(bookmarkData)).toBe(`bookmark?source=${bookmarkData.source}&program=${bookmarkData.program}&Foo=Bar`);
    });

    it('should create values', () => {
        const userContext = { currentCompany: '350', currentDivision: '100' } as IUserContext;

        expect(() => Bookmark['createValues'](userContext, '', undefined, false)).toThrowError('Cannot read properties of undefined (reading \'\')');

        const values = {};
        const key = 'Foo';
        values[key] = 'Bar';
        expect(Bookmark['createValues'](userContext, key, values, false)).toBe(`${key},${values[key]}`);

        const secondKey = 'SUNO';
        const twoKeys1 = key + ',' + secondKey;
        expect(Bookmark['createValues'](userContext, twoKeys1, values, false)).toBe(`${key},${values[key]}`);
        expect(Bookmark['createValues'](userContext, twoKeys1, values, true)).toBe(`${key},${values[key]},${secondKey},%20`);

        const thirdKey = 'WWCONO';
        const twoKeys2 = key + ',' + thirdKey;
        expect(Bookmark['createValues'](userContext, twoKeys2, values, true)).toBe(`${key},${values[key]},${thirdKey},${userContext.currentCompany}`);

        const fourthKey = 'WWDIVI';
        const twoKeys3 = key + ',' + fourthKey;
        expect(Bookmark['createValues'](userContext, twoKeys3, values, true)).toBe(`${key},${values[key]},${fourthKey},${userContext.currentDivision}`);

        const fifthKey = 'WWFACI';
        values['FACI'] = '200';
        const twoKeys4 = key + ',' + fifthKey;
        expect(Bookmark['createValues'](userContext, twoKeys4, values, true)).toBe(`${key},${values[key]},${fifthKey},${values['FACI']}`);

        const sixtKey = 'WWWHLO';
        const twoKeys5 = key + ',' + sixtKey;
        expect(Bookmark['createValues'](userContext, twoKeys5, values, true)).toBe(`${key},${values[key]},${sixtKey},%20`);
    });

    it('should return params', () => {
        const bookmarkData: IBookmark = {};
        const userContext = { company: '100' } as IUserContext;
        const result = { BM_INCLUDE_START_PANEL: 'False', BM_REQUIRE_PANEL: 'False', BM_SOURCE: 'Web', BM_SUPPRESS_CONFIRM: 'False' };
        expect(Bookmark.toParams(bookmarkData, userContext)).toStrictEqual(result);

        const values = {};
        const key = 'Foo';
        values[key] = 'Bar';
        bookmarkData.keyNames = key;
        bookmarkData.values = values;
        Bookmark['createValues'] = jest.fn<(...args: any) => string>().mockImplementation((uc: IUserContext, keyNames, vals, isKeys) => {
            expect(uc).toStrictEqual(userContext);
            expect(keyNames).toBe(key);
            expect(vals).toStrictEqual(values);
            expect(isKeys).toBe(true);

            return `${key},${values[key]}`;
        });
        expect(Bookmark.toParams(bookmarkData, userContext)).toStrictEqual({ ...result, BM_KEY_FIELDS: `${key},${values[key]}` });

        bookmarkData.keyNames = undefined;
        bookmarkData.parameterNames = key;
        Bookmark['createValues'] = jest.fn<(...args: any) => string>().mockImplementation((uc: IUserContext, keyNames, vals, isKeys) => {
            expect(uc).toStrictEqual(userContext);
            expect(keyNames).toBe(key);
            expect(vals).toStrictEqual(values);
            expect(isKeys).toBe(false);

            return `${key},${values[key]}`;
        });
        expect(Bookmark.toParams(bookmarkData, userContext)).toStrictEqual({ ...result, BM_PARAMETERS: `${key},${values[key]}` });

        bookmarkData.parameterNames = undefined;
        bookmarkData.fieldNames = key;
        bookmarkData.informationCategory = 'ADPROMOS';
        Bookmark['createValues'] = jest.fn<(...args: any) => string>().mockImplementation((uc: IUserContext, keyNames, vals, isKeys) => {
            expect(uc).toStrictEqual(userContext);
            expect(keyNames).toBe(key);
            expect(vals).toStrictEqual(values);
            expect(isKeys).toBe(false);

            return `${key},${values[key]}`;
        });
        expect(Bookmark.toParams(bookmarkData, userContext)).toStrictEqual({ ...result, BM_START_PANEL_FIELDS: `${key},${values[key]},${FormConstants.fieldInformationCategory},${bookmarkData.informationCategory},${FormConstants.fieldNumberOfFilters},0` });
    });

    it('should return source', () => {
        const bookmarkData: IBookmark = { source: 'Foo' };

        expect(Bookmark['getSource'](bookmarkData)).toBe(bookmarkData.source);
    });
});

describe('TranslationItem', () => {
    it('should construct translation item', () => {
        const key = 'Foo';
        const file = 'Bar';
        const translationItem = new TranslationItem(key, file);
        const result: ITranslationItem = { key, file };

        expect(translationItem).toStrictEqual(Object.assign(new TranslationItem('will be overwritten'), result));
    });
});