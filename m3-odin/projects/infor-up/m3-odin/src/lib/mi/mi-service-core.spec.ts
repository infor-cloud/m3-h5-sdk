import { firstValueFrom, of, throwError } from 'rxjs';
import { AjaxHttpService } from '../http';
import { IMIMetadataMap, IMIResponse } from './base';
import { MIMetadataInfo, MIRecord, MIResponse, MIServiceCore } from './runtime';
import { IMIRequest } from './types';
import { IHttpRequest, IHttpResponse, IHttpService } from '../types';
import { CoreUtil } from '../util';

describe('MI Service Core', () => {
    it('should initialize', () => {
        const http = {} as IHttpService;
        const spyLogDebug = spyOn(MIServiceCore.prototype as any, 'logDebug').and.callFake(() => { });
        const service = new MIServiceCore();
        const serviceHttp = new MIServiceCore(http);

        expect(service['http']).toBeInstanceOf(AjaxHttpService);
        expect(serviceHttp['http']).toBe(http);
        expect(spyLogDebug).toHaveBeenCalledTimes(3);
        expect(spyLogDebug.calls.allArgs()).toEqual([['constructor'], ['IHttpService not passed using default implmentation'], ['constructor']]);

        expect(service['csrfToken']).toBeUndefined();
        expect(service['csrfTimestamp']).toBe(0);
        expect(service['csrfStatus']).toBe(0);
        expect(service['maxTokenAge']).toBe(30000);
        expect(service['currentCompany']).toBeNull();
        expect(service['currentDivision']).toBeNull();
    });

    it('should create request', () => {
        const service = new MIServiceCore();
        const requestExpected: IHttpRequest = {
            method: 'GET', url: 'foo', responseType: 'json',
            body: null,
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                'Accept': 'application/json'
            }
        };
        const request = service['createRequest'](requestExpected.url);

        expect(request).toEqual(requestExpected);
    });

    it('should return if token is valid', () => {
        const service = new MIServiceCore();

        expect(service['isTokenValid']()).toBe(false);

        service['csrfToken'] = 'foo';
        expect(service['isTokenValid']()).toBe(false);

        service['csrfTimestamp'] = new Date().getTime();
        expect(service['isTokenValid']()).toBe(true);
    });

    it('should return if token should be used', () => {
        const service = new MIServiceCore();
        const request = {} as IMIRequest;

        expect(service['useToken'](request)).toBe(true);
        expect(service['useToken']({ ...request, enableCsrf: false })).toBe(false);

        service['csrfStatus'] = 404;
        expect(service['useToken'](request)).toBe(false);
    });

    it('should route the execute observable to executeInternal when a token is not needed', () => {
        const service = new MIServiceCore();
        const request = { enableCsrf: false } as IMIRequest;
        const value = { program: 'foo' } as IMIResponse;
        const spyExecuteInternal = spyOn(service as any, 'executeInternal').and.returnValue(of(value));

        const observable = service.execute(request);

        expect(spyExecuteInternal).toHaveBeenCalledTimes(1);
        // execute() defaults the version before delegating to executeInternal.
        expect(spyExecuteInternal).toHaveBeenCalledWith(jasmine.objectContaining({ enableCsrf: false, version: 2 }));
        return firstValueFrom(observable).then((val) => expect(val).toBe(value));
    });

    it('should route the execute observable to executeRefreshToken when a token is needed', () => {
        const service = new MIServiceCore();
        const request = {} as IMIRequest;
        const value = { program: 'foo' } as IMIResponse;
        spyOn(service as any, 'useToken').and.returnValue(true);
        spyOn(service as any, 'isTokenValid').and.returnValue(false);
        const spyExecuteRefreshToken = spyOn(service as any, 'executeRefreshToken').and.returnValue(of(value));

        const observable = service.execute(request);

        expect(spyExecuteRefreshToken).toHaveBeenCalledTimes(1);
        return firstValueFrom(observable).then((val) => expect(val).toBe(value));
    });

    // Channel behavior (restored 8.1.0 / 6.0.0 contract): a response whose hasError()
    // is true must reach the ERROR callback, not next. HTTP mocking only, no live server.

    // Helper: build a MIServiceCore whose HTTP layer returns the given observable.
    function createServiceWithHttp(httpResult: any): MIServiceCore {
        const http = { execute: () => httpResult } as unknown as IHttpService;
        const service = new MIServiceCore(http);
        spyOn(service as any, 'logInfo').and.callFake(() => { });
        spyOn(service as any, 'logError').and.callFake(() => { });
        spyOn(service as any, 'logWarning').and.callFake(() => { });
        return service;
    }

    it('should deliver a v1 success response on the next callback', async () => {
        // v1 HTTP 200 with no error body -> next fires, error does not.
        const body = { MIRecord: [{ NameValue: [{ Name: 'USID', Value: 'ADMIN' }] }] };
        const service = createServiceWithHttp(of({ status: 200, body } as IHttpResponse));
        const request = { program: 'MNS150MI', transaction: 'GetUserData', version: 1, enableCsrf: false } as IMIRequest;

        const response = await firstValueFrom(service.execute(request));

        expect(response.hasError()).toBe(false);
        expect(response.item).toBeDefined();
        expect(response.item['USID']).toBe('ADMIN');
    });

    it('should deliver a v1 soft error (HTTP 200) on the error callback', async () => {
        // v1 HTTP 200 whose body parses to hasError() === true -> error fires, next does not.
        const body = { ErrorMessage: { '@code': 'WUS0503', '@field': 'USID', '@type': 'ServerReturnedNOK', Message: 'User NOTME does not exist' } };
        const service = createServiceWithHttp(of({ status: 200, body } as IHttpResponse));
        const request = { program: 'MNS150MI', transaction: 'GetUserData', version: 1, enableCsrf: false } as IMIRequest;

        let nextCalled = false;
        let errorResponse: IMIResponse;
        try {
            await firstValueFrom(service.execute(request).pipe());
            nextCalled = true;
        } catch (err) {
            errorResponse = err as IMIResponse;
        }

        expect(nextCalled).toBe(false);
        expect(errorResponse).toBeDefined();
        expect(errorResponse.hasError()).toBe(true);
        expect(errorResponse.errorMessage).toBe('User NOTME does not exist');
        expect(errorResponse.errorField).toBe('USID');
    });

    it('should deliver a v2 success response on the next callback', async () => {
        // v2 HTTP 200 with nrOfFailedTransactions: 0 -> next fires, error does not.
        const body = {
            results: [{ records: [{ USID: 'ADMIN' }] }],
            nrOfFailedTransactions: 0,
            wasTerminated: false,
        };
        const service = createServiceWithHttp(of({ status: 200, body } as IHttpResponse));
        const request = { program: 'MNS150MI', transaction: 'GetUserData', version: 2, enableCsrf: false } as IMIRequest;

        const response = await firstValueFrom(service.execute(request));

        expect(response.hasError()).toBe(false);
        expect(response.item['USID']).toBe('ADMIN');
    });

    it('should deliver a v2 soft error (HTTP 200) on the error callback', async () => {
        // v2 HTTP 200 with a failed transaction -> error fires, next does not.
        const body = {
            results: [{
                errorMessage: 'User NOTME does not exist',
                errorType: 'ServerReturnedNOK',
                errorCode: 'WUS0503',
                errorField: 'USID',
                records: [],
            }],
            nrOfFailedTransactions: 1,
            wasTerminated: false,
        };
        const service = createServiceWithHttp(of({ status: 200, body } as IHttpResponse));
        const request = { program: 'MNS150MI', transaction: 'GetUserData', version: 2, enableCsrf: false } as IMIRequest;

        let nextCalled = false;
        let errorResponse: IMIResponse;
        try {
            await firstValueFrom(service.execute(request));
            nextCalled = true;
        } catch (err) {
            errorResponse = err as IMIResponse;
        }

        expect(nextCalled).toBe(false);
        expect(errorResponse).toBeDefined();
        expect(errorResponse.hasError()).toBe(true);
        expect(errorResponse.errorMessage).toBe('User NOTME does not exist');
        expect(errorResponse.errorCode).toBe('WUS0503');
        expect(errorResponse.errorField).toBe('USID');
    });

    it('should deliver a v2 HTTP 400 error body on the error callback', async () => {
        // v2 returns HTTP 400 for errors; catchError parses the body and, because it
        // hasError(), the response is surfaced on the error channel, not next.
        const body = {
            errorMessage: 'User NOTME does not exist',
            errorType: 'ServerReturnedNOK',
            errorCode: 'WUS0503',
            errorField: 'USID',
            nrOfFailedTransactions: 1,
        };
        const service = createServiceWithHttp(throwError(() => ({ status: 400, body } as IHttpResponse)));
        const request = { program: 'MNS150MI', transaction: 'GetUserData', version: 2, enableCsrf: false } as IMIRequest;

        let nextCalled = false;
        let errorResponse: IMIResponse;
        try {
            await firstValueFrom(service.execute(request));
            nextCalled = true;
        } catch (err) {
            errorResponse = err as IMIResponse;
        }

        expect(nextCalled).toBe(false);
        expect(errorResponse).toBeDefined();
        expect(errorResponse.hasError()).toBe(true);
        expect(errorResponse.errorMessage).toBe('User NOTME does not exist');
        expect(errorResponse.errorCode).toBe('WUS0503');
    });

    it('should deliver a failed CSRF token fetch (non-404) on the error callback', async () => {
        // When a token is needed and the CSRF token fetch fails with a non-404 status,
        // executeRefreshToken builds a TOKEN error response. Prior to the fix this was
        // delivered on next via of(errorResponse); it must now reach the error channel.
        // The HTTP mock fails on the token GET (the first and only HTTP call made here).
        const service = createServiceWithHttp(throwError(() => ({ status: 500, body: null } as IHttpResponse)));
        // enableCsrf is not false and there is no cached token, so execute() routes to
        // executeRefreshToken (useToken() === true, isTokenValid() === false).
        const request = { program: 'MNS150MI', transaction: 'GetUserData', version: 2 } as IMIRequest;

        let nextCalled = false;
        let errorResponse: IMIResponse;
        try {
            await firstValueFrom(service.execute(request));
            nextCalled = true;
        } catch (err) {
            errorResponse = err as IMIResponse;
        }

        expect(nextCalled).toBe(false);
        expect(errorResponse).toBeDefined();
        expect(errorResponse.hasError()).toBe(true);
        expect(errorResponse.errorType).toBe('TOKEN');
        expect(errorResponse.errorMessage).toBe('Failed to get CSRF token 500');
    });

    it('should update user context', () => {
        const service = new MIServiceCore();
        const spyLogDebug = spyOn(service as any, 'logDebug').and.callFake(() => { });
        const company = 'foo';
        const division = 'bar';

        service.updateUserContext(company, division);
        expect(service['currentCompany']).toBe(company);
        expect(service['currentDivision']).toBe(division);
        expect(spyLogDebug).toHaveBeenCalledTimes(1);
        expect(spyLogDebug).toHaveBeenCalledWith(`updateUserContext: ${company}/${division}`);
    });

    it('should create url', () => {
        const service = new MIServiceCore();
        const spyIsDebug = spyOn(service as any, 'isDebug');
        spyIsDebug.and.returnValue(false);
        const spyLogDebug = spyOn(service as any, 'logDebug').and.callFake(() => { });
        const spyLogInfo = spyOn(service as any, 'logInfo').and.callFake(() => { });
        const baseUrl = 'odin';
        const request = { program: 'foo', transaction: 'bar' } as IMIRequest;
        const random = 123456789;
        spyOn(CoreUtil, 'random').and.returnValue(random.toString());
        const defaultMetadata = 'true';
        const defaultMaxRecords = 100;
        const expectedMaxRecords = 1;
        const defaultExcludeEmpty = 'true';
        const changedExcludeEmpty = 'false';
        const outputFields = ['CUNO'];
        const company = '100';
        const division = '200';

        expect(service.createUrl(baseUrl, request)).toBe(`${baseUrl}/${request.program}/${request.transaction};metadata=${defaultMetadata};maxrecs=${defaultMaxRecords};excludempty=${changedExcludeEmpty}?_rid=${random}`);
        expect(service.createUrl(baseUrl, { ...request, excludeEmptyValues: true })).toBe(`${baseUrl}/${request.program}/${request.transaction};metadata=${defaultMetadata};maxrecs=${defaultMaxRecords};excludempty=${defaultExcludeEmpty}?_rid=${random}`);
        expect(service.createUrl(baseUrl, { ...request, maxReturnedRecords: expectedMaxRecords })).toBe(`${baseUrl}/${request.program}/${request.transaction};metadata=${defaultMetadata};maxrecs=${expectedMaxRecords};excludempty=${changedExcludeEmpty}?_rid=${random}`);
        expect(service.createUrl(baseUrl, { ...request, outputFields })).toBe(`${baseUrl}/${request.program}/${request.transaction};metadata=${defaultMetadata};maxrecs=${defaultMaxRecords};excludempty=${changedExcludeEmpty};returncols=${outputFields}?_rid=${random}`);
        expect(service.createUrl(baseUrl, { ...request, includeMetadata: true })).toBe(`${baseUrl}/${request.program}/${request.transaction};metadata=${defaultMetadata};maxrecs=${defaultMaxRecords};excludempty=${changedExcludeEmpty}?_rid=${random}`);
        expect(service.createUrl(baseUrl, { ...request, company, division })).toBe(`${baseUrl}/${request.program}/${request.transaction};metadata=${defaultMetadata};maxrecs=${defaultMaxRecords};excludempty=${changedExcludeEmpty};cono=${company};divi=${division}?_rid=${random}`);
        expect(service.createUrl(baseUrl, { ...request, record: { program: 'MNS150' } })).toBe(`${baseUrl}/${request.program}/${request.transaction};metadata=${defaultMetadata};maxrecs=${defaultMaxRecords};excludempty=${changedExcludeEmpty}?program=MNS150&_rid=${random}`);
        expect(service.createUrl(baseUrl, { ...request, record: { program: 'MNS150', transaction: 'GetUserData' } })).toBe(`${baseUrl}/${request.program}/${request.transaction};metadata=${defaultMetadata};maxrecs=${defaultMaxRecords};excludempty=${changedExcludeEmpty}?program=MNS150&transaction=GetUserData&_rid=${random}`);

        service['currentCompany'] = company;
        expect(service.createUrl(baseUrl, request)).toBe(`${baseUrl}/${request.program}/${request.transaction};metadata=${defaultMetadata};maxrecs=${defaultMaxRecords};excludempty=${changedExcludeEmpty};cono=${company}?_rid=${random}`);
        spyIsDebug.and.returnValue(true);
        expect(service.createUrl(baseUrl, request)).toBe(`${baseUrl}/${request.program}/${request.transaction};metadata=${defaultMetadata};maxrecs=${defaultMaxRecords};excludempty=${changedExcludeEmpty};cono=${company}?_rid=${random}`);


        expect(spyIsDebug).toHaveBeenCalledTimes(2);
        expect(spyLogDebug.calls.allArgs()).toEqual([[`createUrl: using company ${company} and division null from user context`]]);
        expect(spyLogDebug).toHaveBeenCalledTimes(1);
        // createUrl logs a 'createUrl - baseUrl:' line on every call (10) plus a
        // 'company not set' line on the 8 calls without a resolvable company = 18.
        expect(spyLogInfo).toHaveBeenCalledTimes(18);
        expect(spyLogInfo).toHaveBeenCalledWith('createUrl: company not set, user context not available.');
    });

    it('should parse response', () => {
        const service = new MIServiceCore();
        const request = { tag: 'hello' } as IMIRequest;
        const content = {};
        const response = new MIResponse();
        response.transaction = undefined as unknown as string;
        response.program = undefined as unknown as string;
        response.tag = request.tag;
        response.errorCode = undefined as unknown as string;
        response.errorField = undefined as unknown as string;
        response.errorType = undefined as unknown as string;
        response.items = [];

        expect(service.parseResponse(request, content)).toEqual(response);

        response.metadata = null as unknown as IMIMetadataMap;
        expect(service.parseResponse({ ...request, includeMetadata: true }, content)).toEqual(response);

        const record = new MIRecord();
        record['name1'] = 'bar';
        record['name'] = 'foo';
        response.items = [record];
        response.item = record;
        content['MIRecord'] = [{ NameValue: [{ Name: 'name1', Value: 'bar' }, { Name: 'name', Value: 'foo' }] }];
        content['Metadata'] = { Field: [{ '@name': 'name1', '@length': 1, '@description': 'desc1' }, { '@name': 'name2', '@length': 2, '@description': 'desc2' }] };
        const info1 = new MIMetadataInfo('name1', 1, '', 'desc1');
        const info2 = new MIMetadataInfo('name2', 2, '', 'desc2');
        response.metadata = { name1: info1, name2: info2 };
        record['metadata'] = response.metadata;
        expect(service.parseResponse({ ...request, includeMetadata: true, typedOutput: true }, content)).toEqual(response);
        expect(service.parseResponse({ ...request, includeMetadata: true }, content)).toEqual(response);
    });

    it('should parse value', () => {
        const service = new MIServiceCore();
        const valueString = 'foo';
        const valueNumeric = '1';
        const valueDate = '20221001';
        const metadata = new MIMetadataInfo('', 0, '', '');
        const spyIsString = spyOn(metadata, 'isString').and
            .returnValues(true, false, false, false, false, false);
        const spyIsNumeric = spyOn(metadata, 'isNumeric').and
            .returnValues(true, true, false, false, false);
        const spyIsDate = spyOn(metadata, 'isDate').and
            .returnValues(true, true, false);

        expect(service['parseValue'](valueString, metadata)).toBe(valueString);
        expect(service['parseValue'](valueNumeric, metadata)).toBe(+valueNumeric);
        expect(service['parseValue'](undefined as unknown as string, metadata)).toBe(0);
        expect(service['parseValue'](valueDate, metadata)).toEqual(new Date(2022, 9, 1));
        expect(service['parseValue'](undefined as unknown as string, metadata)).toBeNull();
        expect(service['parseValue'](valueString, metadata)).toBe(valueString);

        expect(spyIsString).toHaveBeenCalledTimes(6);
        expect(spyIsNumeric).toHaveBeenCalledTimes(5);
        expect(spyIsDate).toHaveBeenCalledTimes(3);
    });
});
