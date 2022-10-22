import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { CoreBase, ErrorState } from '../base';
import { Log } from '../log';
import { IErrorState } from '../types';

describe('ErrorState', () => {
    it('shoud return no error', () => {
        const error = new ErrorState();
        expect(error.hasError()).toBe(false);
    });

    it('shoud return a error', () => {
        const errorWithErrorMessage = <IErrorState>(new ErrorState());
        errorWithErrorMessage.errorMessage = 'foo';
        expect(errorWithErrorMessage.hasError()).toBe(true);

        const errorWithErrorCode = <IErrorState>(new ErrorState());
        errorWithErrorCode.errorCode = 'foo';
        expect(errorWithErrorCode.hasError()).toBe(true);

        const errorWithError = <IErrorState>(new ErrorState());
        errorWithError.error = 'foo';
        expect(errorWithError.hasError()).toBe(true);
    });
});

describe('CoreBase', () => {
    const error = Log.error;
    const warning = Log.warning;
    const info = Log.info;
    const debug = Log.debug;
    const isDebug = Log.isDebug;

    afterEach(() => {
        Log.error = error;
        Log.warning = warning;
        Log.info = info;
        Log.debug = debug;
        Log.isDebug = isDebug;
    });

    it('should log error', () => {
        const name = 'Error';
        const base = new CoreBase(name);
        const message = 'Foo';
        const ex = new Error();
        Log.error = jest.fn().mockImplementation(() => {});

        base['logError'](message, ex);
        expect(Log.error).toHaveBeenCalledWith(`[${name}] ${message}`, ex);
    });

    it('should log warning', () => {
        const name = 'Warning';
        const base = new CoreBase(name);
        const message = 'Foo';
        Log.warning = jest.fn().mockImplementation(() => {});

        base['logWarning'](message);
        expect(Log.warning).toHaveBeenCalledWith(`[${name}] ${message}`);
    });

    it('should log info', () => {
        const name = 'Info';
        const base = new CoreBase(name);
        const message = 'Foo';
        Log.info = jest.fn().mockImplementation(() => {});

        base['logInfo'](message);
        expect(Log.info).toHaveBeenCalledWith(`[${name}] ${message}`);
    });

    it('should log debug', () => {
        const name = 'Info';
        const base = new CoreBase(name);
        const message = 'Foo';
        const ex = new Error();
        Log.debug = jest.fn().mockImplementation(() => {});

        base['logDebug'](message, ex);
        expect(Log.debug).toHaveBeenCalledWith(`[${name}] ${message}`, ex);
    });

    it('should return debug flag', () => {
        const base = new CoreBase('');
        Log.isDebug = jest.fn(() => true).mockImplementation(() => true);

        expect(base['isDebug']()).toBe(true);
    });
});