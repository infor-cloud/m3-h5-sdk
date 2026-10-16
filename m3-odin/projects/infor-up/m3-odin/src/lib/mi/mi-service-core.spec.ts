import { firstValueFrom, of, Subject, throwError } from 'rxjs';
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
        // When a token is needed and the CSRF token fetch fails with a non-retryable, non-404
        // status (401 is a client error, so it is attempted once and not retried), the shared
        // getCsrfToken$ rejects with a TOKEN MIResponse on the error channel (8.1.0 contract).
        const service = createServiceWithHttp(throwError(() => ({ status: 401, body: null } as IHttpResponse)));
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
        expect(errorResponse.errorMessage).toBe('Failed to get CSRF token 401');
    });

    // 8.2.0: CSRF token fetches are de-duplicated (one in-flight CSRF GET shared by concurrent
    // callers) and the single shared GET is retried on transient failures. HTTP mocking only.

    const csrfUrlFragment = '/m3api-rest/csrf';

    // Builds a MIServiceCore whose HTTP layer branches on the request URL so the CSRF GET and the
    // MI transaction can be distinguished and counted. csrfResponder is called for the CSRF GET,
    // miResponder for the MI transaction; each returns the Observable the HTTP layer should emit.
    function createServiceWithRoutedHttp(
        csrfResponder: () => any,
        miResponder: (request: IHttpRequest) => any,
    ): { service: MIServiceCore; httpSpy: jasmine.Spy } {
        const httpSpy = jasmine.createSpy('execute').and.callFake((request: IHttpRequest) =>
            request.url.includes(csrfUrlFragment) ? csrfResponder() : miResponder(request),
        );
        const http = { execute: httpSpy } as unknown as IHttpService;
        const service = new MIServiceCore(http);
        spyOn(service as any, 'logInfo').and.callFake(() => { });
        spyOn(service as any, 'logError').and.callFake(() => { });
        spyOn(service as any, 'logWarning').and.callFake(() => { });
        return { service, httpSpy };
    }

    function csrfGetCount(httpSpy: jasmine.Spy): number {
        return httpSpy.calls.allArgs().filter(([req]) => (req as IHttpRequest).url.includes(csrfUrlFragment)).length;
    }

    function miCount(httpSpy: jasmine.Spy): number {
        return httpSpy.calls.allArgs().filter(([req]) => !(req as IHttpRequest).url.includes(csrfUrlFragment)).length;
    }

    const v2OkBody = { results: [{ records: [{ USID: 'ADMIN' }] }], nrOfFailedTransactions: 0, wasTerminated: false };
    const tokenRequest = { program: 'MNS150MI', transaction: 'GetUserData', version: 2 } as IMIRequest;

    it('should de-duplicate concurrent CSRF token fetches to a single in-flight GET', async () => {
        // The CSRF GET is held open via a Subject so all callers subscribe before it resolves.
        const csrfSubject = new Subject<IHttpResponse>();
        const { service, httpSpy } = createServiceWithRoutedHttp(
            () => csrfSubject,
            () => of({ status: 200, body: v2OkBody } as IHttpResponse),
        );

        // Fire several concurrent callers that all need a token.
        const callers = [0, 1, 2, 3, 4].map(() => firstValueFrom(service.execute({ ...tokenRequest })));

        // Before the CSRF GET resolves, exactly one CSRF GET must have been issued (dedup).
        expect(csrfGetCount(httpSpy)).toBe(1);

        // Now complete the shared CSRF GET; all callers should run their MI transaction and resolve.
        csrfSubject.next({ status: 200, body: 'the-token' } as IHttpResponse);
        csrfSubject.complete();

        const responses = await Promise.all(callers);
        expect(responses.length).toBe(5);
        responses.forEach((response) => expect(response.item['USID']).toBe('ADMIN'));
        // Still only one CSRF GET; each caller issued its own MI transaction.
        expect(csrfGetCount(httpSpy)).toBe(1);
        expect(miCount(httpSpy)).toBe(5);
    });

    it('should not fetch a CSRF token when a cached token is still valid (within 30s)', async () => {
        const { service, httpSpy } = createServiceWithRoutedHttp(
            () => of({ status: 200, body: 'cached-token' } as IHttpResponse),
            () => of({ status: 200, body: v2OkBody } as IHttpResponse),
        );
        // Pre-seed a valid cached token so execute() takes the isTokenValid() fast path.
        service['csrfToken'] = 'cached-token';
        service['csrfTimestamp'] = Date.now();

        const response = await firstValueFrom(service.execute({ ...tokenRequest }));

        expect(response.item['USID']).toBe('ADMIN');
        expect(csrfGetCount(httpSpy)).toBe(0);
        expect(miCount(httpSpy)).toBe(1);
    });

    it('should retry a transient CSRF failure and then succeed (500 then 200)', async () => {
        let csrfAttempts = 0;
        const { service, httpSpy } = createServiceWithRoutedHttp(
            () => {
                csrfAttempts++;
                return csrfAttempts === 1
                    ? throwError(() => ({ status: 500, body: null } as IHttpResponse))
                    : of({ status: 200, body: 'the-token' } as IHttpResponse);
            },
            () => of({ status: 200, body: v2OkBody } as IHttpResponse),
        );

        // Real retry timer (~300ms) fires here; this is a genuine wall-clock delay from the retry
        // backoff, kept short and deterministic rather than mocked with fakeAsync/tick.
        const response = await firstValueFrom(service.execute({ ...tokenRequest }));

        expect(response.item['USID']).toBe('ADMIN');
        expect(csrfGetCount(httpSpy)).toBe(2); // one failure + one successful retry
        expect(miCount(httpSpy)).toBe(1);
    });

    it('should give up after the bounded retries on a persistent transient failure (500)', async () => {
        const { service, httpSpy } = createServiceWithRoutedHttp(
            () => throwError(() => ({ status: 500, body: null } as IHttpResponse)),
            () => of({ status: 200, body: v2OkBody } as IHttpResponse),
        );

        let nextCalled = false;
        let errorResponse: IMIResponse;
        try {
            // Real retry timers (~300ms + ~600ms) fire here before the fetch gives up.
            await firstValueFrom(service.execute({ ...tokenRequest }));
            nextCalled = true;
        } catch (err) {
            errorResponse = err as IMIResponse;
        }

        expect(nextCalled).toBe(false);
        expect(errorResponse.errorType).toBe('TOKEN');
        expect(errorResponse.errorMessage).toBe('Failed to get CSRF token 500');
        expect(csrfGetCount(httpSpy)).toBe(3); // 1 initial attempt + 2 retries
        expect(miCount(httpSpy)).toBe(0); // business MI transaction never attempted
    });

    it('should not retry a 4xx CSRF failure (401/403), attempting the GET exactly once', async () => {
        for (const status of [401, 403]) {
            const { service, httpSpy } = createServiceWithRoutedHttp(
                () => throwError(() => ({ status, body: null } as IHttpResponse)),
                () => of({ status: 200, body: v2OkBody } as IHttpResponse),
            );

            let nextCalled = false;
            let errorResponse: IMIResponse;
            try {
                await firstValueFrom(service.execute({ ...tokenRequest }));
                nextCalled = true;
            } catch (err) {
                errorResponse = err as IMIResponse;
            }

            expect(nextCalled).toBe(false);
            expect(errorResponse.errorType).toBe('TOKEN');
            expect(csrfGetCount(httpSpy)).toBe(1);
            expect(miCount(httpSpy)).toBe(0);
        }
    });

    it('should leave the 404 no-CSRF-endpoint path untouched (proceed without a token, no retry)', async () => {
        let miHeaders: { [name: string]: any };
        const { service, httpSpy } = createServiceWithRoutedHttp(
            () => throwError(() => ({ status: 404, body: null } as IHttpResponse)),
            (request) => {
                miHeaders = request.headers;
                return of({ status: 200, body: v2OkBody } as IHttpResponse);
            },
        );

        const response = await firstValueFrom(service.execute({ ...tokenRequest }));

        expect(response.item['USID']).toBe('ADMIN');
        expect(service['csrfStatus']).toBe(404);
        // CSRF GET attempted exactly once (404 is not retried).
        expect(csrfGetCount(httpSpy)).toBe(1);
        // MI transaction ran without a CSRF token header.
        expect(miCount(httpSpy)).toBe(1);
        expect(miHeaders['fnd-csrf-token']).toBeUndefined();
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
