import { ITranslationJob, ITranslationRequest } from './base';
import { Translator } from './runtime';

describe('Translator', () => {
    let translator: Translator;

    beforeEach(() => {
        translator = new Translator();
    });

    it('should translate items', () => {
        const job = {
            commandType: 'FNC',
            commandValue: 'TRANSLATE',
            constants: 'MVXCON:foo,',
            items: [{
                file: 'MVXCON',
                key: 'foo',
                language: undefined,
                text: null!,
            }],
            language: undefined,
            params: {
                CONSTANTS: 'MVXCON:foo,',
                LANC: undefined,
            },
        } as unknown as ITranslationJob;
        const emptyRequest: ITranslationRequest = { items: [] };
        const requestFoo: ITranslationRequest = { items: [{ key: 'foo' }] };

        expect(translator.translate(emptyRequest)).toBeNull();
        expect(translator.translate(requestFoo)).toEqual(job);
    });

    it('should be improved, because items is optional but throws error', () => {
        const request: ITranslationRequest = {};
        expect(() => { translator.translate(request); }).toThrowError('Cannot read properties of undefined (reading \'length\')');
    });

    it('should be improved, because item.file is never undefined', () => {
        const job = {
            commandType: 'FNC',
            commandValue: 'TRANSLATE',
            constants: 'hello:bar,',
            items: [{
                file: 'hello',
                key: 'bar',
                language: undefined,
                text: null!,
            }],
            language: undefined,
            params: {
                CONSTANTS: 'hello:bar,',
                LANC: undefined,
            },
        } as unknown as ITranslationJob;
        const requestWithFile: ITranslationRequest = { items: [{ key: 'bar', file: 'hello' }] };

        expect(translator.translate(requestWithFile)).toEqual(job);
    });

    it('should parse response', () => {
        const jobBefore: ITranslationJob = { items: [{ key: 'FA31001', file: 'MVXCON' }], language: 'GB' };
        const jobAfter: ITranslationJob = { items: [{ key: 'FA31001', file: 'MVXCON' }], language: 'GB' };
        const response = '<?xml version="1.0" encoding="UTF-8" ?><Root mcv="1.0"><Result>0</Result><Texts language="GB"><Text file="MVXCON" key="FA31001">Tax Asset Group. Update</Text></Texts></Root>';
        translator.parseResponse(jobAfter, '');
        expect(jobAfter).toEqual(jobBefore);
        translator.parseResponse(jobAfter, response);
        jobBefore.items[0].language = 'GB';
        jobBefore.items[0].text = 'Tax Asset Group. Update';
        expect(jobAfter).toEqual(jobBefore);
    });
});