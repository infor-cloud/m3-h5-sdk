import { describe, expect, fit, it, beforeEach, beforeAll } from '@jest/globals';
import { FormResponse } from '../../form/base';
import { Constraint, IFormControlInfo, Label, Panel, Position, TextBox } from '../../form/elements';
import { FormParser } from '../../form/parser';
import { readFileSync, Dir } from 'fs';

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