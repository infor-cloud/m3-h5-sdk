import { FormParser } from './parser';

/*
 * TODO: This isn't a complete test spec for FormParser!!!!
 * It's currently only there to increase coverage.
 */
describe('FormParser', () => {
   beforeEach(() => {
      FormParser['counter'] = 0;
   });

   it('should parse aps450 xml', () => {
      const formResponse = FormParser.parse(aps450Content);
      expect(formResponse.counter).toBe(1);
   });
});

const aps450Content = `<?xml version="1.0" encoding="UTF-8" ?>
<Root mcv="1.0">
    <Panels>
        <Panel name="APA450BC" mode="">
            <Objs>
                <InqTypeCBox name="WWQTTP" hlp="QTTP" tab="51" cmd="KEY" val="ENTER" rfd="QTTP" acc="WE">
                    <Pos l="52" t="1" w="22" h="1"/>
                    <CBV val="1">1-Division, Inv batch no</CBV>
                    <CBV val="2" sel="true">2-Division, Supplier inv no, Inv batch no</CBV>
                    <CBV val="3">3-Division, Supplier, Currency, Our inv ad</CBV>
                    <CBV val="4">4-Division, Payee, Supplier, Inv bat tp</CBV>
                    <CBV val="5">5-Division, Supplier, Sup inv no, Payee</CBV>
                    <CBV val="6">6-F-ReKo</CBV>
                </InqTypeCBox>
                <BasicOpts>
                    <BO val="-1">Create</BO>
                    <BO val="1">Select</BO>
                    <BO val="2">Change</BO>
                    <BO val="3">Copy</BO>
                    <BO val="4">Delete</BO>
                    <BO val="5">Display</BO>
                    <BO val="0">Open related</BO>
                </BasicOpts>
                <MoreOpts>
                    <MO val="6">Print</MO>
                    <MO val="8">Validation</MO>
                    <MO val="9">Update to AP ledger</MO>
                    <MO val="10">Drill Down</MO>
                    <MO val="11">Lines</MO>
                    <MO val="12">Display rejection history</MO>
                    <MO val="13">Display claim lines</MO>
                    <MO val="14">Display Error Log</MO>
                    <MO val="20">Reverse printout</MO>
                    <MO val="21">Reject invoice</MO>
                    <MO val="22">Approve invoice</MO>
                    <MO val="23">Reset to status New</MO>
                    <MO val="24">Acknowledge</MO>
                </MoreOpts>
                <DocLinks>
                    <DL url="https://archiv.company.com/#/erp/E5SINO=&lt;E5SINO>/EMAL=&lt;EMAL>" label="Invoice" newwin="t">
                        <keys>
                            <key val="E5SINO"/>
                            <key val="EMAL"/>
                        </keys>
                    </DL>
                </DocLinks>
                <List name="APA450BS" tab="2304" scroll="3" count="0" nrOfRows="33" clr="t">
                    <Pos l="1" t="10" w="73" h="14"/>
                    <LView>
                        <LCols>
                            <LCol name="E5SINO" w="24" hlp="SINO" cat="IDENTIFIER" pmt="false" hasPosFld="true">
                                <Cap tip="Supplier invoice number">Supplier invoice no     </Cap>
                                <EFld tab="2292" name="W2OBKV" hlp="OBKV" acc="WE" rfd="OPAR">
                                    <Pos l="18" t="6" w="16" h="1"/>
                                    <Constr maxL="24" type="CHAR" uc="uc"/>
                                </EFld>
                                <Constr maxL="24" type="CHAR" uc="uc"/>
                            </LCol>
                            <LCol name="E5INBN" w="10" hlp="INBN" just="R" cat="IDENTIFIER" pmt="false" hasPosFld="true">
                                <Cap tip="Invoice batch number">Inv bch no</Cap>
                                <EFld tab="2293" name="W3OBKV" hlp="OBKV" acc="WE" rfd="OPAR">
                                    <Pos l="35" t="6" w="16" h="1"/>
                                    <Constr maxL="10" type="DECIMAL"/>
                                </EFld>
                                <Constr maxL="10" type="DECIMAL"/>
                            </LCol>
                            <LCol name="E5SPYN" w="10" hlp="SPYN" cat="IDENTIFIER" pmt="false">
                                <Cap tip="Payee">Payee     </Cap>
                                <Constr maxL="10" type="CHAR" uc="uc"/>
                            </LCol>
                            <LCol name="IDSUNM" w="36" hlp="SUNM" cat="NAME" pmt="false">
                                <Cap tip="Supplier name">Supplier name                       </Cap>
                                <Constr maxL="36" type="CHAR"/>
                            </LCol>
                            <LCol name="E5CUAM" w="17" hlp="CUAM" just="R" agg="0" adr="30" aur="0" cat="AMOUNT" pmt="false">
                                <Cap tip="Foreign currency amount">    For curr amt </Cap>
                                <Constr maxL="15" type="DECIMAL" maxD="2"/>
                            </LCol>
                            <LCol name="E5CUCD" w="3" hlp="CUCD" cat="CURRENCY_CODE" pmt="false">
                                <Cap tip="Currency">Cur</Cap>
                                <Constr maxL="3" type="CHAR" uc="uc"/>
                            </LCol>
                            <LCol name="E5ACDT" w="6" hlp="ACDT" just="R" cat="DATE" pmt="false">
                                <Cap tip="Accounting date">Acc dt</Cap>
                                <Constr maxL="8" type="DECIMAL"/>
                            </LCol>
                            <LCol name="E5IBTP" w="3" hlp="IBTP" cat="ALPHA" pmt="false">
                                <Cap tip="Invoice batch type">Ibt</Cap>
                                <CBox name="E5IBTP" cmd="KEY" val="ENTER" acc="WE" type="2">
                                    <CBV val="05">05-Prepayment invoice</CBV>
                                    <CBV val="06">06-Final invoice</CBV>
                                    <CBV val="10">10-Self-billing</CBV>
                                    <CBV val="15">15-Supplier invoice request</CBV>
                                    <CBV val="20">20-Supplier invoice</CBV>
                                    <CBV val="25">25-Recode</CBV>
                                    <CBV val="30">30-Debit note</CBV>
                                    <CBV val="40">40-Debit note request</CBV>
                                    <CBV val="50">50-Supplier claim</CBV>
                                    <CBV val="51">51-Supplier claim request</CBV>
                                    <CBV val="52">52-Supplier claim request</CBV>
                                </CBox>
                                <Constr maxL="2" type="CHAR" uc="uc"/>
                            </LCol>
                            <LCol name="E5BIST" w="3" hlp="BIST" just="R" cat="NUMERIC" pmt="false">
                                <Cap tip="Invoice progress">Pro</Cap>
                                <CBox name="E5BIST" cmd="KEY" val="ENTER" acc="WE" type="2">
                                    <CBV val="0">0-The invoice can be processed</CBV>
                                    <CBV val="2">2-Change in progress</CBV>
                                    <CBV val="4">4-Delete in progress</CBV>
                                    <CBV val="5">5-Update in progress</CBV>
                                    <CBV val="6">6-Printing in progress</CBV>
                                    <CBV val="8">8-Validation in progress</CBV>
                                    <CBV val="9">9-Update to APL in progress</CBV>
                                </CBox>
                                <Constr maxL="1" type="DECIMAL"/>
                            </LCol>
                            <LCol name="E5SUPA" w="3" hlp="SUPA" just="R" cat="NUMERIC" pmt="false">
                                <Cap tip="Invoice status">Inv</Cap>
                                <CBox name="E5SUPA" cmd="KEY" val="ENTER" acc="WE" type="2">
                                    <CBV val="10">10-New</CBV>
                                    <CBV val="15">15-Validated with errors</CBV>
                                    <CBV val="20">20-Validated</CBV>
                                    <CBV val="30">30-Printed</CBV>
                                    <CBV val="40">40-Not approved</CBV>
                                    <CBV val="41">41-Adjusted, not re-printed</CBV>
                                    <CBV val="42">42-Adjusted and re-printed</CBV>
                                    <CBV val="43">43-Adjusted</CBV>
                                    <CBV val="50">50-Approved</CBV>
                                    <CBV val="78">78-Invoice matching recoding failed</CBV>
                                    <CBV val="79">79-Invoice matching failed</CBV>
                                    <CBV val="90">90-Updated in APL</CBV>
                                </CBox>
                                <Constr maxL="2" type="DECIMAL"/>
                            </LCol>
                            <LCol name="E5IVDT" w="6" hlp="IVDT" just="R" cat="DATE" pmt="false">
                                <Cap tip="Invoice date">Inv dt</Cap>
                                <Constr maxL="8" type="DECIMAL"/>
                            </LCol>
                        </LCols>
                        <LRows>
                            <LR name="R1">
                                <LC name="R1C1" hlp="SINO">0000000004</LC>
                                <LC name="R1C2" just="R" hlp="INBN">333</LC>
                                <LC name="R1C3" hlp="SPYN">732000</LC>
                                <LC name="R1C4" hlp="SUNM">Foo</LC>
                                <LC name="R1C5" just="R" hlp="CUAM">95,20-</LC>
                                <LC name="R1C6" hlp="CUCD">EUR</LC>
                                <LC name="R1C7" just="R" hlp="ACDT">160522</LC>
                                <LC name="R1C8" hlp="IBTP">20</LC>
                                <LC name="R1C9" just="R" hlp="BIST"></LC>
                                <LC name="R1C10" just="R" hlp="SUPA">90</LC>
                                <LC name="R1C11" just="R" hlp="IVDT">160522</LC>
                            </LR>
                        </LRows>
                    </LView>
                </List>
                <CBox name="WWNFTR" hlp="NFTR" tab="14" cmd="KEY" val="ENTER" rfd="NFTR" acc="HN">
                    <Pos l="15" t="1" w="16" h="1"/>
                    <CBV val="1" sel="true">1-Division</CBV>
                    <CBV val="2">2-Division, Supplier inv no</CBV>
                    <CBV val="3">3-Division, Supplier inv no, Inv batch no</CBV>
                </CBox>
                <EFld tab="47" name="WWAGGR" hlp="AGGR" acc="HN" just="R" rfd="AGGR">
                    <Pos l="48" t="1" w="16" h="1"/>
                    <Constr maxL="1" type="DECIMAL"/>
                    0
                </EFld>
                <CBox name="WFSLCT" hlp="IBTP" tab="270" cmd="KEY" val="ENTER" rfd="OPAR" acc="WE">
                    <Pos l="15" t="2" w="16" h="1"/>
                    <CBV val="" sel="true">-Blank</CBV>
                    <CBV val="05">05-Prepayment invoice</CBV>
                    <CBV val="06">06-Final invoice</CBV>
                    <CBV val="10">10-Self-billing</CBV>
                    <CBV val="15">15-Supplier invoice request</CBV>
                    <CBV val="20">20-Supplier invoice</CBV>
                    <CBV val="25">25-Recode</CBV>
                    <CBV val="30">30-Debit note</CBV>
                    <CBV val="40">40-Debit note request</CBV>
                    <CBV val="50">50-Supplier claim</CBV>
                    <CBV val="51">51-Supplier claim request</CBV>
                    <CBV val="52">52-Supplier claim request</CBV>
                </CBox>
                <CBox name="WTSLCT" hlp="IBTP" tab="289" cmd="KEY" val="ENTER" rfd="OPAR" acc="WE">
                    <Pos l="34" t="2" w="16" h="1"/>
                    <CBV val="" sel="true">-Blank</CBV>
                    <CBV val="05">05-Prepayment invoice</CBV>
                    <CBV val="06">06-Final invoice</CBV>
                    <CBV val="10">10-Self-billing</CBV>
                    <CBV val="15">15-Supplier invoice request</CBV>
                    <CBV val="20">20-Supplier invoice</CBV>
                    <CBV val="25">25-Recode</CBV>
                    <CBV val="30">30-Debit note</CBV>
                    <CBV val="40">40-Debit note request</CBV>
                    <CBV val="50">50-Supplier claim</CBV>
                    <CBV val="51">51-Supplier claim request</CBV>
                    <CBV val="52">52-Supplier claim request</CBV>
                </CBox>
                <PanelVerCBox name="WOPAVR" hlp="PAVR" tab="307" cmd="KEY" val="ENTER" rfd="PAVR" acc="WE">
                    <Pos l="52" t="2" w="22" h="1"/>
                    <CBV val="STD02-01" sel="true">STD02-01-Standard for SF 2</CBV>
                    <CBV val="STD02-02">STD02-02-Standard for SF 2</CBV>
                    <CBV val="STD05-02">STD05-02-Standard for SF 6</CBV>
                </PanelVerCBox>
                <EFld tab="310" name="W9OBKV" hlp="OBKV" acc="HN" rfd="OPAR">
                    <Pos l="55" t="2" w="16" h="1"/>
                    <Constr maxL="20" type="CHAR" uc="UC"/>
                </EFld>
                <CBox name="WOUPVR" hlp="UPVR" tab="312" cmd="KEY" val="ENTER" rfd="UPVR" acc="WE">
                    <Pos l="57" t="2" w="16" h="1"/>
                    <CBV val="" sel="true">-Blank</CBV>
                </CBox>
                <CBox name="WFSLC2" hlp="SUPA" tab="526" cmd="KEY" val="ENTER" rfd="SLC2" acc="WE">
                    <Pos l="15" t="3" w="16" h="1"/>
                    <CBV val="" sel="true">-Blank</CBV>
                    <CBV val="10">10-New</CBV>
                    <CBV val="15">15-Validated with errors</CBV>
                    <CBV val="20">20-Validated</CBV>
                    <CBV val="30">30-Printed</CBV>
                    <CBV val="40">40-Not approved</CBV>
                    <CBV val="41">41-Adjusted, not re-printed</CBV>
                    <CBV val="42">42-Adjusted and re-printed</CBV>
                    <CBV val="43">43-Adjusted</CBV>
                    <CBV val="50">50-Approved</CBV>
                    <CBV val="78">78-Invoice matching recoding failed</CBV>
                    <CBV val="79">79-Invoice matching failed</CBV>
                    <CBV val="90">90-Updated in APL</CBV>
                </CBox>
                <CBox name="WTSLC2" hlp="SUPA" tab="545" cmd="KEY" val="ENTER" rfd="SLC2" acc="WE">
                    <Pos l="34" t="3" w="16" h="1"/>
                    <CBV val="" sel="true">-Blank</CBV>
                    <CBV val="10">10-New</CBV>
                    <CBV val="15">15-Validated with errors</CBV>
                    <CBV val="20">20-Validated</CBV>
                    <CBV val="30">30-Printed</CBV>
                    <CBV val="40">40-Not approved</CBV>
                    <CBV val="41">41-Adjusted, not re-printed</CBV>
                    <CBV val="42">42-Adjusted and re-printed</CBV>
                    <CBV val="43">43-Adjusted</CBV>
                    <CBV val="50">50-Approved</CBV>
                    <CBV val="78">78-Invoice matching recoding failed</CBV>
                    <CBV val="79">79-Invoice matching failed</CBV>
                    <CBV val="90">90-Updated in APL</CBV>
                </CBox>
                <EFld tab="566" name="WAOBKV" hlp="OBKV" acc="HN" rfd="OPAR">
                    <Pos l="55" t="3" w="16" h="1"/>
                    <Constr maxL="20" type="CHAR" uc="UC"/>
                </EFld>
                <EFld tab="782" name="WFSLC3" hlp="SLC3" acc="HN" rfd="SLC3">
                    <Pos l="15" t="4" w="16" h="1"/>
                    <Constr maxL="20" type="CHAR" uc="UC"/>
                </EFld>
                <EFld tab="801" name="WTSLC3" hlp="SLC3" acc="HN" rfd="SLC3">
                    <Pos l="34" t="4" w="16" h="1"/>
                    <Constr maxL="20" type="CHAR" uc="UC"/>
                </EFld>
                <EFld tab="822" name="WCOBKV" hlp="OBKV" acc="HN" rfd="OPAR">
                    <Pos l="55" t="4" w="16" h="1"/>
                    <Constr maxL="20" type="CHAR" uc="UC"/>
                </EFld>
                <EFld tab="822" name="WBOBKV" hlp="OBKV" acc="HN" rfd="OPAR">
                    <Pos l="55" t="4" w="16" h="1"/>
                    <Constr maxL="20" type="CHAR" uc="UC"/>
                </EFld>
                <Cap addInfo="t">
                    <Pos l="1" t="5" w="16" h="1"/>
                    Division
                </Cap>
                <EFld tab="1041" name="WXTXT2" hlp="TXT2" acc="HN" rfd="TX15">
                    <Pos l="18" t="5" w="16" h="1"/>
                    <Constr maxL="15" type="CHAR"/>
                    Supplier inv no
                </EFld>
                <EFld tab="1058" name="WXTXT3" hlp="TXT3" acc="HN" rfd="TX15">
                    <Pos l="35" t="5" w="16" h="1"/>
                    <Constr maxL="15" type="CHAR"/>
                    Inv batch no
                </EFld>
                <EFld tab="1075" name="WXTXT4" hlp="TXT4" acc="HN" rfd="TX15">
                    <Pos l="52" t="5" w="16" h="1"/>
                    <Constr maxL="15" type="CHAR"/>
                </EFld>
                <EFld tab="1280" name="W1OBKV" oname="E5DIVI" hlp="DIVI" acc="WD" rfd="OPAR" browse="t">
                    <Pos t="6" l="1" h="1" w="5"/>
                    <Constr maxL="3" type="CHAR" uc="uc"/>
                    210
                </EFld>
                <EFld tab="1331" name="W4OBKV" hlp="OBKV" acc="HN" rfd="OPAR">
                    <Pos l="52" t="6" w="16" h="1"/>
                    <Constr maxL="20" type="CHAR" uc="UC"/>
                </EFld>
                <EFld tab="1536" name="WXTXT5" hlp="TXT5" acc="HN" rfd="TX15">
                    <Pos l="1" t="7" w="16" h="1"/>
                    <Constr maxL="15" type="CHAR"/>
                </EFld>
                <EFld tab="1553" name="WXTXT6" hlp="TXT6" acc="HN" rfd="TX15">
                    <Pos l="18" t="7" w="16" h="1"/>
                    <Constr maxL="15" type="CHAR"/>
                </EFld>
                <EFld tab="1570" name="WXTXT7" hlp="TXT7" acc="HN" rfd="TX15">
                    <Pos l="35" t="7" w="16" h="1"/>
                    <Constr maxL="15" type="CHAR"/>
                </EFld>
                <EFld tab="1587" name="WXTXT8" hlp="TXT8" acc="HN" rfd="TX15">
                    <Pos l="52" t="7" w="16" h="1"/>
                    <Constr maxL="15" type="CHAR"/>
                </EFld>
                <EFld tab="1792" name="W5OBKV" hlp="OBKV" acc="HN" rfd="OPAR">
                    <Pos l="1" t="8" w="16" h="1"/>
                    <Constr maxL="20" type="CHAR" uc="UC"/>
                </EFld>
                <EFld tab="1809" name="W6OBKV" hlp="OBKV" acc="HN" rfd="OPAR">
                    <Pos l="18" t="8" w="16" h="1"/>
                    <Constr maxL="20" type="CHAR" uc="UC"/>
                </EFld>
                <EFld tab="1826" name="W7OBKV" hlp="OBKV" acc="HN" rfd="OPAR">
                    <Pos l="35" t="8" w="16" h="1"/>
                    <Constr maxL="20" type="CHAR" uc="UC"/>
                </EFld>
                <EFld tab="1843" name="W8OBKV" hlp="OBKV" acc="HN" rfd="OPAR">
                    <Pos l="52" t="8" w="16" h="1"/>
                    <Constr maxL="20" type="CHAR" uc="UC"/>
                </EFld>
                <Cap id="WOI0315" cl="t" tip="Number of filters" acc="HN">
                    <Pos l="1" t="1" w="14" h="1"/>
                    No. filters
                </Cap>
                <Cap id="WAG3715" cl="t" tip="Aggregation" acc="HN">
                    <Pos l="34" t="1" w="14" h="1"/>
                    Aggregation
                </Cap>
                <Cap id="WXSLCT" cl="t">
                    <Pos l="1" t="2" w="14" h="1"/>
                    Inv batch type
                </Cap>
                <Cap id="X__1644">
                    <Pos l="32" t="2" w="1" h="1"/>
                    -
                </Cap>
                <Cap id="WXSLC2" cl="t">
                    <Pos l="1" t="3" w="14" h="1"/>
                    Invoice status
                </Cap>
                <Cap id="X__1644">
                    <Pos l="32" t="3" w="1" h="1"/>
                    -
                </Cap>
                <Cap id="X__1644" acc="HN">
                    <Pos l="32" t="4" w="1" h="1"/>
                    -
                </Cap>
                <Btn name="XT_0168" cmd="KEY" val="ENTER" tab="1792">
                    <Pos l="1" t="8" w="5" h="1"/>
                    Apply
                </Btn>
                <FKeys val="001010000101110011100000">
                    <FKey val="F3">End</FKey>
                    <FKey val="F5">Refresh</FKey>
                    <FKey val="F10">Next Sort Ord</FKey>
                    <FKey val="F12">Cancel</FKey>
                    <FKey val="F13">Settings</FKey>
                    <FKey val="F14">Delete</FKey>
                    <FKey val="F17">Print</FKey>
                    <FKey val="F18">Validation</FKey>
                    <FKey val="F19">Update to AP ledger</FKey>
                </FKeys>
                <PSeq name="_PSEQ" acc="WE" list="true" sP="b" iP="1">
                    EFGT
                    <VPanels>
                        <p name="E" desc="Basic Information (E)"/>
                        <p name="F" desc="Basic Information (F)"/>
                        <p name="G" desc="Basic Information (G)"/>
                        <p name="T" desc="Text"/>
                        <p name="1" desc="Supplier Invoice Batch. Open Lines (APS451)"/>
                        <p name="2" desc="Supplier Invoice Batch. Open Rej History (APS452)"/>
                        <p name="3" desc="Supplier Rebate Inv Transaction. Display (PPS127)"/>
                        <p name="4" desc="Detailed Mail Message. Open (CMS421)"/>
                    </VPanels>
                </PSeq>
            </Objs>
            <PHead>APS450/B1</PHead>
            <PDesc>Supplier Invoice Batch. Open</PDesc>
        </Panel>
    </Panels>
    <SessionData>
        <IID>e92d41ece1e59ba3a6adc6a87572441e</IID>
        <SID>c6a412ae82a70a7a85ad951ac72da08b</SID>
    </SessionData>
    <ControlData>
        <Focus>W1OBKV</Focus>
        <FO>W1OBKV</FO>
        <HelpURL>/help/GB</HelpURL>
        <ShowDialog>true</ShowDialog>
        <Title>M3 UI Adapter</Title>
        <User>AUser</User>
        <Cmp>ACompany</Cmp>
        <Divi>ADivision</Divi>
        <Lng>GB</Lng>
        <ERPV></ERPV>
        <Cono>350</Cono>
        <Div>210</Div>
        <DSep>,</DSep>
        <DF>DDMMYY</DF>
        <DefOpt>5</DefOpt>
        <ShowCmpVer/>
        <JobId>28e2cc40ebd44832891454e756c51443</JobId>
        <PgmInfo bm="t"/>
    </ControlData>
</Root>
`;
