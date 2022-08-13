import { describe, expect, it } from '@jest/globals';
import { FormParser } from '../../form/parser';
import { readFileSync } from 'fs';

/*
 * TODO: This isn't a complete test spec for FormParser!!!!
 * It's currently only there to increase coverage.
 */ 
describe('FormParser', () => {
    it('should parse aps450 xml', () => {
        const xmlContext = readFileSync(`${__dirname}/aps450.xml`, 'utf-8');
        const formResponse = FormParser.parse(xmlContext);
        expect(formResponse.counter).toBe(1);
    });
});