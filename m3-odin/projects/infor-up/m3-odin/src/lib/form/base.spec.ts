import {
   Bookmark,
   FormResponse,
   ITranslationItem,
   TranslationItem,
} from './base';
import {
   Constraint,
   IFormControlInfo,
   Label,
   Panel,
   Position,
   TextBox,
} from './elements';
import { FormParser } from './parser';
import { IBookmark } from './types';
import { IUserContext } from '../m3/types';
import { FormConstants } from './constants';

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
      const constraint = {
         isNumeric: false,
         isUpper: true,
         maxDecimals: 0,
         maxLength: 3,
      };

      textBox = Object.assign(new TextBox(), control);
      textBox.constraint = Object.assign(new Constraint(), constraint);
      const position = { height: 1, left: 16, top: 3, width: 5 };
      textBox.position = Object.assign(new Position(), position);
   });

   beforeAll(() => {
      textBoxInfo = {
         control: textBox,
         additionalInfo: null!,
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
         isColon: false,
      } as unknown as Label;
      const additionalInfoPosition = { height: 1, left: 21, top: 3, width: 31 };
      additionalInfo.position = Object.assign(
         new Position(),
         additionalInfoPosition
      );
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
         isColon: true,
      } as Label;
      const labelPosition = { height: 1, left: 1, top: 3, width: 15 };
      label.position = Object.assign(new Position(), labelPosition);
      textBoxInfo.label = Object.assign(new Label(), label);
   });

   beforeEach(() => {
      FormParser['idCounter'] = 0;
      formResponse = FormParser.parse(ops610Content);
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
      expect(formResponse.getValue('WWFACI')).toBe(
         '\n' +
            '                    \n' +
            '                    \n' +
            '                            210\n' +
            '                '
      );
   });

   it('should return control by name', () => {
      expect(formResponse.getControl('Foo')).toBeNull();

      expect(formResponse.getControl('WWFACI')).toEqual(textBox);
   });

   it('should return multiple controls', () => {
      expect(formResponse.getControls([])).toEqual([]);
      expect(formResponse.getControls(['Foo'])).toEqual([]);
      expect(formResponse.getControls(['WWFACI', 'W1LIVR']).length).toBe(2);
   });

   it('should return control info by name', () => {
      expect(formResponse.getControlInfo('Foo')).toBeNull();
      expect(formResponse.getControlInfo('WWFACI')).toEqual(textBoxInfo);
   });

   it('should return multiple control infos', () => {
      expect(formResponse.getControlInfos([])).toEqual([]);
      expect(formResponse.getControlInfos(['Foo'])).toEqual([]);
      expect(formResponse.getControlInfos(['WWFACI', 'W1LIVR']).length).toBe(2);
   });
});

describe('Bookmark', () => {
   it('should return a URI', () => {
      const bookmarkData: IBookmark = { program: 'OPS610', source: 'FOO' };
      spyOn(Bookmark, 'toParams').and.callFake((bm, uc) => {
         expect(bm).toBe(bookmarkData);
         return {
            BM_SOURCE: bookmarkData.source,
            BM_PROGRAM: bookmarkData.program,
            Foo: 'Bar',
         };
      });

      expect(Bookmark.toUri(bookmarkData)).toBe(
         `bookmark?source=${bookmarkData.source}&program=${bookmarkData.program}&Foo=Bar`
      );
   });

   it('should create values', () => {
      const userContext = {
         currentCompany: '350',
         currentDivision: '100',
      } as IUserContext;

      expect(() =>
         Bookmark['createValues'](userContext, '', undefined, false)
      ).toThrowError("Cannot read properties of undefined (reading '')");

      const values = {};
      const key = 'Foo';
      values[key] = 'Bar';
      expect(Bookmark['createValues'](userContext, key, values, false)).toBe(
         `${key},${values[key]}`
      );

      const secondKey = 'SUNO';
      const twoKeys1 = key + ',' + secondKey;
      expect(
         Bookmark['createValues'](userContext, twoKeys1, values, false)
      ).toBe(`${key},${values[key]}`);
      expect(
         Bookmark['createValues'](userContext, twoKeys1, values, true)
      ).toBe(`${key},${values[key]},${secondKey},%20`);

      const thirdKey = 'WWCONO';
      const twoKeys2 = key + ',' + thirdKey;
      expect(
         Bookmark['createValues'](userContext, twoKeys2, values, true)
      ).toBe(`${key},${values[key]},${thirdKey},${userContext.currentCompany}`);

      const fourthKey = 'WWDIVI';
      const twoKeys3 = key + ',' + fourthKey;
      expect(
         Bookmark['createValues'](userContext, twoKeys3, values, true)
      ).toBe(
         `${key},${values[key]},${fourthKey},${userContext.currentDivision}`
      );

      const fifthKey = 'WWFACI';
      values['FACI'] = '200';
      const twoKeys4 = key + ',' + fifthKey;
      expect(
         Bookmark['createValues'](userContext, twoKeys4, values, true)
      ).toBe(`${key},${values[key]},${fifthKey},${values['FACI']}`);

      const sixtKey = 'WWWHLO';
      const twoKeys5 = key + ',' + sixtKey;
      expect(
         Bookmark['createValues'](userContext, twoKeys5, values, true)
      ).toBe(`${key},${values[key]},${sixtKey},%20`);
   });

   it('should return params', () => {
      const bookmarkData: IBookmark = {};
      const userContext = { company: '100' } as IUserContext;
      const result = {
         BM_INCLUDE_START_PANEL: 'False',
         BM_REQUIRE_PANEL: 'False',
         BM_SOURCE: 'Web',
         BM_SUPPRESS_CONFIRM: 'False',
      };
      expect(Bookmark.toParams(bookmarkData, userContext)).toEqual(result);

      const values = {};
      const key = 'Foo';
      values[key] = 'Bar';
      bookmarkData.keyNames = key;
      bookmarkData.values = values;
      const spyCreateValues = spyOn(Bookmark as any, 'createValues');
      spyCreateValues.and.callFake(
         (uc: IUserContext, keyNames, vals, isKeys) => {
            expect(uc).toBe(userContext);
            expect(keyNames).toBe(key);
            expect(vals).toBe(values);
            expect(isKeys).toBe(true);

            return `${key},${values[key]}`;
         }
      );
      expect(Bookmark.toParams(bookmarkData, userContext)).toEqual({
         ...result,
         BM_KEY_FIELDS: `${key},${values[key]}`,
      });

      bookmarkData.keyNames = undefined;
      bookmarkData.parameterNames = key;
      spyCreateValues.and.callFake(
         (uc: IUserContext, keyNames, vals, isKeys) => {
            expect(uc).toBe(userContext);
            expect(keyNames).toBe(key);
            expect(vals).toBe(values);
            expect(isKeys).toBe(false);

            return `${key},${values[key]}`;
         }
      );
      expect(Bookmark.toParams(bookmarkData, userContext)).toEqual({
         ...result,
         BM_PARAMETERS: `${key},${values[key]}`,
      });

      bookmarkData.parameterNames = undefined;
      bookmarkData.fieldNames = key;
      bookmarkData.informationCategory = 'ADPROMOS';
      spyCreateValues.and.callFake(
         (uc: IUserContext, keyNames, vals, isKeys) => {
            expect(uc).toBe(userContext);
            expect(keyNames).toBe(key);
            expect(vals).toBe(values);
            expect(isKeys).toBe(false);

            return `${key},${values[key]}`;
         }
      );
      expect(Bookmark.toParams(bookmarkData, userContext)).toEqual({
         ...result,
         BM_START_PANEL_FIELDS: `${key},${values[key]},${FormConstants.fieldInformationCategory},${bookmarkData.informationCategory},${FormConstants.fieldNumberOfFilters},0`,
      });
   });

   it('should return source', () => {
      const bookmarkData: IBookmark = { source: 'Foo' };

      expect(Bookmark['getSource'](bookmarkData)).toEqual(
         bookmarkData.source as string
      );
   });
});

describe('TranslationItem', () => {
   it('should construct translation item', () => {
      const key = 'Foo';
      const file = 'Bar';
      const translationItem = new TranslationItem(key, file);
      const result: ITranslationItem = { key, file };

      expect(translationItem).toEqual(
         Object.assign(new TranslationItem('will be overwritten'), result)
      );
   });
});

const ops610Content = `<?xml version="1.0" encoding="UTF-8" ?>
<Root mcv="1.0">
    <Panels>
        <Panel name="OPA610E0" mode="2">
            <Objs>
                <FKeys val="001010000001100000000000">
                    <FKey val="F3">End</FKey>
                    <FKey val="F5">Refresh</FKey>
                    <FKey val="F12">Cancel</FKey>
                    <FKey val="F13">Settings</FKey>
                </FKeys>
                <EFld tab="271" name="W1LIVR" hlp="LIVR" acc="WD" rfl="CSYSTP" rfd="CPLIVR" browse="t">
                    <Pos l="16" t="2" w="21" h="1"/>
                    <Constr maxL="20" type="CHAR" uc="UC"/>
                            FOO01
                </EFld>
                <EFld tab="527" name="WWFACI" hlp="FACI" acc="WE" rfl="MITBAL" rfd="MBFACI" browse="t">
                    <Pos l="16" t="3" w="5" h="1"/>
                    <Constr maxL="3" type="CHAR" uc="UC"/>
                            210
                </EFld>
                <Cap addInfo="t">
                    <Pos l="21" t="3" w="31" h="1"/>
                            Facility Name
                </Cap>
                <EFld tab="783" name="WWWHLO" hlp="WHLO" acc="WE" rfl="MITBAL" rfd="MBWHLO" browse="t">
                    <Pos l="16" t="4" w="5" h="1"/>
                    <Constr maxL="3" type="CHAR" uc="UC"/>
                            000
                </EFld>
                <Cap addInfo="t">
                    <Pos l="21" t="4" w="37" h="1"/>
                            Warehouse Name
                </Cap>
                <EFld tab="1551" name="WFITNO" hlp="ITNO" acc="WE" rfl="MITBAL" rfd="MBITNO" browse="t">
                    <Pos l="16" t="7" w="16" h="1"/>
                    <Constr maxL="15" type="CHAR" uc="UC"/>
                            99100017
                </EFld>
                <EFld tab="1570" name="WTITNO" hlp="ITNO" acc="WE" rfl="MITBAL" rfd="MBITNO" browse="t">
                    <Pos l="35" t="7" w="16" h="1"/>
                    <Constr maxL="15" type="CHAR" uc="UC"/>
                            99100018
                </EFld>
                <ChkBox name="WWSIMM" hlp="OPS61002" tab="2063" acc="WE" rfd="REFYNC">
                    <Pos l="16" t="9" w="3" h="1"/>
                            1
                </ChkBox>
                <ChkBox name="WWSIMB" hlp="OPS61003" tab="2319" acc="WE" rfd="REFYNC">
                    <Pos l="16" t="10" w="3" h="1"/>
                            1
                </ChkBox>
                <ChkBox name="WWSIMD" hlp="OPS61004" tab="2575" acc="WE" rfd="REFYNC">
                    <Pos l="16" t="11" w="3" h="1"/>
                            1
                </ChkBox>
                <ChkBox name="WWSIMP" hlp="OPS61005" tab="2831" acc="WE" rfd="REFYNC">
                    <Pos l="16" t="12" w="3" h="1"/>
                            1
                </ChkBox>
                <Cap id="WLI1115" cl="t" tip="Report version">
                    <Pos l="1" t="2" w="15" h="1"/>
                            Report version
                </Cap>
                <Cap id="WFAC315" cl="t" tip="Facility">
                    <Pos l="1" t="3" w="15" h="1"/>
                            Facility
                </Cap>
                <Cap id="WWH0115" cl="t" tip="Warehouse">
                    <Pos l="1" t="4" w="15" h="1"/>
                            Warehouse
                </Cap>
                <Cap id="XFR0115" emp="t">
                    <Pos l="16" t="6" w="14" h="1"/>
                            From
                </Cap>
                <Cap id="XTO0115" emp="t">
                    <Pos l="35" t="6" w="14" h="1"/>
                            To
                </Cap>
                <Cap id="WIT0115" cl="t" tip="Item number">
                    <Pos l="1" t="7" w="15" h="1"/>
                            Item number
                </Cap>
                <Cap>
                    <Pos l="33" t="7" w="1" h="1"/>
                            -
                </Cap>
                <Cap id="OP61002" cl="t">
                    <Pos l="1" t="9" w="15" h="1"/>
                            Send item
                </Cap>
                <Cap id="OP61003" cl="t">
                    <Pos l="1" t="10" w="15" h="1"/>
                            Send item/whs
                </Cap>
                <Cap id="OP61004" cl="t">
                    <Pos l="1" t="11" w="15" h="1"/>
                            Send item lang
                </Cap>
                <Cap id="OP61005" cl="t">
                    <Pos l="1" t="12" w="15" h="1"/>
                            Send item alias
                </Cap>
                <GroupBox r="t">
                    <Pos l="1" t="1" w="73" h="1"/>
                            Selection Criteria
                </GroupBox>
                <PSeq name="_PSEQ" acc="WD" list="true" sP="e" iP="1">
                            FGHIJO
                    <VPanels>
                        <p name="E" desc="Basic Information (E)"/>
                        <p name="F" desc="Basic Information (F)"/>
                        <p name="G" desc="Basic Information (G)"/>
                        <p name="H" desc="Basic Information (H)"/>
                        <p name="I" desc="Basic Information (I)"/>
                        <p name="J" desc="Basic Information (J)"/>
                    </VPanels>
                </PSeq>
            </Objs>
            <PHead>OPS610/E</PHead>
            <PDesc>POS Item. Transfer</PDesc>
        </Panel>
    </Panels>
    <SessionData>
        <IID>571ad59c7dc496aec056544f603a25ba</IID>
        <SID>0d0b8f1205cdf968c6fddb9e1e8f4376</SID>
    </SessionData>
    <ControlData>
        <HidePrev/>
        <Focus>WWFACI</Focus>
        <HelpURL>/help/GB</HelpURL>
        <ShowDialog>true</ShowDialog>
        <Title>M3 UI Adapter</Title>
        <User>Foo</User>
        <Cmp>Best Company</Cmp>
        <Divi>Bar</Divi>
        <Lng>GB</Lng>
        <ERPV></ERPV>
        <Cono>350</Cono>
        <Div>210</Div>
        <DSep>,</DSep>
        <DF>DDMMYY</DF>
        <DefOpt>5</DefOpt>
        <ChgBy>FOO01</ChgBy>
        <ModDate>12-07-22</ModDate>
        <RegDate>10-05-22</RegDate>
        <ShowCmpVer/>
        <JobId>98789836b0124299a07d6ec230c97527</JobId>
        <PgmInfo/>
    </ControlData>
</Root>`;
